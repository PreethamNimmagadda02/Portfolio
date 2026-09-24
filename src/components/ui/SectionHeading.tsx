"use client";

import type { ReactNode } from "react";
import { InViewClass, RiseWords } from "../Reveal";
import { chapter as chapterFor } from "@/lib/chapters";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  /** Uppercase label rendered in Geist Mono above the title. */
  eyebrow?: string;
  /**
   * The section's id in the chapter registry. Prints the chapter numeral ahead
   * of the eyebrow, so every chapter carries the same number the letterhead
   * and the Index show for it.
   */
  chapter?: string;
  title: ReactNode;
  /** The heading tag. Sizes are applied for h2; the hero sizes its own h1 via titleClassName. */
  as?: "h1" | "h2";
  subtext?: ReactNode;
  className?: string;
  titleClassName?: string;
  id?: string;
}

/** Milliseconds between words in the headline. */
const WORD_STEP = 62;

/**
 * The plate lift shared by every chapter: the chapter numeral and eyebrow,
 * the headline assembling word by word out of its clip masks, a hairline-gold
 * rule drawing beneath it, and an optional subtext. Left-aligned; the rule
 * spans the headline's own width.
 *
 * A string title is split into words so the line builds left to right, which
 * is how a Didone headline wants to arrive. A ReactNode title (one carrying
 * its own emphasis or markup) cannot be split safely, so it keeps the older
 * whole-line lift.
 */
export function SectionHeading({
  eyebrow,
  chapter,
  title,
  as: Tag = "h2",
  subtext,
  className,
  titleClassName,
  id,
}: SectionHeadingProps) {
  const splittable = typeof title === "string";
  // Words carry their own delays, so the rule waits for the last one.
  const ruleDelay = splittable ? (title as string).split(" ").length * WORD_STEP : 0;
  const numeral = chapter ? chapterFor(chapter).no : null;
  const hasLabel = Boolean(eyebrow || numeral);

  return (
    <InViewClass amount={0.3} className={cn("flex flex-col items-start", className)}>
      {hasLabel ? (
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
                  {eyebrow ? <span aria-hidden className="h-px w-6 bg-hairline-gold" /> : null}
                </>
              ) : null}
              {eyebrow}
            </span>
          </span>
        </span>
      ) : null}

      <div className="max-w-full">
        <Tag
          id={id}
          className={cn(
            "font-display font-normal text-ivory-100",
            Tag === "h2" && "text-[2.125rem] lg:text-[3rem] leading-[1.1] tracking-[-0.005em]",
            titleClassName
          )}
        >
          {splittable ? (
            <RiseWords text={title as string} baseDelay={hasLabel ? 120 : 0} step={WORD_STEP} />
          ) : (
            <span className="line-mask">
              <span
                className="line-rise"
                style={{ "--rise-delay": hasLabel ? "120ms" : "0ms" } as React.CSSProperties}
              >
                {title}
              </span>
            </span>
          )}
        </Tag>
        <span
          className="rule-draw"
          aria-hidden
          style={{ transitionDelay: `${150 + ruleDelay}ms` }}
        />
      </div>

      {subtext ? (
        <p className="font-sans text-ivory-200 text-base leading-[1.65] max-w-[65ch] mt-6">{subtext}</p>
      ) : null}
    </InViewClass>
  );
}

export default SectionHeading;
