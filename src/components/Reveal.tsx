"use client";

/**
 * Reveal primitive for the plate-lift heading system.
 *
 * `InViewClass` adds `.in-view` to its wrapper the first time it enters the
 * viewport. Every descendant `.line-rise` and `.rule-draw` (see globals.css)
 * keys off that class, so an entire section's entrance is one
 * IntersectionObserver plus pure CSS, with no per-element Framer nodes.
 */

import { useRef, type ReactNode } from "react";
import { useInView } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function InViewClass({
  children,
  className = "",
  amount,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  amount: number;
  as?: "div" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  // False on the server and through hydration alike, so the class never mismatches.
  const inView = useInView(ref, { once: true, amount });

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={cn(className, inView && "in-view")}>
      {children}
    </Tag>
  );
}
