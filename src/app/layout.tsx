import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import ScrollProgress from "@/components/ScrollProgress";
import KonamiEasterEgg from "@/components/KonamiEasterEgg";
import Cursor from "@/components/Cursor";
import SmoothScroll from "@/components/SmoothScroll";
import PerformanceProvider from "@/components/PerformanceProvider";
import { LazyMotion, domMax, MotionConfig } from "@/lib/motion";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL("https://preethamnimmagadda.github.io"),
  title: "Preetham Nimmagadda | AI architect, autonomous systems",
  description:
    "Preetham Nimmagadda architects AI that acts: a self-healing data security copilot at Matters.AI, multimodal VideoRAG at Introspect Labs, autonomous agents at METAVERTEX. CodeChef top 0.8%, HackerRank top 0.07%.",
  manifest: "/manifest.json",
  keywords: [
    "Preetham Nimmagadda",
    "AI Architect",
    "AI Engineer",
    "Autonomous AI Systems",
    "Agentic AI",
    "Multi-agent Systems",
    "AI Agent Developer",
    "Full Stack Engineer",
    "IIT Dhanbad",
    "CrewAI",
    "LangChain",
    "Next.js Developer",
    "Autonomous Agents",
    "Software Engineer Portfolio",
    "React Developer",
    "Python Developer",
    "Machine Learning",
    "Generative AI",
  ],
  authors: [{ name: "Preetham Nimmagadda", url: "https://preethamnimmagadda.github.io" }],
  creator: "Preetham Nimmagadda",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://preethamnimmagadda.github.io",
    title: "Preetham Nimmagadda, AI architect",
    description:
      "Architecting intelligence that acts. The thesis, the method, the selected work and the record.",
    siteName: "Preetham Nimmagadda",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Preetham Nimmagadda, AI architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Preetham Nimmagadda, AI architect",
    description:
      "Architecting intelligence that acts. The thesis, the method, the selected work and the record.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    // Both tab sizes are drawn at their real pixel size rather than letting the
    // browser downscale one raster, which is what reduced the monogram to a
    // smudge. Source and sizes: scripts/brand/README.md.
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    // iOS "Add to Home Screen" expects about 180px; the 32px favicon upscales
    // blurrily. Reuse the PWA icon that is already generated at a proper size.
    apple: "/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0A08",
  colorScheme: "dark",
};

// Disable browser scroll restoration so every refresh always starts at the top
const scrollResetScript = `if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);`;

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Preetham Nimmagadda",
  url: "https://preethamnimmagadda.github.io",
  image: "https://preethamnimmagadda.github.io/ai-headshot.jpeg",
  jobTitle: "AI Architect",
  description:
    "AI architect designing autonomous systems that perceive, decide and act, shipped at Matters.AI, Introspect Labs and METAVERTEX.",
  worksFor: {
    "@type": "Organization",
    name: "IIT (ISM) Dhanbad",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Indian Institute of Technology (ISM) Dhanbad",
  },
  knowsAbout: [
    "Artificial Intelligence",
    "AI Architecture",
    "Autonomous Agents",
    "Multi-agent Systems",
    "CrewAI",
    "LangChain",
    "Next.js",
    "React",
    "Python",
    "Full Stack Development",
  ],
  sameAs: [
    "https://github.com/PreethamNimmagadda02",
    "https://linkedin.com/in/preethamnimmagadda",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // suppressHydrationWarning on <html> and <body>: browser extensions inject
  // attributes and <script> tags before React hydrates. App code cannot
  // prevent that, and the mismatch is expected.
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: scrollResetScript }} />
        <script
          suppressHydrationWarning
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${fontVariables} antialiased bg-obsidian-0 text-ivory-100`}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <LazyMotion features={domMax} strict>
          <MotionConfig reducedMotion="user">
            <PerformanceProvider>
              <PageLoader />
              <ScrollProgress />
              <KonamiEasterEgg />
              <Cursor />
              <SmoothScroll>
                <Navbar />
                <main
                  id="main-content"
                  className="relative min-h-[100dvh] bg-obsidian-0 text-ivory-100 overflow-x-clip"
                >
                  {children}
                </main>
                <Footer />
              </SmoothScroll>
            </PerformanceProvider>
          </MotionConfig>
        </LazyMotion>
      </body>
    </html>
  );
}
