"use client";

import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import NoiseBackground from "@/components/NoiseBackground";
import SkillsMarquee from "@/components/SkillsMarquee";
import Achievements from "@/components/Achievements";
import dynamic from "next/dynamic";

// Dynamic import for Three.js components (client-side only)
const ParticleField = dynamic(() => import("@/components/ParticleField"), { ssr: false });
const SpotlightCursor = dynamic(() => import("@/components/SpotlightCursor"), { ssr: false });
const SectionDivider3D = dynamic(() => import("@/components/SectionDivider3D"), { ssr: false });
const FloatingOrbs3D = dynamic(() => import("@/components/SectionDivider3D").then(mod => ({ default: mod.FloatingOrbs3D })), { ssr: false });

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      {/* 3D Background layers */}
      <ParticleField />
      <FloatingOrbs3D />
      <SpotlightCursor />
      <NoiseBackground />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Skills Marquee with 3D divider */}
      <SkillsMarquee />
      
      {/* 3D Section Divider */}
      <SectionDivider3D />
      
      {/* About Section */}
      <About />
      
      {/* Projects Section */}
      <Projects />
      
      {/* 3D Section Divider */}
      <SectionDivider3D />
      
      {/* Achievements Section */}
      <Achievements />
      
      {/* Experience Section */}
      <Experience />
      
      {/* 3D Section Divider */}
      <SectionDivider3D />
      
      {/* Contact Section */}
      <Contact />
    </main>
  );
}
