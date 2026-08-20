"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, LayoutGrid, List, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskCard } from "@/components/tasks/task-card";
import { KanbanColumn } from "@/components/tasks/kanban-column";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { useTaskStore } from "@/stores/task-store";
import type { Task } from "@/types/task";
export default function HomePage() {
  const { isAuthenticated, init: initAuth } = useAuthStore();
  const { tasks, stats, loading, fetchTasks, fetchStats, updateTask, deleteTask } = useTaskStore();
  const [view, setView] = useState<"board" | "list">("board");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  useEffect(() => { initAuth(); }, [initAuth]);
  useEffect(() => { if (isAuthenticated) { fetchTasks(); fetchStats(); } }, [isAuthenticated, fetchTasks, fetchStats]);
  const handleEdit = (t: Task) => { setEditing(t); setDialogOpen(true); };
  const handleDelete = async (id: string) => { if (!confirm("Delete this task?")) return; await deleteTask(id); };
  const handleStatus = async (id: string, status: Task["status"]) => { await updateTask(id, { status } as any); };
  const todo = tasks.filter((t) => t.status === "TODO");
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
  const done = tasks.filter((t) => t.status === "DONE");
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium dark:border-zinc-800 dark:bg-zinc-900"><Sparkles className="h-3.5 w-3.5 text-amber-500" /> New • Themed, responsive, guest-ready</div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Organize work,<br /><span className="bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent dark:from-white dark:to-zinc-400">ship faster.</span></h1>
            <p className="max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">A polished task manager with Kanban, priorities, due dates, categories, tags, search & theme persistence. Built with Next.js (App Router) + NestJS + Prisma.</p>
            <div className="flex flex-wrap gap-3"><Link href="/login"><Button size="lg">Continue as Guest →</Button></Link><a href="#preview"><Button variant="outline" size="lg">See preview</Button></a></div>
            <ul className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-2"><li>✓ Light / Dark / System theme (persisted)</li><li>✓ Fully responsive</li><li>✓ Reusable components</li><li>✓ Validated NestJS APIs</li></ul>
          </div>
          <div id="preview" className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-200 via-white to-pink-200 opacity-60 blur-2xl dark:from-violet-950 dark:via-zinc-900 dark:to-pink-950" />
            <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between"><h3 className="font-semibold">Today</h3><span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs text-white dark:bg-white dark:text-zinc-900">3 tasks</span></div>
              <div className="mt-4 grid gap-3">
                {[{ title: "Design review — AbleSpace", status: "In Progress", prio: "High" },{ title: "Implement task API validation", status: "To Do", prio: "Medium" },{ title: "Write Part 2 walkthrough", status: "To Do", prio: "Medium" }].map((i) => (
                  <div key={i.title} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"><div><p className="text-sm font-medium">{i.title}</p><p className="text-xs text-zinc-500">{i.status} • {i.prio}</p></div><span className="h-2 w-2 rounded-full bg-emerald-500" /></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[{ title: "Clean APIs", desc: "Validation, JWT guest auth, Prisma + SQLite." },{ title: "Delightful UX", desc: "Kanban + List, filters, optimistic updates." },{ title: "Production grade", desc: "Structure, types, error handling, docs." }].map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><h4 className="font-semibold">{f.title}</h4><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{f.desc}</p></div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-zinc-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-zinc-500">To Do</p><p className="text-2xl font-bold">{stats.todo}</p></div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-zinc-500">In Progress</p><p className="text-2xl font-bold">{stats.inProgress}</p></div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-zinc-500">Done</p><p className="text-2xl font-bold">{stats.done}</p></div>
        </div>
      )}
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Your tasks</h1>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
              <button onClick={() => setView("board")} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${view === "board" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 dark:text-zinc-400"}`}><LayoutGrid className="h-4 w-4" /> Board</button>
              <button onClick={() => setView("list")} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${view === "list" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 dark:text-zinc-400"}`}><List className="h-4 w-4" /> List</button>
            </div>
            <Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> New task</Button>
          </div>
        </div>
        <TaskFilters />
        {loading && tasks.length === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />))}</div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"><BarChart3 className="h-6 w-6" /></div>
            <h3 className="mt-4 text-lg font-semibold">No tasks yet</h3>
            <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">Create your first task to get organized. You can add priorities, due dates, categories and tags.</p>
            <Button className="mt-6" onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> Create task</Button>
          </div>
        ) : view === "board" ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <KanbanColumn title="To Do" count={todo.length} tasks={todo} accent="bg-zinc-500" onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatus} />
            <KanbanColumn title="In Progress" count={inProgress.length} tasks={inProgress} accent="bg-blue-500" onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatus} />
            <KanbanColumn title="Done" count={done.length} tasks={done} accent="bg-emerald-500" onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatus} />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tasks.map((t) => (<TaskCard key={t.id} task={t} onEdit={() => handleEdit(t)} onDelete={() => handleDelete(t.id)} onStatusChange={(s) => handleStatus(t.id, s)} />))}</div>
        )}
      </div>
      <TaskDialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }} task={editing} />
    </div>
  );
}
