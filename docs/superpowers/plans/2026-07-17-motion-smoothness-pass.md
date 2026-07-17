# Motion System + Smoothness Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio feel premium and smooth via a shared motion-token system, a faster decoupled entrance, jitter-free scroll, refined reveals, consistent interaction primitives, and one restrained scroll-velocity signature beat.

**Architecture:** Introduce motion design tokens in `src/lib/motion.ts` as the single source of truth, then sweep call sites to consume them. Sync Lenis into Framer Motion's single frame loop and expose scroll velocity as a shared motion value. Upgrade `ScrollReveal` with token-driven variants + stagger. Add focus/hover primitives in `globals.css`. Add a mobile/reduced-motion-gated velocity-skew wrapper.

**Tech Stack:** Next.js 16 (App Router, static export), React 19 + TypeScript strict, Tailwind CSS 4, Framer Motion (via LazyMotion `m` re-exported from `@/lib/motion`), Lenis smooth scroll.

## Global Constraints

- All animation components are client-side (`"use client"`) — this project renders everything client-side.
- Import motion primitives from `@/lib/motion` ONLY — never directly from `framer-motion` (LazyMotion `m` aliasing depends on it).
- Respect reduced motion everywhere: every effect must degrade to opacity-only or no-op. `MotionConfig reducedMotion="user"` is set app-wide; also gate imperative effects on `useReducedMotion()` from `@/hooks/use-reduced-motion`.
- Parallax and velocity-skew stay disabled on touch/mobile (`window.innerWidth < 1024`) as the codebase already does.
- Compositor-friendly transforms only on scroll-linked paths: `opacity`, `transform` (translate/scale/skew). No `blur`/`filter` on scroll-linked elements. No new always-on rAF loops beyond the single unified scroll driver.
- Path alias: `@/*` → `src/*`.
- Verification per task: `npm run lint` and `npm run build` must both pass (green) before commit. Manual dev-server check via `npm run dev` (port 3001).
- No test framework exists; do not add one. "Tests" in this plan means lint + build + the specified manual check.
- Commit after every task. Work happens on branch `motion-smoothness-pass`.

---

### Task 1: Motion tokens in `src/lib/motion.ts`

**Files:**
- Modify: `src/lib/motion.ts` (append token exports; keep existing re-exports)

**Interfaces:**
- Consumes: nothing (foundation task).
- Produces:
  - `ease: { out: readonly [number,number,number,number]; inOut: [...]; smooth: [...] }`
  - `duration: { fast: 0.2; base: 0.4; slow: 0.6; slower: 0.9 }`
  - `spring: { soft; snappy; hover; scroll }` each a `{ stiffness, damping, restDelta? }` object
  - `reveal: { fadeUp: Variants; fade: Variants; staggerContainer: Variants; staggerItem: Variants }`
  - Re-export `frame`, `cancelFrame` from framer-motion (needed by Task 3)

- [ ] **Step 1: Append token definitions to `src/lib/motion.ts`**

Add below the existing `export { ... } from "framer-motion";` block, and extend that same export list to add `frame` and `cancelFrame`:

```ts
// Add `frame` and `cancelFrame` to the existing framer-motion re-export block:
//   m as motion, AnimatePresence, MotionConfig, LazyMotion, domMax,
//   useInView, useScroll, useSpring, useTransform, useMotionValue,
//   frame, cancelFrame

import type { Variants } from "framer-motion";

/**
 * Motion design tokens — the single source of truth for the app's motion
 * language. Import these instead of hand-writing easing arrays, durations, or
 * spring configs so every component animates with one consistent feel.
 */

/** Named easing curves (cubic-bezier control points). */
export const ease = {
  /** Expo-out — default for entrances and reveals. */
  out: [0.22, 1, 0.36, 1],
  /** Symmetric in-out — loops and toggles. */
  inOut: [0.65, 0, 0.35, 1],
  /** Material-style — quick micro-interactions (hover/press). */
  smooth: [0.4, 0, 0.2, 1],
} as const;

/** Durations in seconds, aligned with framer-motion transition units. */
export const duration = {
  fast: 0.2,
  base: 0.4,
  slow: 0.6,
  slower: 0.9,
} as const;

/** Spring presets. `scroll` matches the app's existing scroll-progress spring. */
export const spring = {
  soft: { stiffness: 120, damping: 20 },
  snappy: { stiffness: 300, damping: 30 },
  hover: { stiffness: 400, damping: 25 },
  scroll: { stiffness: 100, damping: 30, restDelta: 0.001 },
} as const;

/** Reusable reveal variants for ScrollReveal and grouped section content. */
export const reveal = {
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, ease: ease.out },
    },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.slow, ease: ease.out } },
  },
  staggerContainer: {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  },
  staggerItem: {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, ease: ease.out },
    },
  },
} satisfies Record<string, Variants>;
```

Note: `ease` values are typed `as const` so framer-motion accepts them as tuples. Where a component passes `ease.out` to a `transition`, cast is not needed because the tuple type is preserved.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 3: Typecheck via build**

Run: `npm run build`
Expected: build succeeds (static export to `out/`). This confirms the token types compile against framer-motion's `Variants`/transition types.

- [ ] **Step 4: Commit**

```bash
git add src/lib/motion.ts
git commit -m "feat(motion): add motion design tokens (ease/duration/spring/reveal)"
```

---

### Task 2: Fast, decoupled entrance (loader + hero timing)

**Files:**
- Modify: `src/components/PageLoader.tsx:44-46` (timing constants)
- Modify: `src/components/Hero.tsx:16-33` (`useLoaderDone` — add fonts-ready + shorter fallback)

**Interfaces:**
- Consumes: nothing new.
- Produces: unchanged public behavior/signatures; `useLoaderDone()` still returns `boolean` and still resolves on `loader-done`. Only the resolution *timing* changes (also resolves on `document.fonts.ready`, shorter fallback).

- [ ] **Step 1: Shorten loader hold in `PageLoader.tsx`**

Change the two constants (currently `MIN_SHOWN = 1500`, `MAX_WAIT = 5000`):

```ts
const MIN_SHOWN = 700;
const MAX_WAIT = 2500;
```

Leave all warm-up logic, the `scene-warmed` listener, and the loading-bar animation exactly as-is (scenes keep warming in the background). Update the loading-bar comment near line 187 if it references the old ~3s timing so it isn't misleading:

```tsx
{/* Minimal loading bar — fills over the loader's short hold; on slow
    devices it holds at 100% until the max dismissal */}
```

Also change the bar fill transition `duration: 3` (near line 204) to `duration: 2` so it doesn't visibly stall well before dismissal.

- [ ] **Step 2: Decouple hero reveal from full loader in `Hero.tsx`**

Replace the `useLoaderDone` hook body so it resolves on the earliest of: the `loader-done` event, the already-done flag, `document.fonts.ready`, or a shorter fallback. Change default `fallbackMs` from `7000` to `2500`:

```tsx
function useLoaderDone(fallbackMs = 2500) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onDone = () => setDone(true);
    window.addEventListener("loader-done", onDone);

    // If the loader already finished before mount, resolve next tick.
    const alreadyDone = (window as unknown as { __loaderDone?: boolean }).__loaderDone;
    const fallback = setTimeout(onDone, alreadyDone ? 0 : fallbackMs);

    // Reveal as soon as web fonts are ready even if scenes are still warming —
    // the hero is real HTML content and must not wait on WebGL.
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        if (!cancelled) onDone();
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("loader-done", onDone);
      clearTimeout(fallback);
    };
  }, [fallbackMs]);

  return done;
}
```

Note: `onDone` only ever sets `true`, so multiple triggers are idempotent — no guard needed.

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: both green.

- [ ] **Step 4: Manual check**

Run: `npm run dev`, hard-reload `http://localhost:3001`.
Expected: loader curtain lifts by ~0.7–2.5s; hero words/avatar begin their entrance right as the curtain lifts (never visibly *behind* it, never blank for multiple seconds). Toggle OS "Reduce Motion" and reload — hero still appears; no animation required.

- [ ] **Step 5: Commit**

```bash
git add src/components/PageLoader.tsx src/components/Hero.tsx
git commit -m "perf(entrance): decouple hero reveal from scene warm-up; shorten loader hold"
```

---

### Task 3: Lenis ↔ Framer sync + shared scroll velocity

**Files:**
- Modify: `src/components/SmoothScroll.tsx` (drive Lenis from framer's frame loop; publish velocity)
- Create: `src/lib/scroll-velocity.ts` (shared velocity motion value + accessor)

**Interfaces:**
- Consumes: `frame`, `cancelFrame` from `@/lib/motion` (Task 1).
- Produces:
  - `src/lib/scroll-velocity.ts`:
    - `scrollVelocity: MotionValue<number>` — normalized signed scroll velocity (roughly px/frame from Lenis), updated each frame; `0` when idle.
    - `setScrollVelocity(v: number): void` — internal setter used by SmoothScroll.
  - `SmoothScroll` unchanged public API (`{ children }`), `window.lenis` still exposed.

- [ ] **Step 1: Create `src/lib/scroll-velocity.ts`**

```ts
"use client";

import { useMotionValue } from "@/lib/motion";
import type { MotionValue } from "framer-motion";

/**
 * Shared scroll velocity published by SmoothScroll's single Lenis/Framer frame
 * loop. Consumers (e.g. the velocity-skew wrapper) read this MotionValue instead
 * of attaching their own scroll listeners. Signed: negative scrolling up,
 * positive scrolling down. Settles to 0 when scrolling stops.
 */
export const scrollVelocity: MotionValue<number> = (() => {
  // Module-level MotionValue. useMotionValue must be called in a component, so
  // construct via a tiny factory that mirrors its default (0).
  // framer-motion's motionValue() factory is the non-hook constructor.
  return motionValueFactory();
})();

// Local import kept separate so the factory call above reads cleanly.
import { motionValue } from "framer-motion";
function motionValueFactory(): MotionValue<number> {
  return motionValue(0);
}

/** Push a new velocity sample (called once per frame by SmoothScroll). */
export function setScrollVelocity(v: number): void {
  scrollVelocity.set(v);
}

// Re-export the hook so consumers that prefer a hook form have one source.
export { useMotionValue };
```

Note: `motionValue` is the imperative (non-hook) constructor from framer-motion and is safe at module scope. If lint flags the mid-file `import`, hoist both imports to the top and keep only the `scrollVelocity`/`setScrollVelocity` exports:

```ts
"use client";

import { motionValue } from "framer-motion";
import type { MotionValue } from "framer-motion";

export const scrollVelocity: MotionValue<number> = motionValue(0);

export function setScrollVelocity(v: number): void {
  scrollVelocity.set(v);
}
```

Use this hoisted form as the final content (cleaner; the first block is explanatory only).

- [ ] **Step 2: Rewrite the rAF loop in `SmoothScroll.tsx`**

Replace the manual `requestAnimationFrame(raf)` loop with framer-motion's frame loop so Lenis and all Framer scroll-linked animations share one frame. Publish velocity each frame:

```tsx
"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { frame, cancelFrame } from "@/lib/motion";
import { setScrollVelocity } from "@/lib/scroll-velocity";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: false, // never hijack native touch momentum
      wheelMultiplier: 1,
      touchMultiplier: 1,
      infinite: false,
    });

    lenisRef.current = lenis;
    (window as unknown as { lenis: Lenis }).lenis = lenis;

    // Publish signed velocity for velocity-reactive effects (Task 6).
    lenis.on("scroll", (e: { velocity: number }) => setScrollVelocity(e.velocity));

    // Drive Lenis inside framer-motion's single frame loop so smoothed scroll
    // and every Framer scroll-linked animation are computed in the same frame —
    // eliminating the one-frame desync from two independent rAF loops.
    const update = (data: { timestamp: number }) => {
      lenis.raf(data.timestamp);
    };
    frame.update(update, true); // keepAlive: run every frame

    return () => {
      cancelFrame(update);
      lenis.destroy();
      setScrollVelocity(0);
      if ((window as unknown as { lenis: Lenis }).lenis === lenis) {
        delete (window as unknown as { lenis?: Lenis }).lenis;
      }
    };
  }, []);

  return <>{children}</>;
}
```

Note on Lenis types: if `lenis.on("scroll", ...)` callback arg isn't typed with `velocity`, use `(e: Lenis) => setScrollVelocity(e.velocity)` — the Lenis instance passed to the scroll event exposes `.velocity`. Verify against the installed `lenis` types and pick whichever compiles; both give the same runtime value.

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: both green. Confirms `frame`/`cancelFrame` are exported from `@/lib/motion` (Task 1) and the Lenis event type compiles.

- [ ] **Step 4: Manual check**

Run: `npm run dev`. Scroll the hero slowly and watch the top progress bar and hero parallax. Expected: progress bar and parallax track the smoothed page motion with no visible stutter/lag. Scroll to bottom and back — no runaway motion; velocity settles. Open DevTools Performance for a quick scroll capture — a single scroll rAF driver, no long tasks introduced.

- [ ] **Step 5: Commit**

```bash
git add src/components/SmoothScroll.tsx src/lib/scroll-velocity.ts
git commit -m "fix(scroll): run Lenis in Framer's frame loop; publish shared scroll velocity"
```

---

### Task 4: Refined reveals in `ScrollReveal`

**Files:**
- Modify: `src/components/ScrollReveal.tsx`

**Interfaces:**
- Consumes: `reveal`, `ease`, `duration` from `@/lib/motion` (Task 1); `useReducedMotion` from `@/hooks/use-reduced-motion`.
- Produces: `ScrollReveal` props extended with `stagger?: boolean` (default `false`). Existing props (`direction`, `delay`, `duration`, `once`, `amount`, `className`) preserved. When `stagger` is true, wrapper is a stagger container and DIRECT children must be `motion` elements using the `staggerItem` variant OR plain elements (plain children simply appear with the container). Existing call sites in `page.tsx` (`direction="none"`) keep working unchanged.

- [ ] **Step 1: Rewrite `ScrollReveal.tsx`**

```tsx
"use client";

import { motion, useInView, ease as easeTokens, duration as durTokens } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
  amount?: number;
  /** When true, direct motion children with the `staggerItem` variant cascade. */
  stagger?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = durTokens.slow,
  once = true,
  amount = 0.15,
  stagger = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount, margin: "0px 0px -8% 0px" });
  const reduce = useReducedMotion();

  // Reduced motion: opacity-only, no transform, no stagger delay.
  const dirOffset = reduce
    ? {}
    : {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
        none: {},
      }[direction];

  if (stagger && !reduce) {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 1 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: delay + 0.05 },
          },
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirOffset }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{ duration, delay, ease: easeTokens.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

Export the shared item variant for call sites that opt into stagger. Add to `src/lib/motion.ts` `reveal` (already defined in Task 1 as `reveal.staggerItem`) — no change needed; call sites import `reveal` and spread `variants={reveal.staggerItem}` on children.

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: both green.

- [ ] **Step 3: Manual check**

Run: `npm run dev`. Scroll through sections. Expected: sections drift up subtly while fading (not a flat opacity pop); timing feels consistent section-to-section. No layout shift as content settles. Toggle Reduce Motion → sections fade with no vertical movement.

- [ ] **Step 4: Commit**

```bash
git add src/components/ScrollReveal.tsx
git commit -m "feat(reveal): token-driven fadeUp + optional stagger; reduced-motion safe"
```

---

### Task 5: Opt select section groups into staggered reveal

**Files:**
- Modify: `src/components/Hero.tsx` (stats row → already uses container/stagger variants locally; align to tokens — see below)
- Modify: `src/components/Projects.tsx` (project grid children → `reveal.staggerItem`)
- Modify: `src/components/SkillsMarquee.tsx` OR the skills pills group if statically listed (only if a static group exists; otherwise skip)

**Interfaces:**
- Consumes: `reveal` from `@/lib/motion` (Task 1); `ScrollReveal` `stagger` prop (Task 4).
- Produces: no new exported symbols. Visual: grouped items cascade.

- [ ] **Step 1: Wrap the Projects grid in a staggered ScrollReveal**

In `src/components/Projects.tsx`, locate the top-level grid/list of project cards. Wrap the mapped cards so the grid container is `ScrollReveal stagger` and each card is a `motion.div` (imported from `@/lib/motion`) with `variants={reveal.staggerItem}`. Concrete shape:

```tsx
import { motion, reveal } from "@/lib/motion";
import ScrollReveal from "@/components/ScrollReveal";

// ...where the cards are rendered:
<ScrollReveal stagger className="grid ...existing grid classes...">
  {projects.map((project) => (
    <motion.div key={project.id ?? project.title} variants={reveal.staggerItem}>
      {/* existing card markup unchanged */}
    </motion.div>
  ))}
</ScrollReveal>
```

If `Projects.tsx` already wraps cards in `motion.div`s with their own `initial`/`animate`, remove those per-card `initial`/`animate`/`transition` props and replace with `variants={reveal.staggerItem}` so the parent container drives them. Do NOT leave both — that double-animates.

- [ ] **Step 2: Align Hero stats stagger to tokens (optional cleanup)**

In `src/components/Hero.tsx`, the existing `containerVariants`/`letterVariants` (lines ~233-258) are bespoke. Leave the letter-reveal (`AnimatedWord`) as-is — it is finely tuned. Do not touch it. This step is intentionally a no-op unless the implementer sees an obviously safe substitution; skip if unsure. (Recorded so the sweep is explicitly bounded.)

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: both green.

- [ ] **Step 4: Manual check**

Run: `npm run dev`. Scroll to Projects. Expected: cards cascade in one after another (≈80ms apart) rather than all at once. Reduce Motion → cards appear together with a plain fade (stagger disabled by Task 4's reduced-motion branch).

- [ ] **Step 5: Commit**

```bash
git add src/components/Projects.tsx src/components/Hero.tsx
git commit -m "feat(reveal): cascade project grid via staggered ScrollReveal"
```

---

### Task 6: Signature beat — scroll-velocity skew wrapper

**Files:**
- Create: `src/components/VelocityScroll.tsx`
- Modify: `src/app/page.tsx` (wrap the section stack)

**Interfaces:**
- Consumes: `scrollVelocity` from `@/lib/scroll-velocity` (Task 3); `useSpring`, `useTransform`, `motion` from `@/lib/motion`; `useReducedMotion`; `useMediaQuery` from `@/lib/viewport-store`.
- Produces: `VelocityScroll` component `{ children }` — wraps content in a `motion.div` that applies a capped `skewY` + slight `scaleY` from scroll velocity. No-op on mobile / reduced motion.

- [ ] **Step 1: Create `src/components/VelocityScroll.tsx`**

```tsx
"use client";

import { motion, useSpring, useTransform } from "@/lib/motion";
import { scrollVelocity } from "@/lib/scroll-velocity";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useMediaQuery } from "@/lib/viewport-store";
import { spring as springTokens } from "@/lib/motion";

/**
 * Restrained signature beat: maps scroll velocity to a tiny skewY + scaleY on
 * the whole section stack, giving scrolling a subtle tactile "weight" that reads
 * as smoothness. Disabled on touch/small screens and under reduced motion.
 */
export default function VelocityScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Smooth the raw velocity so the effect eases in/out instead of snapping.
  const smooth = useSpring(scrollVelocity, springTokens.soft);

  // Cap hard: Lenis velocity is roughly px/frame. Clamp the mapped output.
  const skew = useTransform(smooth, [-40, 0, 40], [1.5, 0, -1.5], { clamp: true });
  const scaleY = useTransform(smooth, [-40, 0, 40], [1.015, 1, 1.015], { clamp: true });

  if (reduce || !isDesktop) return <>{children}</>;

  return (
    <motion.div style={{ skewY: skew, scaleY, transformOrigin: "center top", willChange: "transform" }}>
      {children}
    </motion.div>
  );
}
```

Note: `useTransform` numeric ranges use `{ clamp: true }` so extreme velocity never exceeds ±1.5° skew / 1.5% scale. If the installed framer-motion `useTransform` overload doesn't accept the options object, wrap with `Math`-based clamping inside a `useTransform(smooth, (v) => Math.max(-1.5, Math.min(1.5, -v * 0.0375)))` mapping function instead.

- [ ] **Step 2: Wrap the section stack in `page.tsx`**

In `src/components/../app/page.tsx`, wrap the inner `<div className="relative z-10 flex flex-col gap-16 md:gap-40">` block (the section stack) with `<VelocityScroll>`. Do NOT wrap `<ParticleField />` or `<NoiseBackground />` (fixed backdrops must not skew). Import at top:

```tsx
import VelocityScroll from "@/components/VelocityScroll";
```

Apply:

```tsx
<VelocityScroll>
  <div className="relative z-10 flex flex-col gap-16 md:gap-40">
    {/* existing sections unchanged */}
  </div>
</VelocityScroll>
```

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: both green.

- [ ] **Step 4: Manual check**

Run: `npm run dev`. Flick-scroll fast on desktop. Expected: a barely-perceptible weighty give (≤1.5°) that settles smoothly; slow scroll shows essentially nothing. Confirm fixed background/particles do NOT skew. Resize below 1024px (or use device toolbar) → effect gone. Reduce Motion → effect gone. Verify no CLS and no scrollbar artifacts (skew on a full-width block can reveal edges — if horizontal overflow appears, confirm `main` still has `overflow-x-hidden`, which it does).

- [ ] **Step 5: Commit**

```bash
git add src/components/VelocityScroll.tsx src/app/page.tsx
git commit -m "feat(motion): restrained scroll-velocity skew signature beat (desktop only)"
```

---

### Task 7: Interaction primitives — focus + hover

**Files:**
- Modify: `src/app/globals.css` (add `.focus-ring`, unify `.hover-lift`)
- Modify: interactive components to apply `.focus-ring` (Navbar links, CTAs in Hero/Contact/Footer, project cards)

**Interfaces:**
- Consumes: nothing (CSS + class application).
- Produces: `.focus-ring` and `.hover-lift` utility classes.

- [ ] **Step 1: Add primitives to `globals.css`**

Append near the other utility classes:

```css
/* Consistent keyboard focus treatment for every interactive element.
   Uses :focus-visible so mouse clicks don't show the ring. */
.focus-ring:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--background, #030014),
    0 0 0 4px rgba(139, 92, 246, 0.9);
  border-radius: inherit;
}

/* Unified hover lift — spring-like via transform; compositor-friendly. */
.hover-lift {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}
.hover-lift:hover {
  transform: translateY(-3px);
}

@media (prefers-reduced-motion: reduce) {
  .hover-lift {
    transition: none;
  }
  .hover-lift:hover {
    transform: none;
  }
}
```

If a `.hover-lift` class already exists in `globals.css`, replace its body with the above rather than duplicating (grep first: `grep -n "hover-lift" src/app/globals.css`).

- [ ] **Step 2: Apply `.focus-ring` to interactive elements**

Add `focus-ring` to the `className` of: nav links and the theme toggle in `Navbar.tsx`; the "Open to Opportunities" and "Currently Building" anchors in `Hero.tsx`; the submit button and inputs in `Contact.tsx`; social/nav links in `Footer.tsx`; project card links in `Projects.tsx`. Keep existing classes; append ` focus-ring`. Example:

```tsx
className="...existing classes... focus-ring"
```

Apply `.hover-lift` to project cards and any card that currently hand-rolls a `hover:-translate-y` — replace the ad-hoc hover translate with the `hover-lift` class for consistency (grep: `grep -rn "hover:-translate-y" src/components`).

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: both green.

- [ ] **Step 4: Manual check**

Run: `npm run dev`. Press Tab repeatedly from page load. Expected: every interactive element shows a consistent purple focus ring; ring does NOT appear on mouse click (focus-visible). Hover project cards → uniform 3px lift. Reduce Motion → no lift transition. Check both themes (deep-space + nebula) — ring offset color reads against both.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/Navbar.tsx src/components/Hero.tsx src/components/Contact.tsx src/components/Footer.tsx src/components/Projects.tsx
git commit -m "feat(a11y): consistent focus-visible ring + unified hover-lift primitive"
```

---

### Task 8: Token sweep of remaining scattered transitions

**Files:**
- Modify: components still using ad-hoc `transition-colors duration-300` where a token cadence fits: `About3D.tsx`, `Testimonials.tsx`, `GitHubStats.tsx`, `SectionDivider3D.tsx`, `ThemeToggle.tsx`, `Footer.tsx`, `Contact.tsx`, `Navbar.tsx`.

**Interfaces:**
- Consumes: `ease`, `duration`, `spring` from `@/lib/motion` for any JS-driven `transition` props; Tailwind duration utilities for CSS transitions.
- Produces: no new symbols. Consistency only.

- [ ] **Step 1: Standardize durations**

For Tailwind CSS transitions, standardize `duration-300` → `duration-200` for micro hovers (color/opacity) to match `duration.fast`/`ease.smooth`, keeping `duration-300`+ only where a deliberately slower move is intended. Use judgment — this is a consistency sweep, not a forced replace. For any framer-motion `transition={{ ease: [...] , duration: ... }}` literals found in these files, replace with `ease.out`/`duration.base` etc. from `@/lib/motion`.

Grep to find candidates:

```bash
grep -rn "transition-colors duration-300\|ease: \[\|duration: 0\." src/components
```

For each hit in the listed files, substitute the nearest token. Do NOT change bespoke, intentionally-tuned animations (hero letters, loader orchestration, 3D scene internals).

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: both green.

- [ ] **Step 3: Manual check**

Run: `npm run dev`. Hover nav, buttons, cards, theme toggle across the page. Expected: hover cadence feels uniform (no jarring fast-here/slow-there). Toggle theme — transition consistent.

- [ ] **Step 4: Commit**

```bash
git add src/components
git commit -m "refactor(motion): sweep scattered transitions onto motion tokens"
```

---

### Task 9: Full-page verification pass

**Files:** none (verification only).

- [ ] **Step 1: Clean build + lint**

Run: `npm run lint && npm run build`
Expected: both green, static export to `out/` succeeds.

- [ ] **Step 2: Full manual QA on `npm run dev`**

Walk the spec's validation plan end to end:
1. Warm reload → hero content visible < 1s; loader ≤ 2.5s.
2. Scroll hero → progress bar tracks with no jitter.
3. Sections drift + Projects cascade; timing consistent.
4. Tab through page → consistent focus rings; uniform hover lift.
5. Fast scroll → subtle velocity weight; disabled on mobile width + reduced motion.
6. Both themes (deep-space, nebula) look correct.
7. Reduced-motion pass: everything degrades to static/opacity; no transforms.

Record any regression as a follow-up task; fix trivial ones inline and amend the relevant commit.

- [ ] **Step 3: Final commit (if any inline fixes)**

```bash
git add -A
git commit -m "fix(motion): QA polish from full-page verification pass"
```

---

## Self-Review

**Spec coverage:**
- Workstream A (tokens) → Task 1. ✔
- Workstream B (fast entrance) → Task 2. ✔
- Workstream C (Lenis↔Framer sync + velocity) → Task 3. ✔
- Workstream D (refined reveals) → Task 4 (+ Task 5 applies it). ✔
- Workstream E (interaction primitives) → Task 7 (+ Task 8 sweep). ✔
- Workstream F (signature beat) → Task 6. ✔
- Cross-cutting reduced-motion/mobile/perf → enforced in Tasks 3,4,6,7 + Task 9 QA. ✔

**Type consistency:** `scrollVelocity: MotionValue<number>` and `setScrollVelocity(v: number)` are defined in Task 3 and consumed in Task 6 with matching names. `reveal.staggerItem` defined in Task 1, consumed in Tasks 4/5. `frame`/`cancelFrame` added to `@/lib/motion` in Task 1, consumed in Task 3. `ease`/`duration`/`spring` names consistent across Tasks 1,4,6,8.

**Placeholder scan:** No "TBD"/"handle edge cases"/"similar to Task N" — each code step shows concrete code. Task 5 Step 2 and Task 8 use bounded judgment (explicitly scoped, with grep commands and do-not-touch lists) rather than vague instructions.

**Ordering note:** Task 3 must precede Task 6 (velocity source). Task 1 must precede all. Task 4 precedes Task 5. Otherwise independent.
