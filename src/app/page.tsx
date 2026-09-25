"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Contact from "@/components/Contact";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIdle } from "@/lib/viewport-store";
import { markSceneWarmed } from "@/lib/utils";

// The single WebGL background for the whole page. Everything else below is
// plain DOM, CSS and Framer Motion, so the three.js chunk is the only thing
// worth keeping off the initial bundle.
const CosmicScene = dynamic(() => import("@/components/scene/CosmicScene"), { ssr: false });

const SectionSkeleton = ({ className }: { className: string }) => <div className={className} aria-hidden />;

/* Placeholder heights are measured, not guessed. A skeleton shorter than the
   section it stands in for makes the document grow as the chunk arrives, which
   slides every anchor below it out from under an in-flight scroll.

   Each tier holds the tallest measurement inside its own range, not the
   measurement at one representative width. Several sections are taller at
   1024 than at 1280 (About by 61px, Experience by 72px) because the columns
   are tighter there, so a single 1280 reading left them short at exactly the
   width where lg: begins. Ranges sampled at 320, 390, 1024 and 1280.

   Re-measure after any change to a section's contents.

   About is the one reserve written partly in vh: its thesis is pinned over a
   track of 200vh (230vh from lg), so the reserve is that track plus the
   measured height of the method block beneath it. */
const About = dynamic(() => import("@/components/About"), {
  loading: () => <SectionSkeleton className="min-h-[calc(200vh+1389px)] w-full lg:min-h-[calc(230vh+991px)]" />,
});
const Experience = dynamic(() => import("@/components/Experience"), {
  loading: () => <SectionSkeleton className="min-h-[3457px] w-full lg:min-h-[2632px]" />,
});
const Projects = dynamic(() => import("@/components/Projects"), {
  loading: () => <SectionSkeleton className="min-h-[1794px] w-full lg:min-h-[1640px]" />,
});
const Skills = dynamic(() => import("@/components/Skills"), {
  loading: () => <SectionSkeleton className="min-h-[1404px] w-full lg:min-h-[1001px]" />,
});
const GitHubStats = dynamic(() => import("@/components/GitHubStats"), {
  loading: () => <SectionSkeleton className="min-h-[1396px] w-full lg:min-h-[1345px]" />,
});
const Achievements = dynamic(() => import("@/components/Achievements"), {
  loading: () => <SectionSkeleton className="min-h-[1911px] w-full lg:min-h-[1515px]" />,
});
/* The one section that needs more than two tiers, and the only one whose
   reserve is worth this much detail.

   Above 1024 the stage and its segmented track hold one height, 1053 at every
   width measured, since the quote column is fixed and nothing wraps. Below
   1024 the carousel is as tall as the longest quote at that width, so it steps every time the text reflows. Each
   tier below is the tallest measurement in its range, sampled at 320, 360,
   384, 480, 700, 960, 1024, 1056 and 1160.

   Every tier is min-[..rem] on purpose. Mixing lg: with min-[..px] put
   min-width:1080px ahead of min-width:64rem in the output, and with equal
   specificity source order decided it, so lg won at every wide viewport and the
   later tiers never applied. Keep the units consistent when editing.

   Re-measure after any change to the quote text: the sub-1024 plateaus are a
   function of how the longest quote wraps, not of the layout alone. */
const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <SectionSkeleton className="min-h-[1048px] w-full min-[24rem]:min-h-[955px] min-[30rem]:min-h-[884px] min-[60rem]:min-h-[934px] min-[64rem]:min-h-[1053px]" />,
});

/* Flat obsidian behind the page until the scene mounts, and the permanent
   backdrop under reduced motion, where no canvas is ever created. This used to
   carry a gold radial gradient standing in for the nebula behind the portrait;
   with the nebula gone the gradient was the only thing still glowing, and it
   made the pre-mount paint and the reduced-motion view brighter than the
   scene they were standing in for. */
const STATIC_LIGHT = "var(--color-obsidian-0)";

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  // Defer the WebGL background until the main thread goes idle so the hero
  // becomes interactive first; the scene then fades in a beat later.
  const idle = useIdle();
  const mountScene = idle && !prefersReducedMotion;

  // With no canvas to warm, tell the loader the scene is ready so it does not
  // hold for MAX_WAIT under reduced motion.
  useEffect(() => {
    if (prefersReducedMotion) markSceneWarmed();
  }, [prefersReducedMotion]);

  return (
    <div className="relative">
      {mountScene ? (
        <CosmicScene />
      ) : (
        <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: STATIC_LIGHT }} aria-hidden />
      )}

      <div className="grain" aria-hidden />

      <div className="relative z-10 flex flex-col">
        <Hero />

        {/* About pins its thesis (position: sticky) and Experience holds a
            sticky column, so neither sits under content-visibility. */}
        <About />

        <Experience />

        <div className="cv-auto [--cv-h:1794px] lg:[--cv-h:1640px]">
          <Projects />
        </div>

        <div className="cv-auto [--cv-h:1404px] lg:[--cv-h:1001px]">
          <Skills />
        </div>

        <div className="cv-auto [--cv-h:1396px] lg:[--cv-h:1345px]">
          <GitHubStats />
        </div>

        <div className="cv-auto [--cv-h:1911px] lg:[--cv-h:1515px]">
          <Achievements />
        </div>

        <div className="cv-auto [--cv-h:1048px] min-[24rem]:[--cv-h:955px] min-[30rem]:[--cv-h:884px] min-[60rem]:[--cv-h:934px] min-[64rem]:[--cv-h:1053px]">
          <Testimonials />
        </div>

        <Contact />
      </div>
    </div>
  );
}
