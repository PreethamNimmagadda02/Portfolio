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

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <ParticleField />
      <SpotlightCursor />
      <NoiseBackground />
      <Hero />
      <SkillsMarquee />
      <About />
      <Projects />
      <Achievements />
      <Experience />
      <Contact />
    </main>
  );
}
