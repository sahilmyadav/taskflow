"use client";

import { Search, SlidersHorizontal, Plus, LayoutGrid, List, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Topbar({
  search,
  onSearch,
  view,
  onView,
  onAddTask,
  onFields,
  fieldsLabel = "Fields",
  onToggleSidebar,
  showSidebarToggle,
}: {
  search: string;
  onSearch: (v: string) => void;
  view: "board" | "list";
  onView: (v: "board" | "list") => void;
  onAddTask: () => void;
  onFields: () => void;
  fieldsLabel?: string;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        {showSidebarToggle && (
          <button onClick={onToggleSidebar} className="mr-1 rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 md:hidden">
            <PanelLeft className="h-4 w-4" />
          </button>
        )}
        <h1 className="text-sm font-semibold">Tasks</h1>
        {!focused && search === "" && (
          <span className="hidden text-xs text-zinc-400 sm:inline">— Organize your work</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className={cn("relative hidden sm:flex items-center transition-all", focused ? "w-[280px]" : "w-[220px]")}>
          <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-zinc-400" />
          <Input
            id="global-search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search tasks"
            className="h-8 rounded-lg bg-zinc-50 pl-8 text-xs dark:bg-zinc-900"
          />
          <span className="pointer-events-none absolute right-2 hidden rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 sm:inline">
            ⌘F
          </span>
        </div>

        <ThemeToggle />

        <div className="flex items-center gap-1.5">
          <button
            onClick={onFields}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{fieldsLabel}</span>
          </button>

          <div className="hidden items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900 sm:flex">
            <button
              onClick={() => onView("list")}
              className={cn("rounded-md px-2.5 py-1 text-xs font-medium", view === "list" ? "bg-white shadow dark:bg-zinc-800" : "text-zinc-500")}
            >
              <span className="inline-flex items-center gap-1"><List className="h-3.5 w-3.5" /> List</span>
            </button>
            <button
              onClick={() => onView("board")}
              className={cn("rounded-md px-2.5 py-1 text-xs font-medium", view === "board" ? "bg-white shadow dark:bg-zinc-800" : "text-zinc-500")}
            >
              <span className="inline-flex items-center gap-1"><LayoutGrid className="h-3.5 w-3.5" /> Board</span>
            </button>
          </div>

          <Button size="sm" className="h-8 rounded-lg bg-zinc-900 px-3 text-xs font-semibold dark:bg-white dark:text-zinc-900" onClick={onAddTask}>
            <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Add Task</span><span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div className="relative flex sm:hidden">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search tasks"
          className="h-9 rounded-xl bg-zinc-50 pl-8 text-sm dark:bg-zinc-900"
        />
      </div>
    </div>
  );
}
