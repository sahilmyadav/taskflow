"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { guestLogin, isAuthenticated, loading, error, init } = useAuthStore();
  const [name, setName] = useState("");

  useEffect(() => { init(); }, [init]);
  useEffect(() => { if (isAuthenticated) router.replace("/"); }, [isAuthenticated, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await guestLogin(name.trim() || undefined);
      router.replace("/");
    } catch {}
  };

  const quick = async () => {
    try { await guestLogin(undefined); router.replace("/"); } catch {}
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.04]" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="w-full max-w-md"
        >
          <div className="mb-6 flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-400">PYRAMID • TASKFLOW</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Let&apos;s get back on track</h1>
            <p className="mt-1 text-sm text-zinc-500">Enter your email below to login to your account.</p>
          </div>

          <Card className="mt-6 rounded-2xl shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Continue as Guest</CardTitle>
              <CardDescription className="text-xs">No password needed — we&apos;ll create a workspace for you.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Display name (optional)"
                  className="h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900"
                  maxLength={30}
                />
                {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
                <Button type="submit" disabled={loading} className="h-10 w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                  {loading ? "Signing in…" : "Continue as Guest"} <ArrowRight className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" onClick={quick} disabled={loading} className="h-10 w-full rounded-full">
                  <Sparkles className="h-4 w-4" /> Quick guest
                </Button>
                <button
                  type="button"
                  disabled
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white text-sm font-medium text-zinc-700 opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold shadow">G</span> Login with Google
                </button>
                <p className="pt-1 text-center text-[11px] leading-relaxed text-zinc-400">
                  By clicking continue, you agree to our <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>
                </p>
              </form>
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Users className="h-3.5 w-3.5" /> Trusted by teams • Free forever for guests
          </div>
        </motion.div>
      </div>
    </div>
  );
}
