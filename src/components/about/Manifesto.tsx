"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  EASE_HEAVY,
  type MotionValue,
} from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { chapter } from "@/lib/chapters";
import { cn } from "@/lib/utils";

/**
 * The thesis, lit by the reader's own scroll.
 *
 * The statement is pinned for a little under two screens of travel while its
 * words ignite in reading order, from a dim ghost of the line to full ink,
 * with the two sentences the page stands on set in gold. Nothing here plays
 * on its own: the reader's hand is the clock, so the pace is always theirs.
 *
 * Every word is a MotionValue transform of one scroll progress, so a whole
 * pass through the pin costs no React renders. Screen readers get the plain
 * paragraph, since opacity never removes anything from the tree. Under
 * reduced motion the pin collapses and the statement is simply printed.
 */

/** One sentence of the thesis: its words, whether it is set in gold, and the name of the movement it makes. */
type Run = { text: string; gold?: boolean; movement: string };

const STATEMENT: Run[] = [
  { text: "Software has always waited to be told what to do.", movement: "The old contract" },
  { text: "What I build does not wait.", gold: true, movement: "The break" },
  { text: "It perceives, decides and acts, and carries the work to the end.", movement: "The loop" },
  { text: "Autonomy is easy to demo.", movement: "The trap" },
  { text: "Architecture is what makes it hold.", gold: true, movement: "The answer" },
];

const WORDS = STATEMENT.flatMap((run, r) =>
  run.text.split(" ").map((word) => ({ word, gold: Boolean(run.gold), run: r }))
);

const NUMERALS = ["I", "II", "III", "IV", "V"];

/* The stretch of the pin over which the words light. Starting a little in
   lets the statement arrive dim and whole before anything moves; ending short
   of 1 holds the lit statement, signed, for the last part of the travel. */
const LIT_FROM = 0.08;
const LIT_TO = 0.78;
/** How many word-slots each word takes to reach full ink, so the light moves as a wave, not a cursor. */
const SPREAD = 3.5;
/** The unlit ghost. Low enough to read as waiting, high enough to be read ahead. */
const DIM = 0.16;

/** Where word `index` begins and finishes lighting, as scroll progress. */
function wordWindow(index: number) {
  const step = (LIT_TO - LIT_FROM) / (WORDS.length + SPREAD);
  const start = LIT_FROM + index * step;
  return [start, start + SPREAD * step] as const;
}

/**
 * One word of the thesis. Unlit it is a ghost: dim, a fraction of an em low
 * and slightly out of focus, like type seen through the back of the sheet.
 * As the reader's scroll reaches it, it rises into place and sharpens. A gold
 * word also catches the light: a foil band crosses it once as it ignites, so
 * the two sentences the page stands on read as struck, not merely coloured.
 */
function Word({
  progress,
  index,
  gold,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  gold: boolean;
  children: string;
}) {
  const [start, end] = wordWindow(index);
  const opacity = useTransform(progress, [start, end], [DIM, 1]);
  const y = useTransform(progress, [start, end], ["0.14em", "0em"]);
  const filter = useTransform(progress, [start, end], ["blur(3px)", "blur(0px)"]);
  // The band parks off the glyph on both sides of its pass, so it is only
  // ever seen crossing, never resting.
  const band = useTransform(progress, [start, end + (end - start) * 0.6], ["100% 0", "0% 0"]);
  return (
    <motion.span
      style={gold ? { opacity, y, filter, backgroundPosition: band } : { opacity, y, filter }}
      className={cn("inline-block will-change-[opacity,transform]", gold && "foil [--foil-base:var(--color-aurum-200)] [transition:none]")}
    >
      {children}
    </motion.span>
  );
}

/* The window over which sentence r lights: from its first word's start to its last word's end. */
const RUN_WINDOWS = STATEMENT.map((_, r) => {
  const first = WORDS.findIndex((w) => w.run === r);
  const last = WORDS.length - 1 - [...WORDS].reverse().findIndex((w) => w.run === r);
  return [wordWindow(first)[0], wordWindow(last)[1]] as const;
});

/**
 * The folio of the argument: five numerals that light as their sentences do,
 * and the name of the movement the reader is in. Five renders a pass, one per
 * sentence; the words themselves never render.
 */
function Movements({ progress }: { progress: MotionValue<number> }) {
  const [current, setCurrent] = useState(0);
  useMotionValueEvent(progress, "change", (v) => {
    let r = 0;
    for (let i = 0; i < RUN_WINDOWS.length; i++) if (v >= RUN_WINDOWS[i][0]) r = i;
    setCurrent((c) => (c === r ? c : r));
  });
  return (
    <div aria-hidden className="hidden items-center gap-5 caption sm:flex">
      <span className="flex items-center gap-3">
        {NUMERALS.map((n, i) => (
          <span
            key={n}
            className={cn(
              "ledger transition-colors duration-500 ease-heavy",
              i === current ? "text-aurum-300" : i < current ? "text-ivory-200" : "text-ivory-300/50"
            )}
          >
            {n}
          </span>
        ))}
      </span>
      <span className="h-px w-6 bg-hairline-gold" />
      <span className="relative block h-3 w-40 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={current}
            className="absolute inset-0 text-ivory-200"
            initial={{ y: "110%" }}
            animate={{ y: 0, transition: { duration: 0.6, ease: EASE_HEAVY } }}
            exit={{ y: "-110%", transition: { duration: 0.4, ease: EASE_HEAVY } }}
          >
            {STATEMENT[current].movement}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

export default function Manifesto() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  const rule = useTransform(scrollYProgress, [LIT_FROM, LIT_TO], [0, 1]);
  const signature = useTransform(scrollYProgress, [LIT_TO - 0.04, LIT_TO + 0.1], [0, 1]);
  /* The name is written in, left to right, rather than faded up. */
  const signatureClip = useTransform(signature, (v) => `inset(-20% ${(100 - v * 100).toFixed(2)}% -20% 0)`);
  const caption = useTransform(scrollYProgress, [LIT_TO + 0.06, LIT_TO + 0.14], [0, 1]);
  const drift = useTransform(scrollYProgress, [0, 1], [36, -36]);
  /* A reading lamp: a pool of warm light that travels the statement with the
     lit frontier, down and across, so the eye is led and the page feels lit
     rather than printed on black. */
  const lampX = useTransform(scrollYProgress, [LIT_FROM, LIT_TO], ["8%", "62%"]);
  const lampY = useTransform(scrollYProgress, [LIT_FROM, LIT_TO], ["18%", "82%"]);
  const lampOpacity = useTransform(scrollYProgress, [0, LIT_FROM, LIT_TO, 1], [0, 1, 1, 0.35]);

  const { no } = chapter("about");

  return (
    <div
      ref={trackRef}
      className={cn("relative", reduced ? "py-32 lg:py-40" : "h-[200vh] lg:h-[230vh]")}
    >
      <div className={cn(!reduced && "sticky top-0 flex h-[100dvh] items-center overflow-hidden")}>
        <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
          <motion.div style={reduced ? undefined : { y: drift }} className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 lg:col-span-11">
              <div className="mb-8 flex items-center justify-between gap-6 lg:mb-10">
                <h2 className="eyebrow">
                  <span aria-hidden className="ledger text-aurum-300">
                    {no}
                  </span>
                  <span aria-hidden className="h-px w-6 bg-hairline-gold" />
                  THE THESIS
                </h2>
                {reduced ? null : <Movements progress={scrollYProgress} />}
              </div>

              <div className="relative">
                {reduced ? null : (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute -z-10 block size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: lampX,
                      top: lampY,
                      opacity: lampOpacity,
                      background:
                        "radial-gradient(closest-side, color-mix(in srgb, var(--color-aurum-300) 13%, transparent), transparent)",
                    }}
                  />
                )}

                <p className="font-display font-normal text-ivory-100 text-[2rem] leading-[1.16] tracking-[-0.012em] min-[400px]:text-[2.25rem] md:text-[3rem] lg:text-[clamp(3rem,4.35vw,4.25rem)] lg:leading-[1.12]">
                  {WORDS.map(({ word, gold }, i) =>
                    reduced ? (
                      <span key={i} className={gold ? "text-aurum-200" : undefined}>
                        {word}{" "}
                      </span>
                    ) : (
                      <span key={i}>
                        <Word progress={scrollYProgress} index={i} gold={gold}>
                          {word}
                        </Word>{" "}
                      </span>
                    )
                  )}
                </p>
              </div>

              {/* The rule fills as the statement lights, then the statement is
                  signed: the thesis is a position someone is accountable for. */}
              <div className="mt-10 max-w-[46rem] lg:mt-14">
                <span aria-hidden className="relative block h-px w-full bg-hairline">
                  <motion.span
                    className="absolute inset-0 origin-left bg-hairline-gold"
                    style={{ scaleX: reduced ? 1 : rule }}
                  />
                </span>
                <p className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <motion.span
                    style={reduced ? undefined : { clipPath: signatureClip }}
                    className="font-display text-[28px] italic leading-none text-ivory-100"
                  >
                    Preetham Nimmagadda
                  </motion.span>
                  <motion.span
                    style={reduced ? undefined : { opacity: caption }}
                    className="caption text-ivory-300"
                  >
                    AI architect, Hyderabad
                  </motion.span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
