# Preetham Nimmagadda | Modern AI & Full Stack Portfolio

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=firebase)](https://preethamnimmagaddaportfolio.web.app)

A high-performance, interactive, and mobile-responsive portfolio website built with the latest web technologies. This project showcases my work as an AI Agent Developer and Full Stack Engineer.

![Portfolio Preview](public/og-image.png)

## 🚀 Key Features

- **Editorial identity:** a single committed dark theme in obsidian and gold, set in Bodoni Moda (display), Geist (body) and Geist Mono (numerals), with hairline rules and zero border radius.
- **Deliberate motion:** `framer-motion` reveals, a shared plate-lift heading, per-character ledger numerals and a loader-to-headline match cut, all with reduced-motion fallbacks.
- **One WebGL canvas:** a gold nebula built with `three.js` and `@react-three/fiber`, full intensity only in the hero and contact chapters.
- **Progressive Web App (PWA):** Fully installable as a native-like app on mobile and desktop devices.
- **Responsive Design:** Mobile-first layout with explicit collapses below 768px on every section.
- **Performance Optimized:** Server-side rendered with Next.js 16 for blazing fast load times and SEO.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Typography:** Bodoni Moda, Geist and Geist Mono via `next/font/google`
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Phosphor Icons](https://phosphoricons.com/) (`@phosphor-icons/react`, light weight)
- **Theme:** single dark theme, tokens in `src/app/globals.css` (`@theme inline`)
- **3D:** [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **PWA:** [next-pwa](https://www.npmjs.com/package/next-pwa)
- **Deployment:** Firebase Hosting

## 📦 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PreethamNimmagadda02/portfolio.git
   cd portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   *Note: PWA features are disabled in development mode to prevent caching issues.*

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Building for Production

To create a production build with full PWA support:

```bash
npm run build
npm start
```

## 📱 PWA Features

This portfolio is a certified Progressive Web App. It allows users to:
- Install the website as an app on iOS and Android.
- Launch from the home screen with a custom splash screen.
- Experience an app-like standalone interface without browser bars.

---

Designed & Built by **Preetham Nimmagadda**
