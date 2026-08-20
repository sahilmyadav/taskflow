"use client";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut, CheckSquare } from "lucide-react";
import { useEffect } from "react";
export function Header() {
  const { user, isAuthenticated, logout, init } = useAuthStore();
  useEffect(() => { init(); }, [init]);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"><CheckSquare className="h-4 w-4" /></span>
          <span className="hidden sm:inline">TaskFlow</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Hi, <span className="font-medium text-zinc-900 dark:text-zinc-100">{user?.username}</span>{user?.isGuest && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Guest</span>}</span>
                <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4" /> Logout</Button>
              </>
            ) : (<Link href="/login"><Button size="sm">Guest Login</Button></Link>)}
          </div>
          <div className="sm:hidden">
            {isAuthenticated ? <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout"><LogOut className="h-4 w-4" /></Button> : <Link href="/login"><Button size="sm">Login</Button></Link>}
          </div>
        </div>
      </div>
    </header>
  );
}
