import * as React from "react";
import { cn } from "@/lib/utils";
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn("flex h-9 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-100", className)} {...props}>{children}</select>
));
Select.displayName = "Select";
export { Select };
