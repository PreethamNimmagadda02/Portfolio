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
import SectionDivider from "@/components/SectionDivider";
import dynamic from "next/dynamic";

// Dynamic import for Three.js components (client-side only)
const ParticleField = dynamic(() => import("@/components/ParticleField"), { ssr: false });
const SectionDivider3D = dynamic(() => import("@/components/SectionDivider3D"), { ssr: false });
const SkillsMarquee = dynamic(() => import("@/components/SkillsMarquee"), { ssr: false });


export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-x-hidden">
      {/* 3D Background — already renders as fixed layer internally */}
      <ParticleField />

      <NoiseBackground />

      <div className="relative z-10 flex flex-col gap-16 md:gap-40">
        {/* Hero Section */}
        <Hero />

        {/* About Section */}
        <ScrollReveal direction="none">
          <About3D />
        </ScrollReveal>

        <SectionDivider variant="glow" colorFrom="rgba(139, 92, 246, 0.3)" colorTo="rgba(59, 130, 246, 0.2)" />

        {/* Experience Section */}
        <ScrollReveal direction="none">
          <Experience />
        </ScrollReveal>

        <SectionDivider variant="mesh" colorFrom="rgba(59, 130, 246, 0.15)" colorTo="rgba(168, 85, 247, 0.1)" />

        {/* Skills Marquee */}
        <ScrollReveal direction="none">
          <SkillsMarquee />
        </ScrollReveal>

        <SectionDivider variant="glow" colorFrom="rgba(168, 85, 247, 0.2)" colorTo="rgba(236, 72, 153, 0.2)" flip />

        {/* Projects Section */}
        <ScrollReveal direction="none">
          <Projects />
        </ScrollReveal>

        <SectionDivider variant="mesh" colorFrom="rgba(236, 72, 153, 0.15)" colorTo="rgba(6, 182, 212, 0.1)" />

        {/* Coding Activity Section */}
        <ScrollReveal direction="none">
          <GitHubStats />
        </ScrollReveal>

        <SectionDivider variant="glow" colorFrom="rgba(6, 182, 212, 0.2)" colorTo="rgba(251, 191, 36, 0.2)" flip />

        {/* Achievements Section */}
        <ScrollReveal direction="none">
          <Achievements3D />
        </ScrollReveal>

        <SectionDivider variant="mesh" colorFrom="rgba(251, 191, 36, 0.15)" colorTo="rgba(139, 92, 246, 0.1)" flip />

        {/* Testimonials Section */}
        <ScrollReveal direction="none">
          <Testimonials />
        </ScrollReveal>

        <SectionDivider variant="glow" colorFrom="rgba(139, 92, 246, 0.2)" colorTo="rgba(59, 130, 246, 0.15)" />

        {/* Contact Section */}
        <ScrollReveal direction="none">
          <Contact />
        </ScrollReveal>
      </div>
    </main>
  );
}
