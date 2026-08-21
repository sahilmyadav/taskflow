'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Plus } from 'lucide-react';
import type { Task, FieldsConfig } from '@/types/task';
import { BoardCard } from './board-card';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

export function BoardColumn({
  title,
  status,
  tasks,
  count,
  onAdd,
  onOpen,
  onQuickStatus,
  onDelete,
  fields,
  isOver: isOverProp,
}: {
  title: string;
  status: Task['status'];
  tasks: Task[];
  count: number;
  onAdd: () => void;
  onOpen: (t: Task) => void;
  onQuickStatus: (id: string, s: Task['status']) => void;
  onDelete: (id: string) => void;
  fields?: FieldsConfig;
  isOver?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  });
  const activeOver = isOverProp ?? isOver;
  const ids = tasks.map(t => t.id);
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-w-[300px] max-w-[360px] flex-1 flex-col rounded-xl border bg-[#f9f9f8] transition-colors dark:bg-zinc-900/40',
        activeOver
          ? 'border-zinc-900/20 bg-zinc-100 shadow-inner ring-1 ring-zinc-900/10 dark:border-white/20 dark:bg-zinc-900 dark:ring-white/10'
          : 'border-zinc-200 dark:border-zinc-800'
      )}
    >
      <div
        className={cn(
          'sticky top-0 z-[1] flex items-center justify-between border-b px-3 py-2.5',
          activeOver
            ? 'border-zinc-900/10 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900'
            : 'border-zinc-200 bg-[#f9f9f8] dark:border-zinc-800 dark:bg-zinc-900/40'
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              activeOver ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-400'
            )}
          />
          <h3 className="text-xs font-semibold tracking-wide">{title}</h3>
          <span className="rounded-full border border-zinc-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {count}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onAdd} className="rounded-lg p-1 hover:bg-white dark:hover:bg-zinc-800">
            <Plus className="h-3.5 w-3.5 text-zinc-500" />
          </button>
          <button className="rounded-lg p-1 hover:bg-white dark:hover:bg-zinc-800">
            <MoreHorizontal className="h-3.5 w-3.5 text-zinc-500" />
          </button>
        </div>
      </div>

      <SortableContext id={status} items={ids} strategy={verticalListSortingStrategy}>
        <div
          className={cn(
            'flex flex-1 flex-col gap-3 p-3',
            activeOver && 'bg-zinc-100/60 dark:bg-zinc-900/60'
          )}
        >
          <AnimatePresence initial={false}>
            {tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'flex flex-1 items-center justify-center rounded-xl border border-dashed p-6 text-center',
                  activeOver
                    ? 'border-zinc-900/30 bg-white dark:border-white/20 dark:bg-zinc-800'
                    : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
                )}
              >
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    {activeOver ? 'Drop here' : 'No tasks'}
                  </p>
                  <button
                    onClick={onAdd}
                    className="mt-2 text-xs font-medium text-zinc-900 underline dark:text-white"
                  >
                    + Add task
                  </button>
                </div>
              </motion.div>
            ) : (
              tasks.map(t => (
                <BoardCard
                  key={t.id}
                  task={t}
                  onOpen={() => onOpen(t)}
                  onQuickStatus={s => onQuickStatus(t.id, s)}
                  onDelete={() => onDelete(t.id)}
                  fields={fields}
                />
              ))
            )}
          </AnimatePresence>
          <button
            onClick={onAdd}
            className="flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-zinc-500 hover:bg-white hover:text-zinc-900 dark:hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5" /> Add Task
          </button>
        </div>
      </SortableContext>
    </div>
  );
}
