'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import type { Project } from '@/types/task';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: (params?: { search?: string; priority?: string }) => Promise<void>;
  createProject: (payload: {
    title: string;
    description?: string;
    priority?: string;
    lead?: string;
    dueDate?: string;
  }) => Promise<Project>;
  updateProject: (id: string, payload: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>(set => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async params => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/projects', { params });
      set({ projects: Array.isArray(data) ? data : data.data || [], loading: false });
    } catch (e) {
      set({ error: getErrorMessage(e, 'Failed to load projects'), loading: false });
    }
  },

  createProject: async payload => {
    const { data } = await api.post('/projects', payload);
    set(s => ({ projects: [data, ...s.projects] }));
    return data;
  },

  updateProject: async (id, payload) => {
    const { data } = await api.patch(`/projects/${id}`, payload);
    set(s => ({ projects: s.projects.map(p => (p.id === id ? data : p)) }));
    return data;
  },

  deleteProject: async id => {
    await api.delete(`/projects/${id}`);
    set(s => ({ projects: s.projects.filter(p => p.id !== id) }));
  },
}));
