"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export default function PageProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  // Glow intensifies as you scroll further
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 1]);

  return (
    <>
      {/* Main progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 origin-left z-[100]"
        style={{ scaleX }}
      />
      {/* Glow effect behind the bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 origin-left z-[99] blur-sm"
        style={{ scaleX, opacity: glowOpacity }}
      />
    </>
  );
}
