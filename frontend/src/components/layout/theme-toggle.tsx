"use client";
import { useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";
import { cn } from "@/lib/utils";
export function ThemeToggle() {
  const { theme, setTheme, init } = useThemeStore();
  useEffect(() => { init(); }, [init]);
  const options = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ];
  return (
    <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
      {options.map(({ value, icon: Icon, label }) => (
        <button key={value} aria-label={`Switch to ${label} theme`} onClick={() => setTheme(value)} className={cn("flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100", theme === value && "bg-zinc-900 text-white shadow dark:bg-white dark:text-zinc-900")} title={label}><Icon className="h-3.5 w-3.5" /></button>
      ))}
    </div>
  );
}
export function ThemeSwitch() {
  const { theme, resolved, setTheme, init } = useThemeStore();
  useEffect(() => { init(); }, [init]);
  const isDark = resolved === "dark";
  return <button aria-label="Toggle theme" onClick={() => setTheme(isDark ? "light" : "dark")} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>;
}
