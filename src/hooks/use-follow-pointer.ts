"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePointerMove, type PointerState } from "@/lib/viewport-store";

export interface FollowOptions {
  /** Fraction of the remaining distance covered per frame, 0 to 1. Lower trails further behind. */
  lerp?: number;
  /** When false the element stops following; the last position is kept. */
  enabled?: boolean;
  /**
   * Writes the eased position to the node. `dx` is the distance still to
   * cover horizontally, which reads as velocity for anything that leans
   * into its travel.
   */
  write: (x: number, y: number, dx: number, dy: number) => void;
}

/**
 * Eases a position after the mouse and hands each frame to `write`, which
 * sets a transform straight on the node. No React state is touched, and the
 * animation frame only runs while there is distance left to cover, so a
 * resting hand costs nothing.
 *
 * Reads the shared pointer store, so no component adds a window listener of
 * its own, and ignores touch and pen: a follower has nothing to follow on a
 * device with no hover.
 */
export function useFollowPointer({ lerp = 0.18, enabled = true, write }: FollowOptions) {
  const state = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0, primed: false });
  const writeRef = useRef(write);
  const lerpRef = useRef(lerp);

  useEffect(() => {
    writeRef.current = write;
    lerpRef.current = lerp;
  }, [write, lerp]);

  const onMove = useCallback(
    (p: PointerState) => {
      if (!enabled || p.type !== "mouse") return;
      const s = state.current;
      s.tx = p.px;
      s.ty = p.py;
      // The first sighting lands in place rather than flying in from the corner.
      if (!s.primed) {
        s.x = p.px;
        s.y = p.py;
        s.primed = true;
      }
      if (s.raf) return;
      const tick = () => {
        s.raf = 0;
        const dx = s.tx - s.x;
        const dy = s.ty - s.y;
        const k = lerpRef.current;
        s.x += dx * k;
        s.y += dy * k;
        writeRef.current(s.x, s.y, dx, dy);
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) s.raf = requestAnimationFrame(tick);
      };
      s.raf = requestAnimationFrame(tick);
    },
    [enabled]
  );

  usePointerMove(onMove);

  useEffect(() => {
    const s = state.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  return state;
}
