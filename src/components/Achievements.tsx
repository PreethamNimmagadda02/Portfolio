"use client";

/**
 * Achievements: the competitive record set as a ledger sheet.
 *
 * Four display numerals on a 12-column grid (7/5, then 5/7), separated by
 * hairline rules that draw in as the section enters: the ledger is ruled
 * before it is filled. Figures use the shared LedgerNumber roll-in, staggered
 * 120ms between blocks so the largest percentile lands first. Hovering a block
 * turns its figure gold and raises the rules that border it. Nothing else moves.
 */

import { useState, type PointerEvent, type ReactNode } from "react";
import { LedgerNumber, SectionHeading } from "@/components/ui";
import { InViewClass } from "./Reveal";
import { cn } from "@/lib/utils";

type RuleId = "row" | "v1" | "v2";

interface Record {
  id: string;
  figure: string;
  /** Sentence read by assistive tech in place of the character spans. */
  spoken: string;
  /** Mono caption set beneath the figure (Codeforces only). */
  /** The denominator under the figure: percentile, rating, solved. Required,
   *  so no record can ship with a bare number and no unit beside it. */
  unit: string;
  title: string;
  description: string;
  /** Denomination: the two large figures reach 7.5rem, the two small ones 5rem. */
  size: "large" | "small";
  /** Column span on the 12-column grid. */
  span: 7 | 5;
  /** The rules this block borders, raised to hairline-strong while hovered. */
  rules: RuleId[];
}

const records: Record[] = [
  {
    id: "hackerrank",
    figure: "Top 0.07%",
    spoken: "Ranked in the top 0.07% of developers on HackerRank.",
    unit: "percentile",
    title: "HackerRank 6-star gold",
    description: "Ranked in the top 0.07% of 26M+ developers on the platform.",
    size: "large",
    span: 7,
    rules: ["row", "v1"],
  },
  {
    id: "codechef",
    figure: "Top 0.8%",
    spoken: "Ranked in the top 0.8% of coders on CodeChef.",
    unit: "percentile",
    title: "CodeChef 4-star",
    description: "4-star status (1864 rating). Top 0.8% among 2 million+ coders worldwide.",
    size: "small",
    span: 5,
    rules: ["row", "v1"],
  },
  {
    id: "codeforces",
    figure: "1450",
    spoken: "Codeforces rating of 1450, Specialist.",
    unit: "rating",
    title: "Codeforces Specialist",
    description: "Reached 1450 rating, outperforming 80% of global competitive programmers.",
    size: "small",
    span: 5,
    rules: ["row", "v2"],
  },
  {
    id: "problems",
    figure: "1,000+",
    spoken: "More than 1,000 problems solved.",
    unit: "solved",
    title: "1,000+ problems solved",
    description: "Across LeetCode, TUF+, Codeforces, CodeChef and HackerRank. Depth across every major judge.",
    size: "large",
    span: 7,
    rules: ["row", "v2"],
  },
];

/** Block-to-block stagger for the roll-in, in milliseconds. */
const BLOCK_STAGGER = 120;

/* Display sizes. At the 1280px design width the large figure is exactly
   7.5rem and the small one 5rem; between 1024px and 1280px both scale with
   the viewport so "Top 0.07%" never breaks its column. */
const FIGURE_SIZE = {
  large: "text-[3.5rem] sm:text-[4rem] lg:text-[clamp(5rem,9.375vw,7.5rem)]",
  small: "text-[3.5rem] lg:text-[clamp(4rem,6.25vw,5rem)]",
} as const;

/* Each rule carries one transition shorthand: the draw (the `scale` property,
   which Tailwind's scale-x/scale-y utilities set, 900ms, heavy, verticals
   150ms after the horizontal) and the hover lift (background-color, 300ms,
   settle). Under reduced motion the global kill switch collapses the
   durations and the rules render in their final state. */
const HORIZONTAL_DRAW = "[transition:scale_900ms_var(--ease-heavy),background-color_300ms_var(--ease-settle)]";
const VERTICAL_DRAW = "[transition:scale_900ms_var(--ease-heavy)_150ms,background-color_300ms_var(--ease-settle)]";

function HorizontalRule({ active, className }: { active: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block h-px w-full origin-left scale-x-0 in-[.in-view]:scale-x-100 motion-reduce:scale-x-100",
        HORIZONTAL_DRAW,
        active ? "bg-hairline-strong" : "bg-hairline",
        className
      )}
    />
  );
}

function VerticalRule({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-y-0 right-0 hidden w-px origin-top scale-y-0 lg:block",
        "in-[.in-view]:scale-y-100 motion-reduce:scale-y-100",
        VERTICAL_DRAW,
        active ? "bg-hairline-strong" : "bg-hairline"
      )}
    />
  );
}

function RecordBlock({
  record,
  index,
  onEnter,
  onLeave,
  children,
}: {
  record: Record;
  index: number;
  onEnter: (id: string, e: PointerEvent<HTMLElement>) => void;
  onLeave: () => void;
  children?: ReactNode;
}) {
  const isLeft = index % 2 === 0;

  return (
    <article
      aria-labelledby={`achievement-${record.id}`}
      onPointerEnter={(e) => onEnter(record.id, e)}
      onPointerLeave={onLeave}
      className={cn(
        "group relative flex flex-col items-start py-10 lg:py-14",
        record.span === 7 ? "lg:col-span-7" : "lg:col-span-5",
        isLeft ? "lg:pr-10" : "lg:pl-10"
      )}
    >
      {/* Index and denominator on one line above the figure: which record
          this is, and what the figure is measured in. Every record carries a
          unit now, so the line is never half empty. */}
      <div aria-hidden className="mb-5 flex items-center gap-3">
        <span className="ledger font-mono text-[11px] leading-none tracking-[0.14em] text-ivory-300 transition-colors duration-300 ease-heavy group-hover:text-aurum-300">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="h-px w-4 bg-hairline-gold" />
        <span className="font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ivory-300">
          {record.unit}
        </span>
      </div>

      <p
        className={cn(
          "font-display font-normal leading-[0.95] tracking-[-0.01em] text-ivory-100",
          "transition-colors duration-600 ease-settle group-hover:text-aurum-300",
          FIGURE_SIZE[record.size]
        )}
      >
        <LedgerNumber value={record.figure} label={record.spoken} delayMs={index * BLOCK_STAGGER} />
      </p>

      <h3
        id={`achievement-${record.id}`}
        className="mt-8 font-display text-[24px] font-medium leading-[1.2] text-ivory-100 lg:mt-10 lg:text-[26px]"
      >
        {record.title}
      </h3>

      <p className="mt-3 max-w-[36ch] font-sans text-[15px] leading-[1.6] text-ivory-200">{record.description}</p>

      {children}
    </article>
  );
}

export default function Achievements() {
  const [hovered, setHovered] = useState<string | null>(null);

  const handleEnter = (id: string, e: PointerEvent<HTMLElement>) => {
    // Hover is a pointer affordance; a touch should not leave a block lit.
    if (e.pointerType === "touch") return;
    setHovered(id);
  };
  const handleLeave = () => setHovered(null);

  const isActive = (rule: RuleId) => {
    if (!hovered) return false;
    const record = records.find((r) => r.id === hovered);
    return record ? record.rules.includes(rule) : false;
  };

  const [hackerrank, codechef, codeforces, problems] = records;

  return (
    <section id="achievements" className="relative w-full py-32 lg:py-40">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        <div className="lg:grid lg:grid-cols-12">
          <SectionHeading
            eyebrow="FOUR RECORDS"
            title="Competitive record."
            subtext="Rankings across CodeChef, Codeforces and HackerRank, and 1,000+ problems solved."
            className="lg:col-span-8"
          />
        </div>

        <InViewClass amount={0.2} className="mt-16 flex flex-col lg:mt-20 lg:grid lg:grid-cols-12">
          {/* Row one: HackerRank (1 to 7), CodeChef (8 to 12) */}
          <RecordBlock record={hackerrank} index={0} onEnter={handleEnter} onLeave={handleLeave}>
            <VerticalRule active={isActive("v1")} />
          </RecordBlock>
          <HorizontalRule active={isActive("v1")} className="lg:hidden" />
          <RecordBlock record={codechef} index={1} onEnter={handleEnter} onLeave={handleLeave} />

          {/* The ledger's one horizontal rule between the rows */}
          <HorizontalRule active={isActive("row")} className="lg:col-span-12" />

          {/* Row two: Codeforces (1 to 5), problems solved (6 to 12) */}
          <RecordBlock record={codeforces} index={2} onEnter={handleEnter} onLeave={handleLeave}>
            <VerticalRule active={isActive("v2")} />
          </RecordBlock>
          <HorizontalRule active={isActive("v2")} className="lg:hidden" />
          <RecordBlock record={problems} index={3} onEnter={handleEnter} onLeave={handleLeave} />
        </InViewClass>
      </div>
    </section>
  );
}
