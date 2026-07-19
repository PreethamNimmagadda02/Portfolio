/**
 * Shared skills dataset — read by both the DOM Skills section (chips, grid)
 * and the CosmicScene constellation flourish, so the two stay in sync
 * without duplicating the list.
 */
export interface SkillItem {
  name: string;
  category: string;
}

export const skillsData: SkillItem[] = [
  { name: "Prisma", category: "DB" },
  { name: "Ollama", category: "AI" },
  { name: "Git/GitHub", category: "Tools" },
  { name: "AWS EC2", category: "Cloud" },
  { name: "React.js", category: "Web" },
  { name: "MongoDB", category: "DB" },
  { name: "Qwen", category: "AI" },
  { name: "Playwright", category: "Tools" },
  { name: "FastAPI", category: "Web" },
  { name: "Mem0", category: "AI" },
  { name: "Typescript", category: "Lang" },
  { name: "Docker", category: "DevOps" },
  { name: "Redis", category: "DB" },
  { name: "AWS S3", category: "Cloud" },
  { name: "Next.js", category: "Web" },
  { name: "Antigravity", category: "AI" },
  { name: "Postman", category: "Tools" },
  { name: "Python", category: "Lang" },
  { name: "Three.js", category: "Web" },
  { name: "Capacitor", category: "Web" },
  { name: "PostgreSQL", category: "DB" },
  { name: "Context Engineering", category: "AI" },
  { name: "Vite", category: "Tools" },
  { name: "AWS EKS", category: "Cloud" },
  { name: "JavaScript", category: "Lang" },
  { name: "Framer Motion", category: "Web" },
  { name: "DynamoDB", category: "DB" },
  { name: "DeepInfra", category: "AI" },
  { name: "Flask", category: "Web" },
  { name: "LangGraph", category: "AI" },
  { name: "Digital Ocean", category: "Cloud" },
  { name: "Qdrant", category: "DB" },
  { name: "ArgoCD", category: "DevOps" },
  { name: "Tailwind CSS", category: "Web" },
  { name: "OpenAI API", category: "AI" },
  { name: "TablePro", category: "Tools" },
  { name: "C/C++", category: "Lang" },
  { name: "Meta Llama", category: "AI" },
  { name: "AWS ECS", category: "Cloud" },
  { name: "MinIO", category: "Cloud" },
  { name: "Node.js", category: "Web" },
  { name: "Firebase", category: "Web" },
  { name: "Hugging Face", category: "AI" },
  { name: "Claude Code", category: "AI" },
  { name: "FalkorDB", category: "DB" },
  { name: "CrewAI", category: "AI" },
  { name: "LangChain", category: "AI" },
  { name: "Kubernetes", category: "DevOps" },
  { name: "VideoRAG", category: "AI" },
  { name: "SQL", category: "DB" },
  { name: "AWS RDS", category: "Cloud" },
  { name: "Express.js", category: "Web" },
  { name: "n8n", category: "AI" },
  { name: "OpenCV", category: "Tools" },
  { name: "Whisper", category: "AI" },
  { name: "Airbyte", category: "Tools" },
  { name: "OpenCode", category: "AI" },
  { name: "Gemma", category: "AI" },
  { name: "GitHub Actions", category: "DevOps" },
  { name: "Jira", category: "Tools" },
];

export const categoryColors: Record<string, string> = {
  AI: "#ec4899",
  Web: "#06b6d4",
  DB: "#8b5cf6",
  Cloud: "#3b82f6",
  DevOps: "#f59e0b",
  Lang: "#22c55e",
  Tools: "#64748b",
  Automation: "#f97316",
};

export const categoryLabels: Record<string, string> = {
  AI: "Artificial Intelligence",
  Web: "Web Development",
  DB: "Databases",
  Cloud: "Cloud Infrastructure",
  DevOps: "DevOps & CI/CD",
  Lang: "Languages",
  Tools: "Developer Tools",
  Automation: "Automation",
};

export function getCategoryColor(category: string) {
  return categoryColors[category] || "#ffffff";
}
