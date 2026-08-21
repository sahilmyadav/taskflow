"use client";

import { useEffect, useLayoutEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const init = useThemeStore((s) => s.init);

  // The inline script in <head> already applied the theme during parsing. This
  // syncs the store with it, and re-applies the attributes after React's Strict
  // Mode remount in development clears them (a no-op in production). It runs
  // before paint, so no flash is introduced.
  useIsomorphicLayoutEffect(() => {
    init();
  }, [init]);

  return <>{children}</>;
}
