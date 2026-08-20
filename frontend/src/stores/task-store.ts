"use client";
import { create } from "zustand";
import { api } from "@/lib/api";
import type { Task, Stats } from "@/types/task";
interface TaskState {
  tasks: Task[]; stats: Stats | null; loading: boolean; error: string | null;
  search: string; statusFilter: string; priorityFilter: string; categoryFilter: string;
  fetchTasks: () => Promise<void>; fetchStats: () => Promise<void>;
  createTask: (payload: Partial<Task> & { title: string }) => Promise<Task>;
  updateTask: (id: string, payload: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, status: Task["status"]) => Promise<Task>;
  setSearch: (v: string) => void; setStatusFilter: (v: string) => void; setPriorityFilter: (v: string) => void; setCategoryFilter: (v: string) => void;
}
export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [], stats: null, loading: false, error: null, search: "", statusFilter: "all", priorityFilter: "all", categoryFilter: "all",
  setSearch: (v) => set({ search: v }), setStatusFilter: (v) => set({ statusFilter: v }), setPriorityFilter: (v) => set({ priorityFilter: v }), setCategoryFilter: (v) => set({ categoryFilter: v }),
  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const { search, statusFilter, priorityFilter, categoryFilter } = get();
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;
      const { data } = await api.get("/tasks", { params });
      set({ tasks: data.data, loading: false });
    } catch (e: any) { set({ error: e.message, loading: false }); }
  },
  fetchStats: async () => { try { const { data } = await api.get("/tasks/stats"); set({ stats: data }); } catch {} },
  createTask: async (payload) => {
    const { data } = await api.post("/tasks", { title: payload.title, description: payload.description, status: payload.status, priority: payload.priority, category: payload.category, tags: payload.tags, dueDate: payload.dueDate });
    set((s) => ({ tasks: [data, ...s.tasks] })); get().fetchStats(); return data;
  },
  updateTask: async (id, payload) => {
    const { data } = await api.patch(`/tasks/${id}`, payload);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? data : t)) })); get().fetchStats(); return data;
  },
  deleteTask: async (id) => { await api.delete(`/tasks/${id}`); set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })); get().fetchStats(); },
  moveTask: async (id, status) => { const r = await get().updateTask(id, { status } as any); return r; },
}));
