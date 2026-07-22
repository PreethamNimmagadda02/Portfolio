import {
  GraduationCap,
  Ticket,
  TrendingUp,
  Bot,
  Code,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export interface ProjectData {
  id: number;
  title: string;
  description: string;
  /** Human-facing display tags (unchanged). */
  tags: string[];
  /** Canonical skill names from skills-data.ts that drive cross-section links. */
  ecosystemSkills: string[];
  links: { demo: string; repo: string };
  status: string;
  icon: LucideIcon;
  color: string;
  accent: string;
}

export const projects: ProjectData[] = [
  {
    id: 0,
    title: "College Central",
    description:
      "The digital backbone of IIT (ISM) Dhanbad — one platform for academic records, campus navigation, and event coordination, used daily by the student body.",
    tags: ["React", "TypeScript", "Firebase", "REST APIs", "Tailwind CSS", "Vite", "Framer Motion"],
    ecosystemSkills: ["React.js", "Typescript", "Firebase", "Tailwind CSS", "Vite", "Framer Motion"],
    links: { demo: "https://collegecentral.live/#/", repo: "https://github.com/PreethamNimmagadda02/College-Central" },
    status: "Live",
    icon: GraduationCap,
    color: "#a855f7",
    accent: "#ec4899",
  },
  {
    id: 1,
    title: "CareerOps",
    description:
      "A fully automated command center for your job search — discovering the right roles, scoring your fit with AI, and managing the entire application pipeline from end to end.",
    tags: ["TypeScript", "Playwright", "PostgreSQL", "Next.js", "OpenAI"],
    ecosystemSkills: ["Typescript", "Playwright", "PostgreSQL", "Next.js", "OpenAI API", "AWS EC2"],
    links: {
      demo: "http://careerops-alb-328156002.ap-southeast-2.elb.amazonaws.com/",
      repo: "https://github.com/PreethamNimmagadda02/CareerOps",
    },
    status: "Live",
    icon: Briefcase,
    color: "#14b8a6",
    accent: "#0f766e",
  },
  {
    id: 2,
    title: "FestFlow",
    description:
      "Multi-agent AI that turns event requirements into complete logistical plans — scheduling, budgets, and vendor coordination, generated automatically.",
    tags: ["Agentic AI", "AI Agents", "React", "Firebase", "Gemini API"],
    ecosystemSkills: ["React.js", "Firebase"],
    links: { demo: "https://festflow.co.in/", repo: "https://github.com/PreethamNimmagadda02/FestFlow" },
    status: "Live",
    icon: Ticket,
    color: "#3b82f6",
    accent: "#06b6d4",
  },
  {
    id: 3,
    title: "AI Trading System",
    description:
      "A swarm of AI agents that reads market signals and executes trading strategies autonomously, in real time.",
    tags: ["Python", "CrewAI", "GPT API", "Financial Tech"],
    ecosystemSkills: ["Python", "CrewAI", "OpenAI API"],
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
    id: 4,
    title: "Agentic VS Code",
    description:
      "A custom VS Code build with agentic AI at its core — natural language becomes working code, and routine project work runs itself.",
    tags: ["Electron", "TypeScript", "Agentic AI", "LLMs"],
    ecosystemSkills: ["Typescript"],
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
    id: 5,
    title: "Slack AI Data Bot",
    description:
      "A Slack assistant that turns plain English into PostgreSQL insights — auto-generated charts, one-click CSV exports, and smart query caching built in.",
    tags: ["Node.js", "LangChain", "OpenAI", "PostgreSQL", "Slack API", "NLP"],
    ecosystemSkills: ["Node.js", "LangChain", "OpenAI API", "PostgreSQL"],
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
