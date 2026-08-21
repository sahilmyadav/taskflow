'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function BrandMark({
  size = 32,
  className,
  rounded = 10,
}: {
  size?: number;
  className?: string;
  rounded?: number;
}) {
  const uid = React.useId();
  const gradId = `tf-grad-${uid.replace(/:/g, '')}`;
  const shadowId = `tf-shadow-${uid.replace(/:/g, '')}`;
  // keep svg crisp: viewBox 0 0 32 32, rect rx based on size
  const rx = Math.round((rounded * 32) / size);
  return (
    <span
      aria-label="TaskFlow"
      role="img"
      style={{ width: size, height: size }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10',
        className
      )}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <rect width={32} height={32} rx={rx} fill={`url(#${gradId})`} />
        {/* subtle glass highlight */}
        <rect width={32} height={32} rx={rx} fill="white" fillOpacity={0.07} />
        <rect
          x={0.5}
          y={0.5}
          width={31}
          height={31}
          rx={rx - 0.5}
          stroke="white"
          strokeOpacity={0.14}
        />
        {/* double check — conveys “tasks / layers” */}
        <g filter={`url(#${shadowId})`}>
          <path
            d="M10 16.35L13.85 20.2L22.25 11.05L20.85 9.65L13.85 17.25L11.4 14.95L10 16.35Z"
            fill="white"
          />
          <path
            d="M10 19.35L13.85 23.2L22.25 14.05L21.45 13.25L13.85 20.65L10.8 18.55L10 19.35Z"
            fill="white"
            opacity={0.92}
          />
        </g>
        <defs>
          <linearGradient id={gradId} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C3AED" />
            <stop offset="0.55" stopColor="#6366F1" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
          <filter
            id={shadowId}
            x="8"
            y="7"
            width="16.5"
            height="18.5"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feDropShadow dx={0} dy={1} stdDeviation={1} floodOpacity={0.22} />
          </filter>
        </defs>
      </svg>
    </span>
  );
}

export function BrandWordmark({
  size = 32,
  showText = true,
  className,
}: {
  size?: number;
  showText?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <BrandMark size={size} />
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-white">
            TaskFlow
          </span>
          <span className="hidden text-[10px] font-medium tracking-[0.14em] text-zinc-500 dark:text-zinc-400 sm:inline">
            WORKSPACE
          </span>
        </span>
      )}
    </span>
  );
}

// convenient alias for header / sidebar where only the mark is needed
export const BrandLogo = BrandMark;
