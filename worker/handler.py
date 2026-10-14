"""
RunPod Serverless worker — tiangong-ai-video ComfyUI 后端

Job input（由 src/ai/providers/comfyui.ts 的 /run 调用下发）:
    { "workflow":    <ComfyUI API 格式 JSON，占位符已在 Next.js 侧填充>,
      "callbackUrl": <已签名的 Next.js 回调地址，可选> }

流程:
    1. POST workflow 到本 pod 内的 ComfyUI /prompt
    2. 轮询 /history/{prompt_id} 直到完成或超时
    3. 从输出节点取第一个文件（优先 videos > gifs > images）
    4. 经 /view 下载后上传到 S3/R2
    5. 回打 callbackUrl: {id, status, output:{videoUrl}}
    6. 返回 {"videoUrl": ...}，供 Next.js 侧经 RunPod /status 轮询兜底

环境变量:
    COMFY_HOST / COMFY_PORT     ComfyUI 地址（默认 127.0.0.1:8188）
    COMFY_POLL_INTERVAL         轮询间隔秒数（默认 3）
    COMFY_POLL_TIMEOUT          最长等待秒数（默认 1800）
    S3_ENDPOINT_URL             S3 兼容端点，如 https://<acct>.r2.cloudflarestorage.com
    S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY
    S3_BUCKET_NAME              存放成片的 bucket
    S3_PUBLIC_BASE              公网访问前缀，如 https://cdn.example.com
    S3_ACL                      可选，如 public-read（R2 一般留空，用桶策略）
"""

import mimetypes
import os
import time

import requests
import runpod

COMFY_HOST = os.environ.get("COMFY_HOST", "127.0.0.1")
COMFY_PORT = os.environ.get("COMFY_PORT", "8188")
POLL_INTERVAL = int(os.environ.get("COMFY_POLL_INTERVAL", "3"))
POLL_TIMEOUT = int(os.environ.get("COMFY_POLL_TIMEOUT", "1800"))
CALLBACK_TIMEOUT = int(os.environ.get("CALLBACK_TIMEOUT", "15"))

COMFY_BASE = f"http://{COMFY_HOST}:{COMFY_PORT}"


def _submit_workflow(workflow: dict, client_id: str) -> str:
    resp = requests.post(
        f"{COMFY_BASE}/prompt",
        json={"prompt": workflow, "client_id": client_id},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    if "prompt_id" not in data:
        raise RuntimeError(f"ComfyUI rejected workflow: {data.get('error') or data}")
    return data["prompt_id"]


def _poll_history(prompt_id: str) -> dict:
    deadline = time.time() + POLL_TIMEOUT
    while time.time() < deadline:
        resp = requests.get(f"{COMFY_BASE}/history/{prompt_id}", timeout=30)
        resp.raise_for_status()
        entry = resp.json().get(prompt_id)
        if entry:
            status = entry.get("status") or {}
            if status.get("status_str") == "error":
                raise RuntimeError(
                    f"ComfyUI execution error: {status.get('messages') or 'unknown'}"
                )
            if status.get("completed"):
                return entry
        time.sleep(POLL_INTERVAL)
    raise TimeoutError(f"ComfyUI job {prompt_id} did not finish in {POLL_TIMEOUT}s")


def _find_output_file(entry: dict) -> dict:
    for node_output in (entry.get("outputs") or {}).values():
        for key in ("videos", "gifs", "images"):
            files = node_output.get(key)
            if files:
                return files[0]
    raise RuntimeError("No output file found in ComfyUI history")


def _download_output(file_info: dict):
    params = {
        "filename": file_info.get("filename", ""),
        "subfolder": file_info.get("subfolder", ""),
        "type": file_info.get("type", "output"),
    }
    resp = requests.get(f"{COMFY_BASE}/view", params=params, timeout=300)
    resp.raise_for_status()
    return resp.content, params["filename"]


def _upload_to_s3(data: bytes, filename: str, job_id: str) -> str:
    import boto3

    bucket = os.environ.get("S3_BUCKET_NAME")
    if not bucket:
        raise RuntimeError(
            "S3_BUCKET_NAME not set — worker needs S3/R2 storage to publish the video"
        )

    s3 = boto3.client(
        "s3",
        endpoint_url=os.environ.get("S3_ENDPOINT_URL") or None,
        aws_access_key_id=os.environ.get("S3_ACCESS_KEY_ID"),
        aws_secret_access_key=os.environ.get("S3_SECRET_ACCESS_KEY"),
        region_name=os.environ.get("S3_REGION", "auto"),
    )

    key = f"comfyui/{job_id}/{filename}"
    extra = {"ContentType": mimetypes.guess_type(filename)[0] or "video/mp4"}
    acl = os.environ.get("S3_ACL")
    if acl:
        extra["ACL"] = acl

    s3.put_object(Bucket=bucket, Key=key, Body=data, **extra)

    public_base = os.environ.get("S3_PUBLIC_BASE")
    if public_base:
        return f"{public_base.rstrip('/')}/{key}"
    endpoint = os.environ.get("S3_ENDPOINT_URL")
    if endpoint:
        return f"{endpoint.rstrip('/')}/{bucket}/{key}"
    return f"https://{bucket}.s3.amazonaws.com/{key}"


def _send_callback(callback_url, payload: dict) -> None:
    if not callback_url:
        return
    try:
        requests.post(callback_url, json=payload, timeout=CALLBACK_TIMEOUT)
    except Exception as exc:  # 回调失败不能吞掉任务结果，/status 兜底
        print(f"[worker] callback POST failed: {exc}")


def handler(job: dict) -> dict:
    job_input = job.get("input") or {}
    job_id = job.get("id", "unknown")
    workflow = job_input.get("workflow")
    callback_url = job_input.get("callbackUrl")

    if not workflow:
        _send_callback(
            callback_url, {"id": job_id, "status": "FAILED", "error": "missing workflow"}
        )
        raise RuntimeError("missing workflow in job input")

    try:
        prompt_id = _submit_workflow(workflow, client_id=f"tiangong-{job_id}")
        entry = _poll_history(prompt_id)
        file_info = _find_output_file(entry)
        data, filename = _download_output(file_info)
        video_url = _upload_to_s3(data, filename, job_id)
    except Exception as exc:
        _send_callback(callback_url, {"id": job_id, "status": "FAILED", "error": str(exc)})
        raise

    _send_callback(
        callback_url,
        {"id": job_id, "status": "COMPLETED", "output": {"videoUrl": video_url}},
    )
    return {"videoUrl": video_url, "promptId": prompt_id}


if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})
