'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { useTaskStore } from '@/stores/task-store';
import type { Task, FieldsConfig } from '@/types/task';
import { getErrorMessage } from '@/lib/errors';
import { Sidebar } from '@/components/app/sidebar';
import { Topbar } from '@/components/app/topbar';
import { FieldsMenu } from '@/components/app/fields-menu';
import { BoardColumn } from '@/components/app/board-column';
import { ListView } from '@/components/app/list-view';
import { TaskDetail } from '@/components/app/task-detail';
import { BoardSkeleton, Splash } from '@/components/app/splash';
import { TaskDialog } from '@/components/tasks/task-dialog';
import { Toaster, useToastStore } from '@/components/app/toast';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { BoardCard } from '@/components/app/board-card';

const COLUMNS: Task['status'][] = ['TODO', 'IN_PROGRESS', 'DONE', 'ON_HOLD'];

export default function HomePage() {
  const { isAuthenticated, init: initAuth, user } = useAuthStore();
  const { tasks, loading, fetchTasks, fetchStats, updateTask, deleteTask } = useTaskStore();
  const push = useToastStore(s => s.push);

  const [view, setView] = useState<'board' | 'list'>('board');
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [fields, setFields] = useState<FieldsConfig>({
    priority: true,
    members: true,
    dueDate: true,
    labels: false,
    status: false,
    reporter: false,
  });
  const [search, setSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [createStatus, setCreateStatus] = useState<Task['status']>('TODO');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumn, setOverColumn] = useState<Task['status'] | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchStats();
    }
  }, [isAuthenticated, fetchTasks, fetchStats]);
  useEffect(() => {
    // hide splash quickly if already authed
    const t = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q)
    );
  }, [tasks, search]);

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
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(id);
    push({ title: 'Task deleted', type: 'success' });
  };
  const handleStatus = async (id: string, status: Task['status']) => {
    await updateTask(id, { status });
    push({ title: `Moved to ${status}`, type: 'success' });
  };

  // --- Kanban DnD ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } })
  );
  const titleFor = (s: Task['status']) =>
    s === 'TODO' ? 'To Do' : s === 'IN_PROGRESS' ? 'Doing' : s === 'DONE' ? 'Completed' : 'On Hold';

  const getTaskById = useCallback((id: string) => tasks.find(t => t.id === id) || null, [tasks]);

  const onDragStart = useCallback(
    (e: DragStartEvent) => {
      const t = getTaskById(String(e.active.id));
      if (t) setActiveTask(t);
    },
    [getTaskById]
  );

  const onDragOver = useCallback(
    (e: DragOverEvent) => {
      const overId = e.over?.id ? String(e.over.id) : null;
      if (!overId) {
        setOverColumn(null);
        return;
      }
      if ((COLUMNS as string[]).includes(overId)) {
        setOverColumn(overId as Task['status']);
        return;
      }
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        setOverColumn(overTask.status);
        return;
      }
      const colFromData = (
        e.over?.data?.current as { status?: Task['status'] } | undefined
      )?.status;
      if (colFromData && (COLUMNS as string[]).includes(colFromData)) {
        setOverColumn(colFromData);
        return;
      }
      setOverColumn(null);
    },
    [tasks]
  );

  const onDragEnd = useCallback(
    async (e: DragEndEvent) => {
      const activeId = String(e.active.id);
      const overIdRaw = e.over?.id ? String(e.over.id) : null;
      const prev = getTaskById(activeId);
      setActiveTask(null);
      setOverColumn(null);
      if (!prev || !overIdRaw) return;
      if (activeId === overIdRaw) return;

      let targetStatus: Task['status'] | null = null;
      let targetOverCardId: string | null = null;

      if ((COLUMNS as string[]).includes(overIdRaw)) {
        targetStatus = overIdRaw as Task['status'];
      } else {
        const overTask = getTaskById(overIdRaw);
        if (overTask) {
          targetStatus = overTask.status;
          targetOverCardId = overTask.id;
        }
      }
      if (!targetStatus || (targetStatus === prev.status && !targetOverCardId)) {
        // same column drop on itself handled, or cross-column without target — still update if column drop
        if (targetStatus && targetStatus !== prev.status) {
          // pure column drop
        } else {
          return;
        }
      }

      // optimistic UI (supports both reorder within column and cross-column)
      const store = useTaskStore.getState();
      store.reorderLocally(activeId, targetOverCardId, targetStatus);

      // Determine final order for reorder endpoint: collect ordered ids for target column after optimistic move
      // refetch tasks from store after optimistic update
      const after = useTaskStore.getState().tasks.filter(t => t.status === targetStatus);
      const orderedIds = after.map(t => t.id);

      try {
        // 1) update status (required to move column)
        if (targetStatus !== prev.status) {
          await updateTask(activeId, { status: targetStatus });
        }
        // 2) persist order within that column (if we moved position or changed column)
        if (targetOverCardId || targetStatus !== prev.status) {
          try {
            const { api } = await import('@/lib/api');
            await api.patch('/tasks/reorder', { orderedIds });
          } catch {
            // reorder is best-effort
          }
        }
        push({ title: `Moved to ${titleFor(targetStatus!)}`, type: 'success' });
      } catch (err) {
        // revert on failure
        await store.fetchTasks();
        push({ title: getErrorMessage(err, 'Move failed'), type: 'error' });
      }
    },
    [getTaskById, updateTask, push]
  );

  if (showSplash) return <Splash onDone={() => setShowSplash(false)} />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] dark:bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.04]" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                ◆
              </span>{' '}
              TaskFlow
            </div>
            <Link href="/login">
              <Button size="sm" className="rounded-full">
                Continue as Guest →
              </Button>
            </Link>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs dark:border-zinc-800 dark:bg-zinc-900">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> New • Vercel-like motion • App
                splash
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Organize work,
                <br />
                <span className="bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent dark:from-white dark:to-zinc-400">
                  ship faster.
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Board + List, search, fields toggle, subtasks, comments, priority & dates. Built for
                the Figma task — with our own polished, human design.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/login">
                  <Button className="rounded-full" size="lg">
                    Continue as Guest →
                  </Button>
                </Link>
                <a href="#preview">
                  <Button variant="outline" className="rounded-full" size="lg">
                    See preview
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              id="preview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="grid gap-3 sm:grid-cols-3 text-left">
                {[
                  { title: 'Write API Documentation', status: 'Doing' },
                  { title: 'Deploy to Production', status: 'To Do' },
                  { title: 'Security Audit Scheduled', status: 'Completed' },
                ].map(i => (
                  <div
                    key={i.title}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                  >
                    <p className="text-sm font-medium">{i.title}</p>
                    <p className="text-xs text-zinc-500">{i.status} • High</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="border-t border-zinc-200 px-4 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
            Built with Next.js + NestJS • TaskFlow © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f6f6f5] dark:bg-zinc-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
        active="tasks"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative">
          <Topbar
            search={search}
            onSearch={setSearch}
            view={view}
            onView={setView}
            onAddTask={() => openCreate('TODO')}
            onFields={() => setFieldsOpen(v => !v)}
            onToggleSidebar={() => setSidebarCollapsed(v => !v)}
            showSidebarToggle
          />
          {/* fields dropdown anchored to topbar */}
          <div className="absolute right-4 top-[52px]">
            <FieldsMenu
              open={fieldsOpen}
              onClose={() => setFieldsOpen(false)}
              value={fields}
              onChange={setFields}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
            {/* mobile view toggle */}
            <div className="mb-3 flex items-center gap-2 sm:hidden">
              <button
                onClick={() => setView('board')}
                className={`flex-1 rounded-xl py-2 text-sm font-medium ${view === 'board' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'}`}
              >
                Board
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex-1 rounded-xl py-2 text-sm font-medium ${view === 'list' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'}`}
              >
                List
              </button>
            </div>

            {loading && tasks.length === 0 ? (
              <BoardSkeleton />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <h3 className="text-sm font-semibold">
                  {search ? `No results for "${search}"` : 'No tasks yet'}
                </h3>
                <p className="mt-1 max-w-sm text-xs text-zinc-500">
                  {search
                    ? 'Try a different search or clear filters.'
                    : 'Create your first task to get started.'}
                </p>
                {!search && (
                  <Button className="mt-4 rounded-full" onClick={() => openCreate('TODO')}>
                    <Plus className="h-4 w-4" /> Create task
                  </Button>
                )}
                {search && (
                  <Button
                    variant="outline"
                    className="mt-4 rounded-full"
                    onClick={() => setSearch('')}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : view === 'board' ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
              >
                <div className="flex gap-4 overflow-x-auto pb-4">
                  <BoardColumn
                    title="To Do"
                    status="TODO"
                    count={todo.length}
                    tasks={todo}
                    onAdd={() => openCreate('TODO')}
                    onOpen={openEdit}
                    onQuickStatus={handleStatus}
                    onDelete={handleDelete}
                    fields={fields}
                    isOver={overColumn === 'TODO'}
                  />
                  <BoardColumn
                    title="Doing"
                    status="IN_PROGRESS"
                    count={doing.length}
                    tasks={doing}
                    onAdd={() => openCreate('IN_PROGRESS')}
                    onOpen={openEdit}
                    onQuickStatus={handleStatus}
                    onDelete={handleDelete}
                    fields={fields}
                    isOver={overColumn === 'IN_PROGRESS'}
                  />
                  <BoardColumn
                    title="Completed"
                    status="DONE"
                    count={completed.length}
                    tasks={completed}
                    onAdd={() => openCreate('DONE')}
                    onOpen={openEdit}
                    onQuickStatus={handleStatus}
                    onDelete={handleDelete}
                    fields={fields}
                    isOver={overColumn === 'DONE'}
                  />
                  <BoardColumn
                    title="On Hold"
                    status="ON_HOLD"
                    count={onHold.length}
                    tasks={onHold}
                    onAdd={() => openCreate('ON_HOLD')}
                    onOpen={openEdit}
                    onQuickStatus={handleStatus}
                    onDelete={handleDelete}
                    fields={fields}
                    isOver={overColumn === 'ON_HOLD'}
                  />
                </div>
                <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.2,0,0,1)' }}>
                  {activeTask ? (
                    <BoardCard
                      task={activeTask}
                      onOpen={() => {}}
                      onQuickStatus={() => {}}
                      onDelete={() => {}}
                      fields={fields}
                      isOverlay
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : (
              <ListView tasks={filtered} fields={fields} onOpen={openEdit} onAdd={openCreate} />
            )}

            <div className="mt-6 flex items-center justify-between text-xs text-zinc-400">
              <span>
                {filtered.length} tasks • {user?.username}
              </span>
              <span className="hidden sm:inline">
                Fields:{' '}
                {Object.entries(fields)
                  .filter(([, v]) => v)
                  .map(([k]) => k)
                  .join(', ') || 'none'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* create/edit */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={o => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        task={editing}
        defaultStatus={createStatus}
      />

      {/* detail drawer */}
      <TaskDetail
        task={detailTask}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdated={t => {
          setDetailTask(t);
          fetchTasks();
          fetchStats();
        }}
      />

      <Toaster />
    </div>
  );
}
