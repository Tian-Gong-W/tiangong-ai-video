#!/usr/bin/env python3
"""Bounded endpoint availability/header checker with body capture.

Uses GET (no params, no redirects), reads at most --max-body-bytes per endpoint,
stores raw content in --body-dir, and puts a text preview in the CSV.
Only run against a host you own or are explicitly authorized to test.
"""

import argparse
import csv
import hashlib
import logging
import os
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from urllib.parse import urlparse, urlunparse, unquote

import requests

ENDPOINTS = [
    # API Core
    "/api/cos/getCosSign.do",
    "/api/customerService/systemSwitch",
    "/api/follow/follow.do",
    "/api/follow/unfollow.do",
    "/api/log/logTransferDc.do",
    "/api/moment/delete.do",
    "/api/moment/getPersonalMoments.do",
    "/api/moment/getShowMoments.do",
    "/api/myconfig/inPublicMembers.do",
    "/api/photo/getPhotoList.do",
    "/api/photo/saveVideo.do",
    "/api/photo/uploadVideo.do",
    "/api/profile/getObjectProfile.do",
    "/api/recommend/getRecommendList.do",
    "/api/",
    "/api/ccm",
    "/api/ccm/user/login",
    "/api/ccm/cdr/calloutDetail/export",
    "/api/ccm/menu/query",
    "/api/ccm/monitor/store/queryCallSessionList",
    "/api/ccm/number/uploadNumber",
    "/api/ccm/user/list",
    "/api/login/userLogin.do",
    "/api/login/checkLogin.do",
    "/api/login/dynamicLogin.do",
    "/api/login/getGeetestCaptcha.do",
    "/api/login/sendDynamicMessageCode.do",
    "/api/login/sendNonlocalMsgCode.do",
    "/api/login/submitNonlocalMsgCode.do",
    "/api/certification/MyCertificationDetails.do",
    "/api/certification/document/addPersonalId.do",
    "/api/certification/document/getAddStatusInfo.do",
    "/api/certification/document/getVerifyStatusInfo.do",
    "/api/certification/replace/h5/notify.do",
    "/api/certification/replace/h5/submit.do",
    "/api/loveAnswerBook/getH5WapRegConfig.do",
    "/api/offlinestore/getOfflineStoreList",
    "/api/profile/getBasicProfile.do",
    "/api/profile/getProfile.do",
    "/api/register/getWapRegisterImgCode.do",
    "/api/register/sendWapMessageCodeV2.do",
    "/api/system/appConfig.do",
    "/api/seed/cm/mainapi/cmim/pull/offline/session/record",
    "/api/seed/cm/mainapi/cmim/select/session/page",
    "/api/seed/cm/mainapi/crm/recommend/interested_list",
    "/api/seed/cm/mainapi/home/user_context",
    "/api/seed/cm/mainapi/user/member/get_info",
    "/api/seed/cm/mainapi/user/my/info",
    "/api/seed/cm/mainapi/user/visit/list",
    "/api/seed/cm/momentapi/message/list",
    "/api/seed/cm/momentapi/moment/recommend/list/v1",
    "/api/seed/cm/p2papi/user/info",
    "/api/seed/cm/p2papi/wechat/applet/auth/login",
    "/api/seed/cm/tradeapi/matchmaker_member/member_status",
    "/api/seed/matchapi/home/query_home_recommend",
    "/api/seed/matchapi/home/recommend/listHistory",
    "/api/seed/zaq/msgapi/subscribe/get_template_list/v3",
    # Admin & Monitor
    "/admin/search",
    "/admin/swagger-ui.html",
    "/admin/upload",
    "/admin/v2/api-docs",
    "/admin/login.php",
    "/data/admin/config_update.php",
    "/include/dialog/select_soft.php",
    "/include/vdimgck.php",
    "/plus/download.php",
    "/plus/erraddsave.php",
    "/plus/guestbook.php",
    "/plus/search.php",
    "/monitor/collect",
    "/monitor/collect.do",
    "/monitor/csp",
    "/monitor/csp.do",
    "/monitor/upload",
    "/monitor/upload.do",
    "/monitor/v2/api-docs",
    "/web_monitor",
    "/news/data/admin/config_update.php",
    "/news/include/dialog/select_soft.php",
    "/news/include/vdimgck.php",
    "/news/manage/login.php",
    "/news/plus/bookfeedback.php",
    "/news/plus/carbuyaction.php",
    "/news/plus/count.php",
    "/news/plus/diy.php",
    "/news/plus/download.php",
    "/news/plus/feedback.php",
    "/news/plus/feedback_ajax.php",
    "/news/plus/flink.php",
    "/news/plus/guestbook.php",
    "/news/plus/list.php",
    "/news/plus/mytag_js.php",
    "/news/plus/posttocar.php",
    "/news/plus/recommend.php",
    "/news/plus/rss.php",
    "/news/plus/view.php",
    "/news/plus/vote.php",
    "/news/tags.php",
    "/news/u/..%2f..%2f",
    # Auth & Login
    "/auth/v1/login/checkPhone",
    "/auth/v1/refresh",
    "/auth/v1/refreshToken",
    "/auth/v1/sms/send",
    "/login/appleLogin",
    "/login/appleLogin.do",
    "/login/applyTempToken.do",
    "/login/checkLogin.do",
    "/login/checkMessageCode",
    "/login/dynamicLogin.do",
    "/login/dynamicLoginResetPwd.do",
    "/login/getGeetestCaptcha.do",
    "/login/loginByTempToken.do",
    "/login/messageCodeLogin.do",
    "/login/sendDynamicMessageCode.do",
    "/login/sendLoginMessageCode.do",
    "/login/sendMessageCodeCheckDevice",
    "/login/sendNonlocalMsgCode.do",
    "/login/trustDeviceFingerprint.do",
    "/login/userLogin.do",
    "/login/userLogout.do",
    "/login/weChatPublicCodeLogin",
    "/login/weChatPublicLogin",
    "/loginWindow/getWindowFlag.do",
    "/login/activatePhone.do",
    "/login/sendActivatePhoneMessageCode.do",
    "/login/submitNonlocalMsgCode.do",
    "/n/user/_auth",
    "/n/user/_faceAuth",
    "/cgi-bin/login",
]

MAX_ENDPOINTS = 200
MAX_WORKERS = 3
MIN_INTERVAL_SECONDS = 0.25

SKIP_SEGMENTS = {
    "admin", "auth", "login", "logout", "password", "sms", "message",
    "upload", "delete", "follow", "unfollow", "certification", "token",
    "refresh", "export", "notify", "submit", "activate", "faceauth",
    "config_update", "erraddsave", "feedback", "posttocar", "carbuyaction",
    "addpersonalid", "calloutdetail",
}

TEXT_HINTS = ("text/", "json", "xml", "javascript", "x-www-form-urlencoded")
DEFAULT_MAX_BODY = 8192
PREVIEW_CHARS = 300

CATEGORY_ORDER = ("business", "auth", "admin", "cms", "other")
CATEGORY_LABELS = {
    "business": "业务接口",
    "auth": "认证登录",
    "admin": "后台/监控",
    "cms": "遗留CMS",
    "other": "其他",
}

_rate_lock = threading.Lock()
_last_request_at = 0.0
_thread_local = threading.local()


def get_session() -> requests.Session:
    """每线程独立 Session，避免连接池/cookie jar 并发写。"""
    session = getattr(_thread_local, "session", None)
    if session is None:
        session = requests.Session()
        session.headers.update({
            "User-Agent": "EndpointHeaderChecker/2.0",
            "Accept": "*/*",
            "Accept-Encoding": "identity",  # 直接拿原始 body，避免压缩
        })
        _thread_local.session = session
    return session


def parse_base_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise argparse.ArgumentTypeError("请输入完整网址，例如 https://staging.example.org")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise argparse.ArgumentTypeError("网址不可包含账号、密码、查询参数或片段")
    if parsed.path not in ("", "/"):
        raise argparse.ArgumentTypeError("--base-url 只填写站点根网址，不要带路径")
    return urlunparse((parsed.scheme, parsed.netloc, "", "", "", "")).rstrip("/")


def validate_endpoint(value: str) -> str:
    value = value.strip()
    if not value.startswith("/") or value.startswith("//"):
        raise ValueError(f"端点必须是同站相对路径：{value!r}")
    parsed = urlparse(value)
    decoded = unquote(parsed.path).lower()
    if (parsed.scheme or parsed.netloc or parsed.query
            or "\\" in decoded or ".." in decoded):
        raise ValueError(f"端点路径不符合安全限制：{value!r}")
    return value


def should_skip(endpoint: str) -> bool:
    segments = {s for s in re.split(r"[/._-]+", unquote(endpoint).lower()) if s}
    return bool(segments & SKIP_SEGMENTS)


def guess_category(endpoint: str) -> str:
    path = unquote(urlparse(endpoint).path).lower()
    parts = [p for p in path.split("/") if p]
    first = parts[0] if parts else ""
    second = parts[1] if len(parts) > 1 else ""
    if path.startswith("/n/user/"):
        return "auth"
    if first in {"auth", "login", "loginwindow", "cgi-bin"}:
        return "auth"
    if first == "api" and second in {"login", "register", "certification"}:
        return "auth"
    if first == "api" and second == "ccm":
        return "admin"
    if first in {"admin", "data", "monitor", "web_monitor", "n"}:
        return "admin"
    if first in {"news", "plus", "include"}:
        return "cms"
    if first == "api":
        return "business"
    return "other"


def wait_for_rate_limit() -> None:
    global _last_request_at
    with _rate_lock:
        now = time.monotonic()
        wait = MIN_INTERVAL_SECONDS - (now - _last_request_at)
        if wait > 0:
            time.sleep(wait)
        _last_request_at = time.monotonic()


def guess_charset(content_type: str) -> str:
    match = re.search(r"charset=([\w\-]+)", content_type or "", re.I)
    return match.group(1) if match else "utf-8"


def is_textual(content_type: str, data: bytes) -> bool:
    ct = (content_type or "").lower()
    if any(h in ct for h in TEXT_HINTS):
        return True
    if not data:
        return True
    sample = data[:1024]
    printable = sum(1 for b in sample if 9 <= b <= 13 or 32 <= b <= 126 or b >= 128)
    return printable / len(sample) > 0.9


def body_filename(endpoint: str, content_type: str) -> str:
    digest = hashlib.sha256(endpoint.encode("utf-8")).hexdigest()[:16]
    ct = (content_type or "").lower()
    ext = ".bin"
    if "json" in ct:
        ext = ".json"
    elif "html" in ct:
        ext = ".html"
    elif "xml" in ct:
        ext = ".xml"
    elif ct.startswith("text/plain"):
        ext = ".txt"
    elif ct.startswith("text/"):
        ext = ".txt"
    elif "javascript" in ct:
        ext = ".js"
    return f"{digest}{ext}"


def check_one(session: requests.Session, base_url: str, endpoint: str,
              timeout: float, read_body: bool, max_body: int,
              body_dir: str | None) -> dict:
    url = base_url + endpoint
    result = {
        "endpoint": endpoint,
        "url": url,
        "category": guess_category(endpoint),
        "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        "body_read": False,
        "body_bytes": 0,
        "body_truncated": False,
        "body_is_binary": False,
        "body_sha256": "",
        "body_saved_path": "",
        "body_preview": "",
        "error": "",
    }
    wait_for_rate_limit()
    started = time.monotonic()
    try:
        with session.get(url, timeout=timeout, allow_redirects=False, stream=True) as response:
            headers = {key.lower(): val for key, val in response.headers.items()}
            result.update({
                "status_code": response.status_code,
                "status_text": response.reason,
                "content_type": headers.get("content-type", ""),
                "content_length_header": headers.get("content-length", ""),
                "redirect_location": headers.get("location", ""),
                "has_hsts": "strict-transport-security" in headers,
                "has_csp": "content-security-policy" in headers,
                "has_x_frame_options": "x-frame-options" in headers,
                "has_x_content_type_options": "x-content-type-options" in headers,
                "cors_is_wildcard": headers.get("access-control-allow-origin") == "*",
            })

            if read_body:
                buf = bytearray()
                truncated = False
                for chunk in response.iter_content(chunk_size=8192):
                    if not chunk:
                        continue
                    buf.extend(chunk)
                    if len(buf) > max_body:
                        truncated = True
                        del buf[max_body:]
                        break
                body = bytes(buf)
                content_type = headers.get("content-type", "")

                result["body_read"] = True
                result["body_bytes"] = len(body)
                result["body_truncated"] = truncated
                result["body_sha256"] = hashlib.sha256(body).hexdigest()
                textual = is_textual(content_type, body)
                result["body_is_binary"] = not textual

                if textual and body:
                    text = body.decode(guess_charset(content_type), errors="replace")
                    preview = re.sub(r"\s+", " ", text)[:PREVIEW_CHARS]
                    result["body_preview"] = preview

                if body_dir:
                    os.makedirs(body_dir, exist_ok=True)
                    path = os.path.join(body_dir, body_filename(endpoint, content_type))
                    with open(path, "wb") as handle:
                        handle.write(body)
                    result["body_saved_path"] = path

            result["elapsed_sec"] = round(time.monotonic() - started, 3)
    except requests.exceptions.Timeout:
        result.update({"elapsed_sec": round(time.monotonic() - started, 3),
                       "error": "timeout"})
    except requests.exceptions.SSLError as exc:
        result.update({"elapsed_sec": round(time.monotonic() - started, 3),
                       "error": f"ssl_error: {str(exc)[:180]}"})
    except requests.exceptions.ConnectionError as exc:
        result.update({"elapsed_sec": round(time.monotonic() - started, 3),
                       "error": f"connection_error: {str(exc)[:180]}"})
    except requests.exceptions.RequestException as exc:
        result.update({"elapsed_sec": round(time.monotonic() - started, 3),
                       "error": f"request_error: {str(exc)[:180]}"})
    except Exception as exc:
        logging.exception("处理端点 %s 时发生意外错误", endpoint)
        result.update({"elapsed_sec": round(time.monotonic() - started, 3),
                       "error": f"unexpected_error: {str(exc)[:180]}"})
    return result


def write_csv(rows: list[dict], filename: str) -> None:
    fields = [
        "endpoint", "url", "category", "checked_at_utc", "status_code", "status_text",
        "elapsed_sec", "content_type", "content_length_header", "redirect_location",
        "has_hsts", "has_csp", "has_x_frame_options", "has_x_content_type_options",
        "cors_is_wildcard",
        "body_read", "body_bytes", "body_truncated", "body_is_binary",
        "body_sha256", "body_saved_path", "body_preview",
        "error",
    ]
    with open(filename, "w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def make_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="对授权范围内的站点进行低速 GET 探测：响应头 + 响应体预览。"
    )
    parser.add_argument("--base-url", type=parse_base_url, default=None,
                        help="目标站点根网址，例如 https://staging.example.org")
    parser.add_argument("--confirm-authorized", action="store_true",
                        help="确认目标属于你或已获得书面测试授权")
    parser.add_argument("--list-categories", action="store_true",
                        help="仅列出内置端点的分类清单，不发起任何请求；可配合 --output 导出 CSV")
    parser.add_argument("--endpoint", action="append", dest="endpoints",
                        help="额外指定安全端点；可重复使用。与 --all-endpoints 互斥")
    parser.add_argument("--all-endpoints", action="store_true",
                        help="使用脚本内可见的 ENDPOINTS 清单（仍会自动跳过高风险路径）")
    parser.add_argument("--workers", type=int, default=2,
                        help="并发上限 1–3（实际速率仍受全局节流约束），默认 2")
    parser.add_argument("--timeout", type=float, default=8.0,
                        help="单个请求超时秒数，范围 1–30，默认 8")
    parser.add_argument("--output", default="scan_results.csv",
                        help="CSV 输出文件名，默认 scan_results.csv")
    parser.add_argument("--body-dir", default="scan_bodies",
                        help="响应体原始内容保存目录，默认 scan_bodies")
    parser.add_argument("--max-body-bytes", type=int, default=DEFAULT_MAX_BODY,
                        help=f"每个端点最多读取的字节数，默认 {DEFAULT_MAX_BODY}")
    parser.add_argument("--no-body", action="store_true",
                        help="只取响应头，不读取响应体（回到原行为）")
    parser.add_argument("--include-risky", action="store_true",
                        help="不跳过 SKIP_SEGMENTS 中的高风险路径（仅在你完全了解副作用时使用）")
    return parser


def print_inventory(output: str | None) -> int:
    rows = []
    for ep in dict.fromkeys(ENDPOINTS):
        try:
            rows.append({"endpoint": validate_endpoint(ep),
                         "category": guess_category(ep)})
        except ValueError as exc:
            logging.warning("跳过无效端点：%s", exc)
    by_category: dict[str, list[str]] = {}
    for row in rows:
        by_category.setdefault(row["category"], []).append(row["endpoint"])
    for category in CATEGORY_ORDER:
        eps = by_category.get(category, [])
        logging.info("[%s（%s）] %d 个", category, CATEGORY_LABELS[category], len(eps))
        for ep in eps:
            logging.info("    %s", ep)
    if output:
        try:
            write_csv(rows, output)
            logging.info("分类清单已保存：%s", output)
        except OSError as exc:
            logging.error("写入 CSV 失败：%s", exc)
            return 1
    return 0


def main() -> int:
    parser = make_parser()
    args = parser.parse_args()
    if args.list_categories:
        return print_inventory(args.output)
    if not args.base_url:
        parser.error("--list-categories 之外的模式必须提供 --base-url")
    if not args.confirm_authorized:
        parser.error("仅对自有或明确授权的目标运行，并添加 --confirm-authorized")
    if not 1 <= args.workers <= MAX_WORKERS:
        parser.error(f"--workers 范围为 1–{MAX_WORKERS}")
    if not 1 <= args.timeout <= 30:
        parser.error("--timeout 范围为 1–30 秒")
    if not 1 <= args.max_body_bytes <= 1024 * 1024:
        parser.error("--max-body-bytes 范围为 1–1048576")
    if args.all_endpoints and args.endpoints:
        parser.error("--all-endpoints 与 --endpoint 不能同时使用")
    if not args.all_endpoints and not args.endpoints:
        parser.error("请使用 --all-endpoints 或至少一个 --endpoint")

    raw_endpoints = ENDPOINTS if args.all_endpoints else args.endpoints
    if len(raw_endpoints) > MAX_ENDPOINTS:
        parser.error(f"端点数超过上限 {MAX_ENDPOINTS}")

    endpoints = []
    for item in raw_endpoints:
        try:
            endpoints.append(validate_endpoint(item))
        except ValueError as exc:
            logging.warning("跳过无效端点：%s", exc)
    endpoints = list(dict.fromkeys(endpoints))
    if not endpoints:
        logging.error("没有合法端点。")
        return 2

    if args.include_risky:
        logging.warning("--include-risky 已启用：高风险路径不会被跳过，请自行确认。")
        skipped = []
        active = endpoints
    else:
        skipped = [p for p in endpoints if should_skip(p)]
        active = [p for p in endpoints if not should_skip(p)]

    if not active:
        logging.error("安全过滤后没有可请求的端点（可用 --include-risky 覆盖）。")
        return 2

    host = urlparse(args.base_url).hostname
    is_local = host in {"localhost", "127.0.0.1", "::1"}
    if not is_local and urlparse(args.base_url).scheme != "https":
        parser.error("远端目标必须使用 HTTPS；HTTP 仅允许本机测试")

    read_body = not args.no_body
    body_dir = args.body_dir if read_body else None

    logging.info("目标：%s", args.base_url)
    logging.info("待检查：%d；跳过：%d；读取响应体：%s；每端点上限：%d 字节",
                 len(active), len(skipped), read_body, args.max_body_bytes)

    results = []
    pool = ThreadPoolExecutor(max_workers=args.workers)
    future_map = {
        pool.submit(check_one, get_session(), args.base_url, endpoint,
                    args.timeout, read_body, args.max_body_bytes, body_dir): endpoint
        for endpoint in active
    }
    try:
        for index, future in enumerate(as_completed(future_map), start=1):
            endpoint = future_map[future]
            try:
                row = future.result()
            except Exception as exc:
                row = {
                    "endpoint": endpoint,
                    "url": args.base_url + endpoint,
                    "checked_at_utc": datetime.now(timezone.utc).isoformat(),
                    "error": f"worker_error: {str(exc)[:180]}",
                }
            results.append(row)
            category = CATEGORY_LABELS.get(row.get("category", "other"), "其他")
            status = row.get("status_code") or row.get("error") or "unknown"
            nbytes = row.get("body_bytes", 0)
            preview = (row.get("body_preview") or "")[:80]
            print(f"[{index}/{len(active)}] {status} {nbytes}B [{category}] {endpoint} :: {preview}",
                  flush=True)
    except KeyboardInterrupt:
        logging.info("收到 Ctrl-C，取消未开始的任务并保存已完成结果。")
    finally:
        pool.shutdown(wait=False, cancel_futures=True)

    logging.info("分类统计：%s",
                 ", ".join(
                     f"{CATEGORY_LABELS.get(cat, cat)}={sum(1 for r in results if r.get('category') == cat)}"
                     for cat in sorted({r.get("category", "other") for r in results})))
    results.sort(key=lambda row: row["endpoint"])
    try:
        if results:
            write_csv(results, args.output)
            logging.info("已保存 %d 条结果：%s", len(results), args.output)
            if body_dir:
                logging.info("原始响应体已保存到：%s", body_dir)
        else:
            logging.warning("没有完成的检查结果。")
    except OSError as exc:
        logging.error("写入 CSV 失败：%s", exc)
        return 1

    if skipped:
        logging.info("自动跳过的高风险路径示例：%s", ", ".join(skipped[:12]))
    return 0


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        logging.info("用户中断。")
        sys.exit(130)
    except Exception:
        logging.exception("程序发生未处理异常。")
        sys.exit(1)
