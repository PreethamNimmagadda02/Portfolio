# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3001
npm run build        # Static export to out/ directory
npm run lint         # ESLint (flat config, Next.js rules)
```

No test framework is configured.

## Architecture

**Next.js 16 App Router** portfolio site, statically exported (`output: "export"`) and deployed to **Firebase Hosting** via GitHub Actions on push to `main`.

### Tech Stack
- **React 19 + TypeScript** with strict mode
- **Tailwind CSS 4** (PostCSS plugin, not legacy config file)
- **Framer Motion** for component animations
- **Three.js + React Three Fiber** for 3D visuals (About, Projects, Achievements, ParticleField, SectionDivider)
- **Lenis** for smooth scrolling
- **EmailJS** for contact form (env vars: `NEXT_PUBLIC_SERVICE_ID`, `NEXT_PUBLIC_TEMPLATE_ID`, `NEXT_PUBLIC_PUBLIC_KEY`)
- **next-pwa** for service worker / offline support

### Key Patterns

- **All components are client-side** (`"use client"`) due to heavy interactivity
- **Three.js components are dynamically imported** with `ssr: false` in `page.tsx` to avoid server-side rendering issues
- **Path alias**: `@/*` maps to `src/*`
- **Utility function**: `cn()` in `src/lib/utils.ts` merges Tailwind classes via clsx + tailwind-merge
- **Theming**: Two themes (deep-space, nebula) managed via React Context in the root layout, with CSS variable overrides in `globals.css`
- **ScrollReveal wrapper**: Sections use intersection observer for entrance animations
- **Data is hardcoded in components** (no CMS or content collections) — project data lives in `Projects.tsx`, experience in `Experience.tsx`, roles in `Hero.tsx`

### Layout Structure

`src/app/layout.tsx` wraps everything with: ThemeProvider → PageLoader → ScrollProgress → KonamiEasterEgg → SmoothScroll → Navbar + content + Footer

`src/app/page.tsx` composes all sections top-to-bottom, each wrapped in ScrollReveal with ParallaxLayer.

### Custom CSS Animations

`src/app/globals.css` contains 1000+ lines of custom `@keyframes` and utility classes (`.glass-panel`, `.text-gradient`, `.glow`, `.glass-card`, `.hover-lift`). Check this file before adding new animation classes — there's likely an existing one.

### Deployment

- Static build outputs to `out/`
- Firebase Hosting serves from `out/` with aggressive caching (1 year for static assets, 7 days for HTML)
- CI/CD: `.github/workflows/deploy.yml` — Node 22, build with secrets, deploy to Firebase on push to main
