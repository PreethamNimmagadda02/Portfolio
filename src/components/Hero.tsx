"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDownRight } from "@phosphor-icons/react";
import { motion, useScroll, useTransform, EASE_HEAVY, EASE_SETTLE, type Variants } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { TextButton } from "@/components/ui";
import PortraitPlate from "./PortraitPlate";

/**
 * Loader-completion hook with a safety net. Resolves via the "loader-done"
 * event, the global flag (if the event already fired before mount), or a
 * fallback timeout so the hero can never stay hidden forever. The loader
 * fires loader-done at the start of its exit wipe and holds at most
 * MIN_SHOWN 1400ms / MAX_WAIT 5000ms, so 6500ms comfortably outlasts it.
 */
function useLoaderDone(fallbackMs = 6500) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onDone = () => setDone(true);
    window.addEventListener("loader-done", onDone);
    const alreadyDone = (window as unknown as { __loaderDone?: boolean }).__loaderDone;
    const fallback = setTimeout(onDone, alreadyDone ? 0 : fallbackMs);
    return () => {
      window.removeEventListener("loader-done", onDone);
      clearTimeout(fallback);
    };
  }, [fallbackMs]);

  return done;
}

/* Entrance clock, in seconds from loader-done. The rule contracts at 0, the
   eyebrow at 0.15, the headline lines at 0.30 and 0.42 (CSS, see below), the
   plate at 0.20, the subtext at 0.80, the CTAs at 1.00 and 1.10. */
const T = {
  eyebrow: 0.15,
  plate: 0.2,
  subtext: 0.8,
  primary: 1.0,
  primaryLabel: 1.3,
  secondary: 1.1,
} as const;

const REDUCED_FADE = { duration: 0.2 } as const;

/** Opacity plus an 8px rise; opacity-only 200ms under reduced motion. */
function fadeRise(reduced: boolean, delay: number, duration: number): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 8 },
    shown: {
      opacity: 1,
      y: 0,
      transition: reduced ? REDUCED_FADE : { delay, duration, ease: EASE_SETTLE },
    },
  };
}

/** Opacity only. */
function fade(reduced: boolean, delay: number, duration: number): Variants {
  return {
    hidden: { opacity: 0 },
    shown: {
      opacity: 1,
      transition: reduced ? REDUCED_FADE : { delay, duration, ease: EASE_SETTLE },
    },
  };
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const loaderDone = useLoaderDone();
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  /* Scroll parallax: the text sinks and fades while the plate lifts off the
     page. MotionValues go straight to style, so no React renders per frame. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const plateY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const parallax = !reduced && !isMobile;

  /* Match cut. At loader-done the hero's rule stands in for the loader's
     full-width gold line: it is measured once, placed over the whole viewport
     with translateX and scaleX, and contracts to the headline's own width over
     700ms on the heavy ease. Transform only; one layout read, no state. */
  useEffect(() => {
    if (!loaderDone || reduced) return;
    const el = ruleRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const animation = el.animate(
      [
        { transform: `translateX(${-rect.left}px) scaleX(${window.innerWidth / rect.width})` },
        { transform: "translateX(0px) scaleX(1)" },
      ],
      { duration: 700, easing: `cubic-bezier(${EASE_HEAVY.join(", ")})`, fill: "forwards" }
    );
    animation.onfinish = () => animation.cancel();
    return () => animation.cancel();
  }, [loaderDone, reduced]);

  const state = loaderDone ? "shown" : "hidden";

  const eyebrowVariants = fadeRise(reduced, T.eyebrow, 0.5);
  const subtextVariants = fadeRise(reduced, T.subtext, 0.7);
  const secondaryVariants = fade(reduced, T.secondary, 0.5);
  const primaryLabelVariants = fade(reduced, T.primaryLabel, 0.3);
  /* The rule is transform-driven by the effect above; Framer only owns its
     opacity, which flips at loader-done (or fades 200ms under reduced motion). */
  const ruleVariants = fade(reduced, 0, 0);

  const primaryVariants: Variants = {
    hidden: { opacity: reduced ? 0 : 1, scaleX: reduced ? 1 : 0 },
    shown: {
      opacity: 1,
      scaleX: 1,
      transition: reduced ? REDUCED_FADE : { delay: T.primary, duration: 0.45, ease: EASE_HEAVY },
    },
  };

  const plateVariants: Variants = {
    hidden: {
      opacity: reduced ? 0 : 1,
      clipPath: reduced ? "inset(0px 0px 0% 0px)" : "inset(0px 0px 100% 0px)",
    },
    shown: {
      opacity: 1,
      clipPath: "inset(0px 0px 0% 0px)",
      transition: reduced ? REDUCED_FADE : { delay: T.plate, duration: 1.4, ease: EASE_HEAVY },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative flex min-h-[100dvh] items-center pt-20 pb-16 lg:pt-24"
    >
      {/* Static gold light behind the plate; stands in until the scene mounts
          and remains the only glow under reduced motion. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 78% 30%, color-mix(in srgb, var(--color-aurum-300) 10%, transparent), transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1280px] grid-cols-12 items-start gap-x-6 px-6 lg:px-10">
        {/* Text block */}
        <motion.div
          style={{ y: parallax ? textY : 0, opacity: parallax ? textOpacity : 1 }}
          className="order-2 col-span-12 flex flex-col items-start md:order-1 md:col-span-6 lg:col-span-7"
        >
          <motion.span
            variants={eyebrowVariants}
            initial="hidden"
            animate={state}
            className="eyebrow mb-4"
          >
            AUTONOMOUS SYSTEMS · IIT (ISM) DHANBAD
          </motion.span>

          {/* Plate lift: each line rises out of its own mask once the wrapper
              gains .in-view at loader-done; the rule beneath is the match cut. */}
          <div className={loaderDone ? "in-view max-w-full" : "max-w-full"}>
            <h1
              aria-label="AI that acts, not just answers."
              className="font-display font-normal text-ivory-100 text-[2.5rem] leading-[1.06] tracking-[-0.01em] lg:text-[clamp(3.5rem,6.2vw,5.25rem)] lg:leading-[1.04]"
            >
              <span className="line-mask -mb-2" aria-hidden>
                <span className="line-rise" style={{ "--rise-delay": "300ms" } as CSSProperties}>
                  AI that <em className="italic font-normal">acts</em>,
                </span>
              </span>
              <span className="line-mask" aria-hidden>
                <span className="line-rise" style={{ "--rise-delay": "420ms" } as CSSProperties}>
                  not just answers.
                </span>
              </span>
            </h1>
            <motion.span
              ref={ruleRef}
              aria-hidden
              variants={ruleVariants}
              initial="hidden"
              animate={state}
              className="block h-px w-full origin-left bg-hairline-gold"
            />
          </div>

          <motion.p
            variants={subtextVariants}
            initial="hidden"
            animate={state}
            className="mt-8 max-w-[52ch] font-sans text-[15px] leading-[1.6] text-ivory-200 md:text-[17px] md:leading-[1.65]"
          >
            Most of the field is still demonstrating what AI could do. I ship systems that already
            do it: exposures found and closed unattended, agents that carry work to the end. Built at
            Matters.AI, Introspect Labs and IIT (ISM) Dhanbad.
          </motion.p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            {/* The border draws (scaleX) before the label and icon fade in. */}
            <motion.div variants={primaryVariants} initial="hidden" animate={state} className="origin-left">
              <TextButton
                variant="primary"
                href="#projects"
                icon={
                  <motion.span variants={primaryLabelVariants} className="inline-flex">
                    <ArrowDownRight size={16} weight="light" />
                  </motion.span>
                }
              >
                <motion.span variants={primaryLabelVariants} className="inline-block">
                  View selected work
                </motion.span>
              </TextButton>
            </motion.div>

            <motion.div variants={secondaryVariants} initial="hidden" animate={state}>
              <TextButton variant="secondary" href="#contact">
                Start a conversation
              </TextButton>
            </motion.div>
          </div>
        </motion.div>

        {/* Portrait plate */}
        <motion.div
          style={{ y: parallax ? plateY : 0 }}
          className="order-1 col-span-12 mb-8 md:order-2 md:col-span-6 md:mb-0 lg:col-span-5 lg:col-start-8"
        >
          {/* The clip wrapper carries 8px of padding (and a matching negative
              margin) so its settled clip-path never trims the figure's focus ring. */}
          <motion.div variants={plateVariants} initial="hidden" animate={state} className="-m-2 p-2">
            <PortraitPlate />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
