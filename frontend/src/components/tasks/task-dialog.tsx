"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useTaskStore } from "@/stores/task-store";
import type { Task } from "@/types/task";
export function TaskDialog({ open, onOpenChange, task }: { open: boolean; onOpenChange: (v: boolean) => void; task?: Task | null; }) {
  const { createTask, updateTask } = useTaskStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "TODO" as Task["status"], priority: "MEDIUM" as Task["priority"], category: "", tags: "", dueDate: "" });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (task) setForm({ title: task.title, description: task.description || "", status: task.status, priority: task.priority, category: task.category || "", tags: task.tags.join(", "), dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "" });
    else setForm({ title: "", description: "", status: "TODO", priority: "MEDIUM", category: "", tags: "", dueDate: "" });
    setError(null);
  }, [task, open]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true); setError(null);
    try {
      const payload: any = { title: form.title.trim(), description: form.description.trim() || undefined, status: form.status, priority: form.priority, category: form.category.trim() || undefined, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean), dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined };
      if (task) await updateTask(task.id, payload); else await createTask(payload);
      onOpenChange(false);
    } catch (err: any) { const msg = err.response?.data?.message || err.message || "Something went wrong"; setError(Array.isArray(msg) ? msg.join(", ") : msg); } finally { setLoading(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="sm:max-w-[520px]">
        <DialogHeader><DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle><p className="text-sm text-zinc-500">Keep your tasks organized and track progress.</p></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="text-sm font-medium">Title *</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Design review meeting" className="mt-1" maxLength={200} /></div>
          <div><label className="text-sm font-medium">Description</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add details..." rows={3} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Status</label><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="mt-1"><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></Select></div>
            <div><label className="text-sm font-medium">Priority</label><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })} className="mt-1"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Category</label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Work, Personal..." className="mt-1" /></div>
            <div><label className="text-sm font-medium">Due date</label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1" /></div>
          </div>
          <div><label className="text-sm font-medium">Tags</label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Comma separated: design, urgent" className="mt-1" /><p className="text-xs text-zinc-500 mt-1">Separate with commas.</p></div>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? "Saving..." : task ? "Save changes" : "Create task"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
