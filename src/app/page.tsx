"use client";

import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import NoiseBackground from "@/components/NoiseBackground";
import SkillsMarquee from "@/components/SkillsMarquee";
import Achievements from "@/components/Achievements";
import ScrollReveal from "@/components/ScrollReveal";
import dynamic from "next/dynamic";

// Dynamic import for Three.js components (client-side only)
const ParticleField = dynamic(() => import("@/components/ParticleField"), { ssr: false });
const SectionDivider3D = dynamic(() => import("@/components/SectionDivider3D"), { ssr: false });


export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      {/* 3D Background layers */}
      <ParticleField />

      <NoiseBackground />

      {/* Hero Section */}
      <Hero />

      {/* 3D Section Divider */}
      <SectionDivider3D />

      {/* Skills Marquee with 3D divider */}
      <ScrollReveal>
        <SkillsMarquee />
      </ScrollReveal>


      {/* About Section */}
      <ScrollReveal delay={0.1}>
        <About />
      </ScrollReveal>

      {/* 3D Section Divider */}
      <SectionDivider3D />

      {/* Projects Section */}
      <ScrollReveal delay={0.1}>
        <Projects />
      </ScrollReveal>

      {/* 3D Section Divider */}
      <SectionDivider3D />

      {/* Achievements Section */}
      <ScrollReveal delay={0.1}>
        <Achievements />
      </ScrollReveal>

      {/* 3D Section Divider */}
      <SectionDivider3D />

      {/* Experience Section */}
      <ScrollReveal delay={0.1}>
        <Experience />
      </ScrollReveal>

      {/* 3D Section Divider */}
      <SectionDivider3D />

      {/* Contact Section */}
      <ScrollReveal delay={0.1}>
        <Contact />
      </ScrollReveal>
    </main>
  );
}

