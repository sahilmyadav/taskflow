"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * TaskFlow mark — traced from the user image (white sunburst on black).
 * Vector: black rounded square + 14 white ellipses around center. No external asset, no CDN.
 * Works crisp at any size (viewBox 0 0 100 100). Dark mode + light mode: always black tile with white burst.
 */
export function BrandMark({
  size = 32,
  className,
  rounded = 10,
}: {
  size?: number;
  className?: string;
  rounded?: number;
}) {
  const rx = Math.round((rounded * 100) / size);
  // angles + shape tuned to match uploaded image (thin top, fatter east/south-east)
  // 14 petals: angle, rx, ry — left side slightly narrower for that 3d feel
  const petals: { angle: number; rx: number; ry: number }[] = [
    { angle: 0, rx: 3.2, ry: 16 },
    { angle: 18, rx: 3.4, ry: 15.5 },
    { angle: 41, rx: 6.2, ry: 13.2 },
    { angle: 63, rx: 6.8, ry: 12.6 },
    { angle: 86, rx: 7.2, ry: 11.8 },
    { angle: 109, rx: 7.0, ry: 12.4 },
    { angle: 133, rx: 6.9, ry: 13.0 },
    { angle: 160, rx: 5.8, ry: 14.2 },
    { angle: 185, rx: 5.0, ry: 15.0 },
    { angle: 208, rx: 5.6, ry: 13.8 },
    { angle: 232, rx: 5.8, ry: 12.8 },
    { angle: 260, rx: 6.9, ry: 11.4 },
    { angle: 285, rx: 6.5, ry: 12.0 },
    { angle: 320, rx: 3.6, ry: 15.0 },
  ];

  return (
    <span
      aria-label="TaskFlow"
      role="img"
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-lg ring-1 ring-black/15 dark:ring-white/10",
        className
      )}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        shapeRendering="geometricPrecision"
      >
        <rect width={100} height={100} rx={rx} fill="#0a0a0a" />
        {/* soft inner highlight like the reference */}
        <rect width={100} height={100} rx={rx} fill="white" fillOpacity={0.04} />
        <rect x={0.7} y={0.7} width={98.6} height={98.6} rx={rx - 0.7} stroke="white" strokeOpacity={0.09} />
        <g fill="white">
          {petals.map((p, i) => (
            <ellipse
              key={i}
              cx={50}
              cy={20}
              rx={p.rx}
              ry={p.ry}
              transform={`rotate(${p.angle} 50 50)`}
            />
          ))}
        </g>
        {/* tiny center hole to match reference negative space */}
        <circle cx={50} cy={50} r={10.5} fill="#0a0a0a" />
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
    <span className={cn("inline-flex items-center gap-2.5", className)}>
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

export const BrandLogo = BrandMark;
