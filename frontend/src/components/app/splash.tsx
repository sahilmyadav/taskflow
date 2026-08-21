'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BrandMark } from '@/components/brand/brand-mark';

export function Splash({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 1300);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-zinc-950"
        >
          <div className="absolute inset-0 grid-bg opacity-[0.06]" />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative flex flex-col items-center gap-6"
          >
            <motion.div
              initial={{ rotate: -4 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
              <BrandMark size={56} rounded={14} />
            </motion.div>
            <div className="text-center">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-400">TASKFLOW</p>
              <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Organizing your workspace…
              </p>
            </div>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
                className="h-full w-1/2 bg-zinc-900 dark:bg-white"
              />
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-8 text-xs text-zinc-400"
          >
            Crafted for focus • Vercel-inspired motion
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-white" />
        <p className="text-xs text-zinc-500">Loading tasks…</p>
      </div>
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <div className="mb-3 h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-3">
            {[0, 1, 2].map(j => (
              <div
                key={j}
                className="h-28 animate-pulse rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
