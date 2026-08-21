'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Tag, GripVertical } from 'lucide-react';
import type { Task, FieldsConfig } from '@/types/task';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar } from '@/components/ui/avatar';

export function BoardCard({
  task,
  onOpen,
  onQuickStatus,
  onDelete,
  fields,
  isOverlay,
}: {
  task: Task;
  onOpen: () => void;
  onQuickStatus: (s: Task['status']) => void;
  onDelete: () => void;
  fields?: Partial<FieldsConfig>;
  isOverlay?: boolean;
}) {
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const showMembers = fields?.members !== false;
  const showDate = fields?.dueDate !== false;
  const showLabels = fields?.labels !== false;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
    disabled: isOverlay,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.2,0,0,1)',
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...(!isOverlay ? attributes : {})}
      {...(!isOverlay ? listeners : {})}
      layout={!isDragging}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isDragging ? 0.45 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={!isDragging ? { y: -1 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onOpen}
      className={cn(
        'group relative cursor-grab active:cursor-grabbing select-none rounded-xl border bg-white p-3 shadow-sm hover:shadow-md dark:bg-zinc-900',
        isDragging
          ? 'border-zinc-300 shadow-lg ring-2 ring-zinc-900/10 dark:border-zinc-700 dark:ring-white/10'
          : 'border-zinc-200 dark:border-zinc-800',
        isOverlay &&
          'rotate-[1.2deg] cursor-grabbing shadow-2xl ring-2 ring-zinc-900/15 dark:ring-white/15'
      )}
    >
      {/* drag handle affordance — whole card is draggable, handle is visual only */}
      <span
        className="pointer-events-none absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-md text-zinc-300 group-hover:flex dark:text-zinc-600"
        aria-hidden
        title="Drag to move"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </span>
      <div className="flex items-start justify-between gap-2">
        <h4 className="line-clamp-2 text-sm font-medium leading-snug">{task.title}</h4>
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          className="hidden rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 group-hover:flex dark:hover:bg-zinc-800"
        >
          •••
        </button>
      </div>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        {showMembers ? (
          <div className="flex items-center gap-1.5">
            <Avatar
              src={`https://i.pravatar.cc/100?u=${task.userId.slice(0, 6)}`}
              className="h-5 w-5"
            />
            <span className="text-xs text-zinc-500">Admin</span>
          </div>
        ) : (
          <span className="text-[11px] text-zinc-400">{task.priority}</span>
        )}
        {showDate && due && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-950/40 dark:text-red-300">
            <Calendar className="h-3 w-3" /> {format(due, 'dd MMM')}
          </span>
        )}
      </div>

      {showLabels && (task.category || (task.tags && task.tags.length > 0)) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <Tag className="h-3 w-3" /> {task.category}
            </span>
          )}
          {(task.tags || []).slice(0, 2).map(t => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              <Tag className="h-3 w-3 opacity-60" /> {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center gap-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
        {(['TODO', 'IN_PROGRESS', 'DONE', 'ON_HOLD'] as const).map(s => (
          <button
            key={s}
            onClick={e => {
              e.stopPropagation();
              onQuickStatus(s);
            }}
            className={cn(
              'rounded-full border px-2 py-1 font-medium',
              task.status === s
                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white'
                : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-white dark:bg-zinc-800 dark:border-zinc-700'
            )}
          >
            {s === 'TODO'
              ? 'To Do'
              : s === 'IN_PROGRESS'
                ? 'Doing'
                : s === 'DONE'
                  ? 'Done'
                  : 'On Hold'}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
