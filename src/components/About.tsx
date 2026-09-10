"use client";

import { motion, EASE_SETTLE } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { SectionHeading, LedgerNumber } from "@/components/ui";
import { cn } from "@/lib/utils";
import styles from "./About.module.css";

/**
 * About: a manifesto column with hanging figures.
 *
 * Four paragraphs of running prose sit in the centre columns. Each opens with
 * a Bodoni lead phrase set inline, and one figure per paragraph hangs in the
 * left gutter, right-aligned toward the prose, with a mono caption beneath.
 * No cards, nothing sticky; the record carries the page.
 */

interface Paragraph {
  lead: string;
  text: string;
  figure: string;
  caption: string;
}

const PARAGRAPHS: Paragraph[] = [
  {
    lead: "Autonomy, not autocomplete.",
    text:
      "Most of the field is still demonstrating what AI could do. At Matters.AI I built a copilot that finds data exposures the moment they open and closes them without being asked; at Introspect Labs, a multimodal companion that reads 100+ hours of video at 95% accuracy and lifted retention by 40%. Both were shipped, not staged.",
    figure: "95%",
    caption: "VideoRAG accuracy",
  },
  {
    lead: "Proof, not claims.",
    text:
      "Top 0.8% on CodeChef, top 0.07% on HackerRank, Codeforces Specialist. Public numbers, checkable by anyone who cares to, and the same discipline is what keeps production code honest.",
    figure: "0.07%",
    caption: "HackerRank, top percentile",
  },
  {
    lead: "Many agents, one intent.",
    text:
      "Multi-agent architectures for trading, event logistics and agentic tooling: independent components that hold a single intent between them. At METAVERTEX the agents I architected cut system resource load by 20%.",
    figure: "20%",
    caption: "system load reduced, METAVERTEX",
  },
  {
    lead: "People, at scale.",
    text:
      "Elected Student Senator for 1,500+ peers. Hostel Prefect for 1,800+ residents, where I cut disputes by 30%. Campus Ambassador for Perplexity. Building the system is the easy half; holding the mandate to run it is the other.",
    figure: "1,800+",
    caption: "residents as Hostel Prefect",
  },
];

/** Row-to-row stagger, in seconds, so rows already on screen enter in reading order. */
const ROW_STAGGER = 0.12;

function ManifestoRow({ paragraph, index }: { paragraph: Paragraph; index: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      /* Each conviction gets its own rule. Four paragraphs separated by air
         alone had nothing of the record about them. */
      /* Deliberately not a `group`: .rule-hover answers to .group:hover as
         well as its own, so a group here would draw the lead's rule from
         anywhere in the row while the figure stayed ivory. The figure, the
         index and the rule all key off the lead phrase instead. */
      className={cn(
        styles.row,
        "grid grid-cols-12 gap-x-6 border-t border-hairline pt-8 transition-colors duration-500 ease-heavy hover:border-hairline-strong lg:gap-x-8 lg:pt-10"
      )}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={
        reduced
          ? { duration: 0.2 }
          : { duration: 0.9, ease: EASE_SETTLE, delay: index * ROW_STAGGER }
      }
    >
      {/* Hanging figure. Mobile: a block above the paragraph. Desktop: hung in
          columns 1 to 3, right-aligned toward the prose, nudged up so the
          Bodoni baseline sits near the paragraph's first baseline. The index
          rides the caption line rather than sitting above the figure, which
          would push the numeral off that baseline. */}
      <div className="col-span-12 mb-6 lg:col-span-3 lg:col-start-1 lg:mb-0 lg:-mt-4 lg:text-right">
        <LedgerNumber
          value={paragraph.figure}
          delayMs={index * ROW_STAGGER * 1000}
          className={cn(
            styles.figure,
            "font-display font-normal text-[2.75rem] leading-[0.95] lg:text-[3.5rem]"
          )}
        />
        <span className="mt-3 flex items-center gap-3 font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ivory-300 lg:justify-end">
          <span aria-hidden className={cn(styles.index, "ledger")}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span aria-hidden className="h-px w-4 bg-hairline-gold" />
          {paragraph.caption}
        </span>
      </div>

      <p className="col-span-12 col-start-1 max-w-[62ch] font-sans text-[16px] leading-[1.7] text-ivory-200 md:text-[17px] lg:col-span-8 lg:col-start-4 lg:text-[18px]">
        <strong
          className={cn(
            styles.lead,
            "rule-hover font-display font-medium text-[22px] leading-[1] text-ivory-100"
          )}
        >
          {paragraph.lead}
        </strong>{" "}
        {paragraph.text}
      </p>
    </motion.div>
  );
}

export default function About() {
  return (
    <section id="about" className="relative w-full py-32 lg:py-40">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-x-6 lg:gap-x-8">
          <div className="col-span-12 lg:col-span-9">
            <SectionHeading
              eyebrow="FOUR CONVICTIONS"
              title="I build for where AI is going, not where it is."
            />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-y-14 lg:mt-24 lg:gap-y-20">
          {PARAGRAPHS.map((paragraph, i) => (
            <ManifestoRow key={paragraph.lead} paragraph={paragraph} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
