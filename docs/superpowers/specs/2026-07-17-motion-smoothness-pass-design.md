# Motion System + Smoothness Pass — Design

**Date:** 2026-07-17
**Author:** Preetham Nimmagadda (with Claude, acting as frontend lead)
**Status:** Approved — ready for implementation planning

## Goal

Make the portfolio *feel* premium and smooth. The priority ranking chosen by the
user: **perceived smoothness first**, delivered as an **opinionated redesign** (not
just targeted polish). Validation is manual: the user runs `npm run dev` (port
3001) and eyeballs each workstream; `npm run build` and `npm run lint` must stay
green throughout.

Non-goals: rebuilding sections, changing content/copy, replacing the tech stack,
or reworking the 3D scenes' internals.

## Context

The app already has a strong performance foundation that this pass **preserves**:
LazyMotion + `m` components, idle-deferred WebGL background, dynamic imports with
height-matched skeletons, a unified pointer/scroll/visibility store
(`src/lib/viewport-store.ts`), reduced-motion respected globally
(`MotionConfig reducedMotion="user"`), and viewport-gated render loops.

The gaps are in **consistency and timing** — what the eye reads as "premium vs.
generic" — not in the plumbing.

## Problems being solved

1. **Slow first impression.** `PageLoader` holds min 1.5s / max 5s gated on *all
   WebGL scenes warming up*; the hero reveal has a 7s fallback. First paint of
   real content is blocked on the heaviest possible signal.
2. **No unified motion language.** Easings (`[0.22,1,0.36,1]`, `easeOut`,
   `easeInOut`, springs) and durations (0.4→1.2s) are scattered with no system.
3. **Two separate scroll loops.** Lenis smooths scroll on its own rAF; Framer's
   `useScroll` reads scroll on its own listener/rAF. Not phase-synced → scroll-
   linked elements (hero parallax, progress bar) can jitter by a frame.
4. **Flat, identical reveals.** Every section is `direction="none"` (pure opacity),
   no drift, no stagger, no depth.
5. **Ad-hoc micro-interactions.** `transition-colors duration-300` sprinkled per
   component; no shared hover/press/focus-visible system.
6. **No signature beat.** Nothing memorable that reinforces the smoothness story.

## Approach

A **motion design system** (tokens → consistency) as the backbone, then targeted
fixes on top. Six workstreams, implemented roughly in this order:

- Core (low risk, high impact): **A → B → C**
- Visible redesign: **D → E**
- Stretch: **F**

Each token/behavior change respects reduced-motion; mobile/touch disables the
heavier effects (parallax, velocity skew) as it does today.

---

### Workstream A — Motion tokens

**File:** `src/lib/motion.ts` (extend; currently re-exports only).

Add a single source of truth every component imports:

```ts
export const ease = {
  out:    [0.22, 1, 0.36, 1],   // expo-out — entrances
  inOut:  [0.65, 0, 0.35, 1],   // loops, toggles
  smooth: [0.4, 0, 0.2, 1],     // micro / hover
} as const;

export const duration = { fast: 0.2, base: 0.4, slow: 0.6, slower: 0.9 } as const;

export const spring = {
  soft:   { stiffness: 120, damping: 20 },
  snappy: { stiffness: 300, damping: 30 },
  hover:  { stiffness: 400, damping: 25 },
  scroll: { stiffness: 100, damping: 30, restDelta: 0.001 },
} as const;

// Reusable reveal variants (used by ScrollReveal and section groups)
export const reveal = {
  fadeUp: { /* hidden: opacity 0, y 20; visible: opacity 1, y 0 */ },
  fade:   { /* hidden: opacity 0; visible: opacity 1 */ },
  staggerContainer: { /* visible: { transition: { staggerChildren, delayChildren } } */ },
  staggerItem: { /* hidden: opacity 0, y 16; visible: opacity 1, y 0 */ },
};
```

Then sweep call sites to consume these tokens instead of inline literals:
`Hero.tsx`, `PageLoader.tsx`, `ScrollReveal.tsx`, `ScrollProgress.tsx`,
`SectionDivider3D.tsx`, and the section components that hand-roll transitions.
The sweep is **substitution only** — it must not change observable behavior beyond
harmonizing values that were already near-identical.

**Acceptance:** grep shows section/animation components importing `ease`/`duration`/
`spring`/`reveal` from `@/lib/motion`; no remaining inline easing arrays or spring
literals in the swept files (except where a bespoke value is intentional and
commented). Visual behavior unchanged except more consistent timing.

---

### Workstream B — Fast, decoupled entrance

**Files:** `src/components/PageLoader.tsx`, `src/components/Hero.tsx`.

- `PageLoader`: `MIN_SHOWN 1500 → 700`, `MAX_WAIT 5000 → 2500`. Scene warm-up
  continues in the background unchanged; we stop blocking the curtain on it.
- `Hero`: decouple content reveal from the "all scenes warmed" path. Reveal when
  the loader dismisses **or** when fonts are ready (`document.fonts.ready`),
  whichever fires first. `useLoaderDone` fallback `7000 → 2500`.

**Acceptance:** On a warm reload, hero text begins revealing in well under 1s.
Loader never blocks past 2.5s. No FOUC; hero entrance still plays *after* the
loader curtain lifts (never behind it). Reduced-motion path still works.

**Risk note:** the fallback must remain ≥ the loader's max dismissal so hero
entrances never play invisibly behind the overlay — with both at 2500 they align;
verify the hero reveal is not swallowed on slow loads.

---

### Workstream C — Lenis ↔ Framer sync

**File:** `src/components/SmoothScroll.tsx`.

Run Lenis inside Framer Motion's frame loop instead of a parallel rAF:

```ts
import { frame, cancelFrame } from "framer-motion";

const update = (data) => lenis.raf(data.timestamp);
frame.update(update, true);          // keepAlive: run every frame
return () => { cancelFrame(update); lenis.destroy(); };
```

One rAF loop → hero parallax and the progress bar are computed in the same frame
Lenis moves the page. Also expose `lenis.velocity` via a shared module-level motion
value (or a small subscribe API) for Workstream F.

**Acceptance:** Scroll-linked elements track the smoothed scroll with no visible
lag/jitter. Only one `requestAnimationFrame`/frame driver for scroll remains.
Cleanup fully tears down on unmount (no leaked frame callback). `window.lenis`
global still exposed for programmatic scroll.

---

### Workstream D — Refined reveals

**File:** `src/components/ScrollReveal.tsx` (and opt-in usage in section grids).

- Default reveal becomes `fadeUp` (opacity + ~20px drift) via `spring.soft` /
  `ease.out` from tokens.
- Add a `stagger` mode: when enabled, the wrapper is a `staggerContainer` and
  direct children animate as `staggerItem`, cascading instead of popping together.
  Apply to natural groups: hero stat cards, project grid, skill pills, achievement
  cards.
- Trigger at `amount: 0.15`, `once: true`, with a small negative root margin so it
  fires just before the section enters view.
- Reduced-motion collapses everything to a plain opacity fade (no transform).

**Acceptance:** Sections drift up subtly rather than flat-fading; grouped items
cascade. No layout shift (CLS) introduced by the drift. Reduced-motion = fade only.

---

### Workstream E — Interaction primitives

**Files:** `src/app/globals.css`, plus a small hover hook if needed; applied across
interactive components.

- `.focus-ring` — consistent `:focus-visible` outline/ring on every interactive
  element (links, buttons, cards, form fields). Currently inconsistent/missing —
  accessibility + polish win.
- `.hover-lift` — unified to a spring-based translate/scale; applied to cards,
  project tiles, nav links, CTAs.
- Replace scattered `transition-colors duration-300` with token-based durations
  (`duration.base` / `duration.fast`) for a consistent hover cadence.

**Acceptance:** Every interactive element shows a visible, consistent focus ring on
keyboard focus. Hover lift/press feels uniform across cards and buttons. No
`transition-colors duration-300` literals left where a token applies.

---

### Workstream F — Signature beat (restrained)

**Files:** new small component/util consuming the `lenis.velocity` motion value;
wraps section content.

Scroll-velocity → a capped (~1.5°) `skewY` + slight scale on section content,
driven by the velocity motion value through `spring.soft`. Adds subtle tactile
"weight" to scrolling that reads as smoothness, not gimmick.

- **Disabled** under reduced-motion and on touch/mobile.
- Cap strictly (≤1.5° skew, ≤~1–2% scale) so it never distracts.
- GPU-only transforms (skew/scale) — no layout, no blur.

**Acceptance:** Fast scroll produces a barely-perceptible weighty give that settles
smoothly; slow scroll shows nothing. Off on mobile and reduced-motion. No jank, no
CLS, no measurable frame drops.

---

## Cross-cutting requirements

- **Reduced motion:** every workstream degrades to a static/opacity-only path.
- **Mobile/touch:** parallax and velocity skew stay disabled (as today).
- **Performance:** transforms limited to opacity/translate/scale/skew (compositor-
  friendly); no new blur on scroll-linked paths; no new always-on rAF loops beyond
  the single unified scroll driver.
- **Accessibility:** focus-visible rings must meet contrast; skip-link and keyboard
  nav unaffected.

## Validation plan

Manual, per workstream, on `npm run dev` (port 3001):

1. **B** — warm reload: hero content visible < 1s; loader ≤ 2.5s.
2. **C** — scroll hero + watch progress bar: no jitter/lag vs. page motion.
3. **A/D** — sections drift + grouped items cascade; timing feels consistent.
4. **E** — tab through page: consistent focus rings; hover lift uniform.
5. **F** — fast scroll shows subtle weight; disabled with reduced-motion / on mobile.

Gate: `npm run build` and `npm run lint` green after each workstream.

## Rollout order

A → B → C (smoothness core) → D → E (visible redesign) → F (stretch). Each
workstream is independently shippable and independently verifiable.
