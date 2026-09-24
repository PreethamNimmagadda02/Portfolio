"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Chapter map for the single persistent CosmicScene background.
 *
 * The whole page is one continuous WebGL journey: as the visitor scrolls,
 * normalized document progress (0..1, from viewport-store's scroll tracker)
 * is looked up here to drive camera position, palette and focus-object state,
 * instead of each section owning its own canvas.
 *
 * The fractions below are only the first guess. Once the page is mounted,
 * useChapterCalibration measures where each chapter's section actually sits
 * and rewrites start and end in place, so a chapter begins when its section
 * reaches the middle of the viewport whatever the section heights turn out
 * to be. That matters now that some chapters are long (the About thesis is
 * pinned for over two screens) and the star chart has to light in Skills and
 * nowhere else.
 *
 * Palette: every chapter shares one gold family. colorA is aurum-300 (the
 * highlight), colorB is aurum-500 (the umber body of the cloud; it must stay
 * this dark or the additive shaders push the gold toward orange), colorC is
 * obsidian-0 (the page ground).
 */
export interface SceneChapter {
  id: string;
  /** The DOM id of the section this chapter follows. */
  section: string;
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
   * Star-field presence, 0 to 1: 1 in the hero and contact chapters, a little
   * behind the pinned thesis in About, 0 through the rest of the page, which
   * is pure obsidian and type.
   */
  intensity: number;
  /** Base opacity of the skills star chart, 0 to 1 (0.12 in the skills chapter). */
  constellationOpacity: number;
}

const AURUM_300 = "#C9A961";
const AURUM_500 = "#7A6134";
const OBSIDIAN_0 = "#0C0A08";

export const SCENE_CHAPTERS: SceneChapter[] = [
  { id: "hero", section: "home", start: 0.0, end: 0.05, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [0.9, 0.3, 6.5], lookAt: [0.2, 0.1, 0], intensity: 1, constellationOpacity: 0 },
  { id: "about", section: "about", start: 0.05, end: 0.24, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [1.4, 0.3, 6], lookAt: [0.4, 0, 0], intensity: 0.35, constellationOpacity: 0 },
  { id: "experience", section: "experience", start: 0.24, end: 0.4, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [-1.6, 0.6, 6.4], lookAt: [-0.3, 0.2, 0], intensity: 0, constellationOpacity: 0 },
  { id: "projects", section: "projects", start: 0.4, end: 0.53, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [1.8, -0.4, 6.2], lookAt: [0.3, -0.1, 0], intensity: 0, constellationOpacity: 0 },
  { id: "skills", section: "skills-sphere", start: 0.53, end: 0.61, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [0, -0.2, 5.6], lookAt: [0, 0, 0], intensity: 0, constellationOpacity: 0.12 },
  { id: "activity", section: "github-stats", start: 0.61, end: 0.72, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [-1.4, 0.4, 6], lookAt: [-0.2, 0.1, 0], intensity: 0, constellationOpacity: 0 },
  { id: "achievements", section: "achievements", start: 0.72, end: 0.82, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [0, 0.5, 6.5], lookAt: [0, 0, 0], intensity: 0, constellationOpacity: 0 },
  { id: "testimonials", section: "testimonials", start: 0.82, end: 0.91, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [-1, -0.2, 6.8], lookAt: [0, 0, 0], intensity: 0, constellationOpacity: 0 },
  { id: "contact", section: "contact", start: 0.91, end: 1.0, colorA: AURUM_300, colorB: AURUM_500, colorC: OBSIDIAN_0, camera: [0, -0.6, 7], lookAt: [0, -0.3, 0], intensity: 1, constellationOpacity: 0 },
];

/**
 * Rewrites every chapter's start and end from the live layout. A chapter
 * starts at the scroll progress where its section's top edge crosses the
 * middle of the viewport and ends where the next one starts. A section that
 * has not mounted yet keeps its previous boundaries, and the result is kept
 * monotonic so the lookup below always finds exactly one chapter.
 */
export function calibrateChapters() {
  if (typeof window === "undefined") return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return;
  const line = window.innerHeight * 0.5;

  const starts = SCENE_CHAPTERS.map((chapter, i) => {
    if (i === 0) return 0;
    const el = document.getElementById(chapter.section);
    if (!el) return chapter.start;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return Math.min(Math.max((top - line) / max, 0), 1);
  });

  for (let i = 1; i < starts.length; i++) starts[i] = Math.max(starts[i], starts[i - 1]);

  SCENE_CHAPTERS.forEach((chapter, i) => {
    chapter.start = starts[i];
    chapter.end = i === SCENE_CHAPTERS.length - 1 ? 1 : starts[i + 1];
  });
}

/**
 * Keeps the chapter map calibrated while the page settles: on mount, when the
 * document changes height (a lazy section arriving, an accordion opening) and
 * on resize. Each burst of changes costs one measurement, on the next frame.
 */
export function useChapterCalibration() {
  useEffect(() => {
    let raf = 0;
    const run = () => {
      raf = 0;
      calibrateChapters();
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    queue();
    const observer = new ResizeObserver(queue);
    observer.observe(document.body);
    window.addEventListener("resize", queue);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", queue);
      cancelAnimationFrame(raf);
    };
  }, []);
}

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
