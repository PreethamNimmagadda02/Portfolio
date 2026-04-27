"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type DividerVariant = "wave" | "mesh" | "glow";

interface SectionDividerProps {
  variant?: DividerVariant;
  colorFrom?: string;
  colorTo?: string;
  flip?: boolean;
}

export default function SectionDivider({
  variant = "wave",
  colorFrom = "rgba(139, 92, 246, 0.15)",
  colorTo = "rgba(59, 130, 246, 0.1)",
  flip = false,
}: SectionDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const xShift = useTransform(scrollYProgress, [0, 1], [0, flip ? -40 : 40]);

  if (variant === "glow") {
    return (
      <div ref={ref} className="relative h-24 md:h-32 w-full overflow-hidden pointer-events-none">
        <motion.div
          style={{ x: xShift }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-[80%] h-[2px] rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
              boxShadow: `0 0 40px 8px ${colorFrom}, 0 0 80px 16px ${colorTo}`,
            }}
          />
        </motion.div>
        {/* Subtle dots */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: i === 1 ? colorFrom : colorTo }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "mesh") {
    return (
      <div ref={ref} className="relative h-20 md:h-28 w-full overflow-hidden pointer-events-none">
        <motion.div style={{ x: xShift }} className="absolute inset-0">
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${colorFrom}, transparent)`,
            }}
          />
        </motion.div>
        {/* Thin gradient line */}
        <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 5%, ${colorFrom} 30%, ${colorTo} 70%, transparent 95%)` }} />
      </div>
    );
  }

  // Wave variant (default)
  return (
    <div ref={ref} className={`relative h-20 md:h-28 w-full overflow-hidden pointer-events-none ${flip ? "rotate-180" : ""}`}>
      <motion.div style={{ x: xShift }} className="absolute inset-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-[120%] -left-[10%] h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
            fill={colorFrom}
          />
          <path
            d="M0,80 C360,20 720,100 1080,40 C1260,20 1380,60 1440,80 L1440,120 L0,120 Z"
            fill={colorTo}
          />
        </svg>
      </motion.div>
    </div>
  );
}
