/**
 * Renders an inline script that the browser executes while parsing the HTML.
 *
 * `type` is `text/javascript` on the server so the browser runs it during
 * parsing, and `text/plain` on the client so React does not warn about
 * rendering a <script> tag (scripts created by React on the client never
 * execute anyway). `suppressHydrationWarning` covers the type difference.
 *
 * This is the helper described in Next's "preventing flash before hydration"
 * guide — see node_modules/next/dist/docs/01-app/02-guides.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
