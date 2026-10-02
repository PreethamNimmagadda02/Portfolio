"use client";

import { InViewClass } from "../Reveal";
import { cn } from "@/lib/utils";

/**
 * The break between movements of the About chapter: two hairline rules drawn
 * out from a gold lozenge, the ornament a printed book sets between sections
 * of one chapter. Decorative only.
 */
export function Ornament({ className }: { className?: string }) {
  return (
    <InViewClass amount={0.8} className={cn("flex items-center justify-center gap-5", className)}>
      <span aria-hidden className="rule-draw w-20 [transform-origin:right] sm:w-32" />
      <span aria-hidden className="size-2 rotate-45 border border-aurum-300" />
      <span aria-hidden className="rule-draw w-20 sm:w-32" />
    </InViewClass>
  );
}
