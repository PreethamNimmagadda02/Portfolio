# Portfolio Redesign — Design Spec

**Date:** 2026-07-19
**Status:** Approved for planning

## 1. Motivation

The current portfolio (Next.js 16 + Three.js + Framer Motion, statically exported to Firebase) uses a recipe — 3D canvas per section, glassmorphism cards, particle fields, bloom/vignette post-processing — that has become a common "AI-generated portfolio" template look. The goal of this redesign is to make the site read as premium and distinctive, and to let the craft of the site itself double as proof of technical/design skill, without losing what already works (content, section lineup, PWA, performance discipline).

## 2. Scope

- **In scope:** visual design system (typography, color, spacing, motion), the implementation of every existing section, the 3D strategy, and light copy tightening.
- **Out of scope:** section lineup/restructuring (all current sections stay: Hero, About, Skills, Experience, Projects, Achievements, GitHub Stats, Testimonials, Contact, Footer, Navbar), infrastructure/stack changes (Next.js, Tailwind 4, Framer Motion, React Three Fiber, Firebase, next-pwa, EmailJS all stay), factual content changes (roles, dates, project facts stay accurate to reality — only prose framing may tighten).

## 3. Direction

Editorial-first: typography, whitespace, and motion craft become the primary premium signal, replacing "pervasive 3D + glassmorphism" as the differentiator. 3D is demoted from a per-section device to a small number of deliberate, high-craft moments. The site commits to a single, meticulously art-directed dark theme rather than a light/dark or deep-space/nebula toggle — consistency reads as more intentional than optionality.

## 4. Design System Foundation

### Typography
- **Display serif — Fraunces** (variable): Hero headline, section titles, pull-quotes. Carries the "editorial luxury" signal. Replaces the current `Space_Grotesk` display font (`--font-space-grotesk`, loaded via `next/font/google` in `src/app/layout.tsx`).
- **Body/UI sans — Geist Sans**: body copy, nav, buttons, form fields. Neutral and premium without being a generic system stack. Replaces the current `Inter` body font (`--font-inter`, same loading mechanism).
- **Mono accent — Geist Mono** (fallback JetBrains Mono): labels, dates, tags, stats, role-rotator text, filter pills. Reinforces engineering identity in the metadata layer. New addition — no mono font currently loaded.
- All three load via `next/font/google` (same mechanism already in use), keeping the CSS variable pattern (`--font-*`) the codebase already follows.
- Type scale: a deliberate modular scale (ratio ~1.25–1.333) with generous line-height on serif headlines; no default browser/Tailwind type scale left unstyled.

### Color
- Single dark theme (replacing deep-space/nebula toggle). Near-black background (not pure `#000`), warm off-white primary text.
- One accent: warm brass/amber, used sparingly (CTAs, active states, key numerals, hover accents) — deliberately not the cyan/electric-blue common to AI/dev portfolios.
- Glassmorphism, heavy gradients, and bloom/vignette post-processing are retired as a default; flat surfaces, hairline borders (1px, low-opacity), and precise shadow work replace them everywhere except the Hero's signature 3D moment.
- Exact hex values, opacity tokens, and Tailwind theme config are implementation-plan-level detail, not fixed in this spec.

### Spacing & Layout
- Wider max-width editorial containers, generous whitespace, consistent vertical rhythm on an 8px base unit.
- Asymmetric, left-aligned grids replace the current centered-card-per-section pattern where it serves the content (e.g. About, Experience, Projects); symmetric/centered layout is kept where it genuinely fits (e.g. Contact form).

### Motion
- Restrained spring/cubic-bezier easing; no bounce or playful overshoot.
- Scroll reveals: subtle fade + slight upward translate, tight stagger between related elements (replacing today's heavier entrance animations).
- Magnetic buttons and cursor-follow interactions are kept but restyled to match the new visual language.
- `prefers-reduced-motion` support (existing `use-reduced-motion` hook) is carried forward unchanged and re-verified against every new animation.

## 5. 3D Strategy

**Correction vs. original assumption:** CLAUDE.md/openwiki describe a stale architecture (6 per-section canvases). The actual current implementation (verified against source) already consolidated to **one persistent WebGL background**, `src/components/scene/CosmicScene.tsx`, mounted once at the page level and running continuously behind all sections. It's chapter-driven: `src/lib/scene-store.ts` maps scroll progress to 9 chapters (hero/about/experience/skills/projects/activity/achievements/testimonials/contact), each with its own color/camera/focus targets that the scene lerps toward. About/Experience/Achievements/Testimonials are already 2D (Framer Motion + CSS), not 3D — the openwiki descriptions of "3D torus," "3D filterable cards," "3D stat cards," "3D tilt" are inaccurate for the current code.

Given this, the 3D strategy is **recomposition, not migration**:
- Keep the single persistent `CosmicScene` canvas (remounting a fresh canvas per section would be a performance regression vs. today, and the existing warm-up/adaptive-quality/visibility-pause infrastructure is sound). Do not reintroduce per-section canvases.
- Recolor the scene's chapter palette (`SCENE_CHAPTERS` in `scene-store.ts`) from the current iris/cyan/rose "cosmic" palette to the new near-black/warm-amber tokens.
- Change its *prominence* per chapter so it reads as one signature moment rather than a pervasive backdrop: full presence/complexity during the **hero** chapter (this is the mandatory signature moment), then recede to a much lower-opacity, simplified ambient presence for every other chapter (fewer active shader layers, lower particle/star density, minimal camera movement) so it never competes with the editorial content sections.
- Drop or simplify shader layers that don't earn their cost under the new restrained aesthetic (e.g. `EnergyRibbons`, `CrystalShards`, `WarpRings` are candidates to cut or reserve for the hero chapter only) — exact cuts are an implementation-plan-level decision made against the existing `CosmicScene.tsx` structure.
- `AvatarFlipCard.tsx`'s flip is CSS 3D (`rotateY`/`preserve-3d`), not WebGL — it's cheap and can be restyled to the new palette rather than removed.
- **Optional second moment:** if the hero-only presence isn't sufficient, a lower-cost shader accent in Contact/Footer using the same `CosmicScene` infrastructure (a dedicated chapter) is acceptable — optional, cut if it doesn't earn its cost.
- Existing performance infrastructure (`markSceneWarmed`, `useIdle`-gated mount, `AdaptiveQuality`, `frameloop` pause on hidden tab, reduced-motion static fallback) is preserved unchanged.

## 6. Section-by-Section Direction

Corrected against actual current implementation (see §5 note) — most sections are already 2D; the work is retheming/simplifying their existing Framer Motion + CSS execution to the new typography/color/spacing system and reducing glass/glow noise, not migrating away from 3D.

| Section | Current (verified) | New Direction |
|---|---|---|
| Navbar | Framer Motion + hand-rolled tilt/spotlight, hardcoded non-theme-reactive purple/blue gradients, renders `ThemeToggle` x2 | Thin, minimal, wordmark + nav links, restyled to new tokens; `ThemeToggle` and its `ThemeProvider`/`ThemeContext` (both defined in `ThemeToggle.tsx`) removed entirely; single-theme CSS vars hardcoded into `:root` |
| Hero | `.text-display` (Space Grotesk) headline, Inter body, persistent `CosmicScene` background at full prominence | Fraunces serif headline, Geist Mono role-rotator, `CosmicScene`'s hero chapter is the signature 3D moment (see §5), restyled magnetic CTA |
| About | 2D Framer Motion feature cards (`InteractiveCard`, `.card-hairline`) + CSS-3D `AvatarFlipCard` | Retheme to editorial layout: serif pull-quote + mono-labeled feature list; `AvatarFlipCard` restyled to new palette, kept |
| Skills | Marquee + `.card-hairline` chips, cross-linked to `CosmicScene`'s `SkillsConstellation` via `scene-store.ts` filter state | Marquee motion and the constellation cross-link kept; chip styling becomes a clean mono-labeled pill/tag grid; `CosmicScene` constellation recolored per §5 |
| Experience | 2D Framer Motion `whileInView` timeline, `InteractiveCard` tilt, scroll-drawn gradient rail | Retheme to editorial timeline/list; filter pills kept functionally; rail and hover elevation restyled to new tokens |
| Projects | 2D alternating rows, Framer Motion `whileInView`, `MagneticButton` CTAs | Retheme to premium case-study list; cursor-follow "view project" label added on hover; links to demos/repos preserved |
| Achievements | 2D Framer Motion cards, manual rAF count-up, `.stat-flare` | Retheme: animated numeral counters in serif/mono, minimal flat badge icons, `.stat-flare` restyled to amber |
| GitHub Stats | Live-fetched heatmap/stats, hardcoded non-theme-reactive purple `cellColors`/`LANG_COLORS` | Layout and fetch logic kept; restyled to new palette (mono stats, amber-scaled heatmap) |
| Testimonials | Marquee rows + mobile carousel, hover glow; **dead code:** `animate-float-particle`/`drift-a`/`drift-b` referenced but never defined | Retheme to serif-italic quote cards; dead animation references removed or intentionally implemented as part of this task (not left dangling) |
| Contact | EmailJS form, floating-label inputs, `.conic-border` focus ring | Retheme to minimal underline-style inputs; optional shader accent (§5) |
| Footer | Framer Motion watermark parallax + `.animate-shimmer` | Retheme to typographic wordmark treatment, same parallax mechanic |

Filtering, linking, live data-fetching, and cross-component state (e.g. Skills↔CosmicScene constellation linking) are preserved as-is — only visual/motion/typography execution changes per this table.

## 7. Content & Copy

Factual content (roles, companies, dates, project details, achievement stats) stays accurate to reality and is not invented or altered. Prose framing (Hero headline, section intros, bio pull-quote) may be tightened or rewritten to match the new editorial voice, subject to your review before being treated as final.

## 8. Accessibility & Performance

- `prefers-reduced-motion` handling is preserved and re-checked for every new animation/transition introduced.
- Mobile behavior (via `useIsMobile`) continues to disable expensive effects (post-processing, and now the reduced 3D surface area besides).
- Static export, Firebase Hosting, PWA/service worker, and CI/CD deployment are unaffected — this is a component/styling-layer change only.

## 9. Rollout Plan

Single spec, phased implementation plan with review checkpoints between phases:

0. **Foundation** — design tokens: typography, color, spacing scale, motion primitives in `globals.css`/Tailwind config; remove theme toggle/deep-space/nebula theming.
1. **Navbar + Hero** — first impression, including the signature 3D piece.
2. **About + Skills**
3. **Experience + Projects**
4. **Achievements + GitHub Stats + Testimonials**
5. **Contact + Footer + PageLoader**
6. **Cross-cutting polish pass** — accessibility (`prefers-reduced-motion`, contrast), performance re-verification (fewer canvases should only help), and visual consistency sweep across all sections.

Phase ordering and task breakdown within each phase are the responsibility of the implementation plan (via `writing-plans`), not this spec.
