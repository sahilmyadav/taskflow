'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

/**
 * Catches render/runtime errors anywhere under the root layout so a single
 * failing component shows recoverable UI instead of blanking the whole app.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f6f5] px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-zinc-500">
          {error.message || 'An unexpected error occurred while rendering this page.'}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-[11px] text-zinc-400">ref: {error.digest}</p>
        )}
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={() => retry()}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            Try again
          </button>
          <a
            href="/login"
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
          >
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
}
