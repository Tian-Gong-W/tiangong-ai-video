"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface AdminTemplate {
  id: number;
  templateKey: string;
  name: string;
  coverUrl: string | null;
  previewVideoUrl: string | null;
  category: string;
  engine: string;
  workflowJson?: unknown;
  creditsCost: number;
  maxDuration: number | null;
  aspectRatio: string | null;
  supportImageToVideo: boolean;
  sortOrder: number | null;
  isActive: boolean;
}

const emptyForm = {
  templateKey: "",
  name: "",
  coverUrl: "",
  previewVideoUrl: "",
  category: "nsfw-video",
  engine: "comfyui",
  workflowJson: "",
  creditsCost: "10",
  maxDuration: "5",
  aspectRatio: "16:9",
  supportImageToVideo: true,
  sortOrder: "0",
  isActive: true,
};

const fieldCls =
  "w-full h-9 rounded-md border border-border bg-muted/40 px-3 text-sm text-foreground focus:outline-none focus:border-primary";

function errMsg(json: any, fallback: string) {
  return json?.error?.message || json?.message || fallback;
}

export default function AdminTemplatesPage() {
  const [items, setItems] = useState<AdminTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/templates");
      const json = await res.json();
      if (!res.ok) throw new Error(errMsg(json, "加载失败"));
      setItems(json.data.templates);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加载模板列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const startEdit = async (key: string) => {
    try {
      const res = await fetch(`/api/v1/admin/templates/${encodeURIComponent(key)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(errMsg(json, "加载失败"));
      const t = json.data.template;
      setForm({
        templateKey: t.templateKey,
        name: t.name,
        coverUrl: t.coverUrl || "",
        previewVideoUrl: t.previewVideoUrl || "",
        category: t.category,
        engine: t.engine,
        workflowJson: JSON.stringify(t.workflowJson, null, 2),
        creditsCost: String(t.creditsCost),
        maxDuration: String(t.maxDuration ?? 5),
        aspectRatio: t.aspectRatio || "16:9",
        supportImageToVideo: t.supportImageToVideo,
        sortOrder: String(t.sortOrder ?? 0),
        isActive: t.isActive,
      });
      setEditingKey(key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加载模板失败");
    }
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingKey(null);
  };

  const submit = async () => {
    if (!form.templateKey.trim() || !form.name.trim()) {
      toast.error("templateKey 和 name 必填");
      return;
    }
    const wfText = form.workflowJson.trim();
    if (!editingKey && !wfText) {
      toast.error("新建模板必须提供 ComfyUI 工作流 JSON");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        templateKey: form.templateKey.trim(),
        name: form.name.trim(),
        coverUrl: form.coverUrl.trim() || null,
        previewVideoUrl: form.previewVideoUrl.trim() || null,
        category: form.category.trim() || "nsfw-video",
        engine: form.engine.trim() || "comfyui",
        creditsCost: Number(form.creditsCost) || 10,
        maxDuration: Number(form.maxDuration) || 5,
        aspectRatio: form.aspectRatio.trim() || "16:9",
        supportImageToVideo: form.supportImageToVideo,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };
      if (wfText) payload.workflowJson = wfText;

      const url = editingKey
        ? `/api/v1/admin/templates/${encodeURIComponent(editingKey)}`
        : "/api/v1/admin/templates";
      const res = await fetch(url, {
        method: editingKey ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(errMsg(json, "保存失败"));
      toast.success(editingKey ? "模板已更新" : "模板已创建");
      resetForm();
      loadList();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t: AdminTemplate) => {
    try {
      const res = await fetch(`/api/v1/admin/templates/${encodeURIComponent(t.templateKey)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !t.isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(errMsg(json, "操作失败"));
      setItems((prev) =>
        prev.map((x) =>
          x.templateKey === t.templateKey ? { ...x, isActive: !t.isActive } : x
        )
      );
      toast.success(t.isActive ? "已停用" : "已启用");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    }
  };

  const remove = async (key: string) => {
    if (!window.confirm(`确认删除模板 ${key}？该操作不可恢复。`)) return;
    try {
      const res = await fetch(`/api/v1/admin/templates/${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(errMsg(json, "删除失败"));
      toast.success("模板已删除");
      if (editingKey === key) resetForm();
      loadList();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除失败");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold">模板管理</h1>
        <p className="text-sm text-muted-foreground mt-1">
          管理 ComfyUI 工作流模板：新建、编辑、上下架。工作流必须是 ComfyUI
          导出的 API 格式 JSON，提示词写 &lt;%prompt%&gt;、seed 写 &lt;%seed%&gt; 等占位符。
        </p>
      </div>

      {/* 表单 */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="font-medium">
          {editingKey ? `编辑模板：${editingKey}` : "新建模板"}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            className={fieldCls}
            placeholder="templateKey（唯一，如 wan22-doggy）"
            value={form.templateKey}
            onChange={(e) => setForm({ ...form, templateKey: e.target.value })}
          />
          <input
            className={fieldCls}
            placeholder="名称（前台展示）"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className={fieldCls}
            placeholder="封面图 URL（可选）"
            value={form.coverUrl}
            onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
          />
          <input
            className={fieldCls}
            placeholder="预览视频 URL（可选，mp4/webm，前台 hover 播放）"
            value={form.previewVideoUrl}
            onChange={(e) => setForm({ ...form, previewVideoUrl: e.target.value })}
          />
          <input
            className={fieldCls}
            placeholder="分类（默认 nsfw-video）"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            className={fieldCls}
            placeholder="引擎（默认 comfyui）"
            value={form.engine}
            onChange={(e) => setForm({ ...form, engine: e.target.value })}
          />
          <input
            className={fieldCls}
            type="number"
            placeholder="积分"
            value={form.creditsCost}
            onChange={(e) => setForm({ ...form, creditsCost: e.target.value })}
          />
          <input
            className={fieldCls}
            type="number"
            placeholder="最长秒数"
            value={form.maxDuration}
            onChange={(e) => setForm({ ...form, maxDuration: e.target.value })}
          />
          <input
            className={fieldCls}
            placeholder="宽高比（16:9/9:16/1:1）"
            value={form.aspectRatio}
            onChange={(e) => setForm({ ...form, aspectRatio: e.target.value })}
          />
          <input
            className={fieldCls}
            type="number"
            placeholder="排序（小在前）"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground h-9">
            <input
              type="checkbox"
              checked={form.supportImageToVideo}
              onChange={(e) => setForm({ ...form, supportImageToVideo: e.target.checked })}
            />
            支持图生视频
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground h-9">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            启用（前台可见）
          </label>
        </div>
        <textarea
          className="w-full min-h-[200px] rounded-md border border-border bg-muted/40 p-3 text-xs font-mono text-foreground focus:outline-none focus:border-primary resize-y"
          placeholder="粘贴 ComfyUI API 格式工作流 JSON（对象或 JSON 字符串均可）"
          value={form.workflowJson}
          onChange={(e) => setForm({ ...form, workflowJson: e.target.value })}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "保存中..." : editingKey ? "保存修改" : "创建模板"}
          </button>
          {editingKey && (
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground"
            >
              取消编辑
            </button>
          )}
        </div>
      </div>

      {/* 列表 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border font-medium">
          模板列表{loading ? "（加载中...）" : `（共 ${items.length} 个）`}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="px-5 py-2.5">Key</th>
              <th className="px-3 py-2.5">名称</th>
              <th className="px-3 py-2.5">分类</th>
              <th className="px-3 py-2.5">积分</th>
              <th className="px-3 py-2.5">启用</th>
              <th className="px-5 py-2.5 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.templateKey} className="border-b border-border/50 last:border-0">
                <td className="px-5 py-3 font-mono text-xs">{t.templateKey}</td>
                <td className="px-3 py-3">{t.name}</td>
                <td className="px-3 py-3 text-muted-foreground">{t.category}</td>
                <td className="px-3 py-3">{t.creditsCost}</td>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={t.isActive}
                    onChange={() => toggleActive(t)}
                  />
                </td>
                <td className="px-5 py-3 text-right space-x-2">
                  <button
                    onClick={() => startEdit(t.templateKey)}
                    className="px-2.5 py-1 rounded-md border border-border text-xs hover:bg-muted"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => remove(t.templateKey)}
                    className="px-2.5 py-1 rounded-md border border-destructive/40 text-xs text-destructive hover:bg-destructive/10"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                  还没有模板，用上方表单创建第一个
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
