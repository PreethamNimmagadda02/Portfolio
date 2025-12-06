"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface TrailDot {
  id: number;
  x: number;
  y: number;
}

export default function SpotlightCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const trailIdRef = useRef(0);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    let lastTrailTime = 0;
    const trailInterval = 50; // ms between trail dots

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Add trail dot with throttling
      const now = Date.now();
      if (now - lastTrailTime > trailInterval) {
        lastTrailTime = now;
        const newDot: TrailDot = {
          id: trailIdRef.current++,
          x: e.clientX,
          y: e.clientY,
        };
        setTrail((prev) => [...prev.slice(-8), newDot]); // Keep max 8 dots
      }
    };

    const hideCursor = () => setIsVisible(false);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseleave", hideCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseleave", hideCursor);
    };
  }, [cursorX, cursorY, isVisible]);

  // Clean up old trail dots
  useEffect(() => {
    const cleanup = setInterval(() => {
      setTrail((prev) => prev.slice(-6));
    }, 100);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <>
      {/* Cursor trail */}
      {trail.map((dot, index) => (
        <motion.div
          key={dot.id}
          className="fixed pointer-events-none z-40"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            left: dot.x,
            top: dot.y,
            translateX: "-50%",
            translateY: "-50%",
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: `rgba(139, 92, 246, ${0.3 + index * 0.05})`,
              boxShadow: "0 0 6px rgba(139, 92, 246, 0.4)",
            }}
          />
        </motion.div>
      ))}

      {/* Main spotlight */}
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-soft-light"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div
          className={`w-[400px] h-[400px] rounded-full transition-opacity duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Inner glow */}
      <motion.div
        className="fixed pointer-events-none z-50"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white/80 blur-sm transition-opacity duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        />
      </motion.div>
    </>
  );
}
