'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import type { Task, Stats } from '@/types/task';

interface TaskState {
  tasks: Task[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  search: string;
  statusFilter: string;
  priorityFilter: string;
  categoryFilter: string;
  fetchTasks: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createTask: (payload: Partial<Task> & { title: string }) => Promise<Task>;
  updateTask: (id: string, payload: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, status: Task['status']) => Promise<Task>;
  reorderLocally: (
    activeId: string,
    overId: string | null,
    overColumn: Task['status'] | null
  ) => void;
  setSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setPriorityFilter: (value: string) => void;
  setCategoryFilter: (value: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  stats: null,
  loading: false,
  error: null,
  search: '',
  statusFilter: 'all',
  priorityFilter: 'all',
  categoryFilter: 'all',

  setSearch: value => set({ search: value }),
  setStatusFilter: value => set({ statusFilter: value }),
  setPriorityFilter: value => set({ priorityFilter: value }),
  setCategoryFilter: value => set({ categoryFilter: value }),

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const { search, statusFilter, priorityFilter, categoryFilter } = get();
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      const { data } = await api.get('/tasks', { params });
      set({ tasks: data.data, loading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load tasks'), loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get('/tasks/stats');
      set({ stats: data });
    } catch {
      // silent
    }
  },

  createTask: async payload => {
    const { data } = await api.post('/tasks', {
      title: payload.title,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      category: payload.category,
      tags: payload.tags,
      dueDate: payload.dueDate,
      projectId: payload.projectId,
    });
    set(s => ({ tasks: [data, ...s.tasks] }));
    get().fetchStats();
    return data;
  },

  // optimistic reorder — used by kanban DnD before API confirms
  reorderLocally: (activeId: string, overId: string | null, overColumn: Task['status'] | null) =>
    set(state => {
      const active = state.tasks.find(t => t.id === activeId);
      if (!active) return state;
      // if dropped on a column (empty) -> just change status, append at end
      if (overColumn && !overId) {
        return {
          tasks: state.tasks.map(t => (t.id === activeId ? { ...t, status: overColumn } : t)),
        };
      }
      const over = overId ? state.tasks.find(t => t.id === overId) : null;
      const newStatus = over ? over.status : overColumn || active.status;
      // if over is a card in same column, reorder within column
      if (over && over.status === active.status && overId) {
        const columnTasks = state.tasks.filter(t => t.status === active.status);
        const oldIndex = columnTasks.findIndex(t => t.id === activeId);
        const newIndex = columnTasks.findIndex(t => t.id === overId);
        if (oldIndex === -1 || newIndex === -1) return state;
        const reordered = [...columnTasks];
        reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, { ...active, status: newStatus });
        const others = state.tasks.filter(t => t.status !== active.status);
        const merged = [...others, ...reordered.map((t, i) => ({ ...t, order: i }))];
        // keep original order for other columns, but board filters by status so fine
        return { tasks: merged };
      }
      // cross-column move: change status, insert near over card if any
      if (over && over.status !== active.status && overId) {
        const targetColumn = state.tasks.filter(t => t.status === newStatus);
        const overIdx = targetColumn.findIndex(t => t.id === overId);
        const moved = { ...active, status: newStatus } as Task;
        const newTarget = [...targetColumn];
        if (overIdx >= 0) newTarget.splice(overIdx, 0, moved);
        else newTarget.push(moved);
        const rest = state.tasks.filter(t => t.id !== activeId && t.status !== newStatus);
        return { tasks: [...rest, ...newTarget.map((t, i) => ({ ...t, order: i }))] };
      }
      // fallback: column drop
      if (overColumn) {
        return {
          tasks: state.tasks.map(t => (t.id === activeId ? { ...t, status: overColumn } : t)),
        };
      }
      return state;
    }),

  updateTask: async (id, payload) => {
    const { data } = await api.patch(`/tasks/${id}`, payload);
    set(s => ({ tasks: s.tasks.map(t => (t.id === id ? data : t)) }));
    get().fetchStats();
    return data;
  },

  deleteTask: async id => {
    await api.delete(`/tasks/${id}`);
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
    get().fetchStats();
  },

  moveTask: async (id, status) => {
    return get().updateTask(id, { status });
  },
}));
