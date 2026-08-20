"use client";
import { format, isPast, isToday } from "date-fns";
import { Clock, Trash2, Pencil, GripVertical, Tag, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
const priorityConfig = {
  LOW: { label: "Low", variant: "secondary" as const, dot: "bg-emerald-500" },
  MEDIUM: { label: "Medium", variant: "warning" as const, dot: "bg-amber-500" },
  HIGH: { label: "High", variant: "danger" as const, dot: "bg-red-500" },
};
const statusConfig = {
  TODO: { label: "To Do", className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  DONE: { label: "Done", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
};
export function TaskCard({ task, onEdit, onDelete, onStatusChange, draggable }: { task: Task; onEdit: () => void; onDelete: () => void; onStatusChange: (s: Task["status"]) => void; draggable?: boolean; }) {
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = due && isPast(due) && task.status !== "DONE" && !isToday(due);
  const isDueToday = due && isToday(due);
  return (
    <Card className={cn("group relative flex flex-col gap-3 p-4 transition-all hover:shadow-md hover:-translate-y-0.5", task.status === "DONE" && "opacity-60")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {draggable && <GripVertical className="h-4 w-4 shrink-0 text-zinc-400 cursor-grab" />}
          <h3 className={cn("text-sm font-medium leading-tight truncate", task.status === "DONE" && "line-through text-zinc-500")}>{task.title}</h3>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0", statusConfig[task.status].className)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", task.status === "TODO" ? "bg-zinc-500" : task.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-emerald-500")} />
          {statusConfig[task.status].label}
        </span>
      </div>
      {task.description && <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">{task.description}</p>}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant={priorityConfig[task.priority].variant} className="gap-1"><span className={cn("h-1.5 w-1.5 rounded-full", priorityConfig[task.priority].dot)} />{priorityConfig[task.priority].label}</Badge>
        {task.category && <Badge variant="outline" className="gap-1"><Tag className="h-3 w-3" /> {task.category}</Badge>}
        {due && <Badge variant="outline" className={cn("gap-1", isOverdue && "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300", isDueToday && "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300")}><Calendar className="h-3 w-3" />{format(due, "MMM d")}{isOverdue && " • Overdue"}{isDueToday && " • Today"}</Badge>}
      </div>
      {task.tags.length > 0 && <div className="flex flex-wrap gap-1">{task.tags.map((t) => (<span key={t} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">#{t}</span>))}</div>}
      <div className="flex items-center justify-between pt-1">
        <span className="flex items-center gap-1 text-[11px] text-zinc-400"><Clock className="h-3 w-3" /> {format(new Date(task.createdAt), "MMM d, yyyy")}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={onDelete} aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      <div className="flex gap-1 pt-1">
        {(["TODO", "IN_PROGRESS", "DONE"] as const).map((s) => (
          <button key={s} onClick={() => onStatusChange(s)} className={cn("flex-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors", task.status === s ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700")}>{s === "TODO" ? "To Do" : s === "IN_PROGRESS" ? "Progress" : "Done"}</button>
        ))}
      </div>
    </Card>
  );
}
