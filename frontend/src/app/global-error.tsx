'use client'; // Error boundaries must be Client Components

/**
 * Last resort for errors thrown by the root layout itself. It replaces the
 * root layout when active, so it must render its own <html>/<body> and cannot
 * rely on globals.css or the app's theme.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#f6f6f5',
          color: '#18181b',
        }}
      >
        <title>Something went wrong — TaskFlow</title>
        <div style={{ maxWidth: 420, padding: 24, textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Something went wrong</h2>
          <p style={{ fontSize: 14, color: '#71717a', marginTop: 8 }}>
            {error.message || 'The application failed to start.'}
          </p>
          <button
            onClick={() => retry()}
            style={{
              marginTop: 20,
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              background: '#18181b',
              color: '#fff',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
