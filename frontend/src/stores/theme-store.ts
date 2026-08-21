"use client";

import { create } from "zustand";

export type Theme = "light" | "dark" | "system";
export type ColorMode = "Amber" | "Blue" | "Pink" | "Rose" | "Emerald" | "Black";

const colorVars: Record<ColorMode, string> = {
  Amber: "38 92% 50%",
  Blue: "221 83% 53%",
  Pink: "330 81% 60%",
  Rose: "347 77% 50%",
  Emerald: "142 76% 36%",
  Black: "240 5.9% 10%",
};

function getSystem(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme): "light" | "dark" {
  const resolved = theme === "system" ? getSystem() : theme;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
  return resolved;
}

function applyColor(mode: ColorMode) {
  const root = document.documentElement;
  const hsl = colorVars[mode] || colorVars.Black;
  root.style.setProperty("--accent-color", `hsl(${hsl})`);
  root.style.setProperty("--primary", hsl);
  // keep foreground readable
  if (mode === "Black") {
    root.style.removeProperty("--accent-color");
  }
}

interface ThemeState {
  theme: Theme;
  colorMode: ColorMode;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
  setColorMode: (c: ColorMode) => void;
  init: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "system",
  colorMode: "Black",
  resolved: "light",

  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    const resolved = applyTheme(theme);
    set({ theme, resolved });
  },

  setColorMode: (colorMode) => {
    localStorage.setItem("colorMode", colorMode);
    applyColor(colorMode);
    set({ colorMode });
  },

  init: () => {
    const saved = (localStorage.getItem("theme") as Theme) || "system";
    const color = (localStorage.getItem("colorMode") as ColorMode) || "Black";
    const resolved = applyTheme(saved);
    applyColor(color);
    set({ theme: saved, colorMode: color, resolved });

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const current = (localStorage.getItem("theme") as Theme) || "system";
      if (current === "system") {
        const r = applyTheme("system");
        set({ resolved: r });
      }
    };
    mql.addEventListener("change", handler);
  },
}));
