"use client";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useTaskStore } from "@/stores/task-store";
import { useEffect, useState } from "react";
export function TaskFilters() {
  const { search, statusFilter, priorityFilter, categoryFilter, setSearch, setStatusFilter, setPriorityFilter, setCategoryFilter, fetchTasks } = useTaskStore();
  const [local, setLocal] = useState(search);
  useEffect(() => { setLocal(search); }, [search]);
  useEffect(() => { const id = setTimeout(() => { if (local !== search) setSearch(local); }, 300); return () => clearTimeout(id); }, [local, search, setSearch]);
  useEffect(() => { fetchTasks(); }, [search, statusFilter, priorityFilter, categoryFilter, fetchTasks]);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><Input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Search tasks, descriptions..." className="pl-9" /></div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500"><SlidersHorizontal className="h-3.5 w-3.5" /> Filters</div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-[140px]"><option value="all">All status</option><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></Select>
        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-[140px]"><option value="all">All priority</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></Select>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-[140px]"><option value="all">All categories</option><option value="Work">Work</option><option value="Personal">Personal</option><option value="Design">Design</option><option value="Dev">Dev</option></Select>
      </div>
    </div>
  );
}
