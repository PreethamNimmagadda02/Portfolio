# Development Guide

**Quick reference for local development, debugging, and common tasks.**

---

## Quick Start

### Installation

```bash
git clone <repo>
cd portfolio
npm install
```

### Running Locally

```bash
npm run dev
```

- **URL:** http://localhost:3001
- **Hot Reload:** Changes auto-refresh
- **PWA Disabled:** Service worker is off (prevents caching issues)

### Building for Production

```bash
npm run build
npm start
```

- **Output:** `out/` directory (static files)
- **URL:** http://localhost:3000
- **Tests:** Exact production setup before deploying

### Linting

```bash
npm run lint
```

Runs ESLint with Next.js rules. Fix most issues with:
```bash
npm run lint -- --fix
```

---

## File Structure Quick Reference

```
src/
├── app/
│   ├── layout.tsx       # Root layout (providers, navbar, footer)
│   ├── page.tsx         # Main page (all sections)
│   ├── globals.css      # 1000+ lines of custom CSS + animations
│   ├── robots.ts        # SEO robots.txt
│   └── sitemap.ts       # Sitemap generation
├── components/
│   ├── Hero.tsx         # Hero section (roles, CTA)
│   ├── About3D.tsx      # About section (3D torus)
│   ├── Experience.tsx   # Experience section (3D cards)
│   ├── Projects.tsx     # Projects section (3D carousel)
│   ├── Achievements3D.tsx # Stats and badges
│   ├── SkillsMarquee.tsx  # Tech stack carousel
│   ├── Contact.tsx      # Contact form
│   ├── Navbar.tsx       # Navigation
│   ├── Footer.tsx       # Footer
│   ├── PageLoader.tsx   # Splash screen
│   ├── three/           # Three.js utilities
│   │   └── SceneEffects.tsx # Bloom + Vignette
│   └── [others]         # Utility components
├── hooks/
│   ├── use-in-viewport.ts    # Viewport detection
│   ├── use-mobile.tsx        # Mobile detection
│   └── use-reduced-motion.ts # Accessibility hook
└── lib/
    ├── utils.ts         # Utilities (cn, seededRandom, scene warm-up)
    └── performance-monitoring.ts # Performance metrics
```

---

## Common Development Tasks

### Edit Portfolio Content

**Example: Add a new project**

1. Open `src/components/Projects.tsx`
2. Find the `projects` array
3. Add a new entry (copy last, increment id):
   ```tsx
   {
     id: 5,
     title: "My New Project",
     description: "...",
     tags: ["React", "TypeScript"],
     links: { demo: "https://...", repo: "https://..." },
     status: "Live",
     featured: false,
     icon: Code,
     color: "#3b82f6",
     accent: "#06b6d4",
     geometry: "nexus"
   }
   ```
4. Save
5. Test: `npm run dev` → http://localhost:3001 → scroll to Projects
6. Commit: `git add src/components/Projects.tsx && git commit -m "feat: add new project"`
7. Push: `git push origin main` (auto-deploys)

For all content editable fields, see [Content & Data](content/data-structure.md).

### Add a New Component Section

**Example: Add a new 3D section**

1. Create `src/components/MySection3D.tsx`:
   ```tsx
   "use client";
   
   import { Canvas } from "@react-three/fiber";
   import { Suspense } from "react";
   import SceneEffects from "./three/SceneEffects";
   import { useInViewport, useWarmupTimer } from "@/hooks/use-in-viewport";
   import { markSceneWarmed } from "@/lib/utils";
   
   export default function MySection3D() {
     const [ref, inView] = useInViewport("200px");
     const warm = useWarmupTimer(3000); // Warm after 3s
     
     return (
       <div ref={ref}>
         {(inView || warm) && (
           <Canvas onCreated={() => markSceneWarmed("mySection")}>
             <Suspense fallback={null}>
               <SceneEffects />
               {/* Your 3D content here */}
             </Suspense>
           </Canvas>
         )}
       </div>
     );
   }
   ```

2. Add dynamic import to `src/app/page.tsx`:
   ```tsx
   const MySection3D = dynamic(() => import("@/components/MySection3D"), {
     ssr: false,
     loading: () => <SectionSkeleton className="h-screen w-full" />,
   });
   ```

3. Add to page content:
   ```tsx
   <ScrollReveal direction="none">
     <MySection3D />
   </ScrollReveal>
   ```

4. Increment `TOTAL_WARMED_SCENES` in `src/lib/utils.ts` (if it's a heavy 3D scene)

5. Test locally, commit, push

See [Component Architecture](components/structure.md) for patterns.

### Debug 3D Performance

**Check FPS:**
1. Open DevTools → Rendering tab
2. Click "Enable paint flashing" or "FPS meter"
3. Scroll through page and watch frame rate
4. If drops below 60fps on desktop, optimize:
   - Reduce geometry complexity
   - Lower post-processing intensity
   - Skip effects on mobile

**Check Scene Warm-Up:**
1. Open console: DevTools → Console
2. Reload page
3. You should see `scene-warmed` events (one per 3D section)
4. Check `window.__warmedScenes` to see ready scenes
5. If PageLoader stays > 5 seconds, a scene failed to initialize

**Profile Bundle Size:**
```bash
npm run build
# Check out/ folder:
ls -lh out/_next/static/chunks/
# Largest files are the bottleneck
```

### Test TypeScript Types

```bash
# Type-check entire project (no emit)
npx tsc --noEmit

# Or let the build catch errors:
npm run build
# Check for TS errors in output
```

### Debug Hydration Mismatches

**Symptom:** Content looks different on first load vs after refresh.

**Common Causes:**
- `Math.random()` used in server/client separately
- Timezone-dependent rendering
- Browser APIs used during SSR

**Solution:**
- Use `seededRandom()` for deterministic "random" values
- Wrap browser-only code in `useEffect` (runs only on client)
- Use `suppressHydrationWarning` as last resort (not recommended)

**Example:**
```tsx
// ❌ Bad: Math.random() different on server/client
const stars = Array.from({ length: 60 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
}));

// ✅ Good: seededRandom() produces same output
const rand = seededRandom(42);
const stars = Array.from({ length: 60 }, () => ({
  x: rand() * 100,
  y: rand() * 100,
}));
```

### Test Mobile/Responsive

**Using Chrome DevTools:**
1. DevTools → Toggle device toolbar (Cmd+Shift+M)
2. Select device (iPhone 14, Pixel 6, etc.)
3. Check layout and 3D performance

**Network Throttling:**
1. DevTools → Network tab
2. Throttle: "Slow 4G" or "Fast 3G"
3. Reload and observe load times and jank

**Real Device Testing:**
```bash
npm run build
npm start
# On another machine/device on same network:
# http://<your-ip>:3000
```

---

## Browser DevTools Tips

### Performance Profiling

1. DevTools → Performance tab
2. Click Record, reload page, interact, stop recording
3. Analyze:
   - Main thread tasks (JS execution, layout, paint)
   - Long tasks (>50ms are problematic)
   - Frame rate dips

### Memory Leaks

1. DevTools → Memory tab
2. Take heap snapshot
3. Interact with page, take another snapshot
4. Compare → look for growing object counts

**Common Portfolio leaks:**
- Event listeners not cleaned up in useEffect
- setInterval not cleared
- Three.js objects not disposed

### Lighthouse Audit

1. DevTools → Lighthouse
2. Select "Mobile" or "Desktop"
3. Run audit (takes 30-60s)
4. Review:
   - Performance score
   - Core Web Vitals
   - Accessibility issues
   - SEO issues

---

## Git Workflow

### Branch Strategy

**Main branch only** (no feature branches required for small changes):
```bash
# Make changes
git add .
git commit -m "feat: add new project"
git push origin main
# Auto-deploys via GitHub Actions
```

### Commit Message Format

```
type: short description

Longer explanation if needed.

- Bullet points for clarity
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` CSS/styling
- `refactor:` Code restructure
- `perf:` Performance improvement
- `chore:` Build, deps, etc.

**Examples:**
```
feat: add new project to portfolio
fix: resolve hydration mismatch in ParticleField
docs: update deployment guide
perf: optimize About3D geometry complexity
```

### Revert Changes

```bash
# Undo last commit (keeps changes locally)
git reset --soft HEAD~1

# Undo last commit (discards changes)
git reset --hard HEAD~1

# Undo specific file to previous version
git restore src/components/Hero.tsx

# Revert a past commit (creates new commit that undoes it)
git revert <commit-hash>
```

---

## Environment Setup

### Node Version

**Requires:** Node.js 18.17 or later

**Check version:**
```bash
node --version
# v22.11.0 (or higher)
```

**Upgrade if needed:**
- Install nvm: https://github.com/nvm-sh/nvm
- `nvm install 22`
- `nvm use 22`

### IDE Setup

**VS Code** (recommended):
1. Install extensions:
   - ESLint
   - Prettier
   - TypeScript Vue Plugin
   - Tailwind CSS IntelliSense

2. Create `.vscode/settings.json`:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "[typescript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     }
   }
   ```

3. Run lint on save:
   ```bash
   npm run lint -- --fix
   ```

---

## Troubleshooting

### Port Already in Use

```bash
# Dev server won't start
# Error: listen EADDRINUSE: address already in use :::3001

# Kill process on port 3001
lsof -i :3001
kill -9 <PID>

# Or change port in package.json:
# "dev": "next dev --webpack -p 3002"
```

### Module Not Found

```bash
# Error: Cannot find module '@/components/MyComponent'

# Check:
# 1. File exists at src/components/MyComponent.tsx
# 2. Import path is correct (use @ alias)
# 3. Clear node_modules:
rm -rf node_modules
npm install
npm run dev
```

### TypeScript Errors

```bash
# Error: Property 'xxx' does not exist

# Check:
# 1. Is the prop defined in the interface?
# 2. Is it spelled correctly?
# 3. Run type-check:
npx tsc --noEmit
```

### Build Hangs or Times Out

```bash
# npm run build is stuck

# 1. Check disk space:
df -h

# 2. Clear Next.js cache:
rm -rf .next

# 3. Clear npm cache:
npm cache clean --force

# 4. Reinstall:
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Performance Monitoring

### Measure on Dev Server

```bash
npm run dev
# Open DevTools → Console
# You should see [Perf] logs with FCP, LCP, CLS, TTFB
```

### Measure Production

```bash
npm run build
npm start
# Open Chrome DevTools → Lighthouse
# Run audit to see Core Web Vitals
```

### Key Metrics to Watch

- **LCP (Largest Contentful Paint):** < 2.5s (ideally < 1.5s)
- **FID (First Input Delay):** < 100ms (being replaced by INP)
- **CLS (Cumulative Layout Shift):** < 0.1 (no jank)
- **TTFB (Time to First Byte):** < 600ms (server response)

---

## Testing (No Framework Configured)

**Note:** No Jest, Vitest, or testing framework is set up.

**Manual Testing:**
1. Run `npm run dev`
2. Click through all sections
3. Test on mobile (DevTools responsive)
4. Check console for errors
5. Test 3D sections (scroll into view)
6. Test contact form (submit a test message)

---

## Before Deploying

Checklist:
- [ ] `npm run build` succeeds without errors
- [ ] `npm start` works locally
- [ ] Tested on mobile (DevTools responsive mode)
- [ ] No console errors (DevTools → Console)
- [ ] All content is correct (projects, experience, skills)
- [ ] Links are valid and public
- [ ] Commit messages are clear
- [ ] Pushed to main branch

---

## See Also

- [Architecture Overview](architecture/overview.md) — Tech stack, Next.js setup
- [3D System & Performance](architecture/3d-performance.md) — Viewport, warm-up, mobile optimization
- [Component Architecture](components/structure.md) — Components, hooks, utilities
- [Content & Data](content/data-structure.md) — Edit portfolio content
- [Operations & Deployment](operations/deployment.md) — Build, deploy, troubleshoot production
