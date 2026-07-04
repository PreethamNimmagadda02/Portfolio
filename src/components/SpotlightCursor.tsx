"use client";

import { useEffect, useRef, useState } from "react";

export default function SpotlightCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    // Detect touch devices and skip
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Smooth animation loop with spring physics.
    // Runs only while the spotlight is catching up to the cursor — once it
    // converges (mouse stopped) the loop stops, so an idle page costs nothing.
    let running = true;
    let loopActive = false;

    const animate = () => {
      if (!running || !containerRef.current) {
        loopActive = false;
        return;
      }

      // Spring interpolation for smooth following
      const dx = target.current.x - position.current.x;
      const dy = target.current.y - position.current.y;
      position.current.x += dx * 0.12;
      position.current.y += dy * 0.12;

      containerRef.current.style.setProperty("--cx", `${position.current.x}px`);
      containerRef.current.style.setProperty("--cy", `${position.current.y}px`);

      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        loopActive = false;
        return;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!loopActive) {
        loopActive = true;
        rafId.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener("pointermove", onMouseMove, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("pointermove", onMouseMove);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (isMobile) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      style={{
        // Primary large ambient glow
        background: `
          radial-gradient(
            600px circle at var(--cx, -100px) var(--cy, -100px),
            rgba(139, 92, 246, 0.06),
            rgba(59, 130, 246, 0.03) 40%,
            transparent 70%
          )
        `,
      }}
    >
      {/* Secondary bright accent spot */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          background: `
            radial-gradient(
              200px circle at var(--cx, -100px) var(--cy, -100px),
              rgba(168, 85, 247, 0.08),
              rgba(236, 72, 153, 0.03) 50%,
              transparent 70%
            )
          `,
        }}
      />
    </div>
  );
}
