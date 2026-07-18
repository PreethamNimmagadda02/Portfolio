"use client";

/**
 * InteractiveCard — the shared premium hover treatment for cards.
 *
 * Pointer-following radial sheen + rim-light border + subtle 3D tilt, all
 * driven by a self-stopping rAF loop that writes CSS variables / transforms
 * directly to the DOM (the same pattern as the Navbar). Zero React re-renders
 * per frame, zero Framer springs per card — dozens of these can be mounted
 * with no idle cost: the loop only runs while the pointer is over the card
 * (plus a short decay back to rest).
 *
 * CSS contract (see globals.css `.icard`):
 *   --icx / --icy   pointer position within the card (%)
 *   --ic-opacity    sheen/rim visibility 0..1
 *   --ic-accent     per-card accent color (set via the `accent` prop)
 */

import { useCallback, useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/viewport-store";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  /** Accent color for the sheen/rim light. Defaults to the theme iris. */
  accent?: string;
  /** Max tilt in degrees. 0 disables tilt (sheen only). */
  tilt?: number;
  style?: CSSProperties;
}

export default function InteractiveCard({
  children,
  className = "",
  accent,
  tilt = 3,
  style,
}: InteractiveCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);
  const loopActive = useRef(false);
  const state = useRef({ x: 0.5, y: 0.5, hovering: false, rx: 0, ry: 0, sx: 50, sy: 50, op: 0 });
  // Touch devices get the static card — no tilt/sheen chasing a phantom cursor.
  const coarse = useMediaQuery("(pointer: coarse)", false);

  const tick = useCallback(
    function tickFn() {
      const el = ref.current;
      if (!el) {
        loopActive.current = false;
        return;
      }
      const s = state.current;

      if (s.hovering) {
        s.ry += ((s.x - 0.5) * tilt - s.ry) * 0.09;
        s.rx += ((0.5 - s.y) * tilt - s.rx) * 0.09;
        s.sx += (s.x * 100 - s.sx) * 0.14;
        s.sy += (s.y * 100 - s.sy) * 0.14;
        s.op += (1 - s.op) * 0.1;
      } else {
        s.ry *= 0.9;
        s.rx *= 0.9;
        s.op *= 0.88;
      }

      if (tilt > 0) {
        el.style.transform = `perspective(900px) rotateX(${s.rx}deg) rotateY(${s.ry}deg)`;
      }
      el.style.setProperty("--icx", `${s.sx}%`);
      el.style.setProperty("--icy", `${s.sy}%`);
      el.style.setProperty("--ic-opacity", s.op.toFixed(3));

      const converged =
        !s.hovering && Math.abs(s.rx) < 0.01 && Math.abs(s.ry) < 0.01 && s.op < 0.01;
      if (converged) {
        s.op = 0;
        el.style.setProperty("--ic-opacity", "0");
        if (tilt > 0) el.style.transform = "";
        loopActive.current = false;
        return;
      }
      rafId.current = requestAnimationFrame(tickFn);
    },
    [tilt]
  );

  const startLoop = useCallback(() => {
    if (loopActive.current) return;
    loopActive.current = true;
    rafId.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    return () => {
      loopActive.current = false;
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    state.current.x = (e.clientX - rect.left) / rect.width;
    state.current.y = (e.clientY - rect.top) / rect.height;
  }, []);

  const onMouseEnter = useCallback(() => {
    state.current.hovering = true;
    startLoop();
  }, [startLoop]);

  const onMouseLeave = useCallback(() => {
    state.current.hovering = false;
    startLoop(); // loop keeps running until decay converges, then stops itself
  }, [startLoop]);

  return (
    <div
      ref={ref}
      className={cn("icard", className)}
      style={{ ...(accent ? ({ "--ic-accent": accent } as CSSProperties) : {}), ...style }}
      onMouseMove={coarse ? undefined : onMouseMove}
      onMouseEnter={coarse ? undefined : onMouseEnter}
      onMouseLeave={coarse ? undefined : onMouseLeave}
    >
      {children}
    </div>
  );
}
