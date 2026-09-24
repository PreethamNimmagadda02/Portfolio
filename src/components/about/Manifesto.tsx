"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "@/lib/motion";
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

type Run = { text: string; gold?: boolean };

const STATEMENT: Run[] = [
  { text: "Software has always waited to be told what to do." },
  { text: "What I build does not wait.", gold: true },
  { text: "It perceives, decides and acts, and carries the work to the end." },
  { text: "Autonomy is easy to demo." },
  { text: "Architecture is what makes it hold.", gold: true },
];

const WORDS = STATEMENT.flatMap((run) => run.text.split(" ").map((word) => ({ word, gold: Boolean(run.gold) })));

/* The stretch of the pin over which the words light. Starting a little in
   lets the statement arrive dim and whole before anything moves; ending short
   of 1 holds the lit statement, signed, for the last part of the travel. */
const LIT_FROM = 0.08;
const LIT_TO = 0.78;
/** How many word-slots each word takes to reach full ink, so the light moves as a wave, not a cursor. */
const SPREAD = 3.5;
/** The unlit ghost. Low enough to read as waiting, high enough to be read ahead. */
const DIM = 0.16;

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
  const step = (LIT_TO - LIT_FROM) / (WORDS.length + SPREAD);
  const start = LIT_FROM + index * step;
  const opacity = useTransform(progress, [start, start + SPREAD * step], [DIM, 1]);
  return (
    <motion.span style={{ opacity }} className={gold ? "text-aurum-200" : undefined}>
      {children}
    </motion.span>
  );
}

export default function Manifesto() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  const rule = useTransform(scrollYProgress, [LIT_FROM, LIT_TO], [0, 1]);
  const signature = useTransform(scrollYProgress, [LIT_TO - 0.04, LIT_TO + 0.08], [0, 1]);
  const drift = useTransform(scrollYProgress, [0, 1], [36, -36]);

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
              <h2 className="eyebrow mb-8 lg:mb-10">
                <span aria-hidden className="ledger text-aurum-300">
                  {no}
                </span>
                <span aria-hidden className="h-px w-6 bg-hairline-gold" />
                THE THESIS
              </h2>

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

              {/* The rule fills as the statement lights, then the statement is
                  signed: the thesis is a position someone is accountable for. */}
              <div className="mt-10 max-w-[46rem] lg:mt-14">
                <span aria-hidden className="relative block h-px w-full bg-hairline">
                  <motion.span
                    className="absolute inset-0 origin-left bg-hairline-gold"
                    style={{ scaleX: reduced ? 1 : rule }}
                  />
                </span>
                <motion.p
                  style={reduced ? undefined : { opacity: signature }}
                  className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2"
                >
                  <span className="font-display text-[22px] italic leading-none text-ivory-100">
                    Preetham Nimmagadda
                  </span>
                  <span className="font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ivory-300">
                    AI architect, Hyderabad
                  </span>
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
