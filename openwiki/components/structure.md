# Component Architecture & Patterns

**This page explains how components are organized, key patterns, hooks, and utilities for working with the component tree.**

---

## Component Organization

### Root Layout (`src/app/layout.tsx`)

Wraps the entire site with global context and providers:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        {/* Metadata, theme initialization script, JSON-LD */}
      </head>
      <body>
        <ThemeProvider>
          <PageLoader />           {/* Splash screen + scene warm-up */}
          <ScrollProgress />       {/* Top progress bar */}
          <KonamiEasterEgg />      {/* Hidden easter egg on Konami code */}
          <SmoothScroll />         {/* Lenis smooth scrolling */}
          <Navbar />               {/* Navigation + theme toggle */}
          {children}               {/* page.tsx content */}
          <Footer />               {/* Links, branding, 3D watermark */}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Key Providers:**
- **ThemeProvider** — Manages dark/light theme, reads from localStorage
- **PageLoader** — Orchestrates scene warm-up, displays splash screen
- **SmoothScroll** — Initializes Lenis for physics-based scroll smoothing

### Main Page (`src/app/page.tsx`)

Single page with all sections stacked vertically:

```tsx
export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <main>
      {!prefersReducedMotion && <ParticleField />}
      <NoiseBackground />
      <div className="relative z-10 flex flex-col gap-16 md:gap-40">
        <Hero />
        <ScrollReveal direction="none"><About3D /></ScrollReveal>
        <SectionDivider3D from="#8b5cf6" to="#3b82f6" accent="#a855f7" />
        <ScrollReveal direction="none"><Experience /></ScrollReveal>
        {/* ... more sections ... */}
      </div>
    </main>
  );
}
```

**Patterns:**
- All 3D sections dynamically imported with `ssr: false`
- Wrapped in `ScrollReveal` for entrance animations
- `ParticleField` skipped if `prefers-reduced-motion` is enabled (accessibility)

---

## Key Components

### Content Sections (All `"use client"`)

| Component | Type | Purpose |
|-----------|------|---------|
| `Hero.tsx` | Static | Title, role rotator, CTA buttons |
| `About3D.tsx` | 3D Canvas | Orbiting features around central torus |
| `Experience.tsx` | 3D Canvas | Filterable experience cards with 3D geometry |
| `Projects.tsx` | 3D Canvas | 3D carousel of projects with hover effects |
| `Achievements3D.tsx` | 3D Canvas | Stat badges and rankings with floating animation |
| `SkillsMarquee.tsx` | HTML/CSS | Horizontal scrolling tech stack carousel |
| `GitHubStats.tsx` | Static | Contributions heatmap and metrics |
| `Testimonials.tsx` | Static | Quote cards with tilt/spotlight hover effects |
| `Contact.tsx` | Static | EmailJS contact form |

### Utility Components

| Component | Purpose |
|-----------|---------|
| `Navbar.tsx` | Navigation menu, theme toggle, logo |
| `Footer.tsx` | Links, branding, 3D watermark |
| `PageLoader.tsx` | Splash screen, scene warm-up orchestration |
| `ScrollReveal.tsx` | Intersection observer wrapper for entrance animations |
| `ScrollProgress.tsx` | Progress bar at top of page |
| `ParticleField.tsx` | 3D background particles (fixed layer) |
| `NoiseBackground.tsx` | CSS noise texture overlay |
| `SectionDivider3D.tsx` | 3D gradient divider between sections |
| `AvatarFlipCard.tsx` | Flipping avatar card with tilt effect |
| `KonamiEasterEgg.tsx` | Hidden game triggered by Konami code |
| `MagneticButton.tsx` | Button with mouse-tracking magnet effect |
| `PageLoader.tsx` | Splash screen, scene warm-up orchestration |
| `PerformanceProvider.tsx` | Context for performance monitoring |
| `SmoothScroll.tsx` | Lenis initialization |
| `SpotlightCursor.tsx` | Spotlight effect following cursor |
| `ThemeToggle.tsx` | Theme switcher component |

### Three.js Utilities

| Component | Purpose |
|-----------|---------|
| `three/SceneEffects.tsx` | Shared Bloom + Vignette post-processing |

---

## Custom Hooks

### `useInViewport()`

**File:** `src/hooks/use-in-viewport.ts`

Tracks if an element is in viewport with margins; automatically manages ref.

```tsx
const [ref, inView] = useInViewport(rootMargin = "200px");

return (
  <div ref={ref}>
    {inView && <ExpensiveComponent />}
  </div>
);
```

**Parameters:**
- `rootMargin` — Margin around viewport (e.g., "200px" means element considered "in" 200px before/after screen)
- Returns `[RefObject, boolean]` — ref to attach to DOM, boolean for visibility

**Use Cases:**
- Lazy-mount 3D canvases
- Pause animations when off-screen
- Load images on demand

### `useRefInViewport()`

When you already have a ref, use:

```tsx
const ref = useRef<HTMLDivElement>(null);
const inView = useRefInViewport(ref, rootMargin = "200px", once = false);
```

**Parameters:**
- `ref` — Existing RefObject to observe
- `rootMargin` — Same as above
- `once` — If true, flips to true once and never changes (for mounting scenes exactly once)

**Use Cases:**
- Observe a container element you control elsewhere
- Latch mount state to prevent unmounting (e.g., scene initialization only happens once)

### `useWarmupTimer()`

Pre-warm heavy sections in background before they're visible.

```tsx
const warm = useWarmupTimer(delayMs = 2000);

const shouldMount = inView || warm; // Mount if visible OR timer fired
```

**How It Works:**
1. After `delayMs` milliseconds, state flips to `true`
2. Uses `requestIdleCallback` to avoid jank (runs in idle browser time)
3. Timeout fallback ensures it eventually runs even if browser is busy

**Use Cases:**
- Pre-initialize WebGL scenes while user reads hero (they'll be ready before scroll)
- Stagger heavy initialization (one per 1-2 seconds) to avoid simultaneous load

### `useIsMobile()`

**File:** `src/hooks/use-mobile.tsx`

Detects mobile devices and small screens.

```tsx
const isMobile = useIsMobile();

if (isMobile) {
  // Skip expensive post-processing, simplify geometry
  return <SimplifiedVersion />;
}
return <DesktopVersion />;
```

**Detection Logic:**
- Checks window width (typically < 768px)
- May check for touch capability

### `useReducedMotion()`

**File:** `src/hooks/use-reduced-motion.ts`

Respects `prefers-reduced-motion` media query (accessibility).

```tsx
const prefersReducedMotion = useReducedMotion();

return (
  <>
    {!prefersReducedMotion && <ParticleField />}
    <Content />
  </>
);
```

**When True:**
- Skip ParticleField (3D background)
- Disable enter animations
- Respect user's motion sensitivity preference

---

## Utility Functions

### `src/lib/utils.ts`

#### `cn(...inputs: ClassValue[]): string`

Safely merges Tailwind classes using clsx + tailwind-merge:

```tsx
import { cn } from "@/lib/utils";

const button = cn(
  "px-4 py-2 bg-primary text-white",
  isActive && "bg-secondary",
  className // user override
);
// Result: Tailwind-safe merged class string
```

**Why?** Prevents class conflicts (e.g., `bg-primary bg-secondary` → correct one wins).

#### `seededRandom(seed: number): () => number`

Deterministic PRNG for reproducible "random" values:

```tsx
const rand = seededRandom(42);
const x = rand() * 100; // Always 37.5 (same seed, same output)
const y = rand() * 100; // Always 81.2
```

**Why?** Ensures particle positions, starfield, etc. match between server prerender and client hydration (no FOUC).

#### Scene Warm-Up Helpers

```tsx
export const TOTAL_WARMED_SCENES = 5;

export function markSceneWarmed(name: string) {
  // Add to global window.__warmedScenes Set
  // Dispatch "scene-warmed" event
}

export function warmedSceneCount(): number {
  // Return size of window.__warmedScenes
}
```

**Used By:**
- 3D components in Canvas `onCreated` → call `markSceneWarmed()`
- PageLoader → listen for event and count ready scenes

### `src/lib/performance-monitoring.ts`

```tsx
export function usePerformanceMonitoring() {
  // Measures FCP, LCP, CLS, TTFB in development
  // Logs to console with [Perf] prefix
}
```

**Use in layout.tsx:**
```tsx
import { usePerformanceMonitoring } from "@/lib/performance-monitoring";

export default function RootLayout(...) {
  usePerformanceMonitoring();
  // ...
}
```

---

## Styling Patterns

### Tailwind CSS v4

**Configuration:** `tailwind.config.ts` (minimal, relies on defaults)

**Usage:**
```tsx
<div className="flex items-center justify-between gap-4 md:gap-8 p-4 md:p-8">
  <span className="text-sm md:text-base font-semibold text-primary">Logo</span>
</div>
```

### Custom CSS Utilities & Animations

**File:** `src/app/globals.css` (1000+ lines)

Pre-defined classes:
- `.glass-panel` — Glassmorphism with blur and border
- `.glass-card` — Card with glass effect
- `.text-gradient` — Gradient text effect
- `.glow` — Soft glow filter
- `.hover-lift` — Lift on hover
- `.scroll-smooth` — Smooth scroll behavior
- Custom `@keyframes` for animations (fade-in, float, pulse, etc.)

**Example:**
```tsx
<div className="glass-panel p-6 rounded-lg">
  <h2 className="text-gradient text-2xl font-bold">Title</h2>
</div>
```

**Check Before Adding:** Always review `globals.css` first—your animation likely exists.

### Tailwind + CSS Variables for Theming

In `globals.css`:
```css
:root[data-theme="deep-space"] {
  --color-primary: #a855f7;
  --color-secondary: #3b82f6;
}

:root[data-theme="nebula"] {
  --color-primary: #ec4899;
  --color-secondary: #06b6d4;
}

.text-primary { color: var(--color-primary); }
```

**Usage:** `<div className="text-primary bg-secondary">` automatically respects theme.

---

## Animation Patterns

### Scroll-Driven Animations (Framer Motion)

```tsx
import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  return (
    <motion.div ref={ref} style={{ y }}>
      Moves up as you scroll down
    </motion.div>
  );
}
```

### Entrance Animations (ScrollReveal)

```tsx
<ScrollReveal direction="none">
  <About3D />
</ScrollReveal>
```

Wrapper uses IntersectionObserver to trigger Framer Motion animations on entrance.

### Three.js Animation (`useFrame`)

```tsx
function AnimatedMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });
  
  return <mesh ref={meshRef}><boxGeometry /><meshStandardMaterial /></mesh>;
}
```

---

## Data Structure

### Projects (Projects.tsx)

```tsx
interface ProjectData {
  id: number;
  title: string;
  description: string;
  tags: string[];
  links: { demo: string; repo: string };
  status: string;
  featured: boolean;
  icon: any;
  color: string;
  accent: string;
  geometry: string;
}

const projects: ProjectData[] = [
  {
    id: 0,
    title: "College Central",
    description: "The Digital Backbone of IIT(ISM) Dhanbad...",
    tags: ["React", "TypeScript", "Firebase"],
    links: { demo: "https://...", repo: "https://..." },
    status: "Live",
    featured: true,
    icon: GraduationCap,
    color: "#a855f7",
    // ...
  },
  // ...
];
```

### Experience (Experience.tsx)

```tsx
interface ExperienceData {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
  type: "work" | "leadership" | "community" | "achievement" | "organization";
  skills: string[];
  highlight: string;
  color: string;
  accent: string;
  geometry: string;
}

const experiences: ExperienceData[] = [
  {
    id: 0,
    role: "Machine Learning Intern",
    company: "Matters.AI",
    period: "Mar 2026 - Present",
    description: "Forging the autonomous AI copilot...",
    type: "work",
    skills: ["Autonomous AI", "DSPM", "ML Engineering"],
    highlight: "Autonomous AI Copilot",
    color: "#ef4444",
    // ...
  },
  // ...
];
```

See [Content & Data](../content/data-structure.md) for full structure and where to edit.

---

## Common Patterns & Best Practices

### 1. All components are `"use client"`
```tsx
"use client";
// Client-side only, uses browser APIs
```

**Why?** Framer Motion, Three.js, IntersectionObserver, localStorage all need the browser.

### 2. Dynamic imports for heavy sections
```tsx
const About3D = dynamic(() => import("@/components/About3D"), {
  ssr: false,
  loading: () => <SectionSkeleton className="h-screen w-full" />,
});
```

**Why?** Keeps initial bundle small; three.js loaded on demand.

### 3. Viewport-aware rendering
```tsx
const [ref, inView] = useInViewport("200px");
return (
  <div ref={ref}>
    {inView && <Canvas>...</Canvas>}
  </div>
);
```

**Why?** Pauses render loops when off-screen, saves battery.

### 4. Scene warm-up
```tsx
const warm = useWarmupTimer(1000);
const shouldMount = inView || warm;

return (
  <div ref={containerRef}>
    {shouldMount && <Canvas onCreated={() => markSceneWarmed("about")}>...</Canvas>}
  </div>
);
```

**Why?** Initializes scenes in background while user reads hero.

### 5. Mobile adaptation
```tsx
const isMobile = useIsMobile();
if (isMobile) return <SceneEffects />; // null (skip post-processing)
```

**Why?** Low-end mobile GPUs can't handle Bloom + Vignette.

### 6. Type-safe content
```tsx
const projects: ProjectData[] = [...];
// Render with type safety
projects.map((p) => <ProjectCard key={p.id} {...p} />);
```

**Why?** All content is typed; refactoring is safe.

---

## File Organization Rules

```
src/
├── app/                  # Next.js App Router
├── components/           # React components (all "use client")
│   └── three/           # Three.js related
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
```

**Adding Files:**
- New component? → `src/components/MyComponent.tsx`
- New hook? → `src/hooks/use-my-hook.ts`
- New utility? → `src/lib/my-utils.ts`
- 3D related? → `src/components/three/MyEffect.tsx`

---

## See Also

- [Content & Data](../content/data-structure.md) — How to edit projects, experience, skills
- [Architecture Overview](../architecture/overview.md) — Tech stack, layout, deployment
- [3D System & Performance](../architecture/3d-performance.md) — Hooks for viewport, warm-up, mobile
- [Development Guide](../development.md) — Build, debug, test commands
