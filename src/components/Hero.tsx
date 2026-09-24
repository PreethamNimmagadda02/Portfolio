"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDownRight } from "@phosphor-icons/react";
import { motion, useScroll, useTransform, EASE_HEAVY, EASE_SETTLE, type Variants } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocalTime } from "@/hooks/use-local-time";
import { TextButton } from "@/components/ui";
import { cn, smoothScrollTo } from "@/lib/utils";
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
   eyebrow decodes from 0.15, the headline lines rise at 0.30, 0.40 and 0.50
   (CSS, see below), the plate wipes up from 0.20, the subtext lands at 0.85,
   the CTAs at 1.05 and 1.15, the cover row at 1.40, and the foil glint
   crosses "acts" at 1.60. */
const T = {
  eyebrow: 0.15,
  plate: 0.2,
  subtext: 0.85,
  primary: 1.05,
  primaryLabel: 1.35,
  secondary: 1.15,
  cover: 1.4,
  glintMs: 1600,
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

/* ------------------------------------------------------------------------
   Decoding eyebrow
   ------------------------------------------------------------------------ */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * The eyebrow resolves out of noise, left to right, the way a model's output
 * settles: the one place the page lets the machine show through the print.
 *
 * It is set in the mono face, so every glyph that flickers through a cell is
 * exactly as wide as the letter that lands there and nothing reflows. The
 * server and the first client render both print the final text, so there is
 * no hydration difference and no scrambled first paint; the noise only runs
 * once the entrance begins, and never under reduced motion.
 */
function DecodeText({
  text,
  active,
  reduced,
  delayMs = 0,
  durationMs = 900,
}: {
  text: string;
  active: boolean;
  reduced: boolean;
  delayMs?: number;
  durationMs?: number;
}) {
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (!active || reduced) return;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / durationMs, 1);
      const settled = Math.floor(t * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        // Separators and spaces hold still, so the word shapes read at once.
        out += i < settled || !/[A-Z0-9]/.test(ch) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setShown(out);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delayMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [active, reduced, text, delayMs, durationMs]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{shown}</span>
    </>
  );
}

/* ------------------------------------------------------------------------
   Hero: the cover
   ------------------------------------------------------------------------ */

const EYEBROW = "AI ARCHITECT · AUTONOMOUS SYSTEMS";

/* Each display line rises out of its own mask. The descender reserve is set
   in em rather than the shared 0.5rem, because at 7rem the g in
   "Architecting" hangs well past half a rem below the line box. The matching
   negative margin keeps the reserve from opening the leading. */
const LINE_MASK: CSSProperties = { paddingBottom: "0.2em", marginBottom: "-0.2em" };

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const loaderDone = useLoaderDone();
  const reduced = useReducedMotion();
  const localTime = useLocalTime();
  const isMobile = useIsMobile();

  /* Scroll parallax: the text sinks and fades while the plate lifts off the
     page. MotionValues go straight to style, so no React renders per frame. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const plateY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const coverOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
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

  const eyebrowVariants = fade(reduced, T.eyebrow, 0.4);
  const subtextVariants = fadeRise(reduced, T.subtext, 0.8);
  const secondaryVariants = fade(reduced, T.secondary, 0.5);
  const primaryLabelVariants = fade(reduced, T.primaryLabel, 0.3);
  const coverVariants = fade(reduced, T.cover, 0.9);
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
    <section ref={sectionRef} id="home" className="relative flex min-h-[100dvh] flex-col">
      <div className="flex flex-1 items-center pt-20 pb-12 [@media(max-height:700px)_and_(max-width:767px)]:pt-[4.5rem] [@media(max-height:700px)_and_(max-width:767px)]:pb-6 lg:pt-24 lg:pb-10">
        <div className="relative mx-auto grid w-full max-w-[1280px] grid-cols-12 items-end gap-x-6 px-6 lg:px-10">
          {/* Text block */}
          <motion.div
            style={{ y: parallax ? textY : 0, opacity: parallax ? textOpacity : 1 }}
            className="order-2 col-span-12 flex flex-col items-start md:order-1 md:col-span-7 lg:col-span-8"
          >
            <motion.span
              variants={eyebrowVariants}
              initial="hidden"
              animate={state}
              className="eyebrow mb-5 lg:mb-7"
            >
              <span aria-hidden className="size-1.5 rotate-45 bg-aurum-300" />
              <DecodeText text={EYEBROW} active={loaderDone} reduced={reduced} delayMs={T.eyebrow * 1000} />
            </motion.span>

            {/* Plate lift: each line rises out of its own mask once the wrapper
                gains .in-view at loader-done; the rule beneath is the match cut. */}
            <div className={loaderDone ? "in-view max-w-full" : "max-w-full"}>
              <h1
                aria-label="Architecting intelligence that acts."
                className={cn(
                  "font-display font-normal text-ivory-100 tracking-[-0.015em]",
                  "text-[2.75rem] leading-[1.02] min-[400px]:text-[3rem] md:text-[3.5rem]",
                  "[@media(max-height:700px)_and_(max-width:767px)]:text-[2.5rem]",
                  "lg:text-[clamp(4.5rem,7.1vw,7rem)] lg:leading-[0.98]"
                )}
              >
                <span className="line-mask" style={LINE_MASK} aria-hidden>
                  <span className="line-rise" style={{ "--rise-delay": "300ms" } as CSSProperties}>
                    Architecting
                  </span>
                </span>
                <span className="line-mask" style={LINE_MASK} aria-hidden>
                  <span className="line-rise" style={{ "--rise-delay": "400ms" } as CSSProperties}>
                    intelligence
                  </span>
                </span>
                <span className="line-mask" style={LINE_MASK} aria-hidden>
                  <span className="line-rise" style={{ "--rise-delay": "500ms" } as CSSProperties}>
                    that{" "}
                    {/* The one italic word on the page, and the one the light
                        finds: a single foil glint once the cover has settled,
                        then the hover sweep for anyone who reaches for it. */}
                    <em
                      className={cn("foil glint pr-[0.04em] italic font-normal", loaderDone && !reduced && "is-lit")}
                      style={{ "--glint-delay": `${T.glintMs}ms` } as CSSProperties}
                    >
                      acts
                    </em>
                    .
                  </span>
                </span>
              </h1>
              <motion.span
                ref={ruleRef}
                aria-hidden
                variants={ruleVariants}
                initial="hidden"
                animate={state}
                className="mt-3 block h-px w-full origin-left bg-hairline-gold lg:mt-5"
              />
            </div>

            <motion.p
              variants={subtextVariants}
              initial="hidden"
              animate={state}
              className="mt-7 max-w-[50ch] font-sans text-[15px] leading-[1.6] text-ivory-200 md:text-[17px] md:leading-[1.65] lg:mt-9"
            >
              AI is moving from answering to acting. I architect the systems that do the acting:
              agents that perceive, decide and carry work to the end.
              {/* On the shortest phones the credentials give way to the calls
                  to action; Experience carries the same three names. */}
              <span className="[@media(max-height:700px)_and_(max-width:767px)]:hidden">
                {" "}
                Shipped at Matters.AI, Introspect Labs and METAVERTEX.
              </span>
            </motion.p>

            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-5 lg:mt-10">
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
            className="order-1 col-span-12 mb-7 [@media(max-height:700px)_and_(max-width:767px)]:mb-4 md:order-2 md:col-span-5 md:mb-0 lg:col-span-4 lg:col-start-9"
          >
            {/* The clip wrapper carries 8px of padding (and a matching negative
                margin) so its settled clip-path never trims the figure's focus ring. */}
            <motion.div variants={plateVariants} initial="hidden" animate={state} className="-m-2 p-2">
              <PortraitPlate />
              {/* Plate caption, the way a monograph credits its frontispiece.
                  The figure already names the sitter for assistive tech. */}
              <div
                aria-hidden
                className="mt-4 hidden flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-hairline pt-3 md:flex"
              >
                {/* Each item holds together; on a narrow plate the institute
                    drops beneath the name rather than breaking mid-phrase. */}
                <span className="whitespace-nowrap font-sans text-[13px] leading-none text-ivory-100">
                  Preetham Nimmagadda
                </span>
                <span className="whitespace-nowrap font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ivory-300">
                  IIT (ISM) Dhanbad
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Cover row: the three facts a cover carries at its foot. Desktop only;
          on a phone the portrait and the copy already fill the first screen. */}
      {/* Two layers so the entrance fade and the scroll fade never contend
          for the same opacity: the outer one follows the scroll, the inner one
          arrives once. */}
      <motion.div
        style={{ opacity: parallax ? coverOpacity : 1 }}
        className="relative mx-auto hidden w-full max-w-[1280px] px-10 pb-7 lg:block"
      >
        <motion.div
          variants={coverVariants}
          initial="hidden"
          animate={state}
          className="grid grid-cols-12 items-center gap-x-6 border-t border-hairline pt-5 font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ivory-300"
        >
          <span className="col-span-4 flex items-center gap-3">
            <span aria-hidden className="size-1.5 rotate-45 bg-aurum-300" />
            <span className="text-ivory-200">Taking on new work</span>
          </span>
          <span className="col-span-4 flex items-center justify-center gap-3">
            Hyderabad, India
            <span aria-hidden className="h-px w-4 bg-hairline-gold" />
            <span className="ledger text-ivory-200">{localTime ?? "--:--"} IST</span>
          </span>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo("#about");
            }}
            className="group col-span-4 flex items-center justify-end gap-3 transition-colors duration-300 ease-heavy hover:text-ivory-100"
          >
            Scroll to read the thesis
            <span aria-hidden className="relative block h-6 w-px overflow-hidden bg-hairline">
              <span className="scroll-cue absolute inset-0 bg-aurum-300" />
            </span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
