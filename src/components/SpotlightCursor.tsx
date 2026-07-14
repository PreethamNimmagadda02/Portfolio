"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePointer, usePointerMove, useMediaQuery } from "@/lib/viewport-store";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SpotlightCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  const loopActive = useRef(false);
  // Holds the current spring stepper so the wake callback can kick it without
  // depending on its identity (avoids self-referential useCallback recursion).
  const stepRef = useRef<() => void>(() => {});

  // Touch/coarse-pointer devices skip the spotlight entirely.
  const coarsePointer = useMediaQuery("(pointer: coarse)", false);
  const isMobile = useIsMobile();
  const disabled = coarsePointer || isMobile;

  // Shared pointer object (single window listener). Read as the spring target.
  const pointer = usePointer();

  // Spring animation loop — runs only while the spotlight is catching up to the
  // cursor; once it converges (mouse stopped) the loop stops, so an idle page
  // costs nothing. Defined inside the effect so its self-recursive rAF call is
  // a safe local closure.
  useEffect(() => {
    const animate = () => {
      const el = containerRef.current;
      if (!el) {
        loopActive.current = false;
        return;
      }
      const dx = pointer.px - position.current.x;
      const dy = pointer.py - position.current.y;
      position.current.x += dx * 0.12;
      position.current.y += dy * 0.12;

      el.style.setProperty("--cx", `${position.current.x}px`);
      el.style.setProperty("--cy", `${position.current.y}px`);

      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        loopActive.current = false;
        return;
      }
      rafId.current = requestAnimationFrame(animate);
    };
    stepRef.current = animate;
    return () => cancelAnimationFrame(rafId.current);
  }, [pointer]);

  // Wake the spring loop on movement (via the shared pointer-move fan-out).
  const wake = useCallback(() => {
    if (!disabled && !loopActive.current) {
      loopActive.current = true;
      rafId.current = requestAnimationFrame(() => stepRef.current());
    }
  }, [disabled]);
  usePointerMove(wake);

  if (disabled) return null;

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
