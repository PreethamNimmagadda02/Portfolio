"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "@/lib/motion";
import { Briefcase, Calendar, Award, Trophy, Star, Zap, LucideIcon } from "lucide-react";
import InteractiveCard from "./InteractiveCard";
import { InViewClass, SectionKicker } from "./Reveal";

type ExperienceType = "work" | "community" | "achievement" | "organization";

interface ExperienceData {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
  type: ExperienceType;
  skills: string[];
  highlight: string;
  color: string;
  accent: string;
}

const experiences: ExperienceData[] = [
  {
    id: 0,
    role: "Machine Learning Intern",
    company: "Matters.AI",
    period: "Mar 2026 — Present",
    description:
      "Building the AI copilot that finds data exposures in real time and remediates them automatically — turning data security from passive monitoring into a self-healing defense layer.",
    type: "work",
    skills: ["Autonomous AI", "DSPM", "ML Engineering", "Data Security"],
    highlight: "Autonomous AI Copilot",
    color: "#ef4444",
    accent: "#f87171",
  },
  {
    id: 1,
    role: "Generative AI Intern",
    company: "Introspect Labs",
    period: "Jan 2026 — Mar 2026",
    description:
      "Built a multimodal & multilingual AI companion powered by VideoRAG that processes 100+ hours of video with 95% accuracy. Designed its empathic core for real-time adaptive responses, boosting retention by 40%.",
    type: "work",
    skills: ["VideoRAG", "Vision-Language Models", "Empathic AI"],
    highlight: "Architected an AI Companion",
    color: "#c9974a",
    accent: "#c9974a",
  },
  {
    id: 2,
    role: "Campus Ambassador",
    company: "Perplexity",
    period: "Sept 2025 — Nov 2025",
    description:
      "Led campus adoption for Perplexity — built the partnerships and campaigns that drove real user growth across the university.",
    type: "community",
    skills: ["Growth Hacking", "Strategic Partnerships", "Brand Strategy"],
    highlight: "20+ Strategic Leads",
    color: "#22c55e",
    accent: "#10b981",
  },
  {
    id: 3,
    role: "Software Developer Intern",
    company: "METAVERTEX",
    period: "June 2025 — July 2025",
    description:
      "Architected autonomous AI agents reducing system resource load by 20%. Engineered performance optimizations that boosted SEO visibility by 10%.",
    type: "work",
    skills: ["AI Architecture", "System Optimization", "Scalable Tech"],
    highlight: "20% Efficiency Gain",
    color: "#c9974a",
    accent: "#d3a662",
  },
  {
    id: 4,
    role: "Hostel Prefect",
    company: "Hostel Executive Committee",
    period: "Sept 2024 — Sept 2025",
    description:
      "Managed operations for 1,800+ residents. Implemented conflict resolution protocols reducing disputes by 30% and boosted community engagement by 40%.",
    type: "organization",
    skills: ["Operations Management", "Conflict Resolution", "Community Building"],
    highlight: "Led 1,800+ Residents",
    color: "#c9974a",
    accent: "#d3a662",
  },
  {
    id: 5,
    role: "Student Senator",
    company: "Students' Gymkhana, IIT (ISM)",
    period: "March 2024 — March 2025",
    description:
      "Elected representative for 1,500+ peers. Facilitated policy changes and infrastructure improvements, enhancing student satisfaction and campus life quality.",
    type: "achievement",
    skills: ["Strategic Leadership", "Policy Advocacy", "Governance"],
    highlight: "Elected Representative",
    color: "#f59e0b",
    accent: "#f97316",
  },
];

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

        <p className="font-sans text-sm md:text-[15px] text-gray-300 leading-relaxed mb-4">
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
              background: "linear-gradient(180deg, #d3a662, #d3a662 40%, #d3a662 75%, #d3a662)",
              boxShadow: "0 0 12px rgba(211,166,98,0.5)",
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
