"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { User } from "@/types/task";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  guestLogin: (username?: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateMe: (patch: Partial<User>) => Promise<User>;
  leaveWorkspace: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  init: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    const raw = localStorage.getItem("user");
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as User;
        set({ token, user, isAuthenticated: true });
        get().fetchMe().catch(() => get().logout());
      } catch {
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  },

  guestLogin: async (username) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/auth/guest", { username });
      const { accessToken, user } = data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      set({ token: accessToken, user, isAuthenticated: true, loading: false });
      // fetch full profile
      try {
        const me = await api.get("/auth/me");
        const full = me.data;
        set({ user: full });
        localStorage.setItem("user", JSON.stringify(full));
      } catch {}
    } catch (err) {
      set({ error: getErrorMessage(err, "Guest login failed"), loading: false });
      throw err;
    }
  },

  fetchMe: async () => {
    const { data } = await api.get("/auth/me");
    set({ user: data });
    localStorage.setItem("user", JSON.stringify(data));
  },

  updateMe: async (patch) => {
    const { data } = await api.patch("/users/me", patch);
    set({ user: data });
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  },

  leaveWorkspace: async () => {
    await api.delete("/users/me");
    get().logout();
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
