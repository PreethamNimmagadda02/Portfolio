"use client";

import Hero from "@/components/Hero";
import Contact from "@/components/Contact";
import NoiseBackground from "@/components/NoiseBackground";
import ScrollReveal from "@/components/ScrollReveal";
import VelocityScroll from "@/components/VelocityScroll";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIdle } from "@/lib/viewport-store";

// Dynamic imports for every Three.js/heavy below-fold section (client-only).
// This keeps three.js, drei, and postprocessing out of the initial bundle —
// they load as separate chunks once the page is interactive, so the hero
// paints fast. Only Hero and Contact (real HTML content) stay eager.
//
// Each import gets a `loading` placeholder matching the section's real
// height. Without them the page collapses while chunks load, which puts
// every section "in the viewport" at once — mounting all WebGL canvases
// simultaneously and janking the initial load.
const SectionSkeleton = ({ className }: { className: string }) => (
  <div className={className} aria-hidden />
);

const ParticleField = dynamic(() => import("@/components/ParticleField"), { ssr: false });
const SkillsMarquee = dynamic(() => import("@/components/SkillsMarquee"), {
  ssr: false,
  loading: () => <SectionSkeleton className="min-h-[720px] md:min-h-[950px] w-full" />,
});
const About3D = dynamic(() => import("@/components/About3D"), {
  ssr: false,
  loading: () => <SectionSkeleton className="min-h-[800px] md:min-h-screen w-full" />,
});
const Projects = dynamic(() => import("@/components/Projects"), {
  ssr: false,
  loading: () => <SectionSkeleton className="h-[100svh] min-h-[600px] w-full" />,
});
const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
  loading: () => <SectionSkeleton className="h-[100svh] min-h-[600px] w-full" />,
});
const Achievements3D = dynamic(() => import("@/components/Achievements3D"), {
  ssr: false,
  loading: () => <SectionSkeleton className="h-[100svh] min-h-[600px] w-full" />,
});
const GitHubStats = dynamic(() => import("@/components/GitHubStats"), {
  ssr: false,
  loading: () => <SectionSkeleton className="min-h-[800px] w-full" />,
});
const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  ssr: false,
  loading: () => <SectionSkeleton className="min-h-[700px] w-full" />,
});
const SectionDivider3D = dynamic(() => import("@/components/SectionDivider3D"), {
  ssr: false,
  loading: () => <SectionSkeleton className="h-20 md:h-56 w-full" />,
});

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  // Defer the fixed WebGL background until the main thread goes idle. It's a
  // non-interactive backdrop, so keeping three.js (~800 KB) off the initial
  // critical path lets the hero reach interactivity first; the background then
  // fades in a beat later with no perceptible UI change.
  const idle = useIdle();

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-x-hidden">
      {/* 3D Background — already renders as fixed layer internally. Skip if user prefers reduced motion. */}
      {!prefersReducedMotion && idle && <ParticleField />}

      <NoiseBackground />

      <VelocityScroll>
        <div className="relative z-10 flex flex-col gap-16 md:gap-40">
          {/* Hero Section */}
          <Hero />

          {/* About Section */}
          <ScrollReveal direction="none">
            <About3D />
          </ScrollReveal>

          <SectionDivider3D from="#8b5cf6" to="#3b82f6" accent="#a855f7" />

          {/* Experience Section */}
          <ScrollReveal direction="none">
            <Experience />
          </ScrollReveal>

          <SectionDivider3D from="#3b82f6" to="#a855f7" accent="#6366f1" />

          {/* Skills Marquee */}
          <ScrollReveal direction="none">
            <SkillsMarquee />
          </ScrollReveal>

          <SectionDivider3D from="#a855f7" to="#ec4899" accent="#d946ef" flip />

          {/* Projects Section */}
          <ScrollReveal direction="none">
            <Projects />
          </ScrollReveal>

          <SectionDivider3D from="#ec4899" to="#06b6d4" accent="#f472b6" />

          {/* Coding Activity Section */}
          <ScrollReveal direction="none">
            <GitHubStats />
          </ScrollReveal>

          <SectionDivider3D from="#06b6d4" to="#fbbf24" accent="#22d3ee" flip />

          {/* Achievements Section */}
          <ScrollReveal direction="none">
            <Achievements3D />
          </ScrollReveal>

          <SectionDivider3D from="#fbbf24" to="#8b5cf6" accent="#f59e0b" flip />

          {/* Testimonials Section */}
          <ScrollReveal direction="none">
            <Testimonials />
          </ScrollReveal>

          <SectionDivider3D from="#8b5cf6" to="#3b82f6" accent="#a855f7" />

          {/* Contact Section */}
          <ScrollReveal direction="none">
            <Contact />
          </ScrollReveal>
        </div>
      </VelocityScroll>
    </main>
  );
}
