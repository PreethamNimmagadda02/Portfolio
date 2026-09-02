# Obsidian & Aurum Redesign: Implementation Plan

**Spec:** `docs/superpowers/specs/2026-09-02-obsidian-aurum-redesign-design.md`
**Art direction (binding detail):** `docs/superpowers/specs/2026-09-02-obsidian-aurum-art-direction.json`
**Branch:** `redesign/obsidian-aurum`

This run is orchestrated as a multi-agent workflow. Each phase below is one workflow phase; ownership is by file so parallel agents never touch the same file.

## Phase 1: Foundation (two agents in parallel, then a build gate)

Agent A (tokens, fonts, layout, shared components):
- `package.json`: add `prebuild` copy check before `fetch-loc`; keep `@phosphor-icons/react`; `lucide-react` stays until Phase 3.
- `next.config.ts`: webpack cache group `lucide` becomes `phosphor`.
- `src/app/layout.tsx`: Bodoni Moda, Geist, Geist Mono via `next/font/google`; remove `ThemeProvider` and theme init script; new metadata copy; JSON-LD `jobTitle`.
- `src/app/globals.css`: full rewrite around the spec tokens (hex, in `@theme inline`), easing tokens, sharp radius, headline mask and rule classes, eyebrow, ledger, hairline utilities, focus ring, selection, scrollbar, reduced motion, heatmap `cell-in`, grain.
- `src/lib/motion.ts`: export `EASE_HEAVY`, `EASE_SETTLE`, `DUR` constants.
- `src/components/ui/SectionHeading.tsx`, `src/components/ui/LedgerNumber.tsx`, `src/components/ui/TextButton.tsx`.
- `src/components/Reveal.tsx`: keep `InViewClass`; `SectionKicker` becomes a null-rendering stub until Phase 3 deletes it.
- `src/components/ThemeToggle.tsx`: deleted; `Navbar.tsx` loses its import and two usages (minimal edit only).
- `src/app/page.tsx`: no dividers, no `ScrollReveal`, sized skeletons, `cv-auto` on every section except Experience, hero static gold gradient before idle.
- `public/manifest.json`: colours.
- `scripts/check-copy.mjs`.

Agent B (scene):
- `src/lib/scene-store.ts`: recolour chapters, add `intensity` and `constellationOpacity`, hero and contact cameras.
- `src/components/scene/CosmicScene.tsx`: uniforms, alpha by intensity, velocity heat, ivory stars at 60% count, no shooting stars, halved additive opacities, gold reduced-motion fallback, early return when dark.
- `src/lib/skills-data.ts`: `categoryColors` on the gold ramp.

Gate: `npx eslint src`, `npx tsc --noEmit`, `npm run build`.

## Phase 2: Sections (twelve agents in parallel)

1. `Navbar.tsx`
2. `Hero.tsx` and new `PortraitPlate.tsx`
3. `About.tsx`
4. `Experience.tsx`
5. `Skills.tsx`
6. `Projects.tsx` (reads `src/data/project-shots.json`)
7. `GitHubStats.tsx` and `CodingProfiles.tsx`
8. `Achievements.tsx`
9. `Testimonials.tsx`
10. `Contact.tsx`
11. Chrome: `Footer.tsx`, `PageLoader.tsx`, `ScrollProgress.tsx`, `KonamiEasterEgg.tsx`, `NoiseBackground.tsx`
12. Assets: `public/projects/*.webp` screenshots of the live products, `src/data/project-shots.json`, new `public/og-image.png` and PWA icons if Playwright is available.

Rules for every section agent: edit only owned files (plus an optional `<Name>.module.css`), never `globals.css`, `layout.tsx`, `page.tsx` or `src/lib`; Phosphor light icons; tokens by utility class; no dashes; lint and type-check owned files; no git commands.

## Phase 3: Integration (one agent)

Delete `AvatarFlipCard.tsx`, `MagneticButton.tsx`, `InteractiveCard.tsx`, `SpotlightCursor.tsx`, `SectionDivider.tsx`, `ScrollReveal.tsx` if unused; remove the `SectionKicker` stub; `npm uninstall lucide-react`; fix cross-file errors; run every mechanical check in spec section 10.

## Phase 4: Review and fix

Four reviewers in parallel (design pre-flight, motion standards, accessibility and performance, copy and facts against `main`), then fixers grouped by file, then the mechanical checks again.

## Phase 5: Visual verification

Dev server plus Playwright screenshots at 1440x900 and 390x844 for every section, reviewed by the orchestrator, with a final fix pass if needed.
