"use client";

import { motion } from "@/lib/motion";
import { useFocusedSkill, toggleFocusedSkill } from "@/lib/scene-store";

export interface SkillTokenProps {
  /** Canonical skill name for cross-linking, or null for a non-ecosystem tag. */
  canonical: string | null;
  label: string;
  /** Section accent color (hex). */
  color: string;
  className?: string;
  /** When no skill is focused, render in the emphasized (filled) style. */
  emphasizedByDefault?: boolean;
}

/**
 * One skill chip, shared by the Skills, Projects, and Experience sections.
 * - If `canonical` is set, the chip is clickable: it toggles the global focused
 *   skill and carries `data-skill` so the navigator can find/scroll to it.
 * - When a skill is focused elsewhere, matching chips glow and non-matching
 *   chips dim. Chips with no canonical mapping render as plain, inert tags.
 */
export default function SkillToken({ canonical, label, color, className, emphasizedByDefault }: SkillTokenProps) {
  const focused = useFocusedSkill();
  const linkable = canonical !== null;
  const isMatch = linkable && focused === canonical;
  const anyFocus = focused !== null;
  const dimmed = anyFocus && !isMatch;
  const emphasized = isMatch || (!anyFocus && !!emphasizedByDefault);

  const base = "inline-flex items-center gap-1.5 rounded-full border text-xs font-medium transition-all duration-300 px-2.5 py-1";

  const style: React.CSSProperties = {
    color: emphasized ? "#fff" : color,
    borderColor: emphasized ? color : `${color}30`,
    backgroundColor: emphasized ? `${color}22` : `${color}0a`,
    boxShadow: isMatch ? `0 0 18px -4px ${color}` : "none",
    opacity: dimmed ? 0.28 : 1,
    cursor: linkable ? "pointer" : "default",
  };

  const content = (
    <>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
      <span className="whitespace-nowrap">{label}</span>
    </>
  );

  if (!linkable) {
    return (
      <span className={`${base} ${className ?? ""}`} style={style}>
        {content}
      </span>
    );
  }

  return (
    <motion.button
      type="button"
      data-skill={canonical}
      aria-pressed={isMatch}
      title={isMatch ? `Clear ${label}` : `Show where I used ${label}`}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => toggleFocusedSkill(canonical)}
      className={`${base} ${className ?? ""}`}
      style={style}
    >
      {content}
    </motion.button>
  );
}
