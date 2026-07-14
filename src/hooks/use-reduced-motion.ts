"use client";

import { useMediaQuery } from "@/lib/viewport-store";

/**
 * Reactive `prefers-reduced-motion` hook. Backed by the shared media-query
 * store so every consumer reuses one `MediaQueryList` and one listener.
 */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}
