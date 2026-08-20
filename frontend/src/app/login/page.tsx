"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { Sparkles, ArrowRight, User } from "lucide-react";
export default function LoginPage() {
  const router = useRouter();
  const { guestLogin, isAuthenticated, loading, error, init } = useAuthStore();
  const [username, setUsername] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  useEffect(() => { init(); }, [init]);
  useEffect(() => { if (isAuthenticated) router.replace("/"); }, [isAuthenticated, router]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLocalError(null);
    try { await guestLogin(username.trim() || undefined); router.replace("/"); } catch (err: any) { setLocalError(err.message); }
  };
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"><User className="h-6 w-6" /></div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Continue as guest — no password needed. Your tasks are scoped to this guest profile.</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-500" /> Guest Login</CardTitle><CardDescription>Enter a display name or leave blank for an auto-generated guest.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div><label className="text-sm font-medium">Display name (optional)</label><Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g., Alex" maxLength={30} className="mt-1" /><p className="mt-1 text-xs text-zinc-500">Letters, numbers, spaces, _ and - only.</p></div>
              {(localError || error) && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{localError || error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Continue as Guest"} <ArrowRight className="h-4 w-4" /></Button>
              <p className="text-center text-xs text-zinc-500">By continuing you agree to local guest scoping. JWT is stored in localStorage and sent as Bearer token.</p>
            </form>
          </CardContent>
        </Card>
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h4 className="text-sm font-medium">How it works</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"><li>POST /api/auth/guest creates a guest user + JWT.</li><li>All /api/tasks routes are JWT-protected and user-scoped.</li><li>Theme choice is persisted in localStorage and applied on hydration.</li></ol>
        </div>
      </div>
    </div>
  );
}
