"use client";

import { InViewClass } from "../Reveal";
import { cn } from "@/lib/utils";

/**
 * The house mark: PN struck in foil italic inside a double gold ring, with
 * four lozenges at the cardinal points. It is the small sibling of the About
 * seal and the drawing the app icons are rendered from
 * (scripts/brand/monogram.html), so the mark is one object wherever it
 * appears.
 *
 * The outer ring draws itself in once on arrival. Inside a `group`, hovering
 * turns the lozenges an eighth of a turn, the way a bezel clicks round.
 *
 * Fixed gradient id: the mark is rendered once per page, in the letterhead.
 */
export function Emblem({ className }: { className?: string }) {
  const foilId = "brand-foil";
  return (
    <InViewClass as="span" amount={0} className={cn("block", className)}>
      <svg viewBox="0 0 100 100" className="block h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={foilId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className="[stop-color:var(--color-aurum-100)]" />
            <stop offset="45%" className="[stop-color:var(--color-aurum-300)]" />
            <stop offset="100%" className="[stop-color:var(--color-aurum-500)]" />
          </linearGradient>
        </defs>

        <circle
          cx={50}
          cy={50}
          r={47}
          fill="none"
          strokeWidth={1.6}
          pathLength={1}
          className="draw-path stroke-aurum-300"
          transform="rotate(-90 50 50)"
        />
        <circle cx={50} cy={50} r={40.5} fill="none" strokeWidth={1} className="stroke-hairline-strong" />

        <g className="transition-[rotate] duration-700 ease-heavy [transform-box:view-box] [transform-origin:50%_50%] group-hover:rotate-45 group-focus-visible:rotate-45">
          {[
            [50, 3],
            [97, 50],
            [50, 97],
            [3, 50],
          ].map(([x, y]) => (
            <rect
              key={`${x}-${y}`}
              x={x - 3.2}
              y={y - 3.2}
              width={6.4}
              height={6.4}
              transform={`rotate(45 ${x} ${y})`}
              className="fill-obsidian-0 stroke-aurum-300"
              strokeWidth={1.2}
            />
          ))}
        </g>

        <text
          x={50}
          y={52}
          textAnchor="middle"
          dominantBaseline="central"
          fill={`url(#${foilId})`}
          className="font-display italic"
          fontSize={42}
          letterSpacing="-0.04em"
        >
          PN
        </text>
      </svg>
    </InViewClass>
  );
}

/**
 * The letterhead lockup: the emblem, a gold hairline, and the name set in
 * spaced Didone capitals over a small mono descriptor, the arrangement a
 * maison uses on its letterhead. The name takes the foil sweep on hover.
 */
export function BrandLockup() {
  return (
    <span className="flex items-center gap-3 sm:gap-4">
      <Emblem className="size-9 shrink-0 sm:size-10" />
      <span aria-hidden className="hidden h-8 w-px bg-hairline-gold sm:block" />
      <span className="flex flex-col gap-[7px]">
        <span className="foil whitespace-nowrap font-display text-[12px] uppercase leading-none tracking-[0.16em] min-[380px]:text-[13px] sm:text-[15px] sm:tracking-[0.2em]">
          Preetham Nimmagadda
        </span>
        <span className="caption hidden whitespace-nowrap text-[9px] tracking-[0.34em] text-aurum-300 sm:block">
          AI Architect
        </span>
      </span>
    </span>
  );
}
