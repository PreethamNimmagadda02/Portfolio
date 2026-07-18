"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Unified input / viewport / media store.
 *
 * Every component that needs the pointer position, scroll progress, tab
 * visibility, or a media-query result reads it from here instead of attaching
 * its own `window` listener. This collapses what used to be a handful of
 * independent `pointermove` / `scroll` / `visibilitychange` / `matchMedia`
 * handlers (ParticleField, SpotlightCursor, the media hooks, …) down to one
 * of each — keeping the scroll and pointer hot paths cheap and jank-free.
 *
 * Pointer and scroll are exposed as long-lived mutable objects, not React
 * state: their consumers (WebGL frame loops, spring rAF loops) read them
 * imperatively every frame and must never trigger re-renders. Listeners are
 * ref-counted so they attach on the first subscriber and detach on the last.
 */

// -----------------------------------------------------------------------------
// Pointer — one passive `pointermove` listener, shared normalized + pixel coords
// -----------------------------------------------------------------------------
export interface PointerState {
  /** Normalized X in [-1, 1] (left → right). */
  nx: number;
  /** Normalized Y in [-1, 1] (bottom → top), matching WebGL clip space. */
  ny: number;
  /** Raw clientX in pixels. */
  px: number;
  /** Raw clientY in pixels. */
  py: number;
}

const pointer: PointerState = { nx: 0, ny: 0, px: 0, py: 0 };
let pointerSubscribers = 0;
const pointerMoveListeners = new Set<(p: PointerState) => void>();

function handlePointerMove(e: PointerEvent) {
  pointer.px = e.clientX;
  pointer.py = e.clientY;
  pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.ny = -(e.clientY / window.innerHeight) * 2 + 1;
  for (const listener of pointerMoveListeners) listener(pointer);
}

function ensurePointerListener() {
  if (pointerSubscribers++ === 0) {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
  }
  return () => {
    if (--pointerSubscribers === 0) {
      window.removeEventListener("pointermove", handlePointerMove);
    }
  };
}

/**
 * Returns the shared pointer object. The reference is stable for the lifetime
 * of the page — read `.nx` / `.py` etc. inside your frame loop each tick.
 */
export function usePointer(): PointerState {
  useEffect(ensurePointerListener, []);
  return pointer;
}

/**
 * Registers `callback`, fired on every pointer move with the shared pointer
 * object. Use this when you need to *wake* an idle rAF loop on movement (rather
 * than polling the pointer every frame). Still backed by the single shared
 * `pointermove` window listener — no extra DOM listener is attached.
 */
export function usePointerMove(callback: (p: PointerState) => void): void {
  useEffect(() => {
    const detach = ensurePointerListener();
    pointerMoveListeners.add(callback);
    return () => {
      pointerMoveListeners.delete(callback);
      detach();
    };
  }, [callback]);
}

// -----------------------------------------------------------------------------
// Scroll — one passive `scroll` listener, coalesced to one read per frame
// -----------------------------------------------------------------------------
export interface ScrollState {
  /** Scroll progress through the document in [0, 1]. */
  progress: number;
  /** Raw scrollY in pixels. */
  y: number;
  /**
   * Smoothed scroll velocity in px/ms, exponentially decayed toward 0 when
   * scrolling stops. Consumers (the WebGL background) read it every frame to
   * make the scene react to motion — star stretch, nebula swell, etc.
   * Positive = scrolling down.
   */
  velocity: number;
}

const scroll: ScrollState = { progress: 0, y: 0, velocity: 0 };
let scrollSubscribers = 0;
let scrollRaf = 0;
let scrollQueued = false;
let lastScrollY = 0;
let lastScrollTime = 0;
let velocityDecayRaf = 0;

function decayVelocity() {
  // Ease velocity back to zero once scroll events stop arriving. Runs a short
  // self-terminating rAF chain — no permanent loop.
  scroll.velocity *= 0.9;
  if (Math.abs(scroll.velocity) > 0.001) {
    velocityDecayRaf = requestAnimationFrame(decayVelocity);
  } else {
    scroll.velocity = 0;
    velocityDecayRaf = 0;
  }
}

function readScroll() {
  scrollQueued = false;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const now = performance.now();
  const dt = now - lastScrollTime;
  if (dt > 0 && dt < 250) {
    const instant = (y - lastScrollY) / dt;
    // Light smoothing so a single janky event doesn't spike the scene
    scroll.velocity += (instant - scroll.velocity) * 0.35;
  }
  lastScrollY = y;
  lastScrollTime = now;
  scroll.y = y;
  scroll.progress = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;
  // (Re)arm the decay chain
  if (velocityDecayRaf) cancelAnimationFrame(velocityDecayRaf);
  velocityDecayRaf = requestAnimationFrame(decayVelocity);
}

function handleScroll() {
  // Coalesce bursts of scroll events into a single read on the next frame —
  // the raw event can fire far more often than the display refreshes.
  if (!scrollQueued) {
    scrollQueued = true;
    scrollRaf = requestAnimationFrame(readScroll);
  }
}

/**
 * Returns the shared scroll object. The reference is stable — read `.progress`
 * / `.y` inside your frame loop each tick.
 */
export function useScrollTracker(): ScrollState {
  useEffect(() => {
    if (scrollSubscribers++ === 0) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      readScroll();
    }
    return () => {
      if (--scrollSubscribers === 0) {
        window.removeEventListener("scroll", handleScroll);
        cancelAnimationFrame(scrollRaf);
        if (velocityDecayRaf) cancelAnimationFrame(velocityDecayRaf);
        velocityDecayRaf = 0;
        scrollQueued = false;
      }
    };
  }, []);
  return scroll;
}

// -----------------------------------------------------------------------------
// Tab visibility — one `visibilitychange` listener, reactive
// -----------------------------------------------------------------------------
function subscribeVisibility(callback: () => void) {
  if (typeof document === "undefined") return () => {};
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function getVisibilitySnapshot() {
  return typeof document === "undefined" ? true : document.visibilityState === "visible";
}

/** Reactive: `true` while the tab is foregrounded. Drives WebGL frameloop gating. */
export function useDocumentVisible(): boolean {
  return useSyncExternalStore(subscribeVisibility, getVisibilitySnapshot, () => true);
}

// -----------------------------------------------------------------------------
// Idle gate — defer non-critical work until the main thread is quiet
// -----------------------------------------------------------------------------
/**
 * Flips to `true` once the browser is idle (or after `timeout` ms as a floor).
 * Used to keep heavy, non-critical mounts — e.g. the fixed WebGL background and
 * its ~800 KB three.js chunk — off the initial interactivity critical path so
 * the hero becomes interactive first.
 */
export function useIdle(timeout = 1500): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => setIdle(true), { timeout });
    } else {
      timer = setTimeout(() => setIdle(true), timeout);
    }

    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timer) clearTimeout(timer);
    };
  }, [timeout]);
  return idle;
}

// -----------------------------------------------------------------------------
// Media queries — one shared MediaQueryList per query string
// -----------------------------------------------------------------------------
const mediaQueryCache = new Map<string, MediaQueryList>();

function getMediaQuery(query: string): MediaQueryList | null {
  if (typeof window === "undefined") return null;
  let mql = mediaQueryCache.get(query);
  if (!mql) {
    mql = window.matchMedia(query);
    mediaQueryCache.set(query, mql);
  }
  return mql;
}

/**
 * Reactive media-query hook. All consumers of the same query string share a
 * single `MediaQueryList` object instead of each allocating their own.
 */
export function useMediaQuery(query: string, serverDefault = false): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = getMediaQuery(query);
      if (!mql) return () => {};
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    const mql = getMediaQuery(query);
    return mql ? mql.matches : serverDefault;
  }, [query, serverDefault]);

  return useSyncExternalStore(subscribe, getSnapshot, () => serverDefault);
}
