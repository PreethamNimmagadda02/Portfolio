# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## OpenWiki

This repository has documentation located in the /openwiki directory.

Start here:
- [OpenWiki quickstart](openwiki/quickstart.md)

OpenWiki includes repository overview, architecture notes, workflows, domain concepts, operations, integrations, testing guidance, and source maps.

When working in this repository, read the OpenWiki quickstart first, then follow its links to the relevant architecture, workflow, domain, operation, and testing notes.

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
- **Framer Motion** for component animations (imported only through `@/lib/motion`)
- **Three.js + React Three Fiber** for the single fixed background canvas (`src/components/scene/CosmicScene.tsx`)
- **Bodoni Moda, Geist and Geist Mono** via `next/font/google` (display, body, numerals)
- **Phosphor Icons** (`@phosphor-icons/react`, always `weight="light"`); lucide-react is removed
- **Lenis** for smooth scrolling
- **EmailJS** for contact form (env vars: `NEXT_PUBLIC_SERVICE_ID`, `NEXT_PUBLIC_TEMPLATE_ID`, `NEXT_PUBLIC_PUBLIC_KEY`)
- **next-pwa** for service worker / offline support

### Key Patterns

- **All components are client-side** (`"use client"`) due to heavy interactivity
- **Three.js components are dynamically imported** with `ssr: false` in `page.tsx` to avoid server-side rendering issues
- **Path alias**: `@/*` maps to `src/*`
- **Utility function**: `cn()` in `src/lib/utils.ts` merges Tailwind classes via clsx + tailwind-merge
- **Theming**: single committed dark theme (Obsidian & Aurum tokens in globals.css @theme inline); no toggle
- **Plate lift reveals**: `SectionHeading` and `InViewClass` (src/components/Reveal.tsx) add `.in-view` via IntersectionObserver to drive the `.line-rise` and `.rule-draw` CSS
- **Data is hardcoded in components** (no CMS or content collections): project data lives in `Projects.tsx`, experience in `Experience.tsx`

### Layout Structure

`src/app/layout.tsx` wraps everything with: LazyMotion + MotionConfig, PerformanceProvider, PageLoader, ScrollProgress, KonamiEasterEgg, SmoothScroll, Navbar + main content + Footer

`src/app/page.tsx` composes all sections top-to-bottom; every section after the hero is a dynamic() import with a sized skeleton, and the single CosmicScene canvas mounts once the main thread is idle.

### Custom CSS Animations

`src/app/globals.css` holds the design tokens (`@theme inline static`), the base layer and the shared component classes (`.eyebrow`, `.line-mask`, `.line-rise`, `.rule-draw`, `.ledger`, `.grid-accordion`, `.cell-in`, `.grain`, `.breathe`). Check this file before adding new animation classes; there is likely an existing one. Zero em or en dashes are allowed under src (enforced by `scripts/check-copy.mjs` at prebuild).

### Deployment

- Static build outputs to `out/`
- Firebase Hosting serves from `out/` with aggressive caching (1 year for static assets, 7 days for HTML)
- CI/CD: `.github/workflows/deploy.yml`: Node 22, build with secrets, deploy to Firebase on push to main
