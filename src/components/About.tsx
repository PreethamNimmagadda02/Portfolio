"use client";

import Manifesto from "./about/Manifesto";
import Profile from "./about/Profile";
import ArchitectureLoop from "./about/ArchitectureLoop";
import { ChapterTurn } from "./about/ChapterTurn";

/**
 * About, in three movements: the belief, the person, the method.
 *
 * 01.1, the thesis, pinned and lit by the reader's scroll: software that does
 * not wait, and architecture as the thing that makes autonomy hold.
 * 01.2, the architect: a seal, one paragraph and the record as a ledger.
 * 01.3, the method: the loop every system runs, drawn as a blueprint, with
 * each stage tied to where it was built.
 *
 * The four convictions that used to live here carried figures that now sit
 * where they are evidence: 95%, 20% and the Matters.AI copilot on the loop,
 * the rankings in Achievements, the 1,500+ and 1,800+ mandates in Experience.
 */
export default function About() {
  return (
    <section id="about" aria-label="About" className="relative w-full">
      <Manifesto />
      <Profile />
      <ArchitectureLoop />
      <ChapterTurn from="about" to="experience" />
    </section>
  );
}
