'use client';

import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  FolderKanban,
  ChevronDown,
  PanelLeft,
  Sun,
  Moon,
  Palette,
  Settings,
  LogOut,
} from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-mark';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useThemeStore, type ColorMode } from '@/stores/theme-store';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';

const colorOptions: { value: ColorMode; label: string; dot: string }[] = [
  { value: 'Amber', label: 'Amber', dot: 'bg-amber-500' },
  { value: 'Blue', label: 'Blue', dot: 'bg-blue-600' },
  { value: 'Pink', label: 'Pink', dot: 'bg-pink-500' },
  { value: 'Rose', label: 'Rose', dot: 'bg-rose-500' },
  { value: 'Emerald', label: 'Emerald', dot: 'bg-emerald-500' },
  { value: 'Black', label: 'Black', dot: 'bg-zinc-900 dark:bg-white' },
];

function UserCard() {
  const { user, logout } = useAuthStore();
  const { theme, colorMode, setTheme, setColorMode } = useThemeStore();
  const [open, setOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setThemeOpen(false);
        setColorOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const displayName = user?.fullName || user?.username || 'Dexter';
  const isGuest = !!user?.isGuest;
  const email = isGuest
    ? 'Guest • Session only • No email'
    : user?.email || `${(user?.username || 'dexter').toLowerCase().replace(/\s+/g, '')}@gmail.com`;
  const avatarSrc = isGuest
    ? '/guest-avatar.png'
    : user?.avatarUrl || 'https://i.pravatar.cc/100?img=68';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-2 rounded-xl px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        <Avatar src={avatarSrc} className="h-7 w-7 ring-1 ring-zinc-200 dark:ring-zinc-800" />
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold leading-none">{displayName}</p>
          <p className="truncate text-[11px] text-zinc-500">{email}</p>
        </div>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-zinc-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="absolute bottom-full left-0 mb-2 w-[260px] rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-col items-center gap-1 border-b border-zinc-100 px-3 py-3 dark:border-zinc-800">
              <Avatar
                src={avatarSrc}
                className="h-10 w-10 ring-1 ring-zinc-200 dark:ring-zinc-800"
              />
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-zinc-500">{email}</p>
              {isGuest && (
                <span className="mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-widest text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  GUEST • {user?.usage ? `${user.usage.tasks}/${user?.quota?.maxTasks ?? 10} tasks` : 'Limited free'} • Session
                </span>
              )}
              {isGuest && (
                <button
                  onClick={() => router.push('/login')}
                  className="mt-2 w-full rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                >
                  Create account — unlock unlimited
                </button>
              )}
            </div>

            <div className="mt-1 space-y-1">
              <div className="relative">
                <button
                  onMouseEnter={() => setThemeOpen(true)}
                  onMouseLeave={() => setThemeOpen(false)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sun className="h-3.5 w-3.5" /> Change Theme
                  </span>
                  <span className="text-zinc-400">›</span>
                </button>
                {themeOpen && (
                  <div
                    onMouseEnter={() => setThemeOpen(true)}
                    onMouseLeave={() => setThemeOpen(false)}
                    className="absolute left-full top-0 ml-2 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <button
                      onClick={() => setTheme('light')}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Sun className="h-3.5 w-3.5" /> Light
                      </span>
                      {theme === 'light' && <span>✓</span>}
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Moon className="h-3.5 w-3.5" /> Dark
                      </span>
                      {theme === 'dark' && <span>✓</span>}
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Palette className="h-3.5 w-3.5" /> System
                      </span>
                      {theme === 'system' && <span>✓</span>}
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onMouseEnter={() => setColorOpen(true)}
                  onMouseLeave={() => setColorOpen(false)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-zinc-900 dark:bg-white" /> Color Mode
                  </span>
                  <span className="text-zinc-400">›</span>
                </button>
                {colorOpen && (
                  <div
                    onMouseEnter={() => setColorOpen(true)}
                    onMouseLeave={() => setColorOpen(false)}
                    className="absolute left-full top-0 ml-2 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {colorOptions.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setColorMode(c.value)}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className={cn('h-3 w-3 rounded-sm', c.dot)} /> {c.label}
                        </span>
                        {colorMode === c.value && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/profile');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <Settings className="h-3.5 w-3.5" /> Settings
              </button>

              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
  active = 'tasks',
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  active?: 'tasks' | 'projects' | 'profile';
}) {
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const pathname = usePathname();

  const isTasks = active === 'tasks' || pathname === '/';
  const isProjects = active === 'projects' || pathname?.startsWith('/projects');
  const isProfile = active === 'profile' || pathname?.startsWith('/profile');

  if (collapsed) {
    return (
      <div className="hidden md:flex w-[64px] flex-col items-center gap-4 border-r border-zinc-200 bg-white py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <BrandMark size={36} rounded={10} />
        <button
          onClick={onToggle}
          className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <PanelLeft className="h-4 w-4 text-zinc-500" />
        </button>
        <div className="mt-2 flex flex-col gap-2">
          <Link
            href="/"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl',
              isTasks
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Link>
          <Link
            href="/projects"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl',
              isProjects
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            )}
          >
            <FolderKanban className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.aside
      initial={{ x: -8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.8 }}
      className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-zinc-200 bg-[#fcfcfc] dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex h-[56px] items-center justify-between px-3">
        <UserCard />
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <PanelLeft className="h-4 w-4 text-zinc-500" />
        </button>
      </div>

      <div className="px-3 py-2">
        <button
          onClick={() => setWorkspaceOpen(v => !v)}
          className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          <span>Workspace</span>
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform', workspaceOpen && 'rotate-180')}
          />
        </button>

        {workspaceOpen && (
          <div className="mt-2 space-y-1">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm',
                isTasks
                  ? 'bg-white font-medium shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'
                  : 'text-zinc-600 hover:bg-white dark:text-zinc-400 dark:hover:bg-zinc-900'
              )}
            >
              <CheckCircle2 className="h-4 w-4" /> Tasks
            </Link>
            <Link
              href="/projects"
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm',
                isProjects
                  ? 'bg-white font-medium shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'
                  : 'text-zinc-600 hover:bg-white dark:text-zinc-400 dark:hover:bg-zinc-900'
              )}
            >
              <FolderKanban className="h-4 w-4" /> Projects
            </Link>
            <Link
              href="/profile"
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm',
                isProfile
                  ? 'bg-white font-medium shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'
                  : 'text-zinc-600 hover:bg-white dark:text-zinc-400 dark:hover:bg-zinc-900'
              )}
            >
              <Settings className="h-4 w-4" /> Profile
            </Link>
          </div>
        )}
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-xl bg-zinc-900 p-3 text-white dark:bg-white dark:text-zinc-900">
          <p className="text-xs font-medium">Upgrade to Pro</p>
          <p className="mt-1 text-[11px] leading-relaxed opacity-70">
            Get unlimited projects & priority support.
          </p>
        </div>
      </div>
    </motion.aside>
  );
}
