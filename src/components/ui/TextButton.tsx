"use client";

import type { MouseEvent, ReactNode } from "react";
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

const PRIMARY =
  "group inline-flex items-center gap-3 px-7 py-3.5 border border-aurum-300 text-ivory-100 font-sans font-medium text-[15px] leading-none whitespace-nowrap transition-colors duration-300 ease-[var(--ease-heavy)] hover:bg-aurum-300 hover:text-obsidian-0 active:bg-aurum-400 active:text-obsidian-0 disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none";

/* The underline is a pseudo-element so thickening it on hover moves nothing:
   1px hairline-gold at rest, scaled to 2px aurum-200 on hover. */
const SECONDARY =
  "group relative inline-flex items-center gap-2 pb-0.5 text-ivory-200 font-sans text-[15px] leading-none whitespace-nowrap transition-colors duration-300 ease-[var(--ease-heavy)] hover:text-ivory-100 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-bottom after:bg-hairline-gold after:transition-[transform,background-color] after:duration-300 after:ease-[var(--ease-heavy)] hover:after:scale-y-200 hover:after:bg-aurum-200 disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none";

const PRIMARY_ICON =
  "inline-flex shrink-0 transition-transform duration-300 ease-[var(--ease-heavy)] group-hover:translate-x-0.5 group-hover:translate-y-0.5";

const SECONDARY_ICON =
  "inline-flex shrink-0 transition-transform duration-300 ease-[var(--ease-heavy)] group-hover:translate-x-0.5";

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
        <a href={href} onClick={handleAnchor} className={classes} aria-disabled={disabled || undefined}>
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
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}

export default TextButton;
