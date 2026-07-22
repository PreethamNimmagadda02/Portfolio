"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "@/lib/motion";
import { Briefcase, Calendar, Award, Trophy, Star, Zap, LucideIcon } from "lucide-react";
import InteractiveCard from "./InteractiveCard";
import { InViewClass, SectionKicker } from "./Reveal";
import { experiences, type ExperienceData, type ExperienceType } from "@/lib/experience-data";
import SkillToken from "./SkillToken";

const typeIcons: Record<ExperienceType, LucideIcon> = {
  work: Briefcase,
  community: Award,
  achievement: Trophy,
  organization: Star,
};

function TimelineEntry({ data, index }: { data: ExperienceData; index: number }) {
  const Icon = typeIcons[data.type];

  return (
    <motion.div
      id={`exp-${data.id}`}
      data-skill-scope
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.05 }}
      className="relative pl-10 md:pl-14 pb-12 last:pb-0 group"
    >
      {/* Node — lights up with a one-shot ripple when the entry reveals */}
      <InViewClass as="span" className="absolute left-[-5px] top-1 block" amount={0.5}>
        <span
          className="block w-3 h-3 rounded-full border-2 transition-shadow duration-700 in-[.in-view]:shadow-[0_0_14px_2px_var(--node-glow)]"
          style={{ borderColor: data.color, backgroundColor: "#030308", "--node-glow": `${data.color}80` } as React.CSSProperties}
        />
        <span
          className="absolute inset-[-6px] rounded-full border opacity-0 in-[.in-view]:animate-ping in-[.in-view]:opacity-40"
          style={{ borderColor: data.color, animationIterationCount: 2, animationDuration: "1.4s" }}
        />
      </InViewClass>

      <InteractiveCard
        accent={data.color}
        tilt={1.5}
        className="card-hairline rounded-2xl p-5 md:p-7 transition-[border-color,box-shadow] duration-500 hover:border-white/20 hover:shadow-[0_18px_50px_-24px_var(--ic-accent)]"
      >
        <div className="relative z-3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${data.color}18`, color: data.color }}
            >
              <Icon size={18} />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white leading-tight">{data.company}</h3>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                <Calendar size={11} />
                <span>{data.period}</span>
              </div>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0"
            style={{ color: data.color, borderColor: `${data.color}40`, backgroundColor: `${data.color}0f` }}
          >
            <Zap size={12} />
            {data.highlight}
          </span>
        </div>

        <h4 className="text-xl md:text-2xl font-black mb-2" style={{ color: data.color }}>
          {data.role}
        </h4>

        <p className="text-sm md:text-[15px] text-gray-300 leading-relaxed mb-4" style={{ fontFamily: "var(--font-inter)" }}>
          {data.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {data.skills.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors duration-300 cursor-default hover:text-white"
              style={{
                color: data.accent,
                borderColor: `${data.accent}25`,
                backgroundColor: `${data.accent}08`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = data.accent;
                e.currentTarget.style.borderColor = data.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${data.accent}08`;
                e.currentTarget.style.borderColor = `${data.accent}25`;
              }}
            >
              {skill}
            </span>
          ))}
        </div>

        {data.ecosystemSkills.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Built with</span>
            <div className="flex flex-wrap gap-1.5">
              {data.ecosystemSkills.map((skill) => (
                <SkillToken key={skill} canonical={skill} label={skill} color={data.color} />
              ))}
            </div>
          </div>
        )}
        </div>
      </InteractiveCard>
    </motion.div>
  );
}

export default function Experience() {
  const railRef = useRef<HTMLDivElement>(null);
  // The gradient rail draws itself as the timeline scrolls through the viewport
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.8", "end 0.55"],
  });
  const railScale = useSpring(scrollYProgress, { stiffness: 90, damping: 28, restDelta: 0.001 });

  return (
    <section id="experience" className="relative w-full py-20 md:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <InViewClass>
          <SectionKicker num="02" label="Journey" />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14 md:mb-20"
          >
            <h2 className="text-display text-3xl md:text-5xl text-white mb-3">
              <span className="line-mask">
                <span className="line-rise">
                  Experiences &{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-300 via-blue-400 to-cyan-400">
                    Ventures
                  </span>
                </span>
              </span>
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
              A timeline of roles, ventures, and the moments that shaped them.
            </p>
          </motion.div>
        </InViewClass>

        <div ref={railRef} className="relative">
          {/* Base rail */}
          <div className="absolute left-0 top-1 bottom-12 w-px bg-white/10" aria-hidden />
          {/* Scroll-drawn gradient rail */}
          <motion.div
            aria-hidden
            className="absolute left-0 top-1 bottom-12 w-px origin-top"
            style={{
              scaleY: railScale,
              background: "linear-gradient(180deg, #a78bfa, #60a5fa 40%, #22d3ee 75%, #f472b6)",
              boxShadow: "0 0 12px rgba(167,139,250,0.5)",
            }}
          />
          {experiences.map((exp, i) => (
            <TimelineEntry key={exp.id} data={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
