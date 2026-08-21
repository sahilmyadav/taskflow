"use client";

import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

type Toast = { id: string; title: string; type: "success" | "error" };

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => get().remove(id), 2500);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export function Toaster() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="pointer-events-auto flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            {t.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <span>{t.title}</span>
            <button onClick={() => remove(t.id)} className="ml-2 text-xs text-zinc-400 hover:text-zinc-900">✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
