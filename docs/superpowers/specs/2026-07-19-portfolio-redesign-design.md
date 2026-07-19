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
- **Display serif — Fraunces** (variable): Hero headline, section titles, pull-quotes. Carries the "editorial luxury" signal.
- **Body/UI sans — Geist Sans**: body copy, nav, buttons, form fields. Neutral and premium without being a generic system stack.
- **Mono accent — Geist Mono** (fallback JetBrains Mono): labels, dates, tags, stats, role-rotator text, filter pills. Reinforces engineering identity in the metadata layer.
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

- Reduce from the current 6 Three.js canvases (Hero/About/Experience/Projects/Achievements/SectionDivider) to **one mandatory signature moment: the Hero**. This is a single, precisely-lit, restrained abstract 3D piece — not a "cosmic scene with floating everything." It should look considered enough to stand as the site's visual signature.
- **Optional second moment:** a subtle WebGL shader/gradient background (much cheaper than a full R3F scene) in the Contact/Footer area as a closing visual beat. This is optional and may be cut during implementation if it doesn't earn its complexity/performance cost.
- Every other currently-3D section (About torus + orbiting cards, Experience's 3D cards, Achievements' 3D stat cards, SectionDivider) converts to 2D, with typography, layout, and motion carrying the visual weight instead.
- Existing 3D performance infrastructure (dynamic imports, `useInViewport`, scene warm-up via `markSceneWarmed`, mobile detection disabling post-processing) is preserved for whichever canvas(es) remain; it should end up doing less work overall since canvas count drops.

## 6. Section-by-Section Direction

| Section | Current | New Direction |
|---|---|---|
| Navbar | Nav + `ThemeToggle` | Thin, minimal, wordmark + nav links; `ThemeToggle` removed (single theme, component deleted or repurposed) |
| Hero | Role rotator, CTA, 3D backdrop | Serif display headline, mono role-rotator, signature 3D piece (see §5), restyled magnetic CTA |
| About | 3D torus + orbiting feature cards | Editorial bio layout: serif pull-quote + mono-labeled feature list (AI specialist, elite coder, campus leader, architect), 2D |
| Skills | Marquee + glassmorphism cards | Marquee motion kept; cards become a clean mono-labeled pill/tag grid, glass effects removed |
| Experience | 3D filterable cards | Editorial timeline/list; filter pills kept functionally; 2D cards with hover elevation via border/shadow, not 3D transform |
| Projects | 3D carousel | Premium 2D case-study list/gallery; cursor-follow "view project" label on hover; links to demos/repos preserved |
| Achievements | 3D stat cards/badges | Animated numeral counters in serif/mono, minimal flat badge icons |
| GitHub Stats | Heatmap + metrics | Layout mechanics kept; restyled to new palette (mono stats, amber-scaled heatmap) |
| Testimonials | 3D tilt/spotlight cards | Clean serif-italic quote cards, scroll-snap carousel, 2D |
| Contact | EmailJS form | Minimal underline-style form inputs; optional shader accent (§5) |
| Footer | 3D watermark | Typographic wordmark treatment replaces 3D watermark |

Filtering, linking, and data-fetching behavior in Experience/Projects/GitHub Stats/Contact is preserved as-is — only visual/motion execution changes per this table.

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
