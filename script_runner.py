#!/usr/bin/env python3
"""本地单文件脚本运行器：贴 Python 代码 → 运行 → 看结果。

自用工具，仅绑定 127.0.0.1，不做任何沙箱隔离——只运行你自己的代码。
用法：python3 script_runner.py 然后浏览器打开 http://127.0.0.1:8899
"""

import subprocess
import sys
import tempfile
import time
from pathlib import Path

from flask import Flask, jsonify, request

APP = Flask(__name__)
DEFAULT_TIMEOUT = 30
MAX_TIMEOUT = 300

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
  button:disabled { background: #555; }
  #out { white-space: pre-wrap; background: #0a0a0a; border: 1px solid #333;
         border-radius: 6px; padding: 12px; min-height: 60px; font-size: 13px; }
  .meta { color: #8ab4f8; margin-bottom: 6px; }
  .err { color: #ff8a80; }
  input[type=number] { width: 70px; background: #1b1b1b; color: #eee;
                       border: 1px solid #444; border-radius: 4px; padding: 4px; }
</style>
</head>
<body>
<h3>本地脚本运行器 <small style="color:#777">（stdout / stderr / 退出码）</small></h3>
<textarea id="code" spellcheck="false" placeholder="print('hello')"></textarea>
<div class="bar">
  超时 <input type="number" id="timeout" value="__DEFAULT_TIMEOUT__" min="1" max="__MAX_TIMEOUT__"> 秒
  <button id="btn" onclick="run()">▶ 运行</button>
</div>
<div id="out">输出会显示在这里。</div>
<script>
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
async function run() {
  const btn = document.getElementById('btn');
  const out = document.getElementById('out');
  btn.disabled = true; btn.textContent = '运行中…';
  out.innerHTML = '<span class="meta">执行中…</span>';
  const started = Date.now();
  try {
    const res = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: document.getElementById('code').value,
        timeout: parseInt(document.getElementById('timeout').value) || __DEFAULT_TIMEOUT__,
      }),
    });
    const r = await res.json();
    const secs = ((Date.now() - started) / 1000).toFixed(2);
    let html = '<div class="meta">退出码=' + r.return_code
      + ' · 用时=' + secs + 's'
      + (r.timed_out ? ' · <b class="err">已超时强杀</b>' : '') + '</div>';
    if (r.stdout) html += escapeHtml('── stdout ──') + '\n' + escapeHtml(r.stdout);
    if (r.stderr) html += '\n<span class="err">' + escapeHtml('── stderr ──') + '\n'
      + escapeHtml(r.stderr) + '</span>';
    out.innerHTML = '<pre style="margin:0;font:inherit">' + (html || '（无输出）') + '</pre>';
  } catch (e) {
    out.innerHTML = '<span class="err">请求失败：' + e + '</span>';
  }
  btn.disabled = false; btn.textContent = '▶ 运行';
}
</script>
</body>
</html>"""


@APP.get("/")
def index():
    return PAGE.replace("__DEFAULT_TIMEOUT__", str(DEFAULT_TIMEOUT)) \
               .replace("__MAX_TIMEOUT__", str(MAX_TIMEOUT))


@APP.post("/run")
def run():
    data = request.get_json(force=True, silent=True) or {}
    code = data.get("code", "")
    try:
        timeout = max(1, min(int(data.get("timeout", DEFAULT_TIMEOUT)), MAX_TIMEOUT))
    except (TypeError, ValueError):
        timeout = DEFAULT_TIMEOUT
    if not code.strip():
        return jsonify({"return_code": -1, "stdout": "", "stderr": "empty code", "timed_out": False})

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
        result = {"return_code": -1,
                  "stdout": (exc.stdout or b"").decode(errors="replace") if isinstance(exc.stdout, bytes) else (exc.stdout or ""),
                  "stderr": ((exc.stderr or b"").decode(errors="replace") if isinstance(exc.stderr, bytes) else (exc.stderr or "")) + f"\n[runner] 超过 {timeout} 秒，进程已被强杀"}
    finally:
        Path(path).unlink(missing_ok=True)
    result["timed_out"] = timed_out
    result["elapsed"] = round(time.monotonic() - started, 3)
    return jsonify(result)


if __name__ == "__main__":
    print("脚本运行器已启动：http://127.0.0.1:8899 （Ctrl-C 退出）")
    APP.run(host="127.0.0.1", port=8899, debug=False)
