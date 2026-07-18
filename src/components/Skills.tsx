"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, useInView } from "@/lib/motion";
import { skillsData, categoryColors, categoryLabels } from "@/lib/skills-data";
import { toggleSkillCategory, useActiveSkillCategories } from "@/lib/scene-store";
import { InViewClass, SectionKicker } from "./Reveal";

function AnimatedCounter({ end, label, suffix = "" }: { end: number; label: string; suffix?: string }) {
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
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: isActive ? `0 0 8px ${color}` : "none" }} />
        {category}
        <span className="text-[9px] font-medium opacity-60 tabular-nums" style={{ color: isActive ? "#fff" : color }}>
          {count}
        </span>
      </span>
    </motion.button>
  );
}

function SkillTag({ name, category, dimmed }: { name: string; category: string; dimmed: boolean }) {
  const color = categoryColors[category];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35 }}
      animate={{ opacity: dimmed ? 0.35 : 1, scale: dimmed ? 0.96 : 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors duration-300"
      style={{
        borderColor: dimmed ? "rgba(255,255,255,0.06)" : `${color}30`,
        backgroundColor: dimmed ? "rgba(255,255,255,0.02)" : `${color}0a`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: dimmed ? "none" : `0 0 6px ${color}` }} />
      <span className="text-sm font-medium text-gray-200 whitespace-nowrap">{name}</span>
    </motion.div>
  );
}

export default function Skills() {
  const activeCategories = useActiveSkillCategories();
  const allActive = activeCategories.size === 0;

  const categories = useMemo(() => [...new Set(skillsData.map((s) => s.category))], []);
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    skillsData.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <section id="skills-sphere" className="relative w-full py-20 md:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <InViewClass>
          <SectionKicker num="03" label="Toolbox" />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
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
              Tap a category to filter — and watch the constellation behind you respond.
            </p>
          </motion.div>
        </InViewClass>

        {/* Category chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
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

        {/* Skill grid */}
        <div className="flex flex-wrap justify-center gap-2.5 md:gap-3 mb-12">
          {skillsData.map((skill) => (
            <SkillTag
              key={skill.name}
              name={skill.name}
              category={skill.category}
              dimmed={!allActive && !activeCategories.has(skill.category)}
            />
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-around gap-4 sm:gap-6 max-w-2xl mx-auto px-4 sm:px-8 py-4 sm:py-6 rounded-2xl card-hairline"
        >
          <AnimatedCounter end={skillsData.length} label="Total Skills" suffix="+" />
          <div className="w-px h-10 bg-white/10 hidden sm:block" />
          <AnimatedCounter end={categories.length} label="Categories" />
          <div className="w-px h-10 bg-white/10 hidden sm:block" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
              {categories.slice(0, 5).map((cat) => (
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
