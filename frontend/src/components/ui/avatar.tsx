import { cn } from "@/lib/utils";

/**
 * Avatar sources are arbitrary user-supplied URLs (`user.avatarUrl`, with a
 * placeholder fallback), which `next/image` cannot pre-authorise through
 * `remotePatterns`. A plain <img> is the right primitive here, so the lint
 * exception lives in this one place instead of at every call site.
 */
export function Avatar({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn("rounded-full object-cover", className)} />
  );
}
