"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useMagnet } from "@/hooks/use-magnet";
import { cn, smoothScrollTo } from "@/lib/utils";

export interface TextButtonProps {
  /** Bordered CTA that fills gold on hover, or an underlined text link. */
  variant?: "primary" | "secondary";
  /** "#section" smooth-scrolls in page; http(s) opens in a new tab; omit for a <button>. */
  href?: string;
  onClick?: () => void;
  /**
   * For an in-page href only: takes over from the built-in flight. The Index
   * uses it to jump behind its panel instead of flying under it.
   */
  onNavigate?: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
  children: ReactNode;
  /** Trailing Phosphor icon (weight="light"). */
  icon?: ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  /** Stretch to the container width (Contact submit). */
  full?: boolean;
}

/* The gold does not snap on: it rises from the foot of the frame like a fill
   poured into it, and drains back the same way. The label sits above the
   fill (isolate + -z-10) and turns obsidian as the gold passes under it.
   Under a fine pointer a press sinks the plate a fraction, fast, and lets it
   back up at the button's own pace. */
const PRIMARY =
  "group roll-host relative isolate inline-flex items-center gap-3 overflow-hidden px-7 py-3.5 border border-aurum-300 text-ivory-100 font-sans font-medium text-[15px] leading-none whitespace-nowrap transition-[color,translate,scale] duration-500 ease-[var(--ease-heavy)] hover:text-obsidian-0 focus-visible:text-obsidian-0 pointer-fine:active:scale-[0.98] pointer-fine:active:duration-150 before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-aurum-300 before:transition-[scale] before:duration-500 before:ease-[var(--ease-heavy)] hover:before:scale-y-100 focus-visible:before:scale-y-100 active:before:bg-aurum-400 disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none";

/* The underline is a pseudo-element so thickening it on hover moves nothing:
   1px hairline-gold at rest, scaled to 2px aurum-200 on hover. */
const SECONDARY =
  "group relative inline-flex items-center gap-2 pb-0.5 text-ivory-200 font-sans text-[15px] leading-none whitespace-nowrap transition-colors duration-300 ease-[var(--ease-heavy)] hover:text-ivory-100 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-bottom after:bg-hairline-gold after:transition-[transform,background-color] after:duration-300 after:ease-[var(--ease-heavy)] hover:after:scale-y-200 hover:after:bg-aurum-200 disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none";

const PRIMARY_ICON =
  "inline-flex shrink-0 transition-transform duration-300 ease-[var(--ease-heavy)] group-hover:translate-x-0.5 group-hover:translate-y-0.5";

const SECONDARY_ICON =
  "inline-flex shrink-0 transition-transform duration-300 ease-[var(--ease-heavy)] group-hover:translate-x-0.5";

/**
 * A label set twice in one mask. When the hand reaches a primary button the
 * line turns over a letter at a time, rolling up out of the mask while its
 * copy rises in beneath it, the way the drum of a mechanical counter turns;
 * leaving rolls it back. The reserve above and below the mask (see .roll in
 * globals.css) is cancelled by negative margins, so the label occupies
 * exactly the line box plain text would.
 *
 * Read once: both visible lines are hidden from assistive technology and the
 * words are carried by a visually hidden copy. Nothing moves on touch or
 * under reduced motion.
 */
export function RollLabel({ text }: { text: string }) {
  const chars = Array.from(text);
  const line = (copy: boolean) => (
    <span aria-hidden className={copy ? "roll-line roll-copy" : "roll-line"}>
      {chars.map((ch, i) => (
        <span key={i} className="roll-char" style={{ "--i": i } as CSSProperties}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
  return (
    <span className="roll">
      <span className="sr-only">{text}</span>
      {line(false)}
      {line(true)}
    </span>
  );
}

/**
 * The two labels the page uses for action: a bordered primary CTA and an
 * underlined secondary link. Shared by the letterhead and the Index, the
 * cover, About, Projects and Contact.
 *
 * A primary button leans a few pixels toward a mouse inside it (useMagnet),
 * and a plain-text label on it rolls over on hover (RollLabel). Touch, pen
 * and reduced motion get a still button.
 */
export function TextButton({
  variant = "primary",
  href,
  onClick,
  onNavigate,
  children,
  icon,
  className,
  type = "button",
  disabled = false,
  full = false,
}: TextButtonProps) {
  const isPrimary = variant === "primary";
  const reduced = useReducedMotion();
  const magnet = useMagnet(isPrimary && !full && !disabled && !reduced);
  const classes = cn(isPrimary ? PRIMARY : SECONDARY, full && "w-full justify-center", className);
  const label = isPrimary && typeof children === "string" ? <RollLabel text={children} /> : children;
  const content = (
    <>
      <span>{label}</span>
      {icon ? (
        <span aria-hidden className={isPrimary ? PRIMARY_ICON : SECONDARY_ICON}>
          {icon}
        </span>
      ) : null}
    </>
  );

  if (href) {
    if (href.startsWith("#")) {
      const handleAnchor = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (disabled) return;
        onClick?.();
        if (onNavigate) onNavigate(e, href);
        else smoothScrollTo(href);
      };
      return (
        <a href={href} onClick={handleAnchor} className={classes} aria-disabled={disabled || undefined} {...magnet}>
          {content}
        </a>
      );
    }

    const external = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        className={classes}
        aria-disabled={disabled || undefined}
        {...magnet}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...magnet}>
      {content}
    </button>
  );
}
