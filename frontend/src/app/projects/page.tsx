'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { Sidebar } from '@/components/app/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { useProjectStore } from '@/stores/project-store';
import { ProjectDialog } from '@/components/projects/project-dialog';
import { Toaster, useToastStore } from '@/components/app/toast';
import { Splash } from '@/components/app/splash';
import Link from 'next/link';
import type { Priority, Project } from '@/types/task';
import { cn } from '@/lib/utils';

const priorityMeta: Record<string, { label: string; color: string }> = {
  NONE: { label: 'No Priority', color: 'text-zinc-400' },
  LOW: { label: 'Low', color: 'text-zinc-500' },
  MEDIUM: { label: 'Medium', color: 'text-amber-600' },
  HIGH: { label: 'High', color: 'text-red-600' },
  URGENT: { label: 'Urgent', color: 'text-red-700' },
};

export default function ProjectsPage() {
  const { init, isAuthenticated } = useAuthStore();
  const { projects, loading, fetchProjects, updateProject } = useProjectStore();
  const push = useToastStore(s => s.push);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [q, setQ] = useState('');
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [priorityPick, setPriorityPick] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [priorityMenu, setPriorityMenu] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    init();
  }, [init]);
  useEffect(() => {
    if (isAuthenticated) fetchProjects();
  }, [isAuthenticated, fetchProjects]);
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return projects;
    const s = q.toLowerCase();
    return projects.filter(
      p => p.title.toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s)
    );
  }, [projects, q]);

  if (showSplash) return <Splash onDone={() => setShowSplash(false)} />;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc] p-6 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-sm font-medium">Please login to view projects</p>
          <Link
            href="/login"
            className="mt-3 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-zinc-900"
          >
            Go to login →
          </Link>
        </div>
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
        {/* topbar — Figma exactly: title left, search + Fields + Filter + Add Task right */}
        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(v => !v)}
              className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 md:hidden"
            >
              <span className="text-sm">☰</span>
            </button>
            <h1 className="text-sm font-semibold">Projects</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden items-center sm:flex">
              <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-zinc-400" />
              <Input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search projects"
                className="h-8 w-[220px] rounded-lg bg-zinc-50 pl-8 text-sm dark:bg-zinc-900"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setFieldsOpen(v => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Fields
              </button>
              <AnimatePresence>
                {fieldsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="space-y-1">
                      {[
                        { k: 'status', label: 'Status' },
                        { k: 'priority', label: 'Priority' },
                        { k: 'members', label: 'Members' },
                        { k: 'dueDate', label: 'Due Date' },
                        { k: 'teams', label: 'Teams' },
                        { k: 'labels', label: 'Labels' },
                        { k: 'reporter', label: 'Reporter' },
                      ].map(it => (
                        <button
                          key={it.k}
                          onClick={() => {
                            setFieldsOpen(false);
                            if (it.k === 'priority') setPriorityPick(v => (v ? null : 'priority'));
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          <span>{it.label}</span>
                          <span className="text-zinc-400">›</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* priority sub-menu — like Figma 2nd screenshot */}
              {priorityPick && (
                <motion.div
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-[230px] top-0 z-20 w-52 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="px-2 py-1 text-xs font-semibold text-zinc-500">Priority</p>
                  {['No Priority', 'Urgent', 'High', 'Medium', 'Low'].map(p => (
                    <button
                      key={p}
                      onClick={() => {
                        const map: Record<string, Priority> = {
                          'No Priority': 'NONE',
                          Urgent: 'URGENT',
                          High: 'HIGH',
                          Medium: 'MEDIUM',
                          Low: 'LOW',
                        };
                        fetchProjects({ priority: map[p] });
                        setPriorityPick(null);
                        setFieldsOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <span
                        className={
                          p === 'Urgent'
                            ? 'text-red-600'
                            : p === 'High'
                              ? 'text-red-600'
                              : p === 'Medium'
                                ? 'text-amber-600'
                                : 'text-zinc-500'
                        }
                      >
                        {p}
                      </span>
                      {p === 'Urgent' && <span>✓</span>}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      fetchProjects({});
                      setPriorityPick(null);
                      setFieldsOpen(false);
                    }}
                    className="mt-1 w-full rounded-lg bg-zinc-900 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-zinc-900"
                  >
                    Clear filter
                  </button>
                </motion.div>
              )}
            </div>

            <button
              onClick={() => fetchProjects({})}
              className="hidden rounded-lg border border-zinc-200 bg-white p-1.5 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 sm:inline-flex"
            >
              <span className="px-1 text-xs">∇</span>
            </button>

            <Button
              size="sm"
              className="h-8 rounded-lg bg-zinc-900 px-3 text-xs font-semibold dark:bg-white dark:text-zinc-900"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add Project
            </Button>
          </div>

          <div className="relative flex sm:hidden">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search projects"
              className="h-9 rounded-xl bg-zinc-50 pl-8 text-sm dark:bg-zinc-900"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-[1100px]">
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              {/* header */}
              <div className="grid grid-cols-12 gap-2 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900">
                <div className="col-span-6 sm:col-span-5">Projects</div>
                <div className="col-span-2 hidden sm:block">Priority</div>
                <div className="col-span-2 hidden sm:block">Lead</div>
                <div className="col-span-3 sm:col-span-2">Due Date</div>
                <div className="col-span-3 sm:col-span-1 text-right">Actions</div>
              </div>

              {loading && projects.length === 0 ? (
                <div className="space-y-2 p-3">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
                    />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <p className="text-sm font-medium">No projects yet</p>
                  <p className="mt-1 text-xs text-zinc-500">Create one — then add tasks inside.</p>
                  <Button
                    className="mt-4 rounded-full"
                    onClick={() => {
                      setEditing(null);
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" /> New project
                  </Button>
                </div>
              ) : (
                filtered.map(p => {
                  const pri = priorityMeta[p.priority] || priorityMeta.MEDIUM;
                  return (
                    <div
                      key={p.id}
                      className="grid grid-cols-12 items-center gap-2 border-t border-zinc-100 px-3 py-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <div className="col-span-6 flex min-w-0 items-center gap-2 sm:col-span-5">
                        <Link
                          href={`/projects/${p.id}`}
                          className="truncate font-medium hover:underline"
                        >
                          {p.title}
                        </Link>
                      </div>
                      <div className="col-span-2 hidden sm:flex">
                        <div className="relative">
                          <button
                            onClick={() => setPriorityMenu(priorityMenu === p.id ? null : p.id)}
                            className={cn(
                              'inline-flex items-center gap-1 text-xs font-medium',
                              pri.color
                            )}
                          >
                            ◼ {pri.label}
                          </button>
                          {priorityMenu === p.id && (
                            <div className="absolute left-0 top-6 z-10 w-40 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                              {(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'] as Priority[]).map(
                                pr => (
                                  <button
                                    key={pr}
                                    onClick={async () => {
                                      setPriorityMenu(null);
                                      await updateProject(p.id, { priority: pr });
                                      push({ title: `Priority → ${pr}`, type: 'success' });
                                    }}
                                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 ${p.priority === pr ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : ''}`}
                                  >
                                    <span>{pr}</span>
                                    {p.priority === pr && <Check className="h-3 w-3" />}
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2 hidden items-center gap-2 sm:flex">
                        {p.lead ? (
                          <>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-medium text-white dark:bg-white dark:text-zinc-900">
                              {p.lead.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="text-xs">{p.lead}</span>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditing(p);
                              setDialogOpen(true);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-zinc-300 bg-white text-xs dark:border-zinc-700 dark:bg-zinc-900"
                          >
                            +
                          </button>
                        )}
                      </div>
                      <div className="col-span-3 text-xs text-zinc-600 dark:text-zinc-400 sm:col-span-2">
                        {p.dueDate ? format(new Date(p.dueDate), 'dd MMM yyyy') : '—'}
                      </div>
                      <div className="col-span-3 flex justify-end gap-1 sm:col-span-1">
                        <Link
                          href={`/projects/${p.id}`}
                          className="rounded-lg p-1.5 hover:bg-white dark:hover:bg-zinc-800"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}

              <button
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
                className="flex w-full items-center gap-1 border-t border-zinc-100 px-3 py-2.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" /> Add Projects
              </button>
            </div>

            <p className="mt-3 text-xs text-zinc-400">{filtered.length} projects</p>
          </div>
        </div>
      </div>

      <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} project={editing} />
      <Toaster />
    </div>
  );
}
