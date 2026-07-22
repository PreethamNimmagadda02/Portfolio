/**
 * Cross-section skill graph. Resolves the human-facing display tags used on
 * project/experience cards to the canonical skill names in skills-data.ts, and
 * builds a reverse index (skill -> where it was used) that powers the
 * SkillNavigator's "used in N places" count and labels.
 *
 * Navigation/scrolling itself queries the live DOM by [data-skill]; this module
 * supplies the counts and names only.
 */
import { skillsData } from "@/lib/skills-data";
import { projects } from "@/lib/projects-data";
import { experiences } from "@/lib/experience-data";

export type SkillUsageKind = "project" | "experience" | "ecosystem";

export interface SkillUsage {
  kind: SkillUsageKind;
  id: string;
  title: string;
}

const canonicalNames = new Set(skillsData.map((s) => s.name));

/** Display-tag → canonical-name overrides where they differ. */
const ALIASES: Record<string, string> = {
  React: "React.js",
  TypeScript: "Typescript",
  OpenAI: "OpenAI API",
  "GPT API": "OpenAI API",
  "Node JS": "Node.js",
};

export function isCanonicalSkill(name: string): boolean {
  return canonicalNames.has(name);
}

/**
 * Resolve a display tag to its canonical skill name, or null if the tag has no
 * ecosystem counterpart (e.g. "REST APIs", "Agentic AI", "Electron").
 */
export function resolveCanonical(tag: string): string | null {
  if (canonicalNames.has(tag)) return tag;
  const aliased = ALIASES[tag];
  if (aliased && canonicalNames.has(aliased)) return aliased;
  return null;
}

// Reverse index built once at module load. Section order matches page.tsx:
// experience → skills → projects.
const usageIndex = new Map<string, SkillUsage[]>();

function addUsage(skill: string, usage: SkillUsage) {
  const list = usageIndex.get(skill);
  if (list) list.push(usage);
  else usageIndex.set(skill, [usage]);
}

for (const exp of experiences) {
  for (const skill of exp.ecosystemSkills) {
    addUsage(skill, { kind: "experience", id: `exp-${exp.id}`, title: `${exp.role} · ${exp.company}` });
  }
}
for (const skill of skillsData) {
  addUsage(skill.name, { kind: "ecosystem", id: "skills-sphere", title: "Technical Ecosystem" });
}
for (const proj of projects) {
  for (const skill of proj.ecosystemSkills) {
    addUsage(skill, { kind: "project", id: `project-${proj.id}`, title: proj.title });
  }
}

// Dev-only warning for typo'd canonical names in the data modules.
if (process.env.NODE_ENV !== "production") {
  const referenced = new Set<string>();
  projects.forEach((p) => p.ecosystemSkills.forEach((s) => referenced.add(s)));
  experiences.forEach((e) => e.ecosystemSkills.forEach((s) => referenced.add(s)));
  for (const name of referenced) {
    if (!canonicalNames.has(name)) {
      console.warn(`[skill-connections] "${name}" is not a canonical skill in skills-data.ts`);
    }
  }
}

export function getSkillUsages(canonical: string): SkillUsage[] {
  return usageIndex.get(canonical) ?? [];
}
