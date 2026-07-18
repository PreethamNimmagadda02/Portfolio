"use client";

import { motion } from "@/lib/motion";
import {
  ExternalLink,
  Github,
  GraduationCap,
  Ticket,
  TrendingUp,
  Bot,
  Code,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import MagneticButton from "./MagneticButton";
import { InViewClass, SectionKicker } from "./Reveal";
import type { CSSProperties } from "react";

interface ProjectData {
  id: number;
  title: string;
  description: string;
  tags: string[];
  links: { demo: string; repo: string };
  status: string;
  icon: LucideIcon;
  color: string;
  accent: string;
}

const projects: ProjectData[] = [
  {
    id: 0,
    title: "College Central",
    description:
      "The digital backbone of IIT (ISM) Dhanbad. A centralized platform empowering students with real-time academic insights, campus navigation, and event integration.",
    tags: ["React", "TypeScript", "Firebase", "REST APIs", "Tailwind CSS", "Vite", "Framer Motion"],
    links: { demo: "https://collegecentral.live/#/", repo: "https://github.com/PreethamNimmagadda02/College-Central" },
    status: "Live",
    icon: GraduationCap,
    color: "#a855f7",
    accent: "#ec4899",
  },
  {
    id: 1,
    title: "FestFlow",
    description:
      "Autonomous event orchestration at scale. Leveraging multi-agent AI to transform abstract constraints into executable logistical plans.",
    tags: ["Agentic AI", "AI Agents", "React", "Firebase", "Gemini API"],
    links: { demo: "https://festflow.co.in/", repo: "https://github.com/PreethamNimmagadda02/FestFlow" },
    status: "Live",
    icon: Ticket,
    color: "#3b82f6",
    accent: "#06b6d4",
  },
  {
    id: 2,
    title: "AI Trading System",
    description:
      "Algorithmic trading infrastructure. A swarm of AI agents analyzing market signals to execute high-frequency trading strategies with precision.",
    tags: ["Python", "CrewAI", "GPT API", "Financial Tech"],
    links: {
      demo: "https://github.com/PreethamNimmagadda02/Automated-Financial-Trading-Strategy-System",
      repo: "https://github.com/PreethamNimmagadda02/Automated-Financial-Trading-Strategy-System",
    },
    status: "Complete",
    icon: TrendingUp,
    color: "#22c55e",
    accent: "#10b981",
  },
  {
    id: 3,
    title: "Agentic VS Code",
    description:
      "A custom-compiled VS Code distribution with deeply embedded agentic AI capabilities. Empowers developers with seamless natural-language-to-code execution and autonomous project workflows.",
    tags: ["Electron", "TypeScript", "Agentic AI", "LLMs"],
    links: {
      demo: "https://github.com/PreethamNimmagadda02/Agentic-VS-Code",
      repo: "https://github.com/PreethamNimmagadda02/Agentic-VS-Code",
    },
    status: "Complete",
    icon: Code,
    color: "#f43f5e",
    accent: "#e11d48",
  },
  {
    id: 4,
    title: "Slack AI Data Bot",
    description:
      "A generative AI Slack assistant translating plain English into actionable PostgreSQL insights. Features auto-generated charts, 1-click CSV exports, and intelligent query caching.",
    tags: ["Node.js", "LangChain", "OpenAI", "PostgreSQL", "Slack API", "NLP"],
    links: {
      demo: "https://github.com/PreethamNimmagadda02/Slack-AI-Data-Bot",
      repo: "https://github.com/PreethamNimmagadda02/Slack-AI-Data-Bot",
    },
    status: "Complete",
    icon: Bot,
    color: "#eab308",
    accent: "#f59e0b",
  },
];

function ProjectRow({ project, index }: { project: ProjectData; index: number }) {
  const Icon = project.icon;
  const reversed = index % 2 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative py-10 md:py-14 border-b border-white/5 last:border-b-0 group/row"
      style={{ "--proj-color": project.color, "--proj-accent": project.accent } as CSSProperties}
    >
      {/* Row hover wash — project-tinted, gpu-cheap */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover/row:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${reversed ? "80%" : "20%"} 30%, ${project.color}0a, transparent 70%)`,
        }}
      />
      <div className={`relative flex flex-col md:flex-row gap-6 md:gap-12 items-start ${reversed ? "md:flex-row-reverse" : ""}`}>
        {/* Index + icon column */}
        <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-6 md:w-40 shrink-0">
          <span
            className="text-5xl md:text-7xl font-black leading-none select-none transition-colors duration-500 text-[color-mix(in_srgb,var(--proj-color)_18%,transparent)] group-hover/row:text-(--proj-color) group-hover/row:drop-shadow-[0_0_20px_var(--proj-color)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div
            className="p-3 rounded-2xl transition-all duration-500 group-hover/row:scale-110 group-hover/row:shadow-[0_0_28px_-6px_var(--proj-color)]"
            style={{ backgroundColor: `${project.color}14`, color: project.color }}
          >
            <Icon size={24} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h3
              className="text-2xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent transition-[background-position] duration-700 ease-out bg-position-[100%_0] group-hover/row:bg-position-[0%_0]"
              style={{
                backgroundImage: `linear-gradient(90deg, ${project.color}, ${project.accent} 45%, #fff 55%, #fff)`,
                backgroundSize: "220% 100%",
              }}
            >
              {project.title}
            </h3>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                color: project.status === "Live" ? "#4ade80" : "#60a5fa",
                borderColor: project.status === "Live" ? "rgba(74,222,128,0.3)" : "rgba(96,165,250,0.3)",
                backgroundColor: project.status === "Live" ? "rgba(74,222,128,0.08)" : "rgba(96,165,250,0.08)",
              }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${project.status === "Live" ? "bg-green-400 animate-pulse" : "bg-blue-400"}`} />
              {project.status}
            </span>
          </div>

          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-5 max-w-2xl" style={{ fontFamily: "var(--font-inter)" }}>
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-xs font-medium border"
                style={{ color: project.accent, borderColor: `${project.accent}30`, backgroundColor: `${project.accent}0a` }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <MagneticButton strength={0.35} className="inline-block">
              <Link
                href={project.links.demo}
                target="_blank"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:gap-3 transition-all group"
              >
                Live Demo
                <ExternalLink size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.35} className="inline-block">
              <Link
                href={project.links.repo}
                target="_blank"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                <Github size={15} />
                Source
              </Link>
            </MagneticButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="relative w-full py-20 md:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <InViewClass>
          <SectionKicker num="04" label="Selected Work" />
          <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
              Portfolio
            </span>
          </motion.div>
          <h2 className="text-display text-3xl md:text-5xl text-white mb-3">
            <span className="line-mask">
              <span className="line-rise">
                Signature{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-blue-400 to-cyan-400">
                  Projects
                </span>
              </span>
            </span>
          </h2>
          <p className="text-gray-300 text-sm md:text-base mb-6">Five builds that shipped, scaled, and solved real problems.</p>
        </InViewClass>

        <div>
          {projects.map((project, i) => (
            <ProjectRow key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
