'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Mail, Lock, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { BrandMark } from '@/components/brand/brand-mark';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { guestLogin, register, login, isAuthenticated, loading, error, init } = useAuthStore();
  const [mode, setMode] = useState<Mode>('login');
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, [init]);
  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  const handleGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await guestLogin(guestName.trim() || undefined);
      router.replace('/');
    } catch {}
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required');
      return;
    }
    if (mode === 'register' && password !== confirm) {
      setLocalError('Passwords do not match');
      return;
    }
    try {
      if (mode === 'login') {
        await login({ email: email.trim().toLowerCase(), password });
      } else {
        await register({
          email: email.trim().toLowerCase(),
          password,
          username: username.trim() || undefined,
          fullName: username.trim() || undefined,
        });
      }
      router.replace('/');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.04]" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="w-full max-w-[520px]"
        >
          <div className="mb-6 flex justify-center">
            <BrandMark size={44} rounded={11} />
          </div>

          <div className="text-center">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-400">
              PYRAMID • TASKFLOW
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {mode === 'login' ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {mode === 'login'
                ? "Sign in with your email and password."
                : "Sign up with email & password — no Google login."}
            </p>
          </div>

          {/* Auth tabs */}
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setMode('login')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${mode === 'login' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'}`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${mode === 'register' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'}`}
            >
              Create account
            </button>
          </div>

          <Card className="mt-6 rounded-2xl shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" /> {mode === 'login' ? 'Login' : 'Create account'} • Email & Password
              </CardTitle>
              <CardDescription className="text-xs">
                {mode === 'login'
                  ? 'Enter your email and password to continue.'
                  : 'Create a free account with email + password. Unlimited tasks & projects.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-3">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <Input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email — you@example.com"
                    type="email"
                    required
                    className="h-10 rounded-xl bg-zinc-50 pl-9 dark:bg-zinc-900"
                  />
                </div>
                {mode === 'register' && (
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                    <Input
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Display name (optional)"
                      className="h-10 rounded-xl bg-zinc-50 pl-9 dark:bg-zinc-900"
                      maxLength={30}
                    />
                  </div>
                )}
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <Input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password (min 6 chars)"
                    type="password"
                    required
                    minLength={6}
                    className="h-10 rounded-xl bg-zinc-50 pl-9 dark:bg-zinc-900"
                  />
                </div>
                {mode === 'register' && (
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                    <Input
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Confirm password"
                      type="password"
                      required
                      className="h-10 rounded-xl bg-zinc-50 pl-9 dark:bg-zinc-900"
                    />
                  </div>
                )}
                {(error || localError) && (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-300">
                    {localError || error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                >
                  {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'} <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-center text-[11px] text-zinc-400">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="font-medium text-zinc-700 underline dark:text-zinc-300"
                  >
                    {mode === 'login' ? 'Create account' : 'Login'}
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-[11px] font-medium tracking-widest text-zinc-400">OR</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Guest Card with Mascot */}
          <Card className="rounded-2xl border-2 border-amber-100 bg-gradient-to-b from-white to-amber-50/40 shadow-lg dark:border-amber-900/20 dark:from-zinc-900 dark:to-amber-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-amber-600" /> Continue as Guest
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-widest text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">FREE • LIMITED</span>
              </CardTitle>
              <CardDescription className="text-xs">
                No email • No password • Saved in this browser session only. <br />
                <span className="font-medium text-zinc-600 dark:text-zinc-300">Limit: 10 tasks, 3 projects.</span> For unlimited, create an account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGuest} className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
                  <Image
                    src="/guest-avatar.png"
                    alt="Guest mascot"
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-none">Guest mascot</p>
                    <p className="mt-1 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
                      This cute logo becomes your avatar while you&apos;re a guest. <br className="hidden sm:block" />Stored in <span className="font-medium">sessionStorage</span> — clears when you close the tab.
                    </p>
                  </div>
                  <Sparkles className="hidden h-4 w-4 text-amber-500 sm:block" />
                </div>

                <Input
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="Guest display name (optional)"
                  className="h-10 rounded-xl bg-white dark:bg-zinc-900"
                  maxLength={30}
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                >
                  {loading ? 'Signing in…' : 'Continue as Guest'} <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-center text-[11px] text-zinc-500">
                  Guest is perfect to try the app. <span className="font-medium">Create an account when you want unlimited.</span>
                </p>
              </form>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-zinc-400">
            By continuing, you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
