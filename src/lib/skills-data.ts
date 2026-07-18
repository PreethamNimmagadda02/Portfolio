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
  { name: "VideoRAG", category: "AI" },
  { name: "React", category: "Web" },
  { name: "Mem0", category: "AI" },
  { name: "Whisper", category: "AI" },
  { name: "AWS EC2", category: "DevOps" },
  { name: "Digital Ocean", category: "DevOps" },
  { name: "Context Engineering", category: "AI" },
  { name: "Meta Llama", category: "AI" },
  { name: "PostgreSQL", category: "DB" },
  { name: "Redis", category: "DB" },
  { name: "TypeScript", category: "Web" },
  { name: "FalkorDB", category: "DB" },
  { name: "Python", category: "Lang" },
  { name: "Qdrant", category: "DB" },
  { name: "Qwen", category: "AI" },
  { name: "Firebase", category: "Web" },
  { name: "OpenClaw", category: "AI" },
  { name: "DeepInfra", category: "AI" },
  { name: "CrewAI", category: "AI" },
  { name: "Next.js", category: "Web" },
  { name: "SQL", category: "DB" },
  { name: "Google Antigravity", category: "AI" },
  { name: "MongoDB", category: "DB" },
  { name: "n8n", category: "Automation" },
  { name: "C/C++", category: "Lang" },
  { name: "Postman", category: "Tools" },
  { name: "Tailwind CSS", category: "Web" },
  { name: "Git/GitHub", category: "Tools" },
  { name: "Node.js", category: "Web" },
  { name: "Ollama", category: "AI" },
];

export const categoryColors: Record<string, string> = {
  AI: "#ec4899",
  Web: "#06b6d4",
  DB: "#8b5cf6",
  DevOps: "#f59e0b",
  Lang: "#22c55e",
  Tools: "#64748b",
  Automation: "#f97316",
};

export const categoryLabels: Record<string, string> = {
  AI: "Artificial Intelligence",
  Web: "Web Development",
  DB: "Databases",
  DevOps: "DevOps & Cloud",
  Lang: "Languages",
  Tools: "Developer Tools",
  Automation: "Automation",
};

export function getCategoryColor(category: string) {
  return categoryColors[category] || "#ffffff";
}
