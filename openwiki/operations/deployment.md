# Operations & Deployment

**This page explains how to build, deploy, and operate the portfolio in production. Covers the build process, Firebase setup, GitHub Actions CI/CD, PWA configuration, and troubleshooting.**

---

## Build Process

### Development Build

```bash
npm run dev
```

Starts Next.js development server with hot reload:
- **Port:** 3001 (configured in `package.json`)
- **PWA Disabled:** Service worker is disabled to prevent caching issues during development
- **Rebuild on Save:** Changes auto-reload instantly
- **Browser:** http://localhost:3001

**Features Disabled in Dev:**
- Service worker (prevents stale cache interference)
- Pre-warning of 3D scenes
- Some performance optimizations (to speed up iteration)

### Production Build

```bash
npm run build
```

Compiles and exports to static files:

**Process:**
1. TypeScript compilation → JavaScript
2. Tailwind CSS optimization
3. Webpack bundling with vendor code splitting:
   - `three-vendor.js` (three.js + @react-three/fiber + @react-three/drei)
   - `framer-motion.js`
   - `lucide-icons.js`
   - Main bundle (React, Tailwind, app code)
4. next-pwa generates service worker + manifest
5. Static HTML/CSS/JS exported to `out/` directory

**Output:**
- All files in `out/` are static (no Node.js server needed)
- Ready for deployment to Firebase Hosting, Netlify, Vercel, etc.

**Build Time:** ~30-60 seconds on typical machine

**Bundle Size (gzipped):**
- Initial JS: ~300KB
- three-vendor: ~800KB
- HTML: ~50KB
- CSS: ~100KB
- Total: ~1.2MB

### Serve Production Locally

```bash
npm run build
npm start
```

Starts a local Next.js server serving the production build:
- **Port:** 3000
- **Browser:** http://localhost:3000
- Tests the exact output that will be deployed

---

## Firebase Hosting Deployment

### Manual Deployment (Rarely Used)

If you need to deploy without using GitHub Actions:

**Prerequisites:**
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in: `firebase login`
- Project ID configured: `firebase projects:list` and `firebase use <project-id>`

**Deploy:**
```bash
npm run build
firebase deploy --only hosting
```

**What Happens:**
1. Build outputs to `out/`
2. Firebase CLI reads `firebase.json` config
3. Uploads `out/` contents to Firebase Hosting
4. Updates live site: https://preethamnimmagaddaportfolio.web.app

### Automatic Deployment (GitHub Actions)

**Trigger:** Push to `main` branch

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Firebase Hosting on merge
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
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
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: preethamnimmagaddaportfolio
```

**Workflow:**
1. Developer pushes to `main` (or PR merged to main)
2. GitHub Actions runner spins up
3. Node 22 installed, dependencies cached
4. Build runs with environment variables injected from secrets
5. Firebase action deploys `out/` to Firebase Hosting
6. Site live within 1-2 minutes

**Required Secrets in GitHub:**
- `NEXT_PUBLIC_SERVICE_ID` — EmailJS service ID
- `NEXT_PUBLIC_TEMPLATE_ID` — EmailJS template ID
- `NEXT_PUBLIC_PUBLIC_KEY` — EmailJS public key
- `FIREBASE_SERVICE_ACCOUNT` — Firebase service account JSON (as secret)

### Setting Up Secrets

**In GitHub (one-time setup):**

1. Go to repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret:
   - Name: `NEXT_PUBLIC_SERVICE_ID` → Value: (get from EmailJS)
   - Name: `NEXT_PUBLIC_TEMPLATE_ID` → Value: (get from EmailJS)
   - Name: `NEXT_PUBLIC_PUBLIC_KEY` → Value: (get from EmailJS)
   - Name: `FIREBASE_SERVICE_ACCOUNT` → Value: (Firebase service account JSON)

**Firebase Service Account:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Copy the entire JSON
4. Paste as GitHub secret `FIREBASE_SERVICE_ACCOUNT`

**EmailJS:**
1. Go to EmailJS dashboard
2. In Service & Templates, find:
   - Service ID
   - Template ID
   - Public Key (under Account)
3. Paste into GitHub secrets

---

## Firebase Configuration

**File:** `firebase.json`

### Hosting Rules

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|png|gif|webp|avif|svg|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(woff|woff2|ttf|otf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=604800"
          }
        ]
      }
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Cache Strategy

| File Type | Cache Duration | Reasoning |
|-----------|-----------------|-----------|
| JS/CSS | 1 year (immutable) | Content hash in filename ensures cache busts on changes |
| Images/Fonts | 1 year (immutable) | Rarely change; hashed names ensure proper invalidation |
| HTML | 7 days | Allows updates weekly; users get fresh content within a week |

### SPA Rewrite

```json
"rewrites": [
  {
    "source": "**",
    "destination": "/index.html"
  }
]
```

All routes (e.g., `/projects`, `/about`) → `/index.html`. React Router (or in this case, no client-side router since it's a single page) handles routing on the client.

---

## Progressive Web App (PWA)

### Configuration

**File:** `next.config.ts`

```tsx
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
});

export default withPWA(nextConfig);
```

**Settings:**
- `dest: "public"` — Service worker files output to `public/`
- `register: true` — Auto-register service worker on page load
- `skipWaiting: true` — New SW takes over immediately (not waiting for all clients)
- `disable: process.env.NODE_ENV === "development"` — PWA off in dev mode

### Service Worker

**Files Generated:**
- `public/sw.js` — Service worker (auto-generated by next-pwa)
- `public/workbox-*.js` — Workbox caching library (auto-generated)
- `public/manifest.json` — PWA manifest (manually configured)

### Manifest Configuration

**File:** `public/manifest.json`

```json
{
  "name": "Preetham Nimmagadda Portfolio",
  "short_name": "Portfolio",
  "description": "AI Engineer & Full Stack Developer Portfolio",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#a855f7",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/favicon.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

**Key Fields:**
- `name`, `short_name` — App display name
- `start_url: "/"` — Entry point when launched from home screen
- `display: "standalone"` — Full-screen app mode (hides browser UI)
- `theme_color` — Status bar color (Android)
- `background_color` — Loading screen color
- `icons` — App icons for home screen and splash screen

### PWA Features

**Users can:**
1. **Install:** Add to home screen (iOS Safari, Android Chrome)
2. **Offline:** View cached pages (service worker caching)
3. **Splash Screen:** Custom splash screen on launch (1-2 seconds)
4. **Standalone Mode:** No address bar; looks like native app

**Test PWA Locally:**
```bash
npm run build
npm start

# Open Chrome DevTools → Application tab
# Check if Service Worker is registered
# Check Manifest is valid
# Try "Install app" button (if available in your browser)
```

---

## Environment Variables

### Build-Time Variables (Public)

Prefixed with `NEXT_PUBLIC_` and embedded in JS:

```env
NEXT_PUBLIC_SERVICE_ID=abc123
NEXT_PUBLIC_TEMPLATE_ID=xyz789
NEXT_PUBLIC_PUBLIC_KEY=key123
```

**Used By:** EmailJS contact form (`src/components/Contact.tsx`)

**Set During Build:**
```bash
NEXT_PUBLIC_SERVICE_ID=abc123 npm run build
# Or via GitHub Actions secrets
```

### Runtime Secrets (Private)

**Note:** This portfolio has no backend, so no private secrets are used during the build. Firebase service account is only used for deployment.

---

## Troubleshooting Deployment

### Build Fails in GitHub Actions

**Check the logs:**
1. Go to GitHub repo → Actions
2. Click the failed workflow run
3. Expand the "build_and_deploy" job
4. Read the error messages

**Common Issues:**

| Error | Cause | Fix |
|-------|-------|-----|
| `NEXT_PUBLIC_SERVICE_ID not defined` | Missing GitHub secret | Add secret in repo settings |
| `Cannot find module '@react-three/fiber'` | Dependency not installed | `npm install` locally, commit `package-lock.json` |
| `TypeScript error: Type X not assignable` | Code syntax issue | Fix locally with `npm run build` |
| `Firebase authentication failed` | Bad service account | Regenerate and update secret |

### Site Not Updating After Deploy

**Possible Causes:**
1. **Browser Cache:** Browser cached old HTML. Clear cache or use incognito.
2. **CloudFlare/CDN Cache:** If using intermediary CDN, purge cache there.
3. **Firebase Cache Headers:** If cache-control is too aggressive, wait 7 days (HTML) or manually clear in Firebase Console.

**Fix:**
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear site data: DevTools → Application → Clear storage → Clear all
3. Incognito window: Open site in private browsing (no cache)

### Performance Issues in Production

**Check:**
1. **Bundle Size:** `npm run build` → check `out/` folder sizes
2. **Lighthouse:** Chrome Lighthouse audit (DevTools → Lighthouse)
3. **Network Tab:** Chrome DevTools → Network tab, reload and check asset sizes
4. **3D Performance:** Check FPS during scroll (Chrome DevTools → Rendering tab)

**Common Optimizations:**
- Disable Bloom/Vignette on mobile (already done in `SceneEffects`)
- Reduce Three.js geometry complexity (fewer vertices)
- Increase viewport warm-up margin to initialize scenes earlier
- Use dynamic imports for heavy components (already done)

---

## Monitoring & Logs

### GitHub Actions Logs

**View:**
1. Go to repo → Actions
2. Click a workflow run
3. Expand job steps to see output

**Keep logs for debugging:**
- Logs auto-delete after 90 days (GitHub default)
- Download failed logs for analysis

### Firebase Hosting Logs

**In Firebase Console:**
1. Go to Hosting → Deployments
2. See all deployment history
3. Click a deployment to see details (file sizes, errors)
4. Revert to a previous version if needed

### Browser Errors

**Check Console:**
```bash
# Development
npm run dev
# Open DevTools → Console
# Check for errors during load and interaction

# Production
# Open site at https://preethamnimmagaddaportfolio.web.app
# DevTools → Console
# Check for 3D errors, load errors, etc.
```

---

## Rollback & Recovery

### Revert to Previous Deployment

**Via GitHub:**
1. Find the commit you want to revert to
2. `git revert <commit-hash>`
3. Push to `main`
4. GitHub Actions redeploys from that commit

**Via Firebase Console:**
1. Go to Hosting → Deployments
2. Find the previous deployment
3. Click three dots → Rollback
4. Confirm

**Time:** Rollback is instant; no rebuild needed if reverting to a previous deployment.

---

## SSL/HTTPS

**Firebase Hosting provides free SSL certificate:**
- All traffic is automatically HTTPS
- Certificate auto-renews
- No configuration needed

**Verify:**
1. Visit https://preethamnimmagaddaportfolio.web.app
2. Check browser address bar (lock icon indicates secure)
3. DevTools → Security tab (certificate details)

---

## Cost & Limits

### Firebase Hosting (Free Tier)

- **Storage:** 1 GB
- **Bandwidth:** 10 GB/month
- **Serves:** Static content only
- **Scale:** Unlimited (auto-scales)

**Upgrade:** If exceeding, Firebase offers pay-as-you-go ($0.18/GB bandwidth).

### Portfolio Typical Usage

- **Monthly Bandwidth:** 10-100 MB (small portfolio)
- **Storage Used:** ~50 MB (one deployment)
- **Cost:** Free tier typically sufficient

---

## See Also

- [Architecture Overview](../architecture/overview.md) — Tech stack, Next.js setup, rendering strategy
- [Content & Data](../content/data-structure.md) — How to edit portfolio content and trigger redeploy
- [Development Guide](../development.md) — Local build and debug commands
