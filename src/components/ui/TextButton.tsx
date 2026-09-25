"use client";

import { useCallback, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn, smoothScrollTo } from "@/lib/utils";

export interface TextButtonProps {
  /** Bordered CTA that fills gold on hover, or an underlined text link. */
  variant?: "primary" | "secondary";
  /** "#section" smooth-scrolls in page; http(s) opens in a new tab; omit for a <button>. */
  href?: string;
  onClick?: () => void;
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
   fill (isolate + -z-10) and turns obsidian as the gold passes under it. */
const PRIMARY =
  "group relative isolate inline-flex items-center gap-3 overflow-hidden px-7 py-3.5 border border-aurum-300 text-ivory-100 font-sans font-medium text-[15px] leading-none whitespace-nowrap transition-[color,translate] duration-500 ease-[var(--ease-heavy)] hover:text-obsidian-0 focus-visible:text-obsidian-0 before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-aurum-300 before:transition-[scale] before:duration-500 before:ease-[var(--ease-heavy)] hover:before:scale-y-100 focus-visible:before:scale-y-100 active:before:bg-aurum-400 disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none";

/* The underline is a pseudo-element so thickening it on hover moves nothing:
   1px hairline-gold at rest, scaled to 2px aurum-200 on hover. */
const SECONDARY =
  "group relative inline-flex items-center gap-2 pb-0.5 text-ivory-200 font-sans text-[15px] leading-none whitespace-nowrap transition-colors duration-300 ease-[var(--ease-heavy)] hover:text-ivory-100 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-bottom after:bg-hairline-gold after:transition-[transform,background-color] after:duration-300 after:ease-[var(--ease-heavy)] hover:after:scale-y-200 hover:after:bg-aurum-200 disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none";

const PRIMARY_ICON =
  "inline-flex shrink-0 transition-transform duration-300 ease-[var(--ease-heavy)] group-hover:translate-x-0.5 group-hover:translate-y-0.5";

const SECONDARY_ICON =
  "inline-flex shrink-0 transition-transform duration-300 ease-[var(--ease-heavy)] group-hover:translate-x-0.5";

/** How far a primary button leans toward the hand, as a fraction of the offset from its centre. */
const PULL = 0.22;
/** The lean never exceeds this many pixels, so a wide button does not wander. */
const MAX_PULL = 7;

/**
 * A primary button leans a few pixels toward a mouse inside it, and settles
 * back when the mouse leaves. The listener is the button's own, and it writes
 * the `translate` property straight to the node, so a hover costs no renders.
 * Touch, pen and reduced motion get a still button.
 */
function useMagnet(enabled: boolean) {
  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled || e.pointerType !== "mouse") return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const clamp = (v: number) => Math.max(-MAX_PULL, Math.min(MAX_PULL, v));
      const x = clamp((e.clientX - (r.left + r.width / 2)) * PULL);
      const y = clamp((e.clientY - (r.top + r.height / 2)) * PULL);
      el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    },
    [enabled]
  );
  const onPointerLeave = useCallback((e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.translate = "";
  }, []);
  return enabled ? { onPointerMove, onPointerLeave } : {};
}

/**
 * The two labels the page uses for action: a bordered primary CTA and an
 * underlined secondary link. Shared by Hero, Contact and Projects.
 */
export function TextButton({
  variant = "primary",
  href,
  onClick,
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
  const content = (
    <>
      <span>{children}</span>
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
        smoothScrollTo(href);
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
