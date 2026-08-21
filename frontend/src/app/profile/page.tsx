'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Pencil, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/lib/errors';
import type { User } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { useToastStore } from '@/components/app/toast';
import { Toaster } from '@/components/app/toast';

type SettingsTab = 'profile' | 'theme' | 'color';

const colorDots: Record<string, string> = {
  Amber: 'bg-amber-500',
  Blue: 'bg-blue-600',
  Pink: 'bg-pink-500',
  Rose: 'bg-rose-500',
  Emerald: 'bg-emerald-500',
  Black: 'bg-zinc-900 dark:bg-white',
};

export default function ProfilePage() {
  const { user, isAuthenticated, init, updateMe, leaveWorkspace } = useAuthStore();
  const router = useRouter();
  const push = useToastStore(s => s.push);

  const [tab, setTab] = useState<SettingsTab>('profile');
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    title: '',
    username: '',
    email: '',
  });

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Seed the form from the loaded profile during render rather than in an effect.
  const profileSignature = user
    ? `${user.id}|${user.fullName ?? ''}|${user.title ?? ''}|${user.username}|${user.email ?? ''}`
    : '';
  const [seededFor, setSeededFor] = useState(profileSignature);
  if (user && seededFor !== profileSignature) {
    setSeededFor(profileSignature);
    setForm({
      fullName: user.fullName || user.username || 'Dexter',
      title: user.title || '',
      username: user.username || '',
      email: user.email || '',
    });
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc] dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-white" />
      </div>
    );
  }

  const displayEmail =
    form.email || `${(user.username || 'dexter').toLowerCase().replace(/\s+/g, '')}@gmail.com`;
  const avatar = user.avatarUrl || `https://i.pravatar.cc/100?img=68`;

  const save = async (patch: Partial<User>) => {
    setSaving(true);
    try {
      await updateMe(patch);
      push({ title: 'Profile updated', type: 'success' });
      setEditEmail(false);
    } catch (e) {
      push({ title: getErrorMessage(e, 'Failed to save'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onLeave = async () => {
    if (!confirm('Leave workspace? This will delete your account and tasks.')) return;
    try {
      await leaveWorkspace();
      push({ title: 'You left the workspace', type: 'success' });
      router.replace('/login');
    } catch {
      push({ title: 'Failed to leave', type: 'error' });
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: '◆' },
    { id: 'theme', label: 'Theme', icon: '☼' },
    { id: 'color', label: 'Color', icon: '▣' },
  ];

  const filteredTabs = q ? tabs.filter(t => t.label.toLowerCase().includes(q.toLowerCase())) : tabs;

  return (
    <div className="flex min-h-screen bg-[#f6f6f5] dark:bg-zinc-950">
      {/* left settings nav */}
      <aside className="hidden w-[320px] shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-zinc-100 px-4 dark:border-zinc-800">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to app
          </Link>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search"
              className="h-8 rounded-lg bg-zinc-50 pl-8 text-sm dark:bg-zinc-900"
            />
          </div>

          <div className="mt-4 space-y-1">
            {filteredTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${tab === t.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
              >
                <span className="text-xs">{t.icon}</span> {t.label}
                {tab === t.id && <Check className="ml-auto h-3.5 w-3.5" />}
              </button>
            ))}
            {filteredTabs.length === 0 && (
              <p className="px-3 py-2 text-xs text-zinc-500">No results</p>
            )}
          </div>

          {/* color preview when on color tab */}
          {tab === 'color' && (
            <div className="mt-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
              <p className="text-xs font-medium">Color preview</p>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {Object.entries(colorDots).map(([k, cls]) => (
                  <span
                    key={k}
                    className={`h-6 w-6 rounded-full ${cls} border border-zinc-200 dark:border-zinc-800`}
                    title={k}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-20 flex h-12 items-center justify-between border-b border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <span className="text-sm font-semibold">Settings</span>
        <span className="w-10" />
      </div>

      {/* main content */}
      <div className="min-w-0 flex-1 pt-12 md:pt-0">
        <div className="mx-auto max-w-[820px] p-4 sm:p-8">
          {/* page header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage your personal information and workspace access.
            </p>

            {/* mobile tabs */}
            <div className="mt-4 flex gap-2 md:hidden">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${tab === t.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Profile tab */}
          {tab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="space-y-6"
            >
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {/* profile picture row */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4 dark:border-zinc-800 sm:px-5">
                  <div>
                    <p className="text-sm font-medium">Profile picture</p>
                    <p className="text-xs text-zinc-500">Your avatar across Tasks & Projects</p>
                  </div>
                  <Avatar
                    src={avatar}
                    alt="avatar"
                    className="h-10 w-10 ring-2 ring-zinc-100 dark:ring-zinc-800"
                  />
                </div>

                {/* email row */}
                <div className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    {!editEmail ? (
                      <p className="text-xs text-zinc-500">{displayEmail}</p>
                    ) : (
                      <Input
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="mt-1 h-8 max-w-[260px] text-sm"
                        autoFocus
                      />
                    )}
                  </div>
                  {!editEmail ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditEmail(true)}
                      aria-label="Edit email"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditEmail(false)}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={saving}
                        onClick={() => save({ email: form.email.trim() })}
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* full name */}
                <div className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <p className="text-sm font-medium">Full name</p>
                    <p className="text-xs text-zinc-500">As it appears to your team</p>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-[220px]">
                    <Input
                      value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Dexter"
                      className="h-8 bg-zinc-50 text-sm dark:bg-zinc-800"
                      onBlur={() => {
                        if (form.fullName.trim() !== (user.fullName || user.username)) {
                          save({ fullName: form.fullName.trim() });
                        }
                      }}
                      onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    />
                  </div>
                </div>

                {/* title */}
                <div className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <p className="text-sm font-medium">Title</p>
                    <p className="text-xs text-zinc-500">Your job title or role</p>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-[220px]">
                    <Input
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="Designer"
                      className="h-8 bg-zinc-50 text-sm dark:bg-zinc-800"
                      onBlur={() => {
                        const v = form.title.trim();
                        if (v !== (user.title || '')) save({ title: v });
                      }}
                      onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    />
                  </div>
                </div>

                {/* username */}
                <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <p className="text-sm font-medium">Username</p>
                    <p className="text-xs text-zinc-500">One word, like a nickname or first name</p>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-[220px]">
                    <Input
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      placeholder="Dexuser"
                      className="h-8 bg-zinc-50 text-sm dark:bg-zinc-800"
                      onBlur={() => {
                        const v = form.username.trim();
                        if (v && v !== user.username) save({ username: v });
                      }}
                      onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    />
                  </div>
                </div>

                {saving && (
                  <div className="border-t border-zinc-100 px-5 py-2 text-xs text-zinc-500 dark:border-zinc-800">
                    Saving…
                  </div>
                )}
              </div>

              {/* workspace access */}
              <div>
                <h2 className="px-1 text-sm font-semibold">Workspace access</h2>
                <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Remove yourself from the workspace
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onLeave}
                    className="rounded-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300"
                  >
                    Leave Workspace
                  </Button>
                </div>
                <p className="mt-2 px-1 text-xs text-zinc-400">
                  Deleting your account also removes your tasks and projects.
                </p>
              </div>
            </motion.div>
          )}

          {tab === 'theme' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="text-sm font-semibold">Theme</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Switch between light and dark. Open the sidebar dropdown to change anytime.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <ThemeCard
                  active={
                    typeof window !== 'undefined' &&
                    document.documentElement.classList.contains('light')
                  }
                  label="Light"
                  desc="Clean & bright"
                />
                <ThemeCard
                  active={
                    typeof window !== 'undefined' &&
                    document.documentElement.classList.contains('dark')
                  }
                  label="Dark"
                  desc="Eyes at night"
                />
              </div>
            </motion.div>
          )}

          {tab === 'color' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="text-sm font-semibold">Color Mode</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Accent color used for highlights and interactive elements.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.keys(colorDots).map(c => (
                  <div
                    key={c}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                  >
                    <span className={`h-4 w-4 rounded-full ${colorDots[c]}`} />{' '}
                    <span className="text-sm">{c}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Toaster />
    </div>
  );
}

function ThemeCard({ active, label, desc }: { active: boolean; label: string; desc: string }) {
  return (
    <div
      className={`rounded-xl border p-4 ${active ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900' : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800'}`}
    >
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs opacity-70">{desc}</p>
      {active && <span className="mt-2 inline-flex text-xs font-medium">✓ Active</span>}
    </div>
  );
}
