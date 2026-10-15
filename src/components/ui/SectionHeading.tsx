"use client";

import type { CSSProperties, ReactNode } from "react";
import { InViewClass } from "../Reveal";
import { chapter as chapterFor } from "@/lib/chapters";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Uppercase label rendered in Geist Mono above the title. */
  eyebrow: string;
  /**
   * The section's id in the chapter registry. Prints the chapter numeral ahead
   * of the eyebrow, so every chapter carries the same number the letterhead
   * and the Index show for it.
   */
  chapter?: string;
  /** A numeral to print in place of the chapter's, for a movement within one ("01.2"). */
  numeral?: string;
  title: string;
  subtext?: ReactNode;
  className?: string;
  id?: string;
}

/** Milliseconds between words in the headline. */
const WORD_STEP = 62;

/** Milliseconds the first word waits for the eyebrow above it. */
const TITLE_DELAY = 120;

/** Milliseconds the subtext waits once every word of the headline has begun to rise. */
const SUBTEXT_LAG = 260;

/**
 * The plate lift shared by every chapter: the chapter numeral and eyebrow,
 * the headline assembling word by word out of its clip masks, a hairline-gold
 * rule drawing beneath it, and an optional subtext. Left-aligned; the rule
 * spans the headline's own width.
 *
 * The title is split into words, each rising out of its own mask on a
 * left-to-right stagger, so the line builds the way a Didone headline wants
 * to arrive. The mask is `.word-mask`, whose descender reserve is set in em:
 * one shared pixel reserve would clip a "g" at 3rem and leave a gap at 22px.
 * The space between words sits outside the masks so it stays a line break
 * opportunity.
 *
 * The subtext follows the headline rather than waiting under it: once the
 * last word is on its way it settles into place (.ink-in), rising a fraction
 * and coming into focus, so a chapter opens in reading order.
 */
export function SectionHeading({
  eyebrow,
  chapter,
  numeral: numeralOverride,
  title,
  subtext,
  className,
  id,
}: SectionHeadingProps) {
  const words = title.split(" ");
  // Words carry their own delays, so the rule waits for the last one.
  const ruleDelay = words.length * WORD_STEP;
  const numeral = numeralOverride ?? (chapter ? chapterFor(chapter).no : null);

  return (
    <InViewClass amount={0.3} className={cn("flex flex-col items-start", className)}>
      <span className="line-mask mb-3">
        {/* Two elements, not one: .line-rise is inline-block and would
            override the eyebrow's inline-flex, collapsing the numeral, the
            rule and the words into one run. */}
        <span className="line-rise">
          <span className="eyebrow">
            {numeral ? (
              <>
                {/* Decorative: the eyebrow carries the meaning, the numeral the order. */}
                <span aria-hidden className="ledger text-aurum-300">
                  {numeral}
                </span>
                <span aria-hidden className="h-px w-6 bg-hairline-gold" />
              </>
            ) : null}
            {eyebrow}
          </span>
        </span>
      </span>

      <div className="max-w-full">
        <h2
          id={id}
          className="font-display font-normal text-ivory-100 text-[2.125rem] lg:text-[3rem] leading-[1.1] tracking-[-0.005em]"
        >
          {words.map((word, i) => (
            <span key={i}>
              <span className="word-mask">
                <span
                  className="line-rise"
                  style={{ "--rise-delay": `${TITLE_DELAY + i * WORD_STEP}ms` } as CSSProperties}
                >
                  {word}
                </span>
              </span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </h2>
        <span
          className="rule-draw"
          aria-hidden
          style={{ transitionDelay: `${150 + ruleDelay}ms` }}
        />
      </div>

      {subtext ? (
        <p
          className="ink-in font-sans text-ivory-200 text-base leading-[1.65] max-w-[65ch] mt-6"
          style={{ "--ink-delay": `${TITLE_DELAY + ruleDelay + SUBTEXT_LAG}ms` } as CSSProperties}
        >
          {subtext}
        </p>
      ) : null}
    </InViewClass>
  );
}
