"use client";
import { create } from "zustand";
import { api } from "@/lib/api";
import type { User } from "@/types/task";
interface AuthState {
  user: User | null; token: string | null; loading: boolean; error: string | null; isAuthenticated: boolean;
  guestLogin: (username?: string) => Promise<void>; logout: () => void; fetchMe: () => Promise<void>; init: () => void;
}
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, token: null, loading: false, error: null, isAuthenticated: false,
  init: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try { const user = JSON.parse(userStr) as User; set({ token, user, isAuthenticated: true }); get().fetchMe().catch(() => get().logout()); }
      catch { set({ token: null, user: null, isAuthenticated: false }); }
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
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Guest login failed";
      set({ error: Array.isArray(msg) ? msg.join(", ") : msg, loading: false }); throw e;
    }
  },
  logout: () => { if (typeof window !== "undefined") { localStorage.removeItem("accessToken"); localStorage.removeItem("user"); } set({ user: null, token: null, isAuthenticated: false }); },
  fetchMe: async () => {
    const { data } = await api.get("/auth/me");
    const user = { id: data.id, username: data.username, isGuest: data.isGuest } as User;
    localStorage.setItem("user", JSON.stringify(user)); set({ user });
  },
}));
