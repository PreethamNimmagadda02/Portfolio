"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useFocusedSkill, setFocusedSkill } from "@/lib/scene-store";
import { getSkillUsages } from "@/lib/skill-connections";
import { skillsData, getCategoryColor } from "@/lib/skills-data";
import { smoothScrollTo } from "@/lib/utils";

/** Distinct card scopes (in document order) that contain the focused skill. */
function collectScopes(skill: string): HTMLElement[] {
  const tokens = Array.from(document.querySelectorAll<HTMLElement>(`[data-skill="${CSS.escape(skill)}"]`));
  const scopes: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();
  for (const tok of tokens) {
    const scope = (tok.closest("[data-skill-scope]") as HTMLElement) ?? tok;
    if (!seen.has(scope)) {
      seen.add(scope);
      scopes.push(scope);
    }
  }
  // Order by vertical position so prev/next follow the page.
  return scopes.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
}

function pulse(el: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.classList.remove("skill-pulse");
  // Force reflow so re-adding the class restarts the animation.
  void el.offsetWidth;
  el.classList.add("skill-pulse");
  el.addEventListener("animationend", () => el.classList.remove("skill-pulse"), { once: true });
}

export default function SkillNavigator() {
  const focused = useFocusedSkill();
  const [cursor, setCursor] = useState(0);

  const usageCount = focused ? getSkillUsages(focused).length : 0;
  const color = focused
    ? getCategoryColor(skillsData.find((s) => s.name === focused)?.category ?? "")
    : "#8b5cf6";

  // Reset the cursor whenever the focused skill changes (adjust state during render).
  const [prevFocused, setPrevFocused] = useState(focused);
  if (focused !== prevFocused) {
    setPrevFocused(focused);
    setCursor(0);
  }

  // Esc clears focus.
  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusedSkill(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused]);

  const go = (dir: 1 | -1) => {
    if (!focused) return;
    const scopes = collectScopes(focused);
    if (scopes.length === 0) return;
    const next = (cursor + dir + scopes.length) % scopes.length;
    setCursor(next);
    const target = scopes[next];
    if (target.id) smoothScrollTo(`#${target.id}`, -120);
    else target.scrollIntoView({ behavior: "smooth", block: "center" });
    pulse(target);
  };

  return (
    <AnimatePresence>
      {focused && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-white/15 bg-black/85 backdrop-blur-md px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          role="status"
          aria-live="polite"
        >
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
          <span className="text-sm font-semibold text-white whitespace-nowrap">{focused}</span>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            used in {usageCount} {usageCount === 1 ? "place" : "places"}
          </span>
          {usageCount > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous usage"
                className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next usage"
                className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setFocusedSkill(null)}
            aria-label="Clear focused skill"
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
