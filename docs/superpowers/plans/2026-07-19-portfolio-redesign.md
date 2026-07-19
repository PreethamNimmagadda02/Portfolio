# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the entire portfolio to an editorial-first, dark-luxury design system (Fraunces serif + Geist Sans/Mono typography, a single warm-amber accent replacing the current purple/blue/cyan/rose "cosmic" palette, a single committed dark theme) while recomposing — not migrating — the existing single-canvas WebGL background so it reads as one signature Hero moment rather than a pervasive backdrop, and preserving all existing functionality (filtering, live data fetching, cross-component state, links).

**Architecture:** This is a re-skin of an already-working Next.js 16 / React 19 / Tailwind v4 / Framer Motion / React Three Fiber codebase — no new sections, no new libraries beyond two font packages, no infra changes. Work proceeds foundation-first (design tokens, theme-system removal, WebGL scene recomposition) so every subsequent per-section task only has to swap fonts/classes onto already-updated tokens, not invent new colors.

**Tech Stack:** Next.js 16 (static export), React 19, Tailwind CSS v4 (`@theme inline` in `globals.css`, no `tailwind.config.ts`), Framer Motion (via `src/lib/motion.ts` wrapper), Three.js + `@react-three/fiber` (single persistent canvas, no `@react-three/drei`), `next/font/google` + new `geist` npm package for fonts.

## Global Constraints

- **Source of truth is verified source, not `CLAUDE.md`/`openwiki`.** Those docs describe a stale architecture (6 per-section 3D canvases; 3D torus/cards in About/Experience/Achievements). The real code already has ONE persistent WebGL background (`CosmicScene.tsx`) and 2D content sections. Every task below is grounded in source read directly from the repo during planning — do not "correct" a task to match `CLAUDE.md`/`openwiki` instead.
- **No test framework is configured in this repo** (confirmed in `CLAUDE.md`). "Testable deliverable" in this plan means, for every task: (1) `npm run lint` passes with no new errors, (2) `npm run build` succeeds (validates TypeScript + static export), (3) a specific manual visual/functional checklist verified via `npm run dev` at `http://localhost:3001`. Steps below give the exact checklist per task instead of automated test code.
- **Preserve all non-visual behavior exactly:** Experience/Skills filter state, the Skills↔`CosmicScene` `SkillsConstellation` cross-link (`src/lib/scene-store.ts`'s `toggleSkillCategory`/`useActiveSkillCategories`), GitHubStats live fetching, Contact's EmailJS submission, all external links, PWA/service worker, `prefers-reduced-motion` handling, mobile detection (`useIsMobile`) gating of expensive effects. No task in this plan touches data-fetching, filtering, or form-submission logic — only visual/typographic/motion execution and the 3D scene's palette/layer composition.
- **Single committed dark theme.** The `deep-space`/`nebula` toggle, `ThemeProvider`/`ThemeContext`/`useTheme` (all defined in `src/components/ThemeToggle.tsx`), and the `data-theme` attribute mechanism are removed entirely (Task 2) — not made configurable, not left as dead code.
- **Design tokens are defined once (Task 1) and referenced by name in every later task** — no task after Task 1 invents a new hex color or introduces a new font-loading mechanism.
- **Commit after every task**, using the repo's existing commit style (see `git log`), e.g. `refactor: retheme Navbar to editorial design system`.

## Design Tokens Reference (established by Task 1 — cite by name in later tasks)

| Token | Value | Used for |
|---|---|---|
| `--font-fraunces` / Tailwind `font-display` | Fraunces (serif, weights 400/500/600, italic) | Headlines, section titles, pull-quotes |
| `--font-geist-sans` / Tailwind `font-sans` (default) | Geist Sans | Body copy, nav, buttons, form fields |
| `--font-geist-mono` / Tailwind `font-mono` | Geist Mono | Labels, dates, stats, kickers, role-rotator |
| `--iris` / `--amber` / `--primary` | `#c9974a` (brass/amber) | Single accent — CTAs, active states, key numerals |
| `--iris-soft` | `#e2bd85` | Lighter accent (hover states, gradient stops) |
| `--cyan` | `#f3e3c0` | Palest gradient stop (was cyan, now pale gold) |
| `--void` | `#08070a` | Page background |
| `--ink` | `#141116` | Card/panel surface |
| Tailwind `purple/violet/indigo/blue/sky/cyan/teal/fuchsia/pink/rose` families | remapped to the amber ramp (50→950) | Any existing component code using these classes automatically renders in amber, zero component edits needed |
| `EASE_EDITORIAL` (from `@/lib/motion`) | `[0.16, 1, 0.3, 1]` | Restrained, no-bounce easing for new/changed transitions |
| `SPRING_RESTRAINED` (from `@/lib/motion`) | `{ type: "spring", stiffness: 140, damping: 22, mass: 1 }` | Restrained spring for new/changed transitions |

**Note on scope of per-file edits:** Where this plan gives an exact `old_string`/`new_string` pair, that content was read directly from the file during planning — apply it verbatim. Where it gives a **rule** (e.g. "replace every hex value in this array, keep every key unchanged") instead of a literal diff, the surrounding file content wasn't fully read during planning; apply the rule mechanically rather than guessing at unseen content.

---

### Task 1: Design Tokens — Typography, Color Ramp, Motion Primitives

**Files:**
- Modify: `package.json`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css:1-67` (theme block + `:root`), `:353-367` (`.text-display`, `.text-gradient-iris`), `:373-397` (`.card-hairline`, `.content-panel`), `:384-391` (`.cosmic-vignette`), `:479-501` (`.kicker-num`, `.kicker-line`)
- Modify: `src/lib/motion.ts`
- Test: manual, via `npm run dev`

**Interfaces:**
- Produces: Tailwind utilities `font-display`, `font-sans`, `font-mono`; CSS vars `--iris`/`--iris-soft`/`--cyan`/`--amber`/`--void`/`--ink`; remapped `purple-*`/`violet-*`/`indigo-*`/`blue-*`/`sky-*`/`cyan-*`/`teal-*`/`fuchsia-*`/`pink-*`/`rose-*` Tailwind color families; `EASE_EDITORIAL`, `SPRING_RESTRAINED` exports from `@/lib/motion`. Every later task consumes these by name.

- [ ] **Step 1: Install the `geist` font package**

Run: `npm install geist`
Expected: adds `"geist": "^1.x"` to `package.json` dependencies, `npm run build` still succeeds afterward (verified in Step 8).

- [ ] **Step 2: Replace font loading in `src/app/layout.tsx`**

Replace:
```ts
import { Space_Grotesk, Inter } from "next/font/google";
```
with:
```ts
import { Fraunces } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
```

Replace:
```ts
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});
```
with:
```ts
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
```
(`GeistSans`/`GeistMono` are pre-built font objects from the `geist` package — no `next/font/google` call needed for them.)

Replace:
```tsx
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-background text-foreground`}
```
with:
```tsx
        className={`${fraunces.variable} ${GeistSans.variable} ${GeistMono.variable} antialiased bg-background text-foreground`}
```

- [ ] **Step 3: Replace the `:root` token block in `src/app/globals.css` (lines 30–67)**

Replace the entire block from `:root {` through the closing `}` before `@layer base {` with:
```css
:root {
  /* Warm near-black base — editorial, not cosmic-void */
  --background: 30 10% 4%;
  --foreground: 40 25% 95%;
  --card: 30 10% 7%;
  --card-foreground: 40 25% 95%;
  --popover: 30 10% 7%;
  --popover-foreground: 40 25% 95%;
  --primary: 36 54% 54%;
  --primary-foreground: 30 10% 4%;
  --secondary: 30 8% 11%;
  --secondary-foreground: 40 25% 95%;
  --muted: 30 8% 11%;
  --muted-foreground: 30 10% 62%;
  --accent: 36 54% 54%;
  --accent-foreground: 30 10% 4%;
  --destructive: 0 70% 55%;
  --destructive-foreground: 40 25% 95%;
  --border: 30 8% 16%;
  --input: 30 8% 14%;
  --ring: 36 54% 54%;
  --chart-1: 36 54% 54%;
  --chart-2: 30 35% 45%;
  --chart-3: 24 20% 38%;
  --chart-4: 42 60% 65%;
  --chart-5: 18 12% 55%;

  /* ── Editorial identity tokens ──
     Plain hex, consumed only by the CSS utilities below (.text-gradient-iris,
     .icard, .kicker-line, .conic-border). NOT read by CosmicScene — its
     palette lives entirely in src/lib/scene-store.ts (see Task 3). */
  --iris: #c9974a;
  --iris-soft: #e2bd85;
  --cyan: #f3e3c0;
  --amber: #c9974a;
  --void: #08070a;
  --ink: #141116;
}
```

- [ ] **Step 4: Add font tokens and the amber color-ramp override to the `@theme inline` block (lines 3–28)**

Replace:
```css
@theme inline {
  --color-background: var(--background);
```
with:
```css
@theme inline {
  --font-display: var(--font-fraunces);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-background: var(--background);
```

Then, immediately before the closing `}` of the same `@theme inline` block (after the existing `--color-chart-5: var(--chart-5);` line), add the full amber-ramp override for every "cosmic rainbow" hue family still referenced by component code (purple, violet, indigo, blue, sky, cyan, teal, fuchsia, pink, rose). This is a **direct generalization of the exact trick the codebase already used** for the nebula theme's `--color-purple-300..900` override (globals.css:672-678, removed in Task 2) — applied here as the single, permanent theme, and extended to every hue family, so no component file needs individual class-name edits:
```css
  /* ── Single-accent override ──
     Every "cosmic rainbow" hue family the existing components already use
     (purple-500, from-blue-500, text-cyan-400, etc.) is remapped onto one
     warm-amber ramp. This makes every existing purple/blue/pink/cyan/rose/
     indigo/violet/fuchsia/sky/teal Tailwind class render as amber, with no
     changes needed in the component files that use them. Semantic colors
     (red/green/yellow/orange used for destructive/success/warning states)
     are deliberately NOT remapped here. */
  --color-purple-50: #fbf4e7;   --color-violet-50: #fbf4e7;   --color-indigo-50: #fbf4e7;
  --color-blue-50: #fbf4e7;     --color-sky-50: #fbf4e7;      --color-cyan-50: #fbf4e7;
  --color-teal-50: #fbf4e7;     --color-fuchsia-50: #fbf4e7;  --color-pink-50: #fbf4e7;
  --color-rose-50: #fbf4e7;

  --color-purple-100: #f5e7c9; --color-violet-100: #f5e7c9; --color-indigo-100: #f5e7c9;
  --color-blue-100: #f5e7c9;   --color-sky-100: #f5e7c9;    --color-cyan-100: #f5e7c9;
  --color-teal-100: #f5e7c9;   --color-fuchsia-100: #f5e7c9; --color-pink-100: #f5e7c9;
  --color-rose-100: #f5e7c9;

  --color-purple-200: #ecd29e; --color-violet-200: #ecd29e; --color-indigo-200: #ecd29e;
  --color-blue-200: #ecd29e;   --color-sky-200: #ecd29e;    --color-cyan-200: #ecd29e;
  --color-teal-200: #ecd29e;   --color-fuchsia-200: #ecd29e; --color-pink-200: #ecd29e;
  --color-rose-200: #ecd29e;

  --color-purple-300: #e2bd85; --color-violet-300: #e2bd85; --color-indigo-300: #e2bd85;
  --color-blue-300: #e2bd85;   --color-sky-300: #e2bd85;    --color-cyan-300: #e2bd85;
  --color-teal-300: #e2bd85;   --color-fuchsia-300: #e2bd85; --color-pink-300: #e2bd85;
  --color-rose-300: #e2bd85;

  --color-purple-400: #d3a662; --color-violet-400: #d3a662; --color-indigo-400: #d3a662;
  --color-blue-400: #d3a662;   --color-sky-400: #d3a662;    --color-cyan-400: #d3a662;
  --color-teal-400: #d3a662;   --color-fuchsia-400: #d3a662; --color-pink-400: #d3a662;
  --color-rose-400: #d3a662;

  --color-purple-500: #c9974a; --color-violet-500: #c9974a; --color-indigo-500: #c9974a;
  --color-blue-500: #c9974a;   --color-sky-500: #c9974a;    --color-cyan-500: #c9974a;
  --color-teal-500: #c9974a;   --color-fuchsia-500: #c9974a; --color-pink-500: #c9974a;
  --color-rose-500: #c9974a;

  --color-purple-600: #ad7f3c; --color-violet-600: #ad7f3c; --color-indigo-600: #ad7f3c;
  --color-blue-600: #ad7f3c;   --color-sky-600: #ad7f3c;    --color-cyan-600: #ad7f3c;
  --color-teal-600: #ad7f3c;   --color-fuchsia-600: #ad7f3c; --color-pink-600: #ad7f3c;
  --color-rose-600: #ad7f3c;

  --color-purple-700: #8a6530; --color-violet-700: #8a6530; --color-indigo-700: #8a6530;
  --color-blue-700: #8a6530;   --color-sky-700: #8a6530;    --color-cyan-700: #8a6530;
  --color-teal-700: #8a6530;   --color-fuchsia-700: #8a6530; --color-pink-700: #8a6530;
  --color-rose-700: #8a6530;

  --color-purple-800: #664b24; --color-violet-800: #664b24; --color-indigo-800: #664b24;
  --color-blue-800: #664b24;   --color-sky-800: #664b24;    --color-cyan-800: #664b24;
  --color-teal-800: #664b24;   --color-fuchsia-800: #664b24; --color-pink-800: #664b24;
  --color-rose-800: #664b24;

  --color-purple-900: #453218; --color-violet-900: #453218; --color-indigo-900: #453218;
  --color-blue-900: #453218;   --color-sky-900: #453218;    --color-cyan-900: #453218;
  --color-teal-900: #453218;   --color-fuchsia-900: #453218; --color-pink-900: #453218;
  --color-rose-900: #453218;

  --color-purple-950: #2b1f10; --color-violet-950: #2b1f10; --color-indigo-950: #2b1f10;
  --color-blue-950: #2b1f10;   --color-sky-950: #2b1f10;    --color-cyan-950: #2b1f10;
  --color-teal-950: #2b1f10;   --color-fuchsia-950: #2b1f10; --color-pink-950: #2b1f10;
  --color-rose-950: #2b1f10;
}
```

- [ ] **Step 5: Retheme the shared surface/type utility classes**

Replace:
```css
.text-display {
  font-family: var(--font-space-grotesk), sans-serif;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.95;
}

.text-gradient-iris {
  background: linear-gradient(120deg, #fff 0%, var(--iris-soft) 55%, var(--cyan) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```
with:
```css
.text-display {
  font-family: var(--font-fraunces), serif;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.02;
}

.text-gradient-iris {
  background: linear-gradient(120deg, #fff 0%, var(--iris-soft) 55%, var(--cyan) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```
(`.text-gradient-iris` needs no literal change — it already reads `--iris-soft`/`--cyan`, which Step 3 already repointed to the amber family.)

Replace:
```css
.card-hairline {
  border: 1px solid rgba(255, 255, 255, 0.14);
  /* Solid warm-dark fill — no backdrop-filter. Cheaper than blur, and the
     darker tone reads as a real surface over the cosmic backdrop. */
  background: rgba(14, 12, 24, 0.72);
}
```
with:
```css
.card-hairline {
  border: 1px solid rgba(245, 241, 234, 0.1);
  /* Solid warm-dark fill matching --ink, no backdrop-filter. */
  background: rgba(20, 17, 22, 0.75);
}
```

Replace:
```css
.cosmic-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(120% 90% at 50% 45%, transparent 45%, rgba(2, 2, 6, 0.55) 100%),
    linear-gradient(180deg, rgba(2, 2, 6, 0.25) 0%, transparent 12%, transparent 88%, rgba(2, 2, 6, 0.35) 100%);
}
```
with:
```css
.cosmic-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(120% 90% at 50% 45%, transparent 45%, rgba(8, 7, 10, 0.55) 100%),
    linear-gradient(180deg, rgba(8, 7, 10, 0.25) 0%, transparent 12%, transparent 88%, rgba(8, 7, 10, 0.35) 100%);
}
```

Replace:
```css
.content-panel {
  background: rgba(6, 5, 12, 0.55);
  border-radius: 1.5rem;
}
```
with:
```css
.content-panel {
  background: rgba(8, 7, 10, 0.6);
  border-radius: 1.5rem;
}
```

Replace:
```css
.kicker-num {
  font-family: var(--font-space-grotesk), sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.35em;
  color: color-mix(in srgb, var(--iris-soft) 55%, transparent);
}
```
with:
```css
.kicker-num {
  font-family: var(--font-geist-mono), monospace;
  font-weight: 500;
  font-size: 0.75rem;
  letter-spacing: 0.35em;
  color: color-mix(in srgb, var(--iris-soft) 65%, transparent);
}
```

- [ ] **Step 6: Add restrained motion primitives to `src/lib/motion.ts`**

Add, after the existing `export type { Variants, MotionValue } from "framer-motion";` line:
```ts

/** Restrained, no-bounce easing — replaces ad hoc bounce/elastic curves. */
export const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const;

/** Restrained spring — replaces high-stiffness/low-damping "bouncy" springs. */
export const SPRING_RESTRAINED = { type: "spring", stiffness: 140, damping: 22, mass: 1 } as const;
```

- [ ] **Step 7: Add `Fraunces`/mono `font-mono` usage check to `.line-rise`/`.kicker-label` (no change needed)**

Read `globals.css:487-494` (`.kicker-label`) — it has no `font-family` declared (inherits body font), which after Step 2 is now Geist Sans. No edit needed; this step is a verification-only checkpoint, not a code change.

- [ ] **Step 8: Verify**

Run: `npm run lint` — expect no new errors.
Run: `npm run build` — expect success. If it fails specifically on the `Fraunces` import from `next/font/google`, that font isn't in this Next.js version's generated font list; substitute `import { Playfair_Display as Fraunces } from "next/font/google";` (same variable name downstream, different literal import name) and re-run.
Run: `npm run dev`, open `http://localhost:3001`. Confirm: page background is near-black with a warm (not cool/blue) undertone; any element using `.text-display` (e.g. Hero headline, once Task 5 lands — for now just confirm no console font-loading errors); DevTools Network tab shows Fraunces/Geist Sans/Geist Mono font files loading, not Space Grotesk/Inter.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/app/layout.tsx src/app/globals.css src/lib/motion.ts
git commit -m "feat: establish editorial design tokens (Fraunces/Geist, amber accent ramp)"
```

---

### Task 2: Remove the Dual-Theme System

**Files:**
- Delete: `src/components/ThemeToggle.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/Navbar.tsx:7,377,474`
- Modify: `src/app/globals.css:97-123` (nebula focus/selection overrides), `:653-708` (nebula theme block)
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: nothing consumed by later tasks (this is a pure removal).

- [ ] **Step 1: Delete `src/components/ThemeToggle.tsx`**

Confirmed safe: `useTheme`/`ThemeContext` have no consumers outside this file (verified via repo-wide grep during planning); `ThemeProvider` is consumed only by `layout.tsx`, and the default-exported `ThemeToggle` component only by `Navbar.tsx` (both updated in this task).

```bash
rm src/components/ThemeToggle.tsx
```

- [ ] **Step 2: Remove `ThemeProvider` and the pre-hydration theme script from `src/app/layout.tsx`**

Replace:
```ts
import { ThemeProvider } from "@/components/ThemeToggle";
```
Delete this line entirely (no replacement import).

Replace:
```ts
// Runs before paint to apply the saved theme, preventing a flash (FOUC)
const themeInitScript = `(function(){try{var t=localStorage.getItem('portfolio-theme');if(t==='nebula'||t==='deep-space'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

// Disable browser scroll restoration so every refresh always starts at the top
const scrollResetScript = `if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);`;
```
with:
```ts
// Disable browser scroll restoration so every refresh always starts at the top
const scrollResetScript = `if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);`;
```

Replace:
```tsx
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: scrollResetScript }}
        />
```
with:
```tsx
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: scrollResetScript }}
        />
```

Replace:
```tsx
          <PerformanceProvider>
            <ThemeProvider>
              <PageLoader />
              <ScrollProgress />
              <KonamiEasterEgg />
              <SpotlightCursor />
              <SmoothScroll>
                <Navbar />
                <main id="main-content" className="min-h-screen">
                  {children}
                </main>
                <Footer />
              </SmoothScroll>
            </ThemeProvider>
          </PerformanceProvider>
```
with:
```tsx
          <PerformanceProvider>
            <PageLoader />
            <ScrollProgress />
            <KonamiEasterEgg />
            <SpotlightCursor />
            <SmoothScroll>
              <Navbar />
              <main id="main-content" className="min-h-screen">
                {children}
              </main>
              <Footer />
            </SmoothScroll>
          </PerformanceProvider>
```

- [ ] **Step 3: Remove `ThemeToggle` from `src/components/Navbar.tsx`**

Replace:
```tsx
import ThemeToggle from "./ThemeToggle";
```
Delete this line entirely.

At line 377 and line 474, delete the `<ThemeToggle />` element (each is a standalone self-closing JSX element on its own line — remove the line, leave surrounding layout markup as-is; if either was the sole child of a flex/gap wrapper `div`, remove that now-empty wrapper too rather than leaving an empty `<div>`).

- [ ] **Step 4: Remove nebula-specific rules from `src/app/globals.css`**

Replace:
```css
  [data-theme="nebula"] :focus-visible {
    outline-color: rgba(244, 114, 182, 0.9);
  }

  /* Remove default outline only when a visible focus ring is shown */
```
with:
```css
  /* Remove default outline only when a visible focus ring is shown */
```

Replace:
```css
  ::selection {
    background: rgba(139, 92, 246, 0.35);
    color: #ffffff;
  }

  [data-theme="nebula"] ::selection {
    background: rgba(236, 72, 153, 0.35);
  }
```
with:
```css
  ::selection {
    background: rgba(201, 151, 74, 0.35);
    color: #ffffff;
  }
```

Delete the entire block from the `/* ── Nebula Theme ── */` comment through the closing `}` of `[data-theme="nebula"] .pulse-glow-layer { ... }` (globals.css:653-708 as read during planning) — i.e. delete these rules in full: the `[data-theme="nebula"] { ... }` variable block, `[data-theme="nebula"] h1`, `[data-theme="nebula"] ::-webkit-scrollbar-thumb` (both rules), `[data-theme="nebula"] *`, and `[data-theme="nebula"] .pulse-glow-layer`.

- [ ] **Step 5: Verify**

Run: `npm run lint && npm run build` — expect success, no unused-import warnings for `ThemeToggle`/`ThemeProvider`.
Run: `npm run dev`. Confirm: no theme-toggle button renders in the navbar (desktop or mobile menu); setting `localStorage.setItem('portfolio-theme','nebula')` and reloading has no visible effect (there's nothing left to read it); no console errors about missing `ThemeToggle` module.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: remove dual-theme system, commit to single dark theme"
```

---

### Task 3: CosmicScene Recomposition — Palette & Hero-Only Prominence

**Files:**
- Modify: `src/lib/scene-store.ts:33-43` (`SCENE_CHAPTERS`)
- Modify: `src/components/scene/CosmicScene.tsx:1465-1467`
- Modify: `src/app/page.tsx:55`
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: `--iris`/`--void` hex intent from Task 1 (values re-expressed here as literal hex, since `CosmicScene`/`scene-store.ts` do not read CSS custom properties — confirmed via repo-wide grep during planning).
- Produces: nothing new consumed by later tasks; `getSceneState()`'s public shape (`{ index, chapter, next, blend, camera, lookAt }`) is unchanged, so `SkillsConstellation`'s cross-link and every other consumer of `getSceneState` keeps working unmodified.

- [ ] **Step 1: Recolor `SCENE_CHAPTERS` — rich amber for hero/contact, muted neutral elsewhere**

Replace the entire `SCENE_CHAPTERS` array with (only `colorA`/`colorB`/`colorC` change per chapter; `id`/`start`/`end`/`camera`/`lookAt`/`focus` are unchanged from the current file so camera choreography and the Skills-constellation/Embers focus-weighting logic keep working exactly as today):
```ts
export const SCENE_CHAPTERS: SceneChapter[] = [
  { id: "hero", start: 0.0, end: 0.06, colorA: "#c9974a", colorB: "#f3e3c0", colorC: "#0e0a06", camera: [0, 0, 6.5], lookAt: [0, 0, 0], focus: "core" },
  { id: "about", start: 0.06, end: 0.17, colorA: "#2b2620", colorB: "#1a1712", colorC: "#08070a", camera: [1.4, 0.3, 6], lookAt: [0.4, 0, 0], focus: "core" },
  { id: "experience", start: 0.17, end: 0.33, colorA: "#2b2620", colorB: "#1a1712", colorC: "#08070a", camera: [-1.6, 0.6, 6.4], lookAt: [-0.3, 0.2, 0], focus: "signal" },
  { id: "skills", start: 0.33, end: 0.43, colorA: "#3a3226", colorB: "#1e1a14", colorC: "#08070a", camera: [0, -0.2, 5.6], lookAt: [0, 0, 0], focus: "constellation" },
  { id: "projects", start: 0.43, end: 0.59, colorA: "#2b2620", colorB: "#1a1712", colorC: "#08070a", camera: [1.8, -0.4, 6.2], lookAt: [0.3, -0.1, 0], focus: "prism" },
  { id: "activity", start: 0.59, end: 0.71, colorA: "#2b2620", colorB: "#1a1712", colorC: "#08070a", camera: [-1.4, 0.4, 6], lookAt: [-0.2, 0.1, 0], focus: "signal" },
  { id: "achievements", start: 0.71, end: 0.81, colorA: "#4a3a20", colorB: "#241c10", colorC: "#0a0806", camera: [0, 0.5, 6.5], lookAt: [0, 0, 0], focus: "flame" },
  { id: "testimonials", start: 0.81, end: 0.91, colorA: "#2b2620", colorB: "#1a1712", colorC: "#08070a", camera: [-1, -0.2, 6.8], lookAt: [0, 0, 0], focus: "quiet" },
  { id: "contact", start: 0.91, end: 1.0, colorA: "#c9974a", colorB: "#f3e3c0", colorC: "#0e0a06", camera: [0, 0, 7], lookAt: [0, 0, 0], focus: "core" },
];
```
This keeps the scene continuously animating across the whole scroll (no remount, no functional change to camera or focus-weighting), but only the `hero` and `contact` chapters get the rich amber/gold palette — every chapter in between fades to a low-contrast warm-neutral that reads as ambient texture, not a competing light show. `contact` intentionally reuses `hero`'s palette (matching the original file's own bookend pattern) — this doubles as the spec's optional "second signature moment" with zero new code.

- [ ] **Step 2: Reserve the three heaviest flourish layers for the hero chapter only**

Replace:
```tsx
      {!isMobile && <EnergyRibbons scroll={scroll} />}
      {!isMobile && <CrystalShards scroll={scroll} />}
      {!isMobile && <WarpRings scroll={scroll} />}
```
with:
```tsx
      {!isMobile && heroActive && <EnergyRibbons scroll={scroll} />}
      {!isMobile && heroActive && <CrystalShards scroll={scroll} />}
      {!isMobile && heroActive && <WarpRings scroll={scroll} />}
```

Then find the component's main render function (the one containing the `<AuroraNebula .../>` ... `<Embers scroll={scroll} />` JSX block at lines 1454-1469) and, immediately before its `return`, add a `heroActive` boolean derived the same way the existing camera/lookAt lerp already is (reusing the `getSceneState(scroll.progress)` call already present near line 1432 — do not add a second call):
```ts
  const heroActive = getSceneState(scroll.progress).index === 0;
```
If the existing `getSceneState(scroll.progress)` call at line 1432 is destructured only as `{ camera: camWaypoint, lookAt: lookWaypoint }`, extend that same destructure to also pull `index`, e.g. `const { camera: camWaypoint, lookAt: lookWaypoint, index: chapterIndex } = getSceneState(scroll.progress);` and use `chapterIndex === 0` in place of `heroActive` above — either naming is fine as long as it's derived from the single existing call, not a new one.

- [ ] **Step 3: Retheme the pre-scene static placeholder in `src/app/page.tsx`**

Replace:
```tsx
          style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.12), transparent 60%), #030308" }}
```
with:
```tsx
          style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(201,151,74,0.12), transparent 60%), #08070a" }}
```

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`, open `http://localhost:3001`. Confirm: the Hero section shows a visibly rich amber/gold nebula glow with the full set of shader layers active; scrolling into About/Experience/Skills/Projects/Activity/Testimonials shows a much dimmer, low-contrast warm-neutral ambient shimmer (still animating, not static) with no ribbons/shards/rings; Achievements shows a slightly warmer glow (Embers flame focus); Contact shows the rich amber palette return; clicking a Skills chip still highlights/dims the matching constellation points (functional regression check — this must keep working); no WebGL console errors; on a throttled mobile emulation profile, the mobile-only-disabled layers stay disabled as before.

- [ ] **Step 5: Commit**

```bash
git add src/lib/scene-store.ts src/components/scene/CosmicScene.tsx src/app/page.tsx
git commit -m "feat: recompose CosmicScene as a hero-signature moment, recede elsewhere"
```

---

### Task 4: Navbar Retheme

**Files:**
- Modify: `src/components/Navbar.tsx:283,309,311,323,368,388,395,397,458,486`
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: amber ramp (Task 1) — every `purple-*`/`blue-*`/`fuchsia-*` class listed below already renders as amber after Task 1; this task only fixes literal (non-token) rgba values and the wordmark font, which the ramp cannot reach.

- [ ] **Step 1: Fix the one literal (non-Tailwind-token) rgba shadow color**

Replace:
```tsx
                <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-purple-600 via-purple-500 to-blue-500 p-[2px] overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.35)]">
```
with:
```tsx
                <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-purple-600 via-purple-500 to-blue-500 p-[2px] overflow-hidden shadow-[0_0_20px_rgba(201,151,74,0.35)]">
```
(The `from-purple-600 via-purple-500 to-blue-500` classes need no edit — Task 1's ramp override already renders them as amber tones.)

- [ ] **Step 2: Set the wordmark to the display serif**

Find the logo/wordmark text element (the `<span>Preetham Nimmagadda</span>` around line 323, and its non-hover-visible sibling text if present nearby) and add `font-display` to its className (alongside its existing classes — do not remove any existing gradient/opacity classes, just add `font-display` so the brand name renders in Fraunces instead of the default Geist Sans body font).

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`. Confirm: navbar accents (logo glow, active-link background, mobile CTA button) render as warm amber/brass, not purple/blue; the wordmark renders in the serif display font; no `ThemeToggle` present (carried over from Task 2 — regression check); nav scroll/tilt/spotlight interactions still work.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "refactor: retheme Navbar to editorial design system"
```

---

### Task 5: Hero Retheme

**Files:**
- Modify: `src/components/Hero.tsx:38-45` (`ROLES`), and every `style={{ fontFamily: "var(--font-inter)" }}` occurrence (verified at lines 241, 441, 493)
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: `font-sans` (Task 1, now the Tailwind default so it can replace the inline style entirely), `font-mono` (Task 1) for the role rotator, `.text-display` (Task 1, already Fraunces) for the headline — no change needed there since `AnimatedWord` already uses `.text-display`-driven styling per the codebase's existing pattern.

- [ ] **Step 1: Replace inline `fontFamily: "var(--font-inter)"` with `className="font-sans"`**

At each of the three verified occurrences (Hero.tsx:241, 441, 493), replace:
```tsx
style={{ fontFamily: "var(--font-inter)" }}
```
with a `font-sans` class added to that same element's `className` string (Geist Sans is now the Tailwind default body font from Task 1, so this makes the intent explicit and matches every other section's convention rather than leaving an inline style). Remove the now-empty `style={{...}}` prop entirely if `fontFamily` was its only key; if the element has other style properties alongside `fontFamily`, keep those and only remove the `fontFamily` key.

- [ ] **Step 2: Set the role rotator to mono**

Find the `RoleRotator` component's rendered text element and add `font-mono` to its className (the rotating role labels — e.g. "AI Agent Developer" — become mono-styled metadata text, matching the design system's convention of mono for labels/rotators).

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`. Confirm: Hero headline renders in Fraunces serif (large, confident); role rotator text renders in Geist Mono; body/subtitle copy renders in Geist Sans with no inline `fontFamily` styles left; CTA button and stats render with the amber accent; parallax/scroll behavior on the Hero unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "refactor: retheme Hero typography to Fraunces/Geist system"
```

---

### Task 6: About + AvatarFlipCard Retheme

**Files:**
- Modify: `src/components/About.tsx:61` (`stats` color field), `:138,177` (inline fontFamily), `:180` (gradient text)
- Modify: `src/components/AvatarFlipCard.tsx:41,44,49,73,94,115-118,129,137,149,154,167,171` (literal purple/blue classes + literal rgba)
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: `font-sans`/`font-display` (Task 1), amber ramp (Task 1) — most `purple-*`/`blue-*` classes here need zero edits; this task only fixes inline fontFamily and literal (non-token) rgba values the ramp can't reach.

- [ ] **Step 1: About.tsx — replace inline fontFamily with `font-sans`**

At lines 138 and 177, replace each `style={{ fontFamily: "var(--font-inter)" }}` with a `font-sans` class on the element (same pattern as Task 5, Step 1).

- [ ] **Step 2: About.tsx — confirm the `stats`/gradient-text classes need no edit**

`stats[].color: "text-purple-400"` (line 61) and the `from-purple-300 to-pink-300` gradient (line 180) already render as amber after Task 1's ramp override — no literal edit needed. This step is a verification checkpoint only.

- [ ] **Step 3: AvatarFlipCard.tsx — fix literal (non-token) rgba values**

Replace:
```tsx
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
```
with:
```tsx
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(201,151,74,0.8)]" />
```

Replace:
```tsx
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-[#030303]"
```
with:
```tsx
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-purple-500/20 shadow-[0_0_30px_rgba(201,151,74,0.15)] bg-[#08070a]"
```

All other `purple-*`/`blue-*` classes in this file (lines 41, 49, 73, 94, 115-118, 137, 149, 154, 167, 171) need no edit — they already render amber after Task 1.

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`. Confirm: About section body copy renders in Geist Sans with no inline fontFamily; feature cards, stats, and the "answer" gradient word render in amber tones; `AvatarFlipCard`'s orbit rings, corner brackets, and glow all render amber, not purple; the flip interaction (hover/tap) still works.

- [ ] **Step 5: Commit**

```bash
git add src/components/About.tsx src/components/AvatarFlipCard.tsx
git commit -m "refactor: retheme About and AvatarFlipCard to editorial design system"
```

---

### Task 7: Skills Retheme

**Files:**
- Modify: `src/components/Skills.tsx:164` (gradient text)
- Modify: `src/lib/skills-data.ts` (`categoryColors`)
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: amber ramp (Task 1). Does **not** touch `getCategoryColor`/`categoryLabels`/`skillsData` signatures — `CosmicScene.tsx`'s `SkillsConstellation` imports this same file to color-match constellation points to DOM chips, so the exported function/type names must stay identical; only the color **values** inside `categoryColors` change.

- [ ] **Step 1: Skills.tsx — confirm gradient text needs no literal edit**

`from-purple-400 to-cyan-400` (line 164) already renders amber-to-pale-gold after Task 1's ramp override. Verification checkpoint only, no edit.

- [ ] **Step 2: Recolor `categoryColors` in `src/lib/skills-data.ts`**

This file's exact current hex values weren't read verbatim during planning. Apply this rule: for each of the 8 category keys (AI, Web, DB, Cloud, DevOps, Lang, Tools, Automation) in `categoryColors`, keep every key unchanged and replace its hex value with one of these 8 amber-ramp tones (cycling through in the order the keys already appear in the file, so adjacent categories stay visually distinguishable while staying inside one hue family): `#c9974a`, `#d3a662`, `#ad7f3c`, `#e2bd85`, `#8a6530`, `#f3e3c0`, `#b8874a`, `#9c7238`.

This is the same object `CosmicScene.tsx`'s `SkillsConstellation` reads for point colors — after this change, verify (Step 3) that constellation points visually shift to the same amber tones, confirming the cross-link still resolves correctly.

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`. Confirm: skill chip grid renders with amber-family category colors, not the previous rainbow; clicking a category filter still toggles chip visibility (`AnimatePresence`/`layout` behavior unchanged) and still dims/highlights the matching `SkillsConstellation` points in the background scene; the marquee motion is unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/components/Skills.tsx src/lib/skills-data.ts
git commit -m "refactor: retheme Skills chips and constellation colors to amber ramp"
```

---

### Task 8: Experience Retheme

**Files:**
- Modify: `src/components/Experience.tsx:170` (inline fontFamily), `:228` (gradient text — no edit needed)
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: `font-sans` (Task 1), amber ramp (Task 1).

- [ ] **Step 1: Replace inline fontFamily with `font-sans`**

At line 170, replace `style={{ fontFamily: "var(--font-inter)" }}` with a `font-sans` class on the element (same pattern as Task 5/6).

- [ ] **Step 2: Confirm gradient text needs no edit**

`from-purple-300 via-blue-400 to-cyan-400` (line 228) already renders amber after Task 1. Verification checkpoint only.

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`. Confirm: Experience description copy renders in Geist Sans, no inline fontFamily; timeline rail, node glow, and highlight gradient render amber; filter pills still filter correctly (functional regression check).

- [ ] **Step 4: Commit**

```bash
git add src/components/Experience.tsx
git commit -m "refactor: retheme Experience typography to editorial design system"
```

---

### Task 9: Projects Retheme + Cursor-Follow "View Project" Label

**Files:**
- Modify: `src/components/Projects.tsx:145,182` (inline fontFamily), `:241,249` (badge/gradient — no edit needed), add new hover-label sub-component
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: `font-sans`/`font-display` (Task 1), amber ramp (Task 1), the `MagneticButton`-established cursor-follow pattern (`useMotionValue`/`useSpring` from `@/lib/motion`, same libraries `Projects.tsx` already imports for its other animations).
- Produces: nothing new consumed by later tasks — this is a leaf addition local to `Projects.tsx`.

- [ ] **Step 1: Replace inline fontFamily occurrences**

At line 145, replace `style={{ fontFamily: "var(--font-space-grotesk)" }}` with a `font-display` class (this is a project title, matching the design system's serif-for-headings rule).
At line 182, replace `style={{ fontFamily: "var(--font-inter)" }}` with a `font-sans` class.

- [ ] **Step 2: Confirm badge/gradient classes need no edit**

`bg-purple-500/10 border-purple-500/20 text-purple-400` (line 241) and `from-purple-400 via-blue-400 to-cyan-400` (line 249) already render amber after Task 1. Verification checkpoint only.

- [ ] **Step 3: Add a cursor-follow "View Project" label on row hover**

Add this new component near the top of `Projects.tsx` (after existing imports, before the `projects` data array):
```tsx
function ProjectHoverLabel() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  return (
    <motion.span
      aria-hidden
      onPointerMove={(e) => {
        const rect = e.currentTarget.parentElement?.getBoundingClientRect();
        if (!rect) return;
        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
      }}
      style={{ left: springX, top: springY }}
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-2 text-xs font-mono uppercase tracking-widest text-primary-foreground opacity-0 transition-opacity duration-200 group-hover/row:opacity-100"
    >
      View Project ↗
    </motion.span>
  );
}
```
Add `useMotionValue`, `useSpring` to the existing `@/lib/motion` import line at the top of the file if not already imported (the file's `useScroll`-style hooks are already sourced from `@/lib/motion` per the codebase convention — add these two names to that same import).

In the row-level wrapper `<div>` that already carries the `group/row` class (used today for the title's `bg-position` hover sweep, per the codebase's existing pattern), add `relative` to its className if not already present (required so `ProjectHoverLabel`'s `absolute` positioning is relative to the row, not the page), and render `<ProjectHoverLabel />` as a child of that same wrapper, positioned anywhere in its JSX (it's `absolute`, so placement order doesn't affect layout).

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`. Confirm: project titles render in Fraunces, descriptions in Geist Sans; hovering a project row shows a small amber pill reading "View Project ↗" that follows the cursor smoothly (spring-damped, not 1:1 snapping) and fades in/out with the hover state; demo/repo links still navigate correctly; zebra layout unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/components/Projects.tsx
git commit -m "feat: retheme Projects and add cursor-follow view-project label"
```

---

### Task 10: Achievements Retheme

**Files:**
- Modify: `src/components/Achievements.tsx:122` (inline fontFamily)
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: `font-sans` (Task 1).

- [ ] **Step 1: Replace inline fontFamily with `font-sans`**

At line 122, replace `style={{ fontFamily: "var(--font-inter)" }}` with a `font-sans` class on the element.

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`. Confirm: achievement descriptions render in Geist Sans; stat numerals and `.stat-flare` completion flash render amber (the `--iris`/`--amber` tokens both already point to the same amber hex from Task 1, so no `.stat-flare` CSS edit is needed — verification checkpoint only); count-up animation still fires once per card on scroll-into-view.

- [ ] **Step 3: Commit**

```bash
git add src/components/Achievements.tsx
git commit -m "refactor: retheme Achievements typography to editorial design system"
```

---

### Task 11: GitHub Stats Retheme

**Files:**
- Modify: `src/components/GitHubStats.tsx:13-27` (`LANG_COLORS`), `:158-164` (`cellColors`)
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: amber ramp (Task 1) for every Tailwind class in this file (lines 468, 525, 539, 541, 665, 669, 676, 688, 709 all already render amber post-Task-1, no edit needed there). Does not touch the fetch functions (`fetchContributions`, `fetchRepos`, `fetchUserProfile`) or type shapes (`ContributionDay`, `StatsData`, `LanguageData`) — those are unrelated to color and must keep their existing signatures for `CodingProfiles` and the rest of the file to keep compiling.

- [ ] **Step 1: Recolor `LANG_COLORS` — rule-based (exact current keys weren't read verbatim during planning)**

At `GitHubStats.tsx:13-27`, keep every existing language key (e.g. `TypeScript`, `Python`, etc. — whatever the 13 keys currently are) exactly as-is; replace only each hex **value** by cycling through this 5-tone amber sequence in the order the keys already appear in the file: `#c9974a`, `#d3a662`, `#ad7f3c`, `#e2bd85`, `#8a6530` (repeat the cycle for keys 6-13). Do not add, remove, or rename any key — `LanguageData` elsewhere in the file looks these up by the exact existing key strings.

- [ ] **Step 2: Recolor `cellColors` (heatmap 5-step palette) — rule-based**

At `GitHubStats.tsx:158-164`, this is a 5-step intensity ramp (levels 0-4, level 0 = no contributions, level 4 = most). Replace it with:
```ts
const cellColors = [
  "rgba(245, 241, 234, 0.06)",  // level 0 — no contributions
  "rgba(201, 151, 74, 0.25)",   // level 1
  "rgba(201, 151, 74, 0.45)",   // level 2
  "rgba(201, 151, 74, 0.7)",    // level 3
  "rgba(201, 151, 74, 0.95)",   // level 4 — most contributions
];
```
Keep the surrounding declaration syntax (const name, type annotation if any, export-ness) exactly as it already is in the file — only the array literal's contents change.

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`, scroll to GitHub Stats. Confirm: contribution heatmap renders as a warm off-white-to-amber intensity ramp (not purple); language breakdown bars/legend render in amber tones with every language name still correctly labeled (spot-check 2-3 languages against the live GitHub data to confirm no key mismatch); tab-switching between GitHub/Competitive views still works; live data still loads (network calls unaffected).

- [ ] **Step 4: Commit**

```bash
git add src/components/GitHubStats.tsx
git commit -m "refactor: retheme GitHubStats heatmap and language colors to amber ramp"
```

---

### Task 12: Testimonials Retheme + Dead-Code Cleanup

**Files:**
- Modify: `src/components/Testimonials.tsx:140,465,473,481` (dead animation classes), `:522,526,560` (gradient/icon — no edit needed)
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: amber ramp (Task 1).

- [ ] **Step 1: Remove the dead `animate-float-particle`/`drift-a`/`drift-b` references**

These three class names (verified via grep during planning: `Testimonials.tsx:140,465,473,481`) are applied but were never defined anywhere in `globals.css` — today they render as static, motionless elements despite the surrounding code implying drift/float motion. Rather than defining new keyframes for classes that were apparently dead from the start, remove the dead class names from each of the four `className` strings at those lines (leave every other class in those strings untouched) so the elements render as intentionally static accents instead of silently-broken animated ones.

- [ ] **Step 2: Confirm gradient/icon classes need no edit**

`from-purple-400 via-pink-400 to-rose-400` (line 522), `from-purple-400 to-pink-400` (line 526), and `text-purple-400/60` (line 560) already render amber after Task 1. Verification checkpoint only.

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`. Confirm: no console warnings about unknown classes; marquee rows still scroll (desktop) and the snap-scroll carousel still works (mobile); quote card hover glow renders amber; the four previously-dead elements no longer reference undefined animation classes (inspect via DevTools that the className strings no longer contain `animate-float-particle`/`drift-a`/`drift-b`).

- [ ] **Step 4: Commit**

```bash
git add src/components/Testimonials.tsx
git commit -m "refactor: retheme Testimonials and remove dead animation class references"
```

---

### Task 13: Contact Retheme

**Files:**
- Modify: `src/components/Contact.tsx:12-16` (`contactColors`), `:98,146,228,276` (form gradients/borders — no edit needed), `:285` (progress bar color)
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: amber ramp (Task 1). Does not touch `emailjs.sendForm` call, env var names, or `Toast`/`FloatingInput`/`FloatingTextarea` prop signatures.

- [ ] **Step 1: Recolor `contactColors` — rule-based for the unseen middle entry**

At `Contact.tsx:12-16`, the object has 3 keys (`email`, `location`, `phone`). `email`'s current value (`{ gradient: "from-blue-500 to-cyan-500", accent: "#22d3ee" }`) and `phone`'s (`{ gradient: "from-purple-500 to-pink-500", accent: ... }`) were read during planning; `location`'s wasn't. Apply this rule to all three keys uniformly: set every `accent` value to `"#c9974a"`, and set every `gradient` value to `"from-primary to-primary"` (a flat single-tone amber glow rather than a two-hue gradient, matching the single-accent design direction — using the `primary` Tailwind token from Task 1 rather than a literal color name keeps this in sync if the accent value ever changes again).

- [ ] **Step 2: Confirm form-field gradients/borders need no literal edit**

Lines 98, 146, 228, 276 (`from-purple-500 to-blue-500`, `focus:border-purple-500 focus:ring-1 focus:ring-purple-500`, etc.) already render amber after Task 1. Verification checkpoint only.

- [ ] **Step 3: Fix the char-count progress bar's color logic**

At line 285, the bar color logic (`charPercentage > 90 ? "bg-red-500" : charPercentage > 70 ? "bg-yellow-500" : "bg-purple-500"`) mixes semantic warning colors (correctly left as red/yellow — do not touch) with the brand accent (`bg-purple-500`, the "under 70%" default state). No edit is needed here either: `bg-purple-500` already renders amber after Task 1, and red/yellow are intentionally excluded from the ramp override (Task 1) so they keep their semantic meaning. Verification checkpoint only.

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`, scroll to Contact. Confirm: contact method icons/cards (email/location/phone) all render the same flat amber glow instead of three different hues; form focus rings and the conic-border are amber; the char-count bar is amber under 70%, still turns yellow/red as thresholds are crossed (semantic colors preserved); submitting the form still works (do not actually submit in a way that sends a real email unless testing that path is explicitly intended — visually verify the button/validation states instead).

- [ ] **Step 5: Commit**

```bash
git add src/components/Contact.tsx
git commit -m "refactor: retheme Contact to single-accent editorial design system"
```

---

### Task 14: Footer Retheme

**Files:**
- Modify: `src/components/Footer.tsx:12-14` (`socialLinks` gradients — no edit needed except literal rgba), `:49,80,106-107,146,221,224-225`
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: `font-display` (Task 1) for the watermark, amber ramp (Task 1).

- [ ] **Step 1: Fix the one literal (non-token) rgba value**

Replace:
```tsx
                <div className="p-1.5 md:p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 group-hover:shadow-[0_0_16px_rgba(139,92,246,0.25)] transition-all">
```
with:
```tsx
                <div className="p-1.5 md:p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 group-hover:shadow-[0_0_16px_rgba(201,151,74,0.25)] transition-all">
```

- [ ] **Step 2: Set the watermark name to the display serif**

Find the "giant watermark name" parallax element (the large background name text described in the codebase map, around lines 236-248) and add `font-display` to its className so it renders in Fraunces rather than whatever default it currently inherits.

- [ ] **Step 3: Confirm remaining classes need no literal edit**

`socialLinks[].gradient` values, `text-purple-400/70`, `via-purple-500/60`, the "Preetham"/" Nimmagadda" gradient/color classes (lines 106-107), and the `to-pink-400` link-hover underline (line 146) all already render amber after Task 1. Verification checkpoint only.

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`, scroll to Footer. Confirm: social icon hover glow is amber; the giant watermark name renders in Fraunces and still parallax-rises on scroll; back-to-top button hover glow is amber; `LocalTime` clock still ticks.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "refactor: retheme Footer to editorial design system"
```

---

### Task 15: PageLoader Retheme

**Files:**
- Modify: `src/components/PageLoader.tsx:153,161,177,180`
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: `font-display` (Task 1), amber ramp (Task 1).

- [ ] **Step 1: Replace inline `var(--font-space-grotesk)` with `font-display`**

At lines 161 and 180, replace each `style={{ fontFamily: "var(--font-space-grotesk)" }}` (or the equivalent object literal containing that key, per line 180's multi-line style object) with a `font-display` class on the element, removing the `fontFamily` key from the inline style object (keep any other style keys in that object untouched, if present).

- [ ] **Step 2: Confirm gradient classes need no literal edit**

`from-purple-500 via-indigo-500 to-blue-600` (line 153) and `from-purple-300 via-white to-indigo-300` (line 177) already render amber-toned after Task 1. Verification checkpoint only.

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev` with a hard refresh (or throttle network in DevTools to see the loader longer). Confirm: loader logo card and brand text render in Fraunces with amber-toned gradients; the deterministic starfield still renders (seeded, no hydration warning in console); loader dismisses at the same timing as before (min 1500ms, scene-warmed gate, 5000ms hard cap — unchanged since Task 3 didn't touch `markSceneWarmed`/`TOTAL_WARMED_SCENES`).

- [ ] **Step 4: Commit**

```bash
git add src/components/PageLoader.tsx
git commit -m "refactor: retheme PageLoader to editorial design system"
```

---

### Task 16: SectionDivider Color Wiring Retheme

**Files:**
- Modify: `src/app/page.tsx:69,75,81,87,93,99,105` (`colorFrom`/`colorTo` props on all 7 `SectionDivider` call sites)
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: amber palette (Task 1) expressed as literal rgba (matching the existing prop convention — `SectionDivider` takes `colorFrom`/`colorTo` as literal rgba strings, not CSS var references, so this task passes new literal values rather than touching `SectionDivider.tsx` itself).

- [ ] **Step 1: Replace all 7 `colorFrom`/`colorTo` pairs with amber-family tones**

Replace each of the following 7 lines in `src/app/page.tsx`:
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(139,92,246,0.2)" colorTo="rgba(59,130,246,0.15)" />
```
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(59,130,246,0.2)" colorTo="rgba(168,85,247,0.15)" flip />
```
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(236,72,153,0.2)" colorTo="rgba(6,182,212,0.15)" />
```
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(6,182,212,0.2)" colorTo="rgba(34,197,94,0.15)" flip />
```
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(34,197,94,0.2)" colorTo="rgba(251,191,36,0.15)" />
```
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(251,191,36,0.2)" colorTo="rgba(139,92,246,0.15)" flip />
```
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(139,92,246,0.2)" colorTo="rgba(59,130,246,0.15)" />
```
— with, in the same order (all 7, in the order they appear top-to-bottom in the file):
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(201,151,74,0.2)" colorTo="rgba(226,189,133,0.15)" />
```
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(226,189,133,0.2)" colorTo="rgba(201,151,74,0.15)" flip />
```
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(201,151,74,0.2)" colorTo="rgba(226,189,133,0.15)" />
```
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(226,189,133,0.2)" colorTo="rgba(201,151,74,0.15)" flip />
```
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(201,151,74,0.2)" colorTo="rgba(226,189,133,0.15)" />
```
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(226,189,133,0.2)" colorTo="rgba(201,151,74,0.15)" flip />
```
```tsx
        <SectionDivider variant="glow" colorFrom="rgba(201,151,74,0.2)" colorTo="rgba(226,189,133,0.15)" />
```
(Each divider now alternates between the two amber tones with the existing `flip` alternation preserved, instead of sweeping through the old purple→blue→pink→cyan→green→gold rainbow.)

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`, scroll through every section boundary. Confirm: every divider's traveling comet/glow renders in amber tones, alternating direction (`flip`) as before; no visual "rainbow" transition between sections remains.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor: retheme SectionDivider color wiring to amber palette"
```

---

### Task 17: Cross-Cutting Polish & Final Verification

**Files:**
- No planned edits — this task is a verification/fix-forward pass. Modify whichever files a check below surfaces an issue in.
- Test: manual, via `npm run dev` + `npm run build`

**Interfaces:**
- Consumes: everything established in Tasks 1-16.

- [ ] **Step 1: Full lint + build pass**

Run: `npm run lint` — expect zero errors/warnings.
Run: `npm run build` — expect success, static export completes, check the build output for unexpectedly large bundle size changes (the `three`-vendor/`framer-motion`/`lucide-react` webpack `cacheGroups` split in `next.config.ts` is unmodified by this plan, so bundle composition should be roughly unchanged — flag and investigate if not).

- [ ] **Step 2: `prefers-reduced-motion` re-verification**

In browser DevTools, emulate `prefers-reduced-motion: reduce` (Rendering tab → "Emulate CSS media feature"). Reload and click through every section. Confirm: `CosmicScene` falls back to the static CSS gradient (unchanged from Task 3 — its reduced-motion branch wasn't touched); Framer Motion entrance animations are suppressed site-wide (via the existing `<MotionConfig reducedMotion="user">` wrapper in `layout.tsx`, unmodified by this plan); no motion-dependent content (e.g. count-ups, the Projects hover label from Task 9) becomes inaccessible — count-ups should still resolve to their final value even if the animated transition is suppressed.

- [ ] **Step 3: Mobile pass**

In DevTools device emulation (or a real device), load the full page. Confirm: `useIsMobile()`-gated effects (post-processing, `EnergyRibbons`/`CrystalShards`/`WarpRings`/`SkillsConstellation`/`Embers` in `CosmicScene`) still correctly disable; Testimonials' `MobileCarousel` still snap-scrolls; Navbar's mobile menu opens/closes correctly with no leftover `ThemeToggle` button.

- [ ] **Step 4: Full-page visual QA against the design spec**

Scroll top to bottom once more, checklist against `docs/superpowers/specs/2026-07-19-portfolio-redesign-design.md` §6: every section uses Fraunces for headings, Geist Sans for body, Geist Mono for labels/stats/kickers; no purple/blue/cyan/pink/rose/indigo/violet/fuchsia/sky/teal hue is visible anywhere except semantic red/yellow states (Contact's char-count warning); the Hero's `CosmicScene` moment is visibly the richest/most animated point on the page, with every other section's background reading as quiet ambient texture; no console errors anywhere in the scroll.

- [ ] **Step 5: Commit (only if Steps 1-4 surfaced fixes)**

```bash
git add -A
git commit -m "fix: address issues found in full-site redesign verification pass"
```

If no issues were found, skip this commit — Task 17 is verification-only in that case.

---

### Task 18: Copy Tightening Pass (optional, user-reviewed)

**Files:**
- Modify (candidates, pending Step 1's read): `src/components/Hero.tsx` (headline, subtitle), `src/components/About.tsx` (bio pull-quote, section intro), other section intro copy as identified in Step 1.
- Test: manual, via `npm run dev`

**Interfaces:**
- Consumes: nothing structural — this is prose-only.

Per spec §7: copy may be tightened to match the new editorial voice, but factual content (roles, dates, project details, achievement stats) must not be invented or altered, and any rewrite is subject to your review before being treated as final. This plan does not pre-write replacement copy because the current exact strings weren't read verbatim during planning — inventing plausible-sounding replacement copy without seeing the real source risks silently changing a fact (a company name, a stat, a date).

- [ ] **Step 1: Read current copy verbatim**

Read the full current text of: `Hero.tsx`'s headline/subtitle strings, `About.tsx`'s bio paragraph(s) and pull-quote candidate, and the section-intro copy (if any) in Experience/Projects/Achievements/Testimonials/Contact.

- [ ] **Step 2: Draft tightened alternatives**

For each piece of copy identified in Step 1, draft a tightened version that (a) preserves every fact exactly (names, dates, companies, stats, technologies), (b) fits the new editorial/serif-display voice (more confident, less filler), (c) is noticeably shorter or more precise than the original where the original was verbose.

- [ ] **Step 3: Present drafts for review**

Present old-vs-new copy side by side to the project owner before editing any file. Do not apply any copy change until it's approved — this step exists specifically because copy is subjective and factual accuracy must be human-verified, unlike the mechanical visual changes in Tasks 1-17.

- [ ] **Step 4: Apply approved changes**

Edit only the approved strings, in the files identified in Step 1.

- [ ] **Step 5: Verify**

Run: `npm run lint && npm run build` — expect success.
Run: `npm run dev`. Confirm: no factual claim changed (cross-check against the original strings read in Step 1); new copy renders correctly in its existing typographic treatment (no overflow/wrapping regressions from length changes).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "content: tighten copy to match editorial voice"
```
