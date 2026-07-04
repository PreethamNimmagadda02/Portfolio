# Preetham Nimmagadda | Modern Portfolio — OpenWiki Quickstart

**Live Site:** https://preethamnimmagaddaportfolio.web.app

This is a high-performance, interactive, mobile-responsive portfolio website showcasing AI engineering and full-stack development work. The project is built with Next.js 16, React 19, Three.js for immersive 3D visuals, and Framer Motion for complex animations. It is statically exported and deployed to Firebase Hosting via GitHub Actions CI/CD.

---

## What This Repository Is

- **A personal portfolio website** that displays projects, experience, skills, achievements, and testimonials
- **A performance-optimized SPA** with dynamic code splitting, lazy canvas loading, and viewport-aware 3D rendering
- **A PWA (Progressive Web App)** installable on mobile/desktop with service worker caching and offline support
- **A template-like codebase** where content (projects, roles, experiences) is embedded in component files, not fetched from a CMS

The site is a single-page application (SPA) wrapped in Next.js App Router with server-side rendering disabled for all content sections. Every page interaction is client-side, animations are GPU-accelerated, and the entire app is installable as a native-like app.

---

## Key Business Domains

### Content Sections
- **Hero:** Above-the-fold title, role rotator, CV call-to-action
- **About:** A 3D torus with orbiting feature cards (AI specialist, elite coder, campus leader, architect)
- **Skills:** A horizontal marquee of tech stack with glassmorphism cards
- **Experience:** Filterable 3D cards showcasing work roles, leadership, community, and achievements
- **Projects:** A 3D carousel of featured work with links to demos and repos
- **Achievements:** 3D stat cards and badges for rankings (CodeChef, Codeforces, hackathons)
- **GitHub Stats:** Interactive heatmap and metrics from public GitHub profile
- **Testimonials:** 3D tilt/spotlight effects on quote cards
- **Contact:** EmailJS form for inquiries
- **Footer:** Links, branding, 3D watermark

### Technical Infrastructure
- **Performance:** Webpack vendor code splitting, lazy dynamic imports, scene warm-up coordination via `markSceneWarmed()`
- **3D System:** Three.js canvases in About, Experience, Projects, Achievements, and decorative dividers
- **Animations:** Framer Motion scroll-driven animations, parallax, and entrance transitions
- **PWA:** next-pwa with service worker for offline support and app installation
- **Styling:** Tailwind CSS v4 with 1000+ lines of custom CSS animations and glassmorphism utilities
- **Deployment:** Firebase Hosting with aggressive static asset caching (1-year) and 7-day HTML caching

---

## Quick Navigation

Start here based on your task:

- **[Architecture Overview](architecture/overview.md)** — Tech stack, Next.js setup, rendering strategy, performance patterns
- **[3D System & Performance](architecture/3d-performance.md)** — Three.js integration, viewport-aware rendering, scene warm-up, post-processing
- **[Component Architecture](components/structure.md)** — Page layout, section patterns, hooks, utilities, styling patterns
- **[Content & Data](content/data-structure.md)** — Where projects, experience, skills, achievements live; how to update them
- **[Operations & Deployment](operations/deployment.md)** — Build process, Firebase setup, GitHub Actions, PWA configuration
- **[Development Guide](development.md)** — Commands, debugging, common workflows, testing notes

---

## Getting Started

### For Developers

**Prerequisites:** Node.js 18.17+, npm/yarn/pnpm/bun

```bash
# Clone and install
git clone <repo>
cd portfolio
npm install

# Development (PWA disabled, hot reload enabled)
npm run dev
# Open http://localhost:3001

# Production build + serve
npm run build
npm start
# Output: out/ (static HTML/JS/CSS)

# Linting
npm lint
```

**Key Environment Variables (GitHub Secrets for CI/CD):**
- `NEXT_PUBLIC_SERVICE_ID` — EmailJS service ID
- `NEXT_PUBLIC_TEMPLATE_ID` — EmailJS template ID
- `NEXT_PUBLIC_PUBLIC_KEY` — EmailJS public key
- `FIREBASE_SERVICE_ACCOUNT` — Firebase service account JSON (secrets)

### For Agents / Future Code Changes

**Before making changes:**
1. Read the relevant section page from the list above
2. Understand the data structure if editing content (projects, experiences, etc.)
3. Check `src/app/globals.css` before adding new animation classes—many exist already
4. Review the performance patterns (dynamic imports, scene warm-up, viewport detection) if modifying 3D sections
5. Test on mobile if you modify components (use `useIsMobile()` hook to adjust behavior)

**When adding features:**
- Keep all content-bearing components as `"use client"` (they already are)
- Use dynamic imports for heavy sections to avoid bloating the initial bundle
- Report scene warm-up via `markSceneWarmed(name)` if adding new 3D canvases
- Use `useInViewport()` or `useRefInViewport()` for viewport-aware rendering to save power on mobile
- Prefer Tailwind + custom CSS utilities in `globals.css` over inline styles
- Follow the existing folder structure: `/src/components`, `/src/hooks`, `/src/lib`

---

## File Structure at a Glance

```
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (ThemeProvider, PageLoader, Navbar, Footer)
│   │   ├── page.tsx            # Home: composes all sections with dynamic imports
│   │   ├── globals.css         # 1000+ lines of custom animations, utilities, themes
│   │   ├── robots.ts           # SEO metadata
│   │   └── sitemap.ts          # Sitemap generation
│   ├── components/
│   │   ├── three/
│   │   │   └── SceneEffects.tsx    # Shared post-processing (Bloom, Vignette)
│   │   ├── Hero.tsx                # Above-the-fold, role rotator, CTA
│   │   ├── About3D.tsx             # 3D torus with orbiting features
│   │   ├── Experience.tsx          # 3D filterable experience cards
│   │   ├── Projects.tsx            # 3D carousel of projects
│   │   ├── Achievements3D.tsx      # 3D stat cards
│   │   ├── SkillsMarquee.tsx       # Tech stack carousel
│   │   ├── GitHubStats.tsx         # Contributions heatmap
│   │   ├── Testimonials.tsx        # Quote cards with tilt/spotlight
│   │   ├── PageLoader.tsx          # Splash screen, scene warm-up orchestration
│   │   ├── Navbar.tsx              # Navigation, theme toggle
│   │   ├── Footer.tsx              # Links, branding, 3D watermark
│   │   ├── Contact.tsx             # EmailJS form
│   │   ├── SectionDivider3D.tsx    # 3D gradient divider
│   │   ├── ParticleField.tsx       # 3D background particles
│   │   ├── ScrollReveal.tsx        # Intersection observer wrapper
│   │   ├── ThemeToggle.tsx         # Dark/light theme switch
│   │   ├── PerformanceProvider.tsx # Context for perf monitoring
│   │   └── [others]                # Utility components
│   ├── hooks/
│   │   ├── use-in-viewport.ts      # Viewport detection + scene warm-up timers
│   │   ├── use-mobile.tsx          # Mobile detection
│   │   └── use-reduced-motion.ts   # prefers-reduced-motion respects
│   └── lib/
│       ├── utils.ts                # cn() (class merging), seededRandom, scene warm-up helpers
│       └── performance-monitoring.ts # FCP, LCP, CLS, TTFB logging
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                       # Service worker
│   ├── favicon.png, og-image.png   # SEO assets
│   └── [icon, images]              # Avatar, headshots
├── .agents/
│   ├── rules/graphify.md           # Graphify knowledge graph rules
│   └── workflows/graphify.md       # Graphify workflow docs
├── .github/
│   └── workflows/deploy.yml        # CI/CD: build → Firebase deploy on main
├── next.config.ts                  # Static export, webpack vendor splitting, next-pwa
├── tsconfig.json                   # Strict TypeScript
├── tailwind.config.ts              # Tailwind CSS v4
├── firebase.json                   # Firebase hosting config (cache headers, rewrites)
├── package.json                    # Dependencies: React 19, Next.js 16, Three.js, Framer Motion, etc.
└── README.md                       # Public-facing readme
```

---

## Recent Architecture Changes

### Lazy Canvas Loading & Viewport Pre-Warming (Latest)
- **Problem:** Multiple Three.js canvases initializing in parallel causing jank
- **Solution:** 
  - Dynamic imports for all 3D sections with skeleton loaders
  - `useInViewport()` hook with configurable `rootMargin` to mount scenes before visible
  - `useWarmupTimer()` for background pre-warming while user reads hero
  - `markSceneWarmed()` + `PageLoader` orchestration: loader waits until all 5 scenes report ready or timeout elapse
  - Mobile optimization: `useIsMobile()` skips expensive post-processing

### Cinematic Post-Processing (SceneEffects)
- Shared Bloom + Vignette stack with tuned parameters
- Mobile detection: disabled entirely on mobile GPUs to preserve battery/FPS

### Webpack Vendor Code Splitting
- Isolates three.js, @react-three/* libraries into `three-vendor.js` for long-term caching
- Framer Motion and Lucide icons split separately
- Ensures initial bundle focuses on Hero (React, Tailwind, Framer only)

### Hydration Mismatch Prevention
- `seededRandom()`: Deterministic PRNG instead of Math.random() for starfields, particle layouts
- Applies to PageLoader stars and ParticleField

---

## Common Tasks

### Update Portfolio Content
See [Content & Data Structure](content/data-structure.md) for detailed instructions on editing:
- Projects (add/remove, change links/tags)
- Experience (roles, company, period, description, skills)
- Skills list in SkillsMarquee
- Achievements and statistics
- Testimonials

### Optimize 3D Performance
See [3D System & Performance](architecture/3d-performance.md) for:
- Adjusting post-processing parameters (bloom intensity, vignette darkness)
- Tuning viewport warm-up delays
- Adding mobile-specific geometry simplification
- Profiling with Chrome DevTools (Performance, Rendering tabs)

### Add New Section
See [Component Architecture](components/structure.md) for:
- Creating a new 3D canvas component
- Integrating with PageLoader scene warm-up
- Using viewport-aware rendering
- Applying consistent animations and theming

### Deploy Changes
See [Operations & Deployment](operations/deployment.md) for:
- Pushing to main branch → GitHub Actions triggers build
- Firebase deployment details and debugging
- Cache invalidation strategies
- Testing production builds locally

---

## Key Takeaways

1. **Everything is client-side.** No server-side rendering of content; Next.js is used for SSG metadata and static export only.
2. **Performance is obsessed over.** Dynamic imports, lazy canvas mounting, viewport detection, seeded randomness, and scene warm-up orchestration keep the initial load sub-3s on decent networks.
3. **Content lives in components.** Projects, experience, skills, and achievements are arrays hardcoded in the respective `.tsx` files—no API calls or CMS.
4. **3D is pervasive but optional.** Six different Three.js canvases, post-processing, and custom shaders everywhere; mobile detection and reduced-motion support ensure accessibility.
5. **Animations are heavy.** Framer Motion, custom CSS keyframes, and Tailwind utilities power scroll-driven parallax, tilt effects, and entrance animations.
6. **It's a PWA.** Service worker and offline support via next-pwa; installable on home screen with custom icons and splash screen.

---

## Questions or Issues?

- For architecture/design decisions, see the section pages linked above
- For git history on a specific file, check `git log --follow -- <file>` (latest commits show performance optimization efforts)
- For component examples, read the corresponding section page and review the source file directly (all are client-side and well-commented)
- To understand data flow, start in `src/app/page.tsx` and trace the component tree downward

---

**Last updated:** See openwiki/.last-update.json for git revision and timestamp.

**OpenWiki:** This documentation is maintained by OpenWiki and updated when significant architectural changes land. The wiki is the source of truth for understanding the codebase.
