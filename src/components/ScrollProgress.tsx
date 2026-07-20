"use client";

import { motion, useScroll, useSpring } from "@/lib/motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[9999] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, #ad7f3c, #c9974a, #c9974a, #c9974a)",
        boxShadow:
          "0 0 10px rgba(201, 151, 74, 0.5), 0 0 20px rgba(201, 151, 74, 0.3)",
      }}
    />
  );
}
