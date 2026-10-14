# tiangong-ai-video — RunPod Serverless worker (ComfyUI)
#
# 基于 ashleykleynhans/runpod-worker-comfyui：镜像内已包含 ComfyUI、
# runpod SDK 和启动脚本（handler 约定位于 /rp_handler.py，直接覆盖）。
# 若上游镜像布局变化，请同步调整下方 COPY 目标路径。
FROM ashleykleynhans/runpod-worker-comfyui:latest

COPY requirements.txt /tmp/requirements-worker.txt
RUN pip install --no-cache-dir -r /tmp/requirements-worker.txt

# 覆盖为 tiangong 的 handler
COPY handler.py /rp_handler.py
