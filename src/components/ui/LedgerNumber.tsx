"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useInView, EASE_SETTLE } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export interface LedgerNumberProps {
  /** The fully formatted figure, exactly as it should read: "1,800+", "Top 0.07%". */
  value: string;
  className?: string;
  /** Accessible text for the whole figure (the full sentence in Achievements). Defaults to value. */
  label?: string;
  /** Delay before the first character moves, in milliseconds. */
  delayMs?: number;
  /** Delay between characters, in milliseconds. */
  stagger?: number;
}

/**
 * Ledger roll-in. Each character slides up once out of its own mask, staggered
 * left to right, and lands on tabular figures so nothing shifts. The whole
 * component is keyed on `value`, so a live figure re-rolls exactly once when
 * the fetch resolves and never animates a placeholder.
 */
export function LedgerNumber(props: LedgerNumberProps) {
  return <LedgerRoll key={props.value} {...props} />;
}

const MASK_STYLE: CSSProperties = { paddingBottom: "0.08em" };
const SPACE_STYLE: CSSProperties = { width: "0.3em" };

function LedgerRoll({ value, className, label, delayMs = 0, stagger = 40 }: LedgerNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const chars = Array.from(value);
  const accessible = label ?? value;

  if (reduced) {
    return (
      <motion.span
        ref={ref}
        className={cn("ledger inline-flex", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <span className="sr-only">{accessible}</span>
        <span aria-hidden className="inline-flex">
          {value}
        </span>
      </motion.span>
    );
  }

  return (
    <span ref={ref} className={cn("ledger inline-flex", className)}>
      <span className="sr-only">{accessible}</span>
      {chars.map((ch, i) =>
        ch === " " ? (
          <span key={i} aria-hidden className="inline-block" style={SPACE_STYLE}>
            {" "}
          </span>
        ) : (
          <span key={i} aria-hidden className="inline-block overflow-hidden" style={MASK_STYLE}>
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              animate={inView ? { y: 0 } : { y: "110%" }}
              transition={{
                duration: 0.9,
                ease: EASE_SETTLE,
                delay: delayMs / 1000 + (i * stagger) / 1000,
              }}
            >
              {ch}
            </motion.span>
          </span>
        )
      )}
    </span>
  );
}

export default LedgerNumber;
