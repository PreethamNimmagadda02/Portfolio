"use client";

import { useRef } from "react";
import { ArrowDownRight } from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { SectionHeading, LedgerNumber, TextButton } from "@/components/ui";
import { categoryLabels, skillsData } from "@/lib/skills-data";
import { Ornament } from "./Ornament";
import { cn, round3 } from "@/lib/utils";

/**
 * The architect: who holds the thesis, between the belief and the method.
 *
 * A seal on the left, struck like a maker's mark: the monogram in foil inside
 * a graduated ring, with the practice and its address running round the rim
 * and turning slowly, a little faster as the page moves. On the right the
 * person in one paragraph and the record as a ledger of six figures.
 *
 * Every figure is already on the page elsewhere and is restated, never new:
 * the three industry roles (Experience), six builds with three live
 * (Projects), the HackerRank percentile and problem count (Achievements), the
 * residents led (Experience) and the toolset (Skills, counted from its data).
 */

const RING_TEXT = "AI ARCHITECT · AUTONOMOUS SYSTEMS · IIT (ISM) DHANBAD · HYDERABAD · ";

/* Seal geometry, in SVG user units on a 400 square. */
const C = 200;
const TEXT_R = 158;
const TEXT_LENGTH = Math.round(2 * Math.PI * TEXT_R);
const fix = round3;
const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = ((i * 5 - 90) * Math.PI) / 180;
  const major = i % 6 === 0;
  const r1 = major ? 130 : 134;
  return {
    x1: fix(C + r1 * Math.cos(a)),
    y1: fix(C + r1 * Math.sin(a)),
    x2: fix(C + 140 * Math.cos(a)),
    y2: fix(C + 140 * Math.sin(a)),
    major,
  };
});

const TOOL_COUNT = skillsData.length;
const DISCIPLINE_COUNT = Object.keys(categoryLabels).length;

interface Entry {
  figure: string;
  /** What the figure counts, read aloud with it. */
  label: string;
  /** Where it comes from. */
  source: string;
}

const RECORD: Entry[] = [
  { figure: "03", label: "Industry roles", source: "Matters.AI, Introspect Labs, METAVERTEX" },
  { figure: "06", label: "Builds shipped", source: "Three of them live" },
  { figure: "0.07%", label: "HackerRank, top", source: "Of 26M+ developers" },
  { figure: "1,000+", label: "Problems solved", source: "Across five judges" },
  { figure: "1,800+", label: "Residents led", source: "Hostel Prefect, IIT (ISM)" },
  { figure: String(TOOL_COUNT), label: "Tools in the kit", source: `Across ${DISCIPLINE_COUNT} disciplines` },
];

function Seal() {
  const pathId = "seal-text-path";
  const foilId = "seal-foil";
  return (
    <svg viewBox="0 0 400 400" className="block h-auto w-full overflow-visible" aria-hidden>
      <defs>
        <path
          id={pathId}
          d={`M ${C - TEXT_R} ${C} a ${TEXT_R} ${TEXT_R} 0 1 1 ${TEXT_R * 2} 0 a ${TEXT_R} ${TEXT_R} 0 1 1 ${-TEXT_R * 2} 0`}
        />
        <linearGradient id={foilId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" className="[stop-color:var(--color-aurum-100)]" />
          <stop offset="48%" className="[stop-color:var(--color-aurum-300)]" />
          <stop offset="100%" className="[stop-color:var(--color-aurum-500)]" />
        </linearGradient>
      </defs>

      {/* The rim: a gold rule, a hairline inside it, and the lettering between. */}
      <circle cx={C} cy={C} r={192} fill="none" className="stroke-hairline-gold" strokeWidth={1} />
      <circle cx={C} cy={C} r={184} fill="none" className="stroke-hairline" strokeWidth={1} />
      <g className="seal-turn">
        <text className="fill-ivory-300 font-mono uppercase" fontSize={11} letterSpacing="0.2em">
          <textPath href={`#${pathId}`} textLength={TEXT_LENGTH} lengthAdjust="spacing">
            {RING_TEXT.repeat(2)}
          </textPath>
        </text>
      </g>

      {/* The graduated ring, a long tick every thirty degrees. */}
      <circle cx={C} cy={C} r={140} fill="none" className="stroke-hairline" strokeWidth={1} />
      <g strokeWidth={1}>
        {TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            className={t.major ? "stroke-aurum-300" : "stroke-hairline-strong"}
          />
        ))}
      </g>
      <circle cx={C} cy={C} r={118} fill="none" className="stroke-hairline-gold" strokeWidth={1} />

      {/* The mark. */}
      <rect x={C - 4} y={118} width={8} height={8} transform={`rotate(45 ${C} 122)`} className="fill-aurum-300" />
      <text
        x={C}
        y={C + 34}
        textAnchor="middle"
        fill={`url(#${foilId})`}
        className="font-display italic"
        fontSize={104}
        letterSpacing="-0.02em"
      >
        PN
      </text>
      <line x1={C - 46} y1={C + 58} x2={C + 46} y2={C + 58} className="stroke-hairline-gold" strokeWidth={1} />
    </svg>
  );
}

export default function Profile() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  /* The seal turns a few degrees with the page on top of its own slow turn,
     so it reads as an object the reader is walking past. */
  const turn = useTransform(scrollYProgress, [0, 1], [-14, 14]);

  return (
    <div ref={ref} className="mx-auto w-full max-w-[1280px] px-6 pb-24 lg:px-10 lg:pb-32">
      <Ornament className="mb-20 lg:mb-28" />

      <div className="grid grid-cols-12 items-start gap-x-6 gap-y-14">
        {/* On a wide screen the seal stays beside the reader while the
            paragraph and the ledger pass, the way a plate faces its text. */}
        <div className="col-span-12 flex justify-center lg:sticky lg:top-28 lg:col-span-5 lg:justify-start">
          <div className="relative w-[min(78vw,20rem)] lg:w-full lg:max-w-[26rem]">
            {/* A low pool of gold behind the seal, so it reads as a struck
                object under light rather than a drawing on black. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-[-18%] rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in srgb, var(--color-aurum-300) 11%, transparent), transparent)",
              }}
            />
            <motion.div style={reduced ? undefined : { rotate: turn }} className="relative">
              <Seal />
            </motion.div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <SectionHeading
            numeral="01.2"
            eyebrow="THE ARCHITECT"
            title="Built to run unattended."
          />

          <p className="mt-8 max-w-[56ch] font-sans text-[17px] leading-[1.7] text-ivory-200">
            I am Preetham Nimmagadda, an AI architect based in Hyderabad and trained at IIT (ISM)
            Dhanbad. I design systems that act on their own judgment, and I stay accountable for what
            they do: a copilot at Matters.AI that remediates data exposures without waiting to be
            asked, a VideoRAG companion at Introspect Labs, and agents at METAVERTEX that cut system
            load by a fifth.
          </p>

          {/* The record, as a ledger. Each figure rolls in on its own mask. */}
          <dl className="mt-12 grid grid-cols-2 border-t border-hairline sm:grid-cols-3">
            {RECORD.map((entry, i) => (
              <div
                key={entry.label}
                className={cn(
                  "flex flex-col gap-3 border-b border-hairline py-6 pr-4",
                  // A rule between columns: two to a row on a phone, three above.
                  i % 2 !== 0 && "max-sm:border-l max-sm:pl-5",
                  i % 3 !== 0 && "sm:border-l sm:pl-6"
                )}
              >
                {/* The term comes first for assistive technology; the figure
                    is lifted above it visually. */}
                <dt className="order-2 flex flex-col gap-1.5">
                  <span className="caption text-ivory-200">{entry.label}</span>
                  <span className="font-sans text-[13px] leading-snug text-ivory-300">{entry.source}</span>
                </dt>
                <dd className="order-1 m-0">
                  <LedgerNumber
                    value={entry.figure}
                    label={entry.figure}
                    delayMs={i * 90}
                    className="font-display text-[2.25rem] leading-none text-ivory-100 lg:text-[2.75rem]"
                  />
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <TextButton variant="secondary" href="#experience" icon={<ArrowDownRight size={14} weight="light" />}>
              Read the full record
            </TextButton>
            <TextButton variant="secondary" href="#projects" icon={<ArrowDownRight size={14} weight="light" />}>
              See the work
            </TextButton>
          </div>
        </div>
      </div>
    </div>
  );
}
