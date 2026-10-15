"use client";

import { InViewClass } from "../Reveal";

/**
 * The break between movements of the About chapter: two hairline rules drawn
 * out from a gold lozenge, the ornament a printed book sets between sections
 * of one chapter. Decorative only.
 */
export function Ornament() {
  return (
    <InViewClass amount={0.8} className="flex items-center justify-center gap-5 mb-20 lg:mb-28">
      <span aria-hidden className="rule-draw w-20 [transform-origin:right] sm:w-32" />
      <span aria-hidden className="size-2 rotate-45 border border-aurum-300" />
      <span aria-hidden className="rule-draw w-20 sm:w-32" />
    </InViewClass>
  );
}
