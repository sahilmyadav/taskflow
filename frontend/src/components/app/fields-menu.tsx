'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type { FieldsConfig } from '@/types/task';
import { cn } from '@/lib/utils';

type FilterKey =
  'status' | 'priority' | 'members' | 'dueDate' | 'teams' | 'labels' | 'reporter' | null;

export function FieldsMenu({
  open,
  onClose,
  value,
  onChange,
  withFilters,
  onFilter,
}: {
  open: boolean;
  onClose: () => void;
  value: FieldsConfig;
  onChange: (v: FieldsConfig) => void;
  /** when true, also show Figma-style filter flyout (Status / Priority …) */
  withFilters?: boolean;
  onFilter?: (kind: string, value: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [flyout, setFlyout] = useState<FilterKey>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
        setFlyout(null);
      }
    };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, onClose]);

  // reset flyout when closing, adjusted during render instead of in an effect
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setFlyout(null);
  }

  const columns: { key: keyof FieldsConfig; label: string }[] = [
    { key: 'priority', label: 'Priority' },
    { key: 'members', label: 'Members' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'labels', label: 'Labels' },
    { key: 'status', label: 'Status' },
    { key: 'reporter', label: 'Reporter' },
  ];

  const filterItems: { key: FilterKey; label: string; icon: string }[] = [
    { key: 'status', label: 'Status', icon: '◯' },
    { key: 'priority', label: 'Priority', icon: '◼' },
    { key: 'members', label: 'Members', icon: '◐' },
    { key: 'dueDate', label: 'Due Date', icon: '▭' },
    { key: 'teams', label: 'Teams', icon: '▢' },
    { key: 'labels', label: 'Labels', icon: '⬡' },
    { key: 'reporter', label: 'Reporter', icon: '◎' },
  ];

  const priorityOptions = [
    { v: 'NONE', label: 'No Priority' },
    { v: 'URGENT', label: 'Urgent' },
    { v: 'HIGH', label: 'High' },
    { v: 'MEDIUM', label: 'Medium' },
    { v: 'LOW', label: 'Low' },
  ];

  if (!withFilters) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-1 flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold">Fields</span>
              <span className="text-[11px] text-zinc-400">
                {Object.values(value).filter(Boolean).length} visible
              </span>
            </div>
            {columns.map(it => (
              <button
                key={it.key}
                onClick={() => onChange({ ...value, [it.key]: !value[it.key] })}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span className="text-sm">{it.label}</span>
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border',
                    value[it.key]
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-700'
                  )}
                >
                  {value[it.key] && <Check className="h-3 w-3" />}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Figma-style: Fields button shows filter categories with flyout on hover
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute right-0 top-full z-20 mt-2 flex gap-2"
        >
          <div className="w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-1 flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold">Filter by</span>
              <button
                onClick={() =>
                  onChange({
                    priority: true,
                    members: true,
                    dueDate: true,
                    labels: false,
                    status: false,
                    reporter: false,
                  })
                }
                className="text-[11px] text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Reset
              </button>
            </div>
            {filterItems.map(it => (
              <button
                key={it.key}
                onMouseEnter={() => setFlyout(it.key)}
                onClick={() => setFlyout(v => (v === it.key ? null : it.key))}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm',
                  flyout === it.key
                    ? 'bg-zinc-100 dark:bg-zinc-800'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="text-[11px] opacity-60">{it.icon}</span> {it.label}
                </span>
                <span className="text-zinc-400">›</span>
              </button>
            ))}
            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
            <p className="px-2 py-1 text-[11px] font-medium text-zinc-500">Columns</p>
            {columns.map(it => (
              <button
                key={it.key}
                onClick={() => onChange({ ...value, [it.key]: !value[it.key] })}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span>{it.label}</span>
                <span
                  className={cn(
                    'flex h-3.5 w-3.5 items-center justify-center rounded border text-[10px]',
                    value[it.key]
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-700'
                  )}
                >
                  {value[it.key] && <Check className="h-2.5 w-2.5" />}
                </span>
              </button>
            ))}
          </div>

          {/* flyout for priority — mirrors Figma 2nd panel */}
          {flyout === 'priority' && (
            <motion.div
              initial={{ opacity: 0, x: -6, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-52 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="px-2 py-1 text-xs font-semibold text-zinc-500">Priority</p>
              {priorityOptions.map(o => (
                <button
                  key={o.v}
                  onClick={() => {
                    onFilter?.('priority', o.v);
                    setFlyout(null);
                    onClose();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span
                    className={cn(
                      'text-xs',
                      o.v === 'URGENT'
                        ? 'text-red-700'
                        : o.v === 'HIGH'
                          ? 'text-red-600'
                          : o.v === 'MEDIUM'
                            ? 'text-amber-600'
                            : 'text-zinc-500'
                    )}
                  >
                    ◼
                  </span>{' '}
                  {o.label}
                </button>
              ))}
            </motion.div>
          )}
          {flyout && flyout !== 'priority' && (
            <motion.div
              initial={{ opacity: 0, x: -6, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              className="flex w-52 items-center justify-center rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-xs text-zinc-500">No options yet for {flyout}. Try Priority.</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
