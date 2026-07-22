export type ExperienceType = "work" | "community" | "achievement" | "organization";

export interface ExperienceData {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
  type: ExperienceType;
  /** Conceptual pills shown for flavor (unchanged). */
  skills: string[];
  /** Concrete canonical tools from skills-data.ts — the linkable "Built with" row. */
  ecosystemSkills: string[];
  highlight: string;
  color: string;
  accent: string;
}

export const experiences: ExperienceData[] = [
  {
    id: 0,
    role: "Machine Learning Intern",
    company: "Matters.AI",
    period: "Mar 2026 — Present",
    description:
      "Building the AI copilot that finds data exposures in real time and remediates them automatically — turning data security from passive monitoring into a self-healing defense layer.",
    type: "work",
    skills: ["Autonomous AI", "DSPM", "ML Engineering", "Data Security"],
    ecosystemSkills: ["Python", "LangGraph", "AWS Lambda", "Qdrant", "OpenAI API"],
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
    ecosystemSkills: ["Python", "VideoRAG", "Whisper", "LangChain", "Qdrant"],
    highlight: "Architected an AI Companion",
    color: "#3b82f6",
    accent: "#06b6d4",
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
    ecosystemSkills: [],
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
    ecosystemSkills: ["Python", "LangChain", "React.js"],
    highlight: "20% Efficiency Gain",
    color: "#8b5cf6",
    accent: "#a78bfa",
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
    ecosystemSkills: [],
    highlight: "Led 1,800+ Residents",
    color: "#ec4899",
    accent: "#f472b6",
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
    ecosystemSkills: [],
    highlight: "Elected Representative",
    color: "#f59e0b",
    accent: "#f97316",
  },
];
