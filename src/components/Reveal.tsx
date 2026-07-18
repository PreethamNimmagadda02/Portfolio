"use client";

/**
 * Reveal primitives for the masked-line heading system.
 *
 * `InViewClass` adds `.in-view` to its wrapper the first time it enters the
 * viewport — all descendant `.line-rise` / `.kicker-line` / `.comet` CSS
 * animations key off that class, so an entire section's entrance is one
 * IntersectionObserver + pure CSS (no per-element Framer nodes).
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
  // Always starts false — the server prerenders without `.in-view`, and the
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
 * Splits text into words, each wrapped in a clipping mask with a staggered
 * `.line-rise` animation. Use inside an `InViewClass` wrapper.
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
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i} className={cn("line-mask align-bottom", className)} style={{ display: "inline-block" }}>
          <span className="line-rise" style={{ "--rise-delay": `${baseDelay + i * step}ms` } as React.CSSProperties}>
            {word}
          </span>
          {i < text.split(" ").length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </>
  );
}

/** Oversized ghost index + label + drawing hairline. Place inside InViewClass. */
export function SectionKicker({ num, label }: { num: string; label: string }) {
  return (
    <div className="kicker" aria-hidden>
      <span className="kicker-num">{num}</span>
      <span className="kicker-label">{label}</span>
      <span className="kicker-line" />
    </div>
  );
}
