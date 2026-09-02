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
   slides every anchor below it out from under an in-flight scroll. The two
   tiers are the rendered heights at 390px and at 1280px and up. */
const About = dynamic(() => import("@/components/About"), {
  loading: () => <SectionSkeleton className="min-h-[1658px] w-full lg:min-h-[1191px]" />,
});
const Experience = dynamic(() => import("@/components/Experience"), {
  loading: () => <SectionSkeleton className="min-h-[2662px] w-full lg:min-h-[2312px]" />,
});
const Skills = dynamic(() => import("@/components/Skills"), {
  loading: () => <SectionSkeleton className="min-h-[1222px] w-full lg:min-h-[929px]" />,
});
const Projects = dynamic(() => import("@/components/Projects"), {
  loading: () => <SectionSkeleton className="min-h-[1355px] w-full lg:min-h-[1450px]" />,
});
const GitHubStats = dynamic(() => import("@/components/GitHubStats"), {
  loading: () => <SectionSkeleton className="min-h-[1265px] w-full lg:min-h-[1226px]" />,
});
const Achievements = dynamic(() => import("@/components/Achievements"), {
  loading: () => <SectionSkeleton className="min-h-[1651px] w-full lg:min-h-[1397px]" />,
});
/* The one section that needs more than two tiers, and the only one whose
   reserve is worth this much detail.

   Two things move its height. Above 1024 the fourteen-name voice strip wraps to
   three rows, then two from 1160. Below 1024 the carousel is as tall as the
   longest quote at that width, so it steps every time the text reflows. Each
   tier below is a measured plateau, worst residual 25px at 700.

   Every tier is min-[..rem] on purpose. Mixing lg: with min-[..px] put
   min-width:1080px ahead of min-width:64rem in the output, and with equal
   specificity source order decided it, so lg won at every wide viewport and the
   later tiers never applied. Keep the units consistent when editing.

   Re-measure after any change to the quote text: the sub-1024 plateaus are a
   function of how the longest quote wraps, not of the layout alone. */
const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <SectionSkeleton className="min-h-[932px] w-full min-[24rem]:min-h-[859px] min-[30rem]:min-h-[812px] min-[60rem]:min-h-[775px] min-[64rem]:min-h-[934px] min-[66rem]:min-h-[907px] min-[72.5rem]:min-h-[870px]" />,
});

/* Gold light leaking from the upper right, where the nebula will sit behind
   the portrait plate once the scene mounts. Also the permanent backdrop under
   reduced motion, where no canvas is ever created. Token-pure: no literals. */
const STATIC_LIGHT =
  "radial-gradient(60% 45% at 78% 30%, color-mix(in srgb, var(--color-aurum-300) 10%, transparent), transparent 70%), var(--color-obsidian-0)";

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  // Defer the WebGL background until the main thread goes idle so the hero
  // becomes interactive first; the scene then fades in a beat later.
  const idle = useIdle();
  const mountScene = idle && !prefersReducedMotion;

  // With no canvas to warm, tell the loader the scene is ready so it does not
  // hold for MAX_WAIT under reduced motion.
  useEffect(() => {
    if (prefersReducedMotion) markSceneWarmed("cosmic");
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

        <div className="cv-auto [--cv-h:1658px] lg:[--cv-h:1191px]">
          <About />
        </div>

        {/* Experience holds a position: sticky column, so no content-visibility here. */}
        <Experience />

        <div className="cv-auto [--cv-h:1222px] lg:[--cv-h:929px]">
          <Skills />
        </div>

        <div className="cv-auto [--cv-h:1355px] lg:[--cv-h:1450px]">
          <Projects />
        </div>

        <div className="cv-auto [--cv-h:1265px] lg:[--cv-h:1226px]">
          <GitHubStats />
        </div>

        <div className="cv-auto [--cv-h:1651px] lg:[--cv-h:1397px]">
          <Achievements />
        </div>

        <div className="cv-auto [--cv-h:932px] min-[24rem]:[--cv-h:859px] min-[30rem]:[--cv-h:812px] min-[60rem]:[--cv-h:775px] min-[64rem]:[--cv-h:934px] min-[66rem]:[--cv-h:907px] min-[72.5rem]:[--cv-h:870px]">
          <Testimonials />
        </div>

        <Contact />
      </div>
    </div>
  );
}
