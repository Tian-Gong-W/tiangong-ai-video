#!/usr/bin/env python3
"""本地单文件脚本运行器：贴 Python 代码 → 运行 → 报错时 AI 自动修复 → 重跑。

自用工具，仅绑定 127.0.0.1，不做沙箱隔离——只运行你自己的代码。
用法：python3 script_runner.py 然后浏览器打开 http://127.0.0.1:8899
自动修复（可选）：启动前设置环境变量
  MISTRAL_API_KEY=你的key                # 或 OPENAI_API_KEY
  AI_BASE_URL=https://api.mistral.ai/v1  # 可选，默认 Mistral；其他兼容 API 自行覆盖
  AI_MODEL=mistral-large-latest          # 可选
"""

import os
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import requests as http_client
from flask import Flask, jsonify, request

APP = Flask(__name__)
DEFAULT_TIMEOUT = 30
MAX_TIMEOUT = 300
MAX_FIX_ROUNDS = 5

PAGE = """<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8">
<title>脚本运行器</title>
<style>
  body { font-family: ui-monospace, Menlo, Consolas, monospace; margin: 24px;
         background: #111; color: #ddd; }
  textarea { width: 100%; height: 320px; background: #1b1b1b; color: #eee;
             border: 1px solid #444; border-radius: 6px; padding: 10px;
             font: inherit; box-sizing: border-box; }
  .bar { margin: 10px 0; display: flex; gap: 12px; align-items: center; }
  button { background: #2f6feb; color: #fff; border: 0; border-radius: 6px;
           padding: 8px 22px; font: inherit; cursor: pointer; }
  button.fix { background: #188038; }
  button:disabled { background: #555; cursor: not-allowed; }
  #out { white-space: pre-wrap; background: #0a0a0a; border: 1px solid #333;
         border-radius: 6px; padding: 12px; min-height: 60px; font-size: 13px; }
  .meta { color: #8ab4f8; margin-bottom: 6px; }
  .err { color: #ff8a80; }
  .ok { color: #81c995; }
  input[type=number] { width: 70px; background: #1b1b1b; color: #eee;
                       border: 1px solid #444; border-radius: 4px; padding: 4px; }
</style>
</head>
<body>
<h3>本地脚本运行器 <small style="color:#777">（运行 → 报错 → AI修复 → 重跑）</small></h3>
<textarea id="code" spellcheck="false" placeholder="print('hello')"></textarea>
<div class="bar">
  超时 <input type="number" id="timeout" value="__DEFAULT_TIMEOUT__" min="1" max="__MAX_TIMEOUT__"> 秒
  <button id="btn" onclick="run()">▶ 运行</button>
  <button id="fixbtn" class="fix" onclick="autoFix()" disabled title="先运行一次，报错后可用">🛠 自动修复</button>
  <span id="roundInfo" class="meta"></span>
</div>
<div id="out">输出会显示在这里。</div>
<script>
let lastResult = null;
let fixRounds = 0;
const MAX_ROUNDS = __MAX_FIX_ROUNDS__;
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function renderOutput(r) {
  const out = document.getElementById('out');
  let html = '<div class="meta">退出码=' + r.return_code + ' · 用时=' + r.elapsed + 's'
    + (r.timed_out ? ' · <b class="err">已超时强杀</b>' : '')
    + (r.return_code === 0 ? ' · <span class="ok">运行成功</span>' : ' · <span class="err">运行失败</span>')
    + '</div>';
  if (r.explanation) html += '<div class="meta">🛠 ' + escapeHtml(r.explanation) + '</div>';
  if (r.stdout) html += escapeHtml('── stdout ──') + String.fromCharCode(10) + escapeHtml(r.stdout);
  if (r.stderr) html += String.fromCharCode(10) + '<span class="err">' + escapeHtml('── stderr ──')
    + String.fromCharCode(10) + escapeHtml(r.stderr) + '</span>';
  out.innerHTML = '<pre style="margin:0;font:inherit">' + (html || '（无输出，退出码 ' + r.return_code + '）') + '</pre>';
}
async function run(keepRounds) {
  const btn = document.getElementById('btn');
  const code = document.getElementById('code').value;
  if (!keepRounds) { fixRounds = 0; document.getElementById('roundInfo').textContent = ''; }
  btn.disabled = true; btn.textContent = '运行中…';
  try {
    const res = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        timeout: parseInt(document.getElementById('timeout').value) || __DEFAULT_TIMEOUT__,
      }),
    });
    lastResult = await res.json();
    renderOutput(lastResult);
    const failed = lastResult.return_code !== 0;
    const fixbtn = document.getElementById('fixbtn');
    fixbtn.disabled = !failed || fixRounds >= MAX_ROUNDS || !aiEnabled;
    document.getElementById('roundInfo').textContent =
      fixRounds > 0 ? '（已自动修复 ' + fixRounds + ' 轮' + (failed ? '' : '，已跑通 ✅') + '）' : '';
  } catch (e) {
    document.getElementById('out').innerHTML = '<span class="err">请求失败：' + e + '</span>';
  }
  btn.disabled = false; btn.textContent = '▶ 运行';
}
async function autoFix() {
  if (!lastResult || lastResult.return_code === 0) return;
  const fixbtn = document.getElementById('fixbtn');
  fixbtn.disabled = true; fixbtn.textContent = '修复中…';
  const out = document.getElementById('out');
  out.innerHTML = '<span class="meta">🛠 正在把报错交给 AI 修复…</span>';
  try {
    const res = await fetch('/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: document.getElementById('code').value,
        stdout: lastResult.stdout || '',
        stderr: lastResult.stderr || '',
        return_code: lastResult.return_code,
        timed_out: lastResult.timed_out,
      }),
    });
    const r = await res.json();
    if (!r.ok) {
      out.innerHTML = '<span class="err">修复失败：' + escapeHtml(r.error) + '</span>';
      fixbtn.textContent = '🛠 自动修复'; fixbtn.disabled = false;
      return;
    }
    document.getElementById('code').value = r.fixed_code;
    fixRounds += 1;
    fixbtn.textContent = '🛠 自动修复';
    await run(true);
  } catch (e) {
    out.innerHTML = '<span class="err">修复请求失败：' + e + '</span>';
    fixbtn.textContent = '🛠 自动修复'; fixbtn.disabled = false;
  }
}
let aiEnabled = false;
fetch('/ai-status').then(r => r.json()).then(s => {
  aiEnabled = s.enabled;
  if (!s.enabled) {
    const b = document.getElementById('fixbtn');
    b.title = '未配置 AI 修复：设置 MISTRAL_API_KEY 或 OPENAI_API_KEY 环境变量后重启';
  }
});
</script>
</body>
</html>"""


def ai_config() -> tuple[str, str, str] | None:
    key = os.environ.get("MISTRAL_API_KEY") or os.environ.get("OPENAI_API_KEY")
    if not key:
        return None
    base = (os.environ.get("AI_BASE_URL") or "https://api.mistral.ai/v1").rstrip("/")
    model = os.environ.get("AI_MODEL") or "mistral-large-latest"
    return base, key, model


@APP.get("/ai-status")
def ai_status():
    return jsonify({"enabled": ai_config() is not None})


@APP.get("/")
def index():
    return PAGE.replace("__DEFAULT_TIMEOUT__", str(DEFAULT_TIMEOUT)) \
               .replace("__MAX_TIMEOUT__", str(MAX_TIMEOUT)) \
               .replace("__MAX_FIX_ROUNDS__", str(MAX_FIX_ROUNDS))


@APP.post("/run")
def run():
    data = request.get_json(force=True, silent=True) or {}
    code = data.get("code", "")
    try:
        timeout = max(1, min(int(data.get("timeout", DEFAULT_TIMEOUT)), MAX_TIMEOUT))
    except (TypeError, ValueError):
        timeout = DEFAULT_TIMEOUT
    if not code.strip():
        return jsonify({"return_code": -1, "stdout": "", "stderr": "empty code",
                        "timed_out": False, "elapsed": 0})

    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as f:
        f.write(code)
        path = f.name
    started = time.monotonic()
    timed_out = False
    try:
        proc = subprocess.run(
            [sys.executable, "-u", path],
            capture_output=True, text=True, errors="replace",
            timeout=timeout,
        )
        result = {"return_code": proc.returncode,
                  "stdout": proc.stdout or "",
                  "stderr": proc.stderr or ""}
    except subprocess.TimeoutExpired as exc:
        timed_out = True
        text_out = lambda v: v.decode(errors="replace") if isinstance(v, bytes) else (v or "")
        result = {"return_code": -1,
                  "stdout": text_out(exc.stdout),
                  "stderr": text_out(exc.stderr) + "\n[runner] 超过 {} 秒，进程已被强杀".format(timeout)}
    finally:
        Path(path).unlink(missing_ok=True)
    result["timed_out"] = timed_out
    result["elapsed"] = round(time.monotonic() - started, 3)
    return jsonify(result)


FIX_SYSTEM_PROMPT = (
    "你是 Python 调试助手。用户会给你一段完整脚本和它的运行结果（退出码/stdout/stderr）。"
    "只修复导致报错或超时的问题，保留原有功能与打印。"
    "回复格式：第一行用一句话说明改了什么（不要超过40字），"
    "然后紧跟一个 ```python 代码块，包含修复后的完整脚本。不要输出其他内容。"
)


@APP.post("/fix")
def fix():
    data = request.get_json(force=True, silent=True) or {}
    code = data.get("code", "")
    if not code.strip():
        return jsonify({"ok": False, "error": "代码为空"})
    cfg = ai_config()
    if not cfg:
        return jsonify({"ok": False,
                        "error": "未配置 AI 修复：请先设置环境变量 MISTRAL_API_KEY（或 OPENAI_API_KEY + AI_BASE_URL），然后重启运行器"}), 400
    base, key, model = cfg
    user_msg = (
        "运行结果：退出码={}{}\n--- stdout ---\n{}\n--- stderr ---\n{}\n"
        "--- 当前脚本 ---\n{}"
    ).format(data.get("return_code"),
             "（超时被强杀）" if data.get("timed_out") else "",
             (data.get("stdout") or "")[-3000:],
             (data.get("stderr") or "")[-3000:],
             code)
    body = {"model": model,
            "messages": [{"role": "system", "content": FIX_SYSTEM_PROMPT},
                         {"role": "user", "content": user_msg}],
            "temperature": 0.2}
    max_tokens = os.environ.get("AI_MAX_TOKENS")
    if max_tokens and max_tokens.isdigit():
        body["max_tokens"] = int(max_tokens)
    try:
        resp = http_client.post(
            base + "/chat/completions",
            headers={"Authorization": "Bearer " + key},
            json=body,
            timeout=120,
        )
        resp.raise_for_status()
        message = resp.json()["choices"][0]["message"]
        content = message.get("content") or ""
        if not content.strip() and (message.get("reasoning_content") or "").strip():
            return jsonify({"ok": False,
                            "error": "推理模型的思维链占满了输出额度，最终修复代码没来得及生成。"
                                     "解决方案：设置环境变量 AI_MAX_TOKENS=8192（或更大值）后重启，"
                                     "或改用非思考模型（如 deepseek-flash / deepseek-v4-pro）。"}), 502
    except Exception as exc:
        return jsonify({"ok": False, "error": "AI 接口调用失败：" + str(exc)[:300]}), 502

    match = re.search(r"```(?:python)?\s*\n(.*?)```", content, re.S)
    fixed = match.group(1).strip() if match else content.strip()
    lines = content.strip().splitlines()
    if not fixed:
        return jsonify({"ok": False, "error": "AI 未返回有效代码"})

    refusal_hints = ("我无法", "我不能", "无法协助", "对不起，我不能",
                     "I can't", "I cannot", "cannot assist", "against my")
    if not match and any(h in content for h in refusal_hints):
        return jsonify({"ok": False,
                        "error": "模型拒绝了本次修复（脚本内容触发了它的安全策略）。"
                                 "建议：换更强的模型；或把脚本里的大段数据块"
                                 "（如端点词典、URL 列表）拆到独立 JSON/txt 文件由运行时加载，"
                                 "修复请求只发引擎逻辑，通常就不再触发拒绝。"})

    try:
        compile(fixed, "<fixed>", "exec")
    except SyntaxError as exc:
        return jsonify({"ok": False,
                        "error": "AI 返回的内容不是可运行的 Python（第一行：" +
                                 (lines[0][:80] if lines else "") + "，语法错：" + str(exc.msg) +
                                 "）。多为模型拒答或输出格式错误，建议换个更强的模型重试。"})

    explanation = lines[0][:60] if lines else "已修复"
    return jsonify({"ok": True, "fixed_code": fixed,
                    "explanation": "修复说明：" + explanation})


if __name__ == "__main__":
    has_key = ai_config() is not None
    print("脚本运行器已启动：http://127.0.0.1:8899 （Ctrl-C 退出）")
    print("AI 自动修复：" + ("已启用（模型 {}）".format(os.environ.get("AI_MODEL") or "mistral-large-latest")
                            if has_key else
                            "未启用——设置 MISTRAL_API_KEY 或 OPENAI_API_KEY 后重启即可"))
    APP.run(host="127.0.0.1", port=8899, debug=False)
