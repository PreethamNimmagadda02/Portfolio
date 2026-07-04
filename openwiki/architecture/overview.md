# Architecture Overview

**This page explains the technology stack, rendering strategy, and high-level design of the portfolio.**

---

## Tech Stack

| Layer | Tech | Version | Purpose |
|-------|------|---------|---------|
| **Framework** | Next.js | 16.0.4 | App Router, static SSG metadata |
| **Runtime** | React | 19.2.0 | UI component tree, hooks |
| **Language** | TypeScript | 5 | Type safety, DX |
| **Styling** | Tailwind CSS | 4 | Utility-first CSS, dark mode |
| **CSS Animations** | Custom @keyframes | — | 1000+ lines in globals.css |
| **Component Animations** | Framer Motion | 12.23.24 | Scroll-driven, entrance, interactions |
| **3D Graphics** | Three.js | 0.181.2 | WebGL scenes (About, Experience, Projects, Achievements) |
| **3D React Binding** | @react-three/fiber | 9.4.2 | React-like component API for Three.js |
| **3D Utils** | @react-three/drei | 10.7.7 | Helpers (OrbitControls, Environment, Float, etc.) |
| **3D Post-Processing** | @react-three/postprocessing | 3.0.4 | Bloom, Vignette effects |
| **Smooth Scrolling** | Lenis | 1.3.17 | Physics-based scroll smoothing |
| **Icons** | Lucide React | 0.554.0 | SVG icons (60+ used) |
| **Form Service** | EmailJS | 4.4.1 | Client-side email (Contact form) |
| **PWA** | next-pwa | 5.6.0 | Service worker, offline, installable |
| **Hosting** | Firebase Hosting | — | Static serving, global CDN, 1-year asset caching |
| **CI/CD** | GitHub Actions | — | Build on push to main, deploy to Firebase |
| **Class Merging** | clsx + tailwind-merge | 2.1.1, 3.4.0 | Safe Tailwind class composition |

### Key Constraints & Decisions

- **Static Export (`output: "export"`):** No server-side rendering of content. Next.js generates static HTML/CSS/JS only.
- **Client-Side Only:** All content components use `"use client"` directive due to Framer Motion, Three.js, and browser APIs (IntersectionObserver, performance metrics).
- **Single Page App (SPA):** No dynamic routes. The entire portfolio is one `page.tsx` with sections stacked vertically.
- **No Database / CMS:** Content (projects, experience, skills, achievements) is hardcoded as TypeScript arrays/objects in component files.
- **Webpack Vendor Splitting:** Three.js, Framer Motion, and Lucide icons are split into separate long-lived chunks for cache efficiency.

---

## Rendering Strategy

### Server-Side Rendering (SSG Metadata Only)

Next.js generates metadata for SEO in `layout.tsx`:
- OpenGraph tags for social media previews
- Twitter card metadata
- JSON-LD structured data (Person schema)
- Sitemap and robots.txt

**No content HTML is pre-rendered.** The page renders completely on the client after hydration.

### Client-Side Hydration & Rendering

1. **Initial Load:**
   - Browser requests `index.html` from Firebase Hosting
   - HTML contains metadata, no content
   - Inline script (`themeInitScript`) applies saved theme before paint (prevent FOUC)
   - Main `<div id="__next">` is populated during React hydration

2. **Hydration:**
   - React mounts the component tree from `layout.tsx` → `page.tsx`
   - `ThemeProvider` reads theme from localStorage
   - `PageLoader` splash screen appears
   - **Scene Warm-Up Coordination:** PageLoader waits until 5 heavy 3D sections report ready via `markSceneWarmed()`, or timeout (5s) elapse
   - All sections are dynamically imported with skeleton loaders; they mount immediately but render nothing until the canvas is ready

3. **Interactivity:**
   - Once loader dismisses, user sees Hero section
   - Scroll events trigger Framer Motion animations, viewport detection, and section reveals
   - 3D canvases pre-warm in the background while user reads above-fold content
   - Below-fold 3D sections are lazy-mounted based on viewport proximity or warm-up timers

### Bundle Splitting

**Initial Payload (includes Hero, Contact, metadata):**
- React Runtime + Next.js
- Tailwind CSS (atomic utilities)
- Framer Motion (animation primitives)

**Lazy-Loaded Chunks:**
- **three-vendor.js** (three.js + @react-three/fiber + @react-three/drei)
- **framer-motion.js** (if not already in main)
- **lucide-icons.js** (Lucide icon library)
- **Per-section chunks** (About3D, Projects, Experience, Achievements, etc.)

See `next.config.ts` webpack config for details.

---

## Layout & Component Hierarchy

```
layout.tsx
├── ThemeProvider
├── PageLoader (splash screen + scene warm-up orchestration)
├── ScrollProgress (progress bar at top)
├── KonamiEasterEgg (hidden easter egg)
├── SmoothScroll (Lenis initialization)
├── Navbar
├── page.tsx content
│   ├── ParticleField (3D background, fixed)
│   ├── NoiseBackground (CSS noise texture)
│   ├── Hero
│   ├── ScrollReveal + About3D (dynamic import, ssr: false)
│   ├── SectionDivider3D (dynamic import, ssr: false)
│   ├── ScrollReveal + Experience (dynamic import, ssr: false)
│   ├── SectionDivider3D
│   ├── ScrollReveal + Projects (dynamic import, ssr: false)
│   ├── SectionDivider3D
│   ├── ScrollReveal + SkillsMarquee (dynamic import, ssr: false)
│   ├── ScrollReveal + Achievements3D (dynamic import, ssr: false)
│   ├── ScrollReveal + GitHubStats (dynamic import, ssr: false)
│   ├── ScrollReveal + Testimonials (dynamic import, ssr: false)
│   └── Contact
├── Footer
└── (End of page.tsx)
```

**Key Patterns:**
- `ScrollReveal` wraps sections for entrance animations + intersection observer
- `dynamic()` imports all heavy sections with `ssr: false`
- Loading placeholders (skeleton divs) prevent layout shift while chunks download
- Content flows top to bottom; no client-side routing

---

## Theming

### Theme System

Two themes stored in `globals.css` as CSS variable oversets:

- **deep-space** (default): Purples, deep blues, dark grays
- **nebula**: Brighter neons, blues, pinks

### Theme Toggle Mechanism

1. `ThemeToggle.tsx` renders a button to switch themes
2. Theme is saved to `localStorage['portfolio-theme']`
3. Root `<html>` element gets `data-theme="deep-space"` or `data-theme="nebula"` attribute
4. CSS variables (`--color-primary`, `--color-secondary`, etc.) are overridden per theme
5. Components use Tailwind utilities like `text-primary`, `bg-secondary` that reference CSS variables

### FOUC Prevention

Inline script in `layout.tsx` runs before React paints:
```javascript
(function(){
  try {
    var t = localStorage.getItem('portfolio-theme');
    if(t === 'nebula' || t === 'deep-space') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch(e) {}
})();
```

This ensures the correct theme is applied before the first paint, preventing a flash of unstyled content.

---

## Performance Philosophy

### Goals
1. **Hero-to-interactive in <1.5s** (LCP on decent networks)
2. **3D sections warm while user reads** (no jank when scrolling into view)
3. **Mobile-first:** Detect capability; skip heavy post-processing on mobile
4. **Cache-friendly:** Static assets cached 1 year; HTML cached 7 days

### Strategies
- **Code Splitting:** Separate vendor chunks (three.js, framer-motion) for long-term caching
- **Lazy Imports:** 3D sections loaded on demand
- **Viewport Detection:** `useInViewport()` pauses render loops when off-screen
- **Warm-Up Timers:** `useWarmupTimer()` pre-initializes scenes in background
- **Scene Orchestration:** `markSceneWarmed()` + `PageLoader` synchronizes splash screen with WebGL initialization
- **Mobile Adaptation:** `useIsMobile()` disables expensive post-processing and geometry on mobile GPUs
- **Seeded Randomness:** `seededRandom()` ensures particle positions match between server prerender and client hydration (no FOUC)

See [3D System & Performance](3d-performance.md) for detailed performance patterns.

---

## Deployment Architecture

### Build Process
```bash
npm run build
```
- Next.js compiles TypeScript → JSX
- Webpack bundles with vendor code splitting
- Static HTML, CSS, and JS exported to `out/` directory
- next-pwa generates service worker and manifest

### Hosting (Firebase Hosting)

**Configuration:** `firebase.json`

```json
{
  "hosting": {
    "public": "out",
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]
      },
      {
        "source": "**/*.html",
        "headers": [{"key": "Cache-Control", "value": "public, max-age=604800"}]
      }
    ],
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  }
}
```

**Key Points:**
- All JS/CSS/images/fonts cached for **1 year** (immutable hash in filename)
- HTML cached for **7 days** (allows updates every week)
- SPA rewrite: all routes → `/index.html` (client-side routing via React)

### CI/CD (GitHub Actions)

**File:** `.github/workflows/deploy.yml`

```yaml
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm install
      - run: npm run build
        env:
          NEXT_PUBLIC_SERVICE_ID: ${{ secrets.NEXT_PUBLIC_SERVICE_ID }}
          NEXT_PUBLIC_TEMPLATE_ID: ${{ secrets.NEXT_PUBLIC_TEMPLATE_ID }}
          NEXT_PUBLIC_PUBLIC_KEY: ${{ secrets.NEXT_PUBLIC_PUBLIC_KEY }}
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: preethamnimmagaddaportfolio
          channelId: live
```

**Workflow:**
1. Commit to `main` branch
2. GitHub Actions checks out code
3. Installs dependencies (`npm install`)
4. Builds with secrets injected (`npm run build`)
5. Deploys `out/` to Firebase Hosting via service account
6. Site live at https://preethamnimmagaddaportfolio.web.app

**Secrets Required:**
- `NEXT_PUBLIC_SERVICE_ID`, `NEXT_PUBLIC_TEMPLATE_ID`, `NEXT_PUBLIC_PUBLIC_KEY` (EmailJS)
- `FIREBASE_SERVICE_ACCOUNT` (JSON key for Firebase service account)
- `GITHUB_TOKEN` (auto-provided by GitHub)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout, theme provider, page loader |
| `src/app/page.tsx` | Main page, section composition, dynamic imports |
| `src/app/globals.css` | 1000+ lines of custom animations, utilities, theme CSS variables |
| `next.config.ts` | Static export, webpack vendor splitting, next-pwa config |
| `firebase.json` | Hosting rules, cache headers, SPA rewrite |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `public/sw.js` | Service worker (auto-generated by next-pwa) |
| `public/manifest.json` | PWA manifest (app icons, splash screens, display mode) |

---

## See Also

- [3D System & Performance](3d-performance.md) — How Three.js is integrated, scene warm-up, viewport-aware rendering
- [Component Architecture](../components/structure.md) — How components are organized, hooks, utilities
- [Operations & Deployment](../operations/deployment.md) — How to build, deploy, and troubleshoot
