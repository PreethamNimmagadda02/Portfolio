"use client";

/**
 * Reveal primitives for the plate-lift heading system.
 *
 * `InViewClass` adds `.in-view` to its wrapper the first time it enters the
 * viewport. Every descendant `.line-rise` and `.rule-draw` (see globals.css)
 * keys off that class, so an entire section's entrance is one
 * IntersectionObserver plus pure CSS, with no per-element Framer nodes.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function InViewClass({
  children,
  className = "",
  amount = 0.25,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  as?: "div" | "section" | "header" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Always starts false: the server prerenders without `.in-view`, and the
  // client hydrates identically (a lazy `typeof IntersectionObserver` check
  // here caused a server/client class mismatch).
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Ancient-browser fallback: reveal on the next frame
      const raf = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(raf);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: amount }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [amount]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={cn(className, inView && "in-view")}>
      {children}
    </Tag>
  );
}

/**
 * Splits text into words, each rising out of its own clipping mask on a
 * left-to-right stagger, so a display line assembles rather than arriving
 * whole. Use inside an `InViewClass` wrapper.
 *
 * The mask is `.word-mask`, whose descender reserve is set in em: one shared
 * pixel reserve would clip a "g" at 3rem and leave a gap at 22px. The space
 * between words sits outside the masks so it stays a line break opportunity.
 */
export function RiseWords({
  text,
  className = "",
  baseDelay = 0,
  step = 70,
}: {
  text: string;
  className?: string;
  baseDelay?: number;
  step?: number;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={i}>
          <span className={cn("word-mask", className)}>
            <span
              className="line-rise"
              style={{ "--rise-delay": `${baseDelay + i * step}ms` } as React.CSSProperties}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}
