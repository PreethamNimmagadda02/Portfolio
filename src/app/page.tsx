"use client";

import Hero from "@/components/Hero";
import About3D from "@/components/About3D";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import NoiseBackground from "@/components/NoiseBackground";
import Achievements3D from "@/components/Achievements3D";
import ScrollReveal from "@/components/ScrollReveal";
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

        {/* Skills Marquee with 3D divider */}
        <ScrollReveal direction="none">
          <SkillsMarquee />
        </ScrollReveal>

        {/* About Section */}
        <ScrollReveal direction="none">
          <About3D />
        </ScrollReveal>

        {/* Projects Section */}
        <ScrollReveal direction="none">
          <Projects />
        </ScrollReveal>

        {/* Achievements Section */}
        <ScrollReveal direction="none">
          <Achievements3D />
        </ScrollReveal>

        {/* Experience Section */}
        <ScrollReveal direction="none">
          <Experience />
        </ScrollReveal>

        {/* Contact Section */}
        <ScrollReveal direction="none">
          <Contact />
        </ScrollReveal>
      </div>
    </main>
  );
}

