"use client";

import Hero from "@/components/Hero";
import About3D from "@/components/About3D";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import NoiseBackground from "@/components/NoiseBackground";
import Achievements3D from "@/components/Achievements3D";
import ScrollReveal from "@/components/ScrollReveal";
import GitHubStats from "@/components/GitHubStats";
import Testimonials from "@/components/Testimonials";
import SectionDivider3D from "@/components/SectionDivider3D";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Dynamic import for Three.js background components (client-side only).
// Next.js dynamic() with ssr: false ensures these don't run during prerender
// and are split into their own chunks via webpack vendor splitting.
const ParticleField = dynamic(() => import("@/components/ParticleField"), { ssr: false });
const SkillsMarquee = dynamic(() => import("@/components/SkillsMarquee"), { ssr: false });

export default function Home() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-x-hidden">
      {/* 3D Background — already renders as fixed layer internally. Skip if user prefers reduced motion. */}
      {!prefersReducedMotion && <ParticleField />}

      <NoiseBackground />

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
    </main>
  );
}
