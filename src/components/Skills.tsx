"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "@/lib/motion";
import { Brain, Globe, Database, Cloud, Boxes, Terminal, Wrench, Workflow, Sparkles, LayoutGrid, type LucideIcon } from "lucide-react";
import { skillsData, categoryColors, categoryLabels } from "@/lib/skills-data";
import { toggleSkillCategory, useActiveSkillCategories, useFocusedSkill, toggleFocusedSkill } from "@/lib/scene-store";
import { InViewClass, SectionKicker } from "./Reveal";

const categoryIcons: Record<string, LucideIcon> = {
  AI: Brain,
  Web: Globe,
  DB: Database,
  Cloud,
  DevOps: Boxes,
  Lang: Terminal,
  Tools: Wrench,
  Automation: Workflow,
};

function AnimatedCounter({ end, label, suffix = "", icon: Icon }: { end: number; label: string; suffix?: string; icon?: LucideIcon }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      {Icon && <Icon size={16} className="text-gray-500 mb-0.5" />}
      <span className="text-2xl md:text-3xl font-black text-white tabular-nums">
        {count}
        {suffix}
      </span>
      <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-medium">{label}</span>
    </div>
  );
}

function CategoryChip({
  category,
  color,
  count,
  isActive,
}: {
  category: string;
  color: string;
  count: number;
  isActive: boolean;
}) {
  const Icon = categoryIcons[category];
  return (
    <motion.button
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => toggleSkillCategory(category)}
      className="relative px-3 py-1.5 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer"
      style={{
        color: isActive ? "#fff" : color,
        borderColor: isActive ? color : `${color}30`,
        backgroundColor: isActive ? `${color}30` : `${color}08`,
      }}
    >
      {isActive && (
        <motion.span
          className="absolute inset-0 rounded-full -z-10"
          style={{ boxShadow: `0 0 0 1px ${color}60, 0 0 20px -2px ${color}` }}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <span className="flex items-center gap-1.5">
        {Icon ? <Icon size={12} /> : <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: isActive ? `0 0 8px ${color}` : "none" }} />}
        {category}
        <span className="text-[9px] font-medium opacity-60 tabular-nums" style={{ color: isActive ? "#fff" : color }}>
          {count}
        </span>
      </span>
    </motion.button>
  );
}

function SkillTag({ name, category, emphasized }: { name: string; category: string; emphasized: boolean }) {
  const color = categoryColors[category];
  const focused = useFocusedSkill();
  const isMatch = focused === name;
  const dimmed = focused !== null && !isMatch;
  const lit = emphasized || isMatch;
  return (
    <motion.button
      type="button"
      layout
      data-skill={name}
      aria-pressed={isMatch}
      title={isMatch ? `Clear ${name}` : `Show where I used ${name}`}
      onClick={() => toggleFocusedSkill(name)}
      initial={{ opacity: 0, y: 12, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
      transition={{ duration: 0.3, layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
      whileHover={{ scale: 1.05, y: -2, boxShadow: `0 10px 28px -10px ${color}90` }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors duration-300 cursor-pointer"
      style={{
        borderColor: lit ? `${color}80` : `${color}30`,
        backgroundColor: lit ? `${color}22` : `${color}0a`,
        boxShadow: isMatch ? `0 0 20px -4px ${color}` : lit ? `0 0 20px -6px ${color}` : "0 0 0px transparent",
        opacity: dimmed ? 0.3 : 1,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
      <span className={`text-sm whitespace-nowrap ${lit ? "text-white font-semibold" : "text-gray-200 font-medium"}`}>{name}</span>
    </motion.button>
  );
}

export default function Skills() {
  const activeCategories = useActiveSkillCategories();
  const allActive = activeCategories.size === 0;

  const [shuffledSkills, setShuffledSkills] = useState(skillsData);

  useEffect(() => {
    const shuffled = [...skillsData];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledSkills(shuffled);
  }, []);

  const categories = useMemo(() => [...new Set(skillsData.map((s) => s.category))], []);
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    skillsData.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    // Deliberately tighter rhythm than other sections (py-16 md:py-24 vs the
    // site's usual py-20 md:py-32) — with 40+ skill tags this section is
    // already much taller than its siblings, and matching their padding
    // pushed the stats bar below the fold after a nav-triggered scroll.
    <section id="skills-sphere" className="relative w-full py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <InViewClass>
          <SectionKicker num="03" label="Toolbox" />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-display text-3xl md:text-5xl text-white mb-3">
              <span className="line-mask">
                <span className="line-rise">
                  Technical{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-cyan-400">
                    Ecosystem
                  </span>
                </span>
              </span>
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-lg mx-auto">
              Tap a category to filter.
              <span className="hidden md:inline"> Watch the constellation behind you highlight the match.</span>
            </p>
          </motion.div>
        </InViewClass>

        {/* Category chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-6"
        >
          {categories.map((cat) => (
            <CategoryChip
              key={cat}
              category={cat}
              color={categoryColors[cat]}
              count={categoryCounts[cat] || 0}
              isActive={activeCategories.has(cat)}
            />
          ))}
        </motion.div>

        {/* Skill grid — filtering actually removes non-matching tags from
            layout (rather than just dimming them in place) so a narrow
            filter reflows into a small, unmissable cluster instead of
            leaving a few faint matches scattered across a full-size grid. */}
        <motion.div layout className="card-hairline rounded-3xl p-4 sm:p-5 md:p-6 mb-6">
          <motion.div layout className="flex flex-wrap justify-center gap-2 md:gap-2.5">
            <AnimatePresence mode="popLayout">
              {shuffledSkills
                .filter((skill) => allActive || activeCategories.has(skill.category))
                .map((skill) => (
                  <SkillTag
                    key={skill.name}
                    name={skill.name}
                    category={skill.category}
                    emphasized={!allActive}
                  />
                ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-around gap-4 sm:gap-6 max-w-2xl mx-auto px-4 sm:px-8 py-4 sm:py-6 rounded-2xl card-hairline"
        >
          <AnimatedCounter end={skillsData.length} label="Total Skills" icon={Sparkles} />
          <div className="w-px h-10 bg-white/10 hidden sm:block" />
          <AnimatedCounter end={categories.length} label="Categories" icon={LayoutGrid} />
          <div className="w-px h-10 bg-white/10 hidden sm:block" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: categoryColors[cat], boxShadow: `0 0 6px ${categoryColors[cat]}80` }}
                />
              ))}
            </div>
            <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-medium">Domains</span>
          </div>
        </motion.div>

        {/* Category label helper text */}
        {!allActive && (
          <p className="text-center text-xs text-gray-500 mt-4">
            Showing:{" "}
            {[...activeCategories].map((c) => categoryLabels[c] || c).join(", ")}
          </p>
        )}
      </div>
    </section>
  );
}
