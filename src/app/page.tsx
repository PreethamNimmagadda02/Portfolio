"use client";

import Hero from "@/components/Hero";
import Contact from "@/components/Contact";
import NoiseBackground from "@/components/NoiseBackground";
import ScrollReveal from "@/components/ScrollReveal";
import SectionDivider from "@/components/SectionDivider";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIdle } from "@/lib/viewport-store";

// Only one WebGL background for the entire page now (CosmicScene) — every
// other section below is plain DOM/CSS/Framer Motion, so there's nothing
// left to keep off the initial bundle except the three.js chunk itself.
const CosmicScene = dynamic(() => import("@/components/scene/CosmicScene"), { ssr: false });

const SectionSkeleton = ({ className }: { className: string }) => <div className={className} aria-hidden />;

const About = dynamic(() => import("@/components/About"), {
  loading: () => <SectionSkeleton className="min-h-[600px] w-full" />,
});
const Experience = dynamic(() => import("@/components/Experience"), {
  loading: () => <SectionSkeleton className="min-h-[600px] w-full" />,
});
const Skills = dynamic(() => import("@/components/Skills"), {
  loading: () => <SectionSkeleton className="min-h-[500px] w-full" />,
});
const Projects = dynamic(() => import("@/components/Projects"), {
  loading: () => <SectionSkeleton className="min-h-[600px] w-full" />,
});
const GitHubStats = dynamic(() => import("@/components/GitHubStats"), {
  loading: () => <SectionSkeleton className="min-h-[800px] w-full" />,
});
const Achievements = dynamic(() => import("@/components/Achievements"), {
  loading: () => <SectionSkeleton className="min-h-[500px] w-full" />,
});
const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <SectionSkeleton className="min-h-[700px] w-full" />,
});

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  // Defer the WebGL background until the main thread goes idle — the hero
  // becomes interactive first, then the cosmic backdrop fades in a beat
  // later with no perceptible UI change. Reduced-motion users get the
  // CSS-gradient fallback rendered by CosmicScene itself instead.
  const idle = useIdle();

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-x-hidden">
      {idle && <CosmicScene />}
      {!idle && !prefersReducedMotion && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.12), transparent 60%), #030308" }}
          aria-hidden
        />
      )}

      <NoiseBackground />

      <div className="relative z-10 flex flex-col gap-8 md:gap-16">
        <Hero />

        <ScrollReveal direction="none" className="cv-auto">
          <About />
        </ScrollReveal>

        <SectionDivider variant="glow" colorFrom="rgba(139,92,246,0.2)" colorTo="rgba(59,130,246,0.15)" />

        <ScrollReveal direction="none" className="cv-auto">
          <Experience />
        </ScrollReveal>

        <SectionDivider variant="glow" colorFrom="rgba(59,130,246,0.2)" colorTo="rgba(168,85,247,0.15)" flip />

        <ScrollReveal direction="none" className="cv-auto">
          <Skills />
        </ScrollReveal>

        <SectionDivider variant="glow" colorFrom="rgba(236,72,153,0.2)" colorTo="rgba(6,182,212,0.15)" />

        <ScrollReveal direction="none" className="cv-auto">
          <Projects />
        </ScrollReveal>

        <SectionDivider variant="glow" colorFrom="rgba(6,182,212,0.2)" colorTo="rgba(34,197,94,0.15)" flip />

        <ScrollReveal direction="none" className="cv-auto">
          <GitHubStats />
        </ScrollReveal>

        <SectionDivider variant="glow" colorFrom="rgba(34,197,94,0.2)" colorTo="rgba(251,191,36,0.15)" />

        <ScrollReveal direction="none" className="cv-auto">
          <Achievements />
        </ScrollReveal>

        <SectionDivider variant="glow" colorFrom="rgba(251,191,36,0.2)" colorTo="rgba(139,92,246,0.15)" flip />

        <ScrollReveal direction="none" className="cv-auto">
          <Testimonials />
        </ScrollReveal>

        <SectionDivider variant="glow" colorFrom="rgba(139,92,246,0.2)" colorTo="rgba(59,130,246,0.15)" />

        <ScrollReveal direction="none" className="cv-auto">
          <Contact />
        </ScrollReveal>
      </div>
    </main>
  );
}
