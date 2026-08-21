'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { Sidebar } from '@/components/app/sidebar';
import { BoardColumn } from '@/components/app/board-column';
import { ListView } from '@/components/app/list-view';
import { TaskDetail } from '@/components/app/task-detail';
import { TaskDialog } from '@/components/tasks/task-dialog';
import { FieldsMenu } from '@/components/app/fields-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { useTaskStore } from '@/stores/task-store';
import { api } from '@/lib/api';
import type { Project, Task, FieldsConfig } from '@/types/task';
import { useToastStore, Toaster } from '@/components/app/toast';
import { BoardSkeleton } from '@/components/app/splash';

export default function ProjectTasksPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { init, isAuthenticated } = useAuthStore();
  const { tasks, loading, fetchTasks, updateTask, deleteTask } = useTaskStore();
  const push = useToastStore(s => s.push);

  const [project, setProject] = useState<Project | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [view, setView] = useState<'board' | 'list'>('list');
  const [q, setQ] = useState('');
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [fields, setFields] = useState<FieldsConfig>({
    priority: true,
    members: true,
    dueDate: true,
    labels: false,
    status: false,
    reporter: false,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<Task['status']>('TODO');

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    api
      .get(`/projects/${id}`)
      .then(r => setProject(r.data))
      .catch(() => router.replace('/projects'));
    // fetch tasks for project
    fetchTasks();
  }, [isAuthenticated, id, fetchTasks, router]);

  // filter tasks to this project on the frontend (and search)
  const filtered = useMemo(() => {
    let t = tasks.filter(x => x.projectId === id);
    if (q.trim()) {
      const s = q.toLowerCase();
      t = t.filter(
        x => x.title.toLowerCase().includes(s) || (x.description || '').toLowerCase().includes(s)
      );
    }
    return t;
  }, [tasks, id, q]);

  const todo = filtered.filter(t => t.status === 'TODO');
  const doing = filtered.filter(t => t.status === 'IN_PROGRESS');
  const completed = filtered.filter(t => t.status === 'DONE');
  const onHold = filtered.filter(t => t.status === 'ON_HOLD');

  const openCreate = (status: Task['status'] = 'TODO') => {
    setCreateStatus(status);
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (t: Task) => {
    setDetailTask(t);
    setDetailOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(taskId);
    push({ title: 'Task deleted', type: 'success' });
  };

  const handleStatus = async (taskId: string, status: Task['status']) => {
    await updateTask(taskId, { status });
    push({ title: `Moved to ${status}`, type: 'success' });
  };

  if (!project && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm">Loading project…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f6f6f5] dark:bg-zinc-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
        active="projects"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* breadcrumb + topbar — like Figma: “Projects › Design Homepage” */}
        <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-500">
            <Link href="/projects" className="hover:underline">
              Projects
            </Link>
            <span>›</span>
            <span className="font-medium text-zinc-900 dark:text-white">
              {project?.title || 'Project'}
            </span>
          </div>
          <div className="flex flex-col gap-3 px-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-sm font-semibold">Tasks</h1>

            <div className="flex items-center gap-2">
              <div className="relative hidden sm:flex">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search tasks"
                  className="h-8 w-[220px] rounded-lg bg-zinc-50 pl-8 text-xs dark:bg-zinc-900"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setFieldsOpen(v => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  Fields
                </button>
                <div className="absolute right-0 top-full mt-2">
                  <FieldsMenu
                    open={fieldsOpen}
                    onClose={() => setFieldsOpen(false)}
                    value={fields}
                    onChange={setFields}
                  />
                </div>
              </div>

              <button className="hidden rounded-lg border border-zinc-200 bg-white p-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 sm:inline-flex">
                ∇
              </button>

              <Button
                size="sm"
                className="h-8 rounded-lg bg-zinc-900 px-3 text-xs font-semibold dark:bg-white dark:text-zinc-900"
                onClick={() => openCreate('TODO')}
              >
                <Plus className="h-3.5 w-3.5" /> Add Task
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-[1400px]">
            {loading && filtered.length === 0 ? (
              <BoardSkeleton />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <h3 className="text-sm font-semibold">No tasks in this project</h3>
                <p className="mt-1 max-w-sm text-xs text-zinc-500">
                  Add a task — it will be linked to “{project?.title}”.
                </p>
                <Button className="mt-4 rounded-full" onClick={() => openCreate('TODO')}>
                  <Plus className="h-4 w-4" /> Create task
                </Button>
              </div>
            ) : (
              <ListView tasks={filtered} fields={fields} onOpen={openEdit} onAdd={openCreate} />
            )}
          </div>
        </div>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={o => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        task={editing}
        defaultStatus={createStatus}
        defaultProjectId={id}
      />

      <TaskDetail
        task={detailTask}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdated={t => {
          setDetailTask(t);
          fetchTasks();
        }}
      />

      <Toaster />
    </div>
  );
}
