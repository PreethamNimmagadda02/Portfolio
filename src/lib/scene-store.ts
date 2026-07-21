"use client";

import { useSyncExternalStore } from "react";

/**
 * Chapter map for the single persistent CosmicScene background.
 *
 * The whole page is one continuous WebGL journey: as the visitor scrolls,
 * normalized document progress (0..1, from viewport-store's scroll tracker)
 * is looked up here to drive camera position, palette, and focus-object
 * state — instead of each section owning its own canvas/lights/HDR.
 *
 * Boundaries are approximate fractions of total document height. Precision
 * doesn't matter: this is an ambient backdrop, not a scrollytelling rig with
 * hard cuts, so a chapter boundary drifting by a few percent across content
 * edits is invisible.
 */
export interface SceneChapter {
  id: string;
  start: number;
  end: number;
  /** Hex colors driving the nebula shader + focus-object emissive tones. */
  colorA: string;
  colorB: string;
  colorC: string;
  /** Camera waypoint this chapter settles toward. */
  camera: [number, number, number];
  lookAt: [number, number, number];
  /** Which focus-object silhouette is emphasized during this chapter. */
  focus: "core" | "constellation" | "prism" | "signal" | "flame" | "quiet";
}

export const SCENE_CHAPTERS: SceneChapter[] = [
  { id: "hero", start: 0.0, end: 0.06, colorA: "#8b5cf6", colorB: "#3b82f6", colorC: "#06010f", camera: [0, 0, 6.5], lookAt: [0, 0, 0], focus: "core" },
  { id: "about", start: 0.06, end: 0.17, colorA: "#60a5fa", colorB: "#8b5cf6", colorC: "#020410", camera: [1.4, 0.3, 6], lookAt: [0.4, 0, 0], focus: "core" },
  { id: "experience", start: 0.17, end: 0.33, colorA: "#818cf8", colorB: "#a855f7", colorC: "#070414", camera: [-1.6, 0.6, 6.4], lookAt: [-0.3, 0.2, 0], focus: "signal" },
  { id: "skills", start: 0.33, end: 0.43, colorA: "#ec4899", colorB: "#22d3ee", colorC: "#0a0414", camera: [0, -0.2, 5.6], lookAt: [0, 0, 0], focus: "constellation" },
  { id: "projects", start: 0.43, end: 0.59, colorA: "#a855f7", colorB: "#06b6d4", colorC: "#04030f", camera: [1.8, -0.4, 6.2], lookAt: [0.3, -0.1, 0], focus: "prism" },
  { id: "activity", start: 0.59, end: 0.71, colorA: "#22c55e", colorB: "#06b6d4", colorC: "#03100c", camera: [-1.4, 0.4, 6], lookAt: [-0.2, 0.1, 0], focus: "signal" },
  { id: "achievements", start: 0.71, end: 0.81, colorA: "#fbbf24", colorB: "#f97316", colorC: "#100704", camera: [0, 0.5, 6.5], lookAt: [0, 0, 0], focus: "flame" },
  { id: "testimonials", start: 0.81, end: 0.91, colorA: "#a855f7", colorB: "#f472b6", colorC: "#0a0411", camera: [-1, -0.2, 6.8], lookAt: [0, 0, 0], focus: "quiet" },
  { id: "contact", start: 0.91, end: 1.0, colorA: "#8b5cf6", colorB: "#3b82f6", colorC: "#06010f", camera: [0, 0, 7], lookAt: [0, 0, 0], focus: "core" },
];

export function hexToVec3(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function lerp3(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Piecewise-linear lookup: returns the interpolated chapter state at progress `p`. */
export function getSceneState(p: number) {
  const clamped = Math.min(Math.max(p, 0), 1);
  let i = SCENE_CHAPTERS.findIndex((c) => clamped >= c.start && clamped <= c.end);
  if (i === -1) i = clamped < SCENE_CHAPTERS[0].start ? 0 : SCENE_CHAPTERS.length - 1;
  const chapter = SCENE_CHAPTERS[i];
  const next = SCENE_CHAPTERS[Math.min(i + 1, SCENE_CHAPTERS.length - 1)];
  const span = Math.max(chapter.end - chapter.start, 0.0001);
  const localT = Math.min(Math.max((clamped - chapter.start) / span, 0), 1);
  // Cross-fade the last ~50% of a chapter into the next one's camera/palette
  // so transitions are continuous motion rather than a snap at the boundary.
  const blend = Math.max(0, (localT - 0.5) / 0.5);

  return {
    index: i,
    chapter,
    next,
    blend,
    camera: lerp3(chapter.camera, next.camera, blend),
    lookAt: lerp3(chapter.lookAt, next.lookAt, blend),
  };
}

// -----------------------------------------------------------------------------
// Skills category filter — shared between the DOM chip UI (Skills section)
// and the constellation focus-object inside CosmicScene, so clicking a chip
// dims/highlights the matching points in the persistent background scene.
// -----------------------------------------------------------------------------
let activeCategories = new Set<string>();
const listeners = new Set<() => void>();

export function toggleSkillCategory(cat: string) {
  const next = new Set<string>();
  // If it's not already the only active category, select it (exclusive)
  // Otherwise, it gets toggled off (leaving next empty)
  if (!activeCategories.has(cat)) {
    next.add(cat);
  }
  activeCategories = next;
  for (const l of listeners) l();
}

export function getActiveSkillCategories() {
  return activeCategories;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useActiveSkillCategories(): Set<string> {
  return useSyncExternalStore(subscribe, getActiveSkillCategories, () => new Set<string>());
}
