import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* One frame grammar for the instrument surfaces: a hairline box with a short
   gold segment riding each corner, the way a trim mark sits on a printed
   plate. Ornament only, so the ticks never enter the accessibility tree.

   The image plates (PortraitPlate, ScreenshotPlate) use the double bezel
   instead; this is for the framed data surfaces, where an inner bezel would
   crowd the contents. */

const TICK = "pointer-events-none absolute bg-hairline-gold";

/**
 * Corner trim marks, positioned against the nearest positioned ancestor.
 *
 * `edges` has to match the rules the surface actually draws. A tick with no
 * rule beneath it reads as a stray gold dash, so a surface with only a top
 * border asks for "top".
 */
export function PlateTicks({
  length = "1.5rem",
  edges = "all",
}: {
  length?: string;
  edges?: "all" | "top";
}) {
  const width = { width: length };
  return (
    <span aria-hidden>
      <span className={cn(TICK, "-top-px left-0 h-px")} style={width} />
      <span className={cn(TICK, "-top-px right-0 h-px")} style={width} />
      {edges === "all" ? (
        <>
          <span className={cn(TICK, "-bottom-px left-0 h-px")} style={width} />
          <span className={cn(TICK, "-bottom-px right-0 h-px")} style={width} />
        </>
      ) : null}
    </span>
  );
}

export interface PlateProps {
  children: ReactNode;
  className?: string;
  /** Renders only the top and bottom rules, for a surface that should not be boxed. */
  rulesOnly?: boolean;
}

/**
 * A framed data surface. Wraps its contents in hairlines and hangs a gold
 * trim mark on each corner.
 */
export function Plate({ children, className, rulesOnly = false }: PlateProps) {
  return (
    <div
      className={cn(
        "relative",
        rulesOnly ? "border-y border-hairline" : "border border-hairline",
        className
      )}
    >
      <PlateTicks />
      {children}
    </div>
  );
}

export default Plate;
