"use client";

import Manifesto from "./about/Manifesto";
import ArchitectureLoop from "./about/ArchitectureLoop";

/**
 * About: the thesis, then the method.
 *
 * First the position, pinned and lit by the reader's scroll: software that
 * does not wait, and architecture as the thing that makes autonomy hold.
 * Then the proof of method: the loop every system runs, drawn as a blueprint,
 * with each stage tied to where it was built.
 *
 * The four convictions that used to live here carried figures that now sit
 * where they are evidence: 95%, 20% and the Matters.AI copilot on the loop,
 * the rankings in Achievements, the 1,500+ and 1,800+ mandates in Experience.
 */
export default function About() {
  return (
    <section id="about" aria-label="About" className="relative w-full">
      <Manifesto />
      <ArchitectureLoop />
    </section>
  );
}
