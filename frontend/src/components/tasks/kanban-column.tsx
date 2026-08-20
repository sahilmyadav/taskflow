"use client";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { TaskCard } from "./task-card";
export function KanbanColumn({ title, count, tasks, accent, onEdit, onDelete, onStatusChange }: { title: string; count: number; tasks: Task[]; accent: string; onEdit: (t: Task) => void; onDelete: (id: string) => void; onStatusChange: (id: string, s: Task["status"]) => void; }) {
  return (
    <div className="flex w-full min-w-[300px] flex-col rounded-2xl border border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", accent)} /><h3 className="text-sm font-semibold">{title}</h3><span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{count}</span></div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3">
        {tasks.length === 0 ? <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900"><p className="text-sm text-zinc-500">No tasks yet</p></div> : tasks.map((t) => <TaskCard key={t.id} task={t} onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} onStatusChange={(s) => onStatusChange(t.id, s)} />)}
      </div>
    </div>
  );
}
