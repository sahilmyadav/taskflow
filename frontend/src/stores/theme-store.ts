"use client";
import { create } from "zustand";
export type Theme = "light" | "dark" | "system";
interface ThemeState { theme: Theme; resolved: "light" | "dark"; setTheme: (t: Theme) => void; init: () => void; }
function getSystem(): "light" | "dark" { if (typeof window === "undefined") return "light"; return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
function apply(theme: Theme) {
  const resolved = theme === "system" ? getSystem() : theme;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
  return resolved;
}
export const useThemeStore = create<ThemeState>((set) => ({
  theme: "system", resolved: "light",
  setTheme: (t) => { localStorage.setItem("theme", t); const resolved = apply(t); set({ theme: t, resolved }); },
  init: () => {
    const saved = (localStorage.getItem("theme") as Theme) || "system";
    const resolved = apply(saved);
    set({ theme: saved, resolved });
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const current = (localStorage.getItem("theme") as Theme) || "system";
      if (current === "system") { const r = apply("system"); set({ resolved: r }); }
    };
    mql.addEventListener("change", handler);
  },
}));
