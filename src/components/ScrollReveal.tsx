"use client";

import { motion, useInView, ease as easeTokens, duration as durTokens } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
  amount?: number;
  /** When true, direct motion children with the `staggerItem` variant cascade. */
  stagger?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = durTokens.slow,
  once = true,
  amount = 0.15,
  stagger = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount, margin: "0px 0px -8% 0px" });
  const reduce = useReducedMotion();

  // Reduced motion: opacity-only, no transform, no stagger delay.
  const dirOffset = reduce
    ? {}
    : {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
        none: {},
      }[direction];

  if (stagger && !reduce) {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 1 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: delay + 0.05 },
          },
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirOffset }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{ duration, delay, ease: easeTokens.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
