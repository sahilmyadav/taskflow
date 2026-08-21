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
  register: (payload: { email: string; password: string; username?: string; fullName?: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateMe: (patch: Partial<User>) => Promise<User>;
  leaveWorkspace: () => Promise<void>;
  init: () => void;
}

function persistUser(token: string, user: User) {
  if (user.isGuest) {
    // Guest = session only (as requested: logo ke session mai save hoga, no email)
    // Keeps mascot avatar in sessionStorage so it clears when tab closes — proper free guest type
    sessionStorage.setItem("accessToken", token);
    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("isGuestSession", "1");
    // ensure no stale persistent copy
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  } else {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("isGuestSession");
  }
}

function readStored(): { token: string | null; user: User | null } {
  try {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (token && raw) return { token, user: JSON.parse(raw) as User };
  } catch {}
  return { token: null, user: null };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  init: () => {
    if (typeof window === "undefined") return;
    const { token, user } = readStored();
    if (token && user) {
      set({ token, user, isAuthenticated: true });
      get().fetchMe().catch(() => get().logout());
    }
  },

  guestLogin: async (username) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/auth/guest", { username });
      const { accessToken, user } = data as { accessToken: string; user: User };
      // ensure avatar is the mascot (session)
      const guestUser: User = { ...user, avatarUrl: user.avatarUrl || "/guest-avatar.png" };
      persistUser(accessToken, guestUser);
      set({ token: accessToken, user: guestUser, isAuthenticated: true, loading: false });
      try {
        const me = await api.get("/auth/me");
        const full = me.data as User;
        const fullWithAvatar: User = { ...full, avatarUrl: full.avatarUrl || "/guest-avatar.png" };
        persistUser(accessToken, fullWithAvatar);
        set({ user: fullWithAvatar });
      } catch {}
    } catch (err) {
      set({ error: getErrorMessage(err, "Guest login failed"), loading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/auth/register", payload);
      const { accessToken, user } = data as { accessToken: string; user: User };
      persistUser(accessToken, user);
      set({ token: accessToken, user, isAuthenticated: true, loading: false });
      try {
        const me = await api.get("/auth/me");
        set({ user: me.data as User });
        persistUser(accessToken, me.data as User);
      } catch {}
    } catch (err) {
      set({ error: getErrorMessage(err, "Registration failed"), loading: false });
      throw err;
    }
  },

  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/auth/login", payload);
      const { accessToken, user } = data as { accessToken: string; user: User };
      persistUser(accessToken, user);
      set({ token: accessToken, user, isAuthenticated: true, loading: false });
      try {
        const me = await api.get("/auth/me");
        set({ user: me.data as User });
        persistUser(accessToken, me.data as User);
      } catch {}
    } catch (err) {
      set({ error: getErrorMessage(err, "Login failed"), loading: false });
      throw err;
    }
  },

  fetchMe: async () => {
    const { data } = await api.get("/auth/me");
    const user = data as User;
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || get().token || "";
    if (token) persistUser(token, user);
    set({ user });
    // also keep raw in correct store
  },

  updateMe: async (patch) => {
    const { data } = await api.patch("/users/me", patch);
    const updated = data as User;
    // /users/me returns the profile only, while /auth/me additionally computes
    // quota/usage. Carry those over so editing a profile does not blank the
    // guest allowance shown in the UI.
    const prev = get().user;
    const user: User = { ...updated, quota: prev?.quota ?? null, usage: prev?.usage ?? null };
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || get().token || "";
    if (token) persistUser(token, user);
    set({ user });
    return user;
  },

  leaveWorkspace: async () => {
    await api.delete("/users/me");
    get().logout();
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("isGuestSession");
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
