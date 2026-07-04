# 3D System & Performance Patterns

**This page explains how Three.js is integrated, how viewport-aware rendering and scene warm-up work, and performance optimization strategies.**

---

## Three.js Integration

### Canvases in the Portfolio

Six Three.js `<Canvas>` elements are used across the site:

| Component | Purpose | Features |
|-----------|---------|----------|
| `ParticleField.tsx` | Animated background (fixed, behind all content) | Floating particles, scroll-responsive, expensive |
| `About3D.tsx` | Central torus with orbiting feature cards | MeshTransmissionMaterial, multiple meshes |
| `Experience.tsx` | 3D cards with rotation and lighting | Geometry-based shapes (crystal, prism, nexus) |
| `Projects.tsx` | 3D carousel of project geometries | Interactive tilt, hover effects |
| `Achievements3D.tsx` | 3D stat badges with floating animation | Multiple meshes, badges, glow effects |
| `SectionDivider3D.tsx` | Gradient divider between sections | Animated plane with shader gradient |

### React Three Fiber (@react-three/fiber)

**Why?** Simplifies Three.js usage within React:
- Component-like API for meshes, materials, lights
- Hooks for animation (`useFrame`) and interaction
- Automatic cleanup, three instance management
- Canvas element handles WebGL context

**Example (simplified About3D pattern):**
```tsx
<Canvas>
  <Suspense fallback={null}>
    <Environment preset="studio" />
    <SceneEffects />
    <Float>
      <mesh>
        <torusGeometry args={[2, 0.5, 64, 100]} />
        <MeshTransmissionMaterial {...props} />
      </mesh>
    </Float>
  </Suspense>
</Canvas>
```

### Key Libraries

- **@react-three/drei:** Helpers (Environment, OrbitControls, Float, Sparkles, Stars, Html, ContactShadows, etc.)
- **@react-three/postprocessing:** Post-processing pipeline (Bloom, Vignette for cinematic effects)
- **three.js:** Direct access to geometry, materials, lights, shaders

---

## Viewport-Aware Rendering

### Problem
Multiple Three.js canvases rendering simultaneously = jank, battery drain, heat on mobile.

### Solution: `useInViewport()` Hook

**File:** `src/hooks/use-in-viewport.ts`

```tsx
// Creates a ref and tracks visibility
const [ref, inView] = useInViewport(rootMargin = "200px");

return (
  <div ref={ref}>
    {inView && <Canvas>...</Canvas>}
  </div>
);
```

**How It Works:**
1. `IntersectionObserver` monitors if element enters viewport
2. `rootMargin: "200px"` means the element is considered "in view" when 200px away (above or below)
3. Pauses expensive work (render loops, animation updates) when `inView === false`
4. Resumes immediately when element approaches viewport

**Why the margin?**
- Gives the Three.js scene time to initialize (shader compilation, HDR fetch) before user scrolls to it
- Prevents jank when user actually enters the section
- Default 200px on desktop; could be reduced on mobile for faster initial load

### Related: `useRefInViewport()`

When you already have a ref to an element, use:
```tsx
const inView = useRefInViewport(ref, rootMargin = "200px", once = false);
```

**`once: true`** option: Element is considered "in view" exactly once (flips to true forever). Use for canvas mounting to ensure the scene initializes only once, not repeatedly on scroll.

---

## Scene Warm-Up Coordination

### Problem
All 3D sections initialize their WebGL canvases at the same time (on hydration), causing:
- Massive GPU load
- Shader compilation stalls
- Janky page paint
- User sees blank sections

### Solution: Staggered Pre-Warming

**Architecture:**

1. **PageLoader (orchestrator):**
   - Renders splash screen on mount
   - Listens for `"scene-warmed"` events from components
   - Also tracks `window.__warmedScenes` Set to count ready scenes
   - Dismisses loader when either:
     - All 5 scenes report ready (`warmedSceneCount() >= TOTAL_WARMED_SCENES`), **or**
     - 5-second timeout elapses (fallback for slow devices)
   - Holds for minimum 1.5 seconds (branding visibility)

2. **Each 3D Component (e.g., About3D):**
   ```tsx
   const [containerRef, inView] = useInViewport("200px");
   const warm = useWarmupTimer(1000); // Pre-warm after 1s
   
   const shouldMount = inView || warm; // Mount if near viewport OR timer fires
   
   return (
     <div ref={containerRef}>
       {shouldMount && (
         <Canvas onCreated={() => markSceneWarmed("about")}>
           ...
         </Canvas>
       )}
     </div>
   );
   ```

3. **`markSceneWarmed(name)`:**
   ```tsx
   // Called in Canvas onCreated callback
   export function markSceneWarmed(name: string) {
     const w = window as WarmedWindow;
     if (!w.__warmedScenes) w.__warmedScenes = new Set();
     w.__warmedScenes.add(name);
     window.dispatchEvent(new Event("scene-warmed"));
   }
   ```

### Warm-Up Timeline

```
t=0ms    Page loads, PageLoader appears
t=0-1000ms About, Experience, Projects, Achievements, Skills scenes mount
         Shaders compile, HDR textures fetch in background
t=1500ms MIN_SHOWN elapsed, ready to dismiss
t=~2000-3000ms All 5 scenes report ready
t=3500ms PageLoader fades, Hero content animates in
t=5000ms MAX_WAIT timeout (fallback, if slow device)
```

User sees:
- Splash screen for ~2-3s (covers heavy initialization)
- Hero content immediately interactive after loader
- Below-fold sections already pre-warmed when user scrolls (no additional jank)

---

## Post-Processing & Visual Effects

### SceneEffects Component

**File:** `src/components/three/SceneEffects.tsx`

Shared cinematic post-processing applied to multiple canvases:

```tsx
export default function SceneEffects({
  bloomIntensity = 0.9,
  vignetteDarkness = 0.55,
}) {
  const isMobile = useIsMobile();
  
  if (isMobile) return null; // Skip on mobile
  
  return (
    <Suspense fallback={null}>
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={1}
          luminanceSmoothing={0.3}
          mipmapBlur
          radius={0.5}
        />
        <Vignette 
          eskil={false} 
          offset={0.25} 
          darkness={vignetteDarkness} 
        />
      </EffectComposer>
    </Suspense>
  );
}
```

### Parameters

**Bloom:**
- `luminanceThreshold: 1` — Only emissive materials with intensity > 1 glow (selective highlights)
- `luminanceSmoothing: 0.3` — Smooth transition from non-glowing to glowing
- `mipmapBlur: true` — Higher quality bloom blur
- `radius: 0.5` — Bloom spread (smaller = tighter glow)

**Vignette:**
- `darkness: 0.55` — Darkens edges (0 = none, 1 = black)
- `offset: 0.25` — Moves dark region (0 = center, 1 = outer edges)

### Mobile Adaptation

`useIsMobile()` returns true for devices with small screens or touch input. When true:
- SceneEffects is not rendered (entire EffectComposer is skipped)
- Geometry may be simplified (e.g., lower polygon counts)
- Render targets reduced (lower internal resolution)

---

## Dynamic Imports & Code Splitting

### Pattern

In `src/app/page.tsx`:

```tsx
const About3D = dynamic(() => import("@/components/About3D"), {
  ssr: false,
  loading: () => <SectionSkeleton className="min-h-[800px] md:min-h-screen w-full" />,
});
```

### Why `ssr: false`?

- Three.js requires browser APIs (canvas, WebGL context)
- Server-side prerender would fail or create hydration mismatch
- `ssr: false` skips server rendering; only client renders

### Loading Placeholder

While the chunk downloads:
- A skeleton `<div>` with height matching the real section
- Prevents layout shift and "all sections in viewport at once" problem
- User sees smooth scrolling even while chunks load

### Bundle Impact

- Initial HTML/CSS: ~100KB (Tailwind, Framer Motion, Hero)
- three-vendor.js: ~800KB (three.js + drei)
- Per-section chunks: ~50-200KB each

**Total:** ~1.2-1.5MB gzipped (typical for SPA with 3D)

---

## Performance Monitoring & Debugging

### Web Vitals Logging

**File:** `src/lib/performance-monitoring.ts`

Measures in development:
- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint)
- **CLS** (Cumulative Layout Shift)
- **TTFB** (Time to First Byte)

```bash
npm run dev
# Open console to see [Perf] logs
```

### Chrome DevTools Profiling

1. **Performance tab:**
   - Record page load (Cmd+Shift+E)
   - Zoom into Initial Load → see when Three.js chunks load
   - Spot long Main Thread tasks (shader compilation)

2. **Rendering tab:**
   - "Paint flashing" — see which areas repaint
   - FPS meter — monitor frame rate during scroll

3. **Lighthouse:**
   - Run audit to score performance, accessibility, SEO
   - Production build only (`npm run build && npm start`)

### Scene Warm-Up Debugging

1. Open DevTools Console
2. You should see `scene-warmed` events as canvases initialize
3. Check `window.__warmedScenes` to see which scenes are ready
4. If PageLoader stays on for >5s, a scene failed to mount

---

## Optimization Checklist

### When Adding a New 3D Section

- [ ] Use `dynamic()` import with `ssr: false` and skeleton loader
- [ ] Implement `useInViewport()` with 200px margin
- [ ] Add `useWarmupTimer(X)` where X is staggered (e.g., 1000ms for About, 2000ms for Experience)
- [ ] Call `markSceneWarmed("sectionName")` in Canvas `onCreated` callback
- [ ] Increase `TOTAL_WARMED_SCENES` in `src/lib/utils.ts`
- [ ] Use `SceneEffects` for post-processing (if not on mobile)
- [ ] Test on real mobile device (use DevTools throttling: 4G, mid-range phone CPU)

### When Optimizing Existing Sections

- [ ] Profile with Chrome Performance tab → identify long tasks
- [ ] Check if geometry can be simplified (lower segment counts)
- [ ] Reduce post-processing complexity or disable on mobile
- [ ] Use `useMemo()` for expensive calculations (geometry setup, material creation)
- [ ] Check bundle size: `npm run build` and inspect `.next/` folder sizes

### General Performance Rules

1. **Avoid `Math.random()` in render code** — Use `seededRandom()` instead (prevents hydration mismatch)
2. **Pause off-screen render loops** — Use `useInViewport()` or `useRefInViewport()` to prevent rendering hidden canvases
3. **Pre-warm in background** — Use `useWarmupTimer()` to initialize scenes while user reads hero
4. **Mobile detection matters** — Check `useIsMobile()` before expensive operations
5. **CSS animations over JS** — Use Tailwind/custom CSS for simple animations, reserve Framer Motion for scroll-driven and complex interactions

---

## Common Performance Issues & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| Jank when scrolling into 3D section | Canvas initializing just-in-time | Increase viewport margin, adjust warm-up timer |
| PageLoader stuck for >5s | Scene failed to mount | Check browser console for Three.js errors; reduce scene complexity |
| Hydration mismatch (starfield looks different) | `Math.random()` used in server/client | Use `seededRandom()` for deterministic output |
| Mobile feels sluggish | Post-processing on low-end GPU | Check `useIsMobile()` is respected, disable Bloom/Vignette on mobile |
| Large initial bundle | three.js not split correctly | Verify webpack config in `next.config.ts` has vendor splitting for three |
| Flickering/tearing in WebGL | Unsync'd animation loops | Use `useFrame()` with delta time, avoid setTimeout in render code |

---

## References

- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber/)
- [@react-three/drei GitHub](https://github.com/pmndrs/drei)
- [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing)
- [Web.dev Performance](https://web.dev/performance/)

---

## See Also

- [Architecture Overview](overview.md) — Tech stack, layout, deployment
- [Component Architecture](../components/structure.md) — Hooks, utilities, component patterns
- [Development Guide](../development.md) — How to build and debug locally
