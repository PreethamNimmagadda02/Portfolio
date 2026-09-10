"use client";

import { useSyncExternalStore } from "react";

/**
 * Chapter map for the single persistent CosmicScene background.
 *
 * The whole page is one continuous WebGL journey: as the visitor scrolls,
 * normalized document progress (0..1, from viewport-store's scroll tracker)
 * is looked up here to drive camera position, palette and focus-object state,
 * instead of each section owning its own canvas.
 *
 * Boundaries are approximate fractions of total document height. Precision
 * doesn't matter: this is an ambient backdrop, not a scrollytelling rig with
 * hard cuts, so a chapter boundary drifting by a few percent across content
 * edits is invisible.
 *
 * Palette: every chapter shares one gold family. colorA is aurum-300 (the
 * highlight), colorB is aurum-500 (the umber body of the cloud; it must stay
 * this dark or the additive shaders push the gold toward orange), colorC is
 * obsidian-0 (the page ground).
 */
export interface SceneChapter {
  id: string;
  start: number;
  end: number;
  /** Hex colors driving the star field + focus-object emissive tones. */
  colorA: string;
  colorB: string;
  colorC: string;
  /** Camera waypoint this chapter settles toward. */
  camera: [number, number, number];
  lookAt: [number, number, number];
  /**
   * Focus-object presence, 0 to 1: 1 in the hero and contact chapters, 0
   * through the middle of the page, which is pure obsidian and type. This
   * gated the aurora nebula before it was removed; the star field still reads
   * it to lift itself in those two chapters.
   */
  intensity: number;
  /** Base opacity of the skills star chart, 0 to 1 (0.12 in the skills chapter). */
  constellationOpacity: number;
}

const AURUM_300 = "#C9A961";
const AURUM_500 = "#7A6134";
const OBSIDIAN_0 = "#0C0A08";

export const SCENE_CHAPTERS: SceneChapter[] = [
  { id: "hero", start: 0.0, end: 0.06, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [0.9, 0.3, 6.5], lookAt: [0.2, 0.1, 0], intensity: 1, constellationOpacity: 0 },
  { id: "about", start: 0.06, end: 0.17, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [1.4, 0.3, 6], lookAt: [0.4, 0, 0], intensity: 0, constellationOpacity: 0 },
  { id: "experience", start: 0.17, end: 0.33, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [-1.6, 0.6, 6.4], lookAt: [-0.3, 0.2, 0], intensity: 0, constellationOpacity: 0 },
  { id: "skills", start: 0.33, end: 0.43, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [0, -0.2, 5.6], lookAt: [0, 0, 0], intensity: 0, constellationOpacity: 0.12 },
  { id: "projects", start: 0.43, end: 0.59, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [1.8, -0.4, 6.2], lookAt: [0.3, -0.1, 0], intensity: 0, constellationOpacity: 0 },
  { id: "activity", start: 0.59, end: 0.71, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [-1.4, 0.4, 6], lookAt: [-0.2, 0.1, 0], intensity: 0, constellationOpacity: 0 },
  { id: "achievements", start: 0.71, end: 0.81, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [0, 0.5, 6.5], lookAt: [0, 0, 0], intensity: 0, constellationOpacity: 0 },
  { id: "testimonials", start: 0.81, end: 0.91, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [-1, -0.2, 6.8], lookAt: [0, 0, 0], intensity: 0, constellationOpacity: 0 },
  { id: "contact", start: 0.91, end: 1.0, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [0, -0.6, 7], lookAt: [0, -0.3, 0], intensity: 1, constellationOpacity: 0 },
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
  // Cross-fade the last ~50% of a chapter into the next one's camera, palette
  // and intensity so transitions are continuous motion rather than a snap at
  // the boundary.
  const blend = Math.max(0, (localT - 0.5) / 0.5);

  return {
    index: i,
    chapter,
    next,
    blend,
    camera: lerp3(chapter.camera, next.camera, blend),
    lookAt: lerp3(chapter.lookAt, next.lookAt, blend),
    intensity: chapter.intensity + (next.intensity - chapter.intensity) * blend,
    constellationOpacity:
      chapter.constellationOpacity + (next.constellationOpacity - chapter.constellationOpacity) * blend,
  };
}

// -----------------------------------------------------------------------------
// Skills category filter, shared between the DOM filter UI (Skills section)
// and the constellation focus-object inside CosmicScene, so toggling a
// category dims/highlights the matching points in the persistent background.
// -----------------------------------------------------------------------------
let activeCategories = new Set<string>();
const listeners = new Set<() => void>();

/**
 * Selects one category, exclusively. The Skills dial always points at a
 * discipline, so there is no "nothing selected" position to toggle back to:
 * re-selecting the category already showing is a no-op rather than a clear.
 */
export function selectSkillCategory(cat: string) {
  if (activeCategories.size === 1 && activeCategories.has(cat)) return;
  activeCategories = new Set<string>([cat]);
  for (const l of listeners) l();
}

export function getActiveSkillCategories() {
  return activeCategories;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * One frozen empty set for the server snapshot. Returning a fresh Set on every
 * call makes useSyncExternalStore see a new value each render, which React
 * reports as an uncached getServerSnapshot and can spin into a render loop.
 */
const EMPTY_CATEGORIES: ReadonlySet<string> = new Set<string>();

function getServerCategories(): Set<string> {
  return EMPTY_CATEGORIES as Set<string>;
}

export function useActiveSkillCategories(): Set<string> {
  return useSyncExternalStore(subscribe, getActiveSkillCategories, getServerCategories);
}
