"use client";

import type { ReactNode } from "react";
import { InViewClass, RiseWords } from "../Reveal";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  /** One of the three uppercase eyebrows. Rendered in Geist Mono above the title. */
  eyebrow?: string;
  /** Renders the single 6px aurum live indicator before the eyebrow (Contact only). */
  indicator?: boolean;
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
 * The plate lift shared by every chapter: an optional eyebrow, the headline
 * assembling word by word out of its clip masks, a hairline-gold rule drawing
 * beneath it, and an optional subtext. Left-aligned; the rule spans the
 * headline's own width.
 *
 * A string title is split into words so the line builds left to right, which
 * is how a Didone headline wants to arrive. A ReactNode title (one carrying
 * its own emphasis or markup) cannot be split safely, so it keeps the older
 * whole-line lift.
 */
export function SectionHeading({
  eyebrow,
  indicator = false,
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

  return (
    <InViewClass amount={0.3} className={cn("flex flex-col items-start", className)}>
      {eyebrow ? (
        <span className="line-mask mb-3">
          <span className="line-rise eyebrow">
            {indicator ? (
              // The eyebrow also carries .line-rise, whose display:
              // inline-block makes the class's own `gap` inert, so the dot
              // holds its distance from the text with a margin instead.
              <span
                aria-hidden
                className="breathe mr-3 inline-block size-1.5 shrink-0 rounded-full bg-aurum-300"
              />
            ) : null}
            {eyebrow}
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
            <RiseWords text={title as string} baseDelay={eyebrow ? 120 : 0} step={WORD_STEP} />
          ) : (
            <span className="line-mask">
              <span
                className="line-rise"
                style={{ "--rise-delay": eyebrow ? "120ms" : "0ms" } as React.CSSProperties}
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
