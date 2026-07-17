"use client";

import { motionValue } from "framer-motion";
import type { MotionValue } from "framer-motion";

/**
 * Shared scroll velocity published by SmoothScroll's single Lenis/Framer frame
 * loop. Consumers (e.g. the velocity-skew wrapper) read this MotionValue instead
 * of attaching their own scroll listeners. Signed: negative scrolling up,
 * positive scrolling down. Settles to 0 when scrolling stops.
 */
export const scrollVelocity: MotionValue<number> = motionValue(0);

/** Push a new velocity sample (called once per frame by SmoothScroll). */
export function setScrollVelocity(v: number): void {
  scrollVelocity.set(v);
}
