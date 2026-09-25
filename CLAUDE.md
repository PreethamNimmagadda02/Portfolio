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
- **Plate lift reveals**: `SectionHeading` and `InViewClass` (src/components/Reveal.tsx) add `.in-view` via IntersectionObserver to drive the `.line-rise`, `.rule-draw` and `.draw-path` CSS
- **Chapter registry**: `src/lib/chapters.ts` is the single source for section ids, chapter numerals and labels. The letterhead's running chapter indicator, the Index overlay and `SectionHeading chapter="<id>"` all read it; the WebGL scene calibrates its chapter map against the same section ids at runtime (`useChapterCalibration` in `scene-store.ts`). Add or reorder a section there, not in each consumer
- **Positioning**: the site presents Preetham as an AI architect. Every figure and claim must already be on the record (experience, projects, rankings); new copy reframes, it never invents metrics
- **Buttons**: `TextButton` primary fills with gold from the foot of its frame on hover and leans a few pixels toward the mouse (its own pointer listener, off for touch, reduced motion, full-width and disabled buttons). Use it rather than styling a new CTA
- **Local time**: `useLocalTime` (src/hooks) gives Hyderabad's time as HH:MM after mount; the hero cover row and the Contact address both read it
- **Custom cursor**: `Cursor.tsx` (fine pointers only; off under reduced motion, forced colours, touch, and over text fields). Give an element `data-cursor="Word"` to have the cursor ring show that word over it. Trailing elements use `useFollowPointer` (src/hooks), which reads the shared pointer store; never add a window pointer listener
- **About** is `about/Manifesto.tsx` (the thesis pinned on a 200vh/230vh sticky track: each word rises, sharpens and lights with scroll progress, the two gold sentences catch a foil band as they ignite, a reading lamp travels the text, a I to V folio names the movement, and the signature is written in) plus `about/ArchitectureLoop.tsx` (the Perceive, Decide, Act, Adapt blueprint with evidence per stage, a ticked bezel that catches light from the signal, a pointer tilt, and an outlined stage numeral behind the panel; a lozenge ornament separates it from the thesis). Neither may sit under `.cv-auto`: containment breaks `position: sticky`, and it also makes a wrapper the containing block for `position: fixed` descendants, which is why the Projects hover preview is portalled to `document.body`
- **Avoid `useId` inside `next/dynamic` sections**: the server render carries preload siblings the client tree lacks, so generated ids mismatch on hydration. Use fixed ids for single-instance components
- **Testimonials** (desktop) set the quote against a margin column with a monogram seal, and a segmented dwell track replaces the name strip. **Contact** is two columns: the address (sticky) and a framed letter plate that turns into a sealed receipt once a message sends; errors still use the toast
- **Data is hardcoded in components** (no CMS or content collections): project data lives in `Projects.tsx`, experience in `Experience.tsx`, the architecture loop's stages in `about/ArchitectureLoop.tsx`

### Layout Structure

`src/app/layout.tsx` wraps everything with: LazyMotion + MotionConfig, PerformanceProvider, PageLoader, ScrollProgress, KonamiEasterEgg, Cursor, SmoothScroll, Navbar (letterhead + Index overlay) + main content + Footer (colophon + signature)

`src/app/page.tsx` composes all sections top-to-bottom; every section after the hero is a dynamic() import with a sized skeleton, and the single CosmicScene canvas mounts once the main thread is idle.

### Custom CSS Animations

`src/app/globals.css` holds the design tokens (`@theme inline static`), the base layer and the shared component classes (`.eyebrow`, `.line-mask`, `.line-rise`, `.rule-draw`, `.draw-path`, `.ledger`, `.foil`, `.glint`, `.grid-accordion`, `.cell-in`, `.grain`, `.breathe`, `.node-pulse`, `.scroll-cue`, `html.has-cursor`). Every animated class has a final state in the reduced-motion block at the end of the file. Check this file before adding new animation classes; there is likely an existing one. Zero em or en dashes are allowed under src (enforced by `scripts/check-copy.mjs` at prebuild).

### Deployment

- Static build outputs to `out/`
- Firebase Hosting serves from `out/` with aggressive caching (1 year for static assets, 7 days for HTML)
- CI/CD: `.github/workflows/deploy.yml`: Node 22, build with secrets, deploy to Firebase on push to main
