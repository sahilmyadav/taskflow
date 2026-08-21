'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ChevronDown, Plus, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { Task, Priority, FieldsConfig } from '@/types/task';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';

const priorityLabel: Record<Priority, { label: string; color: string }> = {
  NONE: { label: 'No Priority', color: 'text-zinc-400' },
  LOW: { label: 'Low', color: 'text-zinc-500' },
  MEDIUM: { label: 'Medium', color: 'text-amber-600' },
  HIGH: { label: 'High', color: 'text-red-600' },
  URGENT: { label: 'Urgent', color: 'text-red-700' },
};

function PriorityCell({ p }: { p: Priority }) {
  const cfg = priorityLabel[p] || priorityLabel.MEDIUM;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', cfg.color)}>
      <span className="text-[10px]">◼</span> {cfg.label}
    </span>
  );
}

export function ListView({
  tasks,
  fields,
  onOpen,
  onAdd,
}: {
  tasks: Task[];
  fields: FieldsConfig;
  onOpen: (t: Task) => void;
  onAdd: (status: Task['status']) => void;
}) {
  const groups: { key: Task['status']; label: string }[] = [
    { key: 'TODO', label: 'To Do' },
    { key: 'IN_PROGRESS', label: 'Doing' },
    { key: 'DONE', label: 'Completed' },
    { key: 'ON_HOLD', label: 'On Hold' },
  ];

  const [open, setOpen] = useState<Record<string, boolean>>({
    TODO: true,
    IN_PROGRESS: true,
    DONE: true,
    ON_HOLD: true,
  });

  return (
    <div className="space-y-6">
      {groups.map(g => {
        const items = tasks.filter(t => t.status === g.key);
        if (items.length === 0 && g.key === 'ON_HOLD' && tasks.length > 0) return null;
        return (
          <div
            key={g.key}
            className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden"
          >
            <button
              onClick={() => setOpen(s => ({ ...s, [g.key]: !s[g.key] }))}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-zinc-400 transition-transform',
                  open[g.key] ? '' : '-rotate-90'
                )}
              />
              <span className="text-xs font-semibold">{g.label}</span>
              <span className="text-xs text-zinc-400">({items.length})</span>
            </button>

            <AnimatePresence initial={false}>
              {open[g.key] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-zinc-200 dark:border-zinc-800">
                    {/* header */}
                    <div className="grid grid-cols-12 gap-2 bg-zinc-50 px-3 py-2 text-[11px] font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                      <div className="col-span-5">Task</div>
                      {fields.priority && <div className="col-span-2">Priority</div>}
                      {fields.members && <div className="col-span-2">Members</div>}
                      {fields.dueDate && <div className="col-span-2">Due Date</div>}
                      <div className="col-span-1 text-right">Actions</div>
                    </div>

                    {items.map(t => (
                      <div
                        key={t.id}
                        onClick={() => onOpen(t)}
                        className="grid cursor-pointer grid-cols-12 items-center gap-2 border-t border-zinc-100 px-3 py-2.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <div className="col-span-5 truncate pr-2 font-medium text-sm">
                          {t.title}
                        </div>
                        {fields.priority && (
                          <div className="col-span-2">
                            <PriorityCell p={t.priority} />
                          </div>
                        )}
                        {fields.members && (
                          <div className="col-span-2 flex items-center">
                            <Avatar
                              src={`https://i.pravatar.cc/100?u=${t.userId}`}
                              className="h-5 w-5"
                            />
                            <span className="ml-1.5 hidden text-xs text-zinc-600 dark:text-zinc-400 sm:inline">
                              CN
                            </span>
                          </div>
                        )}
                        {fields.dueDate && (
                          <div className="col-span-2 text-xs text-zinc-600 dark:text-zinc-400">
                            {t.dueDate ? format(new Date(t.dueDate), 'dd MMM yyyy') : '—'}
                          </div>
                        )}
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onOpen(t);
                            }}
                            className="rounded-lg p-1 hover:bg-white dark:hover:bg-zinc-700"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => onAdd(g.key)}
                      className="flex w-full items-center gap-1 border-t border-zinc-100 px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Task
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
