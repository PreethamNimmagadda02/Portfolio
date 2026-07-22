# Skill ↔ Project/Experience Connections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make projects, experiences, and the Technical Ecosystem bidirectionally connected — clicking any skill highlights every place it was used across all three sections, with a floating navigator to jump between matches.

**Architecture:** A module-level "focused skill" store (same `useSyncExternalStore` pattern as the existing category filter) holds one canonical skill name. Project/experience data moves to `src/lib/` modules and gains an explicit `ecosystemSkills` field of canonical names. A shared `SkillToken` component renders every clickable skill, glowing on match and dimming otherwise. A `SkillNavigator` pill reads the store and cycles through matches in the live DOM.

**Tech Stack:** Next.js 16 / React 19 / TypeScript (strict), Tailwind CSS 4, Framer Motion, Lenis (via `smoothScrollTo` in `src/lib/utils.ts`), Three.js constellation in `CosmicScene.tsx`.

## Global Constraints

- All touched components are client components — keep the `"use client";` directive at the top of every `.tsx` component file.
- Canonical skill names MUST match `src/lib/skills-data.ts` `skillsData[].name` **exactly** (e.g. `"React.js"`, `"Typescript"`, `"OpenAI API"`). These are the only valid values for `ecosystemSkills` and for the store's focused value.
- No new dependencies. Reuse `smoothScrollTo` from `src/lib/utils.ts` and `window.lenis`.
- Path alias `@/*` → `src/*`.
- No test framework exists. Every task's verification is: `npm run lint` (zero new errors) + `npm run build` (succeeds) + the documented manual check + commit.
- Respect reduced motion (`MotionConfig reducedMotion="user"` is already global; for imperative pulse/scroll, guard with `window.matchMedia("(prefers-reduced-motion: reduce)")`).

---

### Task 1: Focused-skill store

**Files:**
- Modify: `src/lib/scene-store.ts` (append after the existing category-filter block, ~line 107)

**Interfaces:**
- Consumes: nothing (parallel to existing `activeCategories` store).
- Produces:
  - `setFocusedSkill(name: string | null): void`
  - `toggleFocusedSkill(name: string): void` — sets `name`, or clears if `name` is already focused
  - `getFocusedSkill(): string | null`
  - `useFocusedSkill(): string | null`

- [ ] **Step 1: Append the focused-skill store to `scene-store.ts`**

Add at the end of the file:

```ts
// -----------------------------------------------------------------------------
// Focused skill — a single canonical skill name (must match skillsData[].name)
// shared across the Skills, Projects, and Experience sections plus the
// constellation. Selecting a skill anywhere highlights every matching token
// everywhere and drives the SkillNavigator. Parallel to the category filter
// above, but a scalar rather than a Set.
// -----------------------------------------------------------------------------
let focusedSkill: string | null = null;
const focusListeners = new Set<() => void>();

export function setFocusedSkill(name: string | null) {
  if (focusedSkill === name) return;
  focusedSkill = name;
  for (const l of focusListeners) l();
}

export function toggleFocusedSkill(name: string) {
  setFocusedSkill(focusedSkill === name ? null : name);
}

export function getFocusedSkill() {
  return focusedSkill;
}

function subscribeFocus(cb: () => void) {
  focusListeners.add(cb);
  return () => focusListeners.delete(cb);
}

export function useFocusedSkill(): string | null {
  return useSyncExternalStore(subscribeFocus, getFocusedSkill, () => null);
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: succeeds, no new errors. (`useSyncExternalStore` is already imported at the top of the file.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/scene-store.ts
git commit -m "feat: add focused-skill store to scene-store"
```

---

### Task 2: Extract projects data with ecosystem links

**Files:**
- Create: `src/lib/projects-data.ts`
- Modify: `src/components/Projects.tsx` (remove inline `projects` array + `ProjectData` interface; import from the new module; add scope id/attr to the row)

**Interfaces:**
- Consumes: `LucideIcon` from `lucide-react`.
- Produces:
  - `interface ProjectData { id; title; description; tags: string[]; ecosystemSkills: string[]; links; status; icon: LucideIcon; color; accent; }`
  - `export const projects: ProjectData[]`

- [ ] **Step 1: Create `src/lib/projects-data.ts`**

Move the existing array here verbatim, add the `ecosystemSkills` field to each entry, and keep the Lucide icon imports (a `.ts` module can import them):

```ts
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
```

- [ ] **Step 2: Update `Projects.tsx` to import the data**

In `src/components/Projects.tsx`:
- Delete the inline `interface ProjectData { ... }` (lines ~20-30) and the entire `const projects: ProjectData[] = [ ... ];` (lines ~32-117).
- Remove the now-unused icon imports (`ExternalLink` and `Github` stay — they're used in the row; `GraduationCap, Ticket, TrendingUp, Bot, Code, Briefcase, LucideIcon` move to the data module).
- Add the import near the top:

```ts
import { projects, type ProjectData } from "@/lib/projects-data";
```

The resulting import block should be:

```ts
"use client";

import { motion } from "@/lib/motion";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import MagneticButton from "./MagneticButton";
import { InViewClass, SectionKicker } from "./Reveal";
import type { CSSProperties } from "react";
import { projects, type ProjectData } from "@/lib/projects-data";
```

- [ ] **Step 3: Add a scroll scope to each project row**

In `ProjectRow`, add an `id` and `data-skill-scope` to the outer `motion.div` (the one at ~line 124) so the navigator can scroll to and pulse it. Change its opening tag to include:

```tsx
    <motion.div
      id={`project-${project.id}`}
      data-skill-scope
      ...existing props...
    >
```

(Keep all existing className/style/animation props unchanged.)

- [ ] **Step 4: Verify lint + build + manual check**

Run: `npm run lint && npm run build`
Expected: succeeds. Then `npm run dev`, open the Projects section — it renders identically to before (this task is a pure data move + two attributes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/projects-data.ts src/components/Projects.tsx
git commit -m "refactor: extract projects data to lib with ecosystem skill links"
```

---

### Task 3: Extract experience data with ecosystem links

**Files:**
- Create: `src/lib/experience-data.ts`
- Modify: `src/components/Experience.tsx` (remove inline data; import; add scope id/attr)

**Interfaces:**
- Produces:
  - `type ExperienceType = "work" | "community" | "achievement" | "organization"`
  - `interface ExperienceData { id; role; company; period; description; type; skills: string[]; ecosystemSkills: string[]; highlight; color; accent; }`
  - `export const experiences: ExperienceData[]`

- [ ] **Step 1: Create `src/lib/experience-data.ts`**

Move the array here, keeping the conceptual `skills` untouched and adding `ecosystemSkills` (the concrete "Built with" stack; empty for non-technical roles):

```ts
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
```

- [ ] **Step 2: Update `Experience.tsx` to import the data**

In `src/components/Experience.tsx`:
- Delete the inline `type ExperienceType`, `interface ExperienceData`, and the `const experiences: ExperienceData[] = [ ... ];` block (lines ~9-103).
- Keep the `typeIcons` map in the component (it references Lucide icons already imported there: `Briefcase, Award, Trophy, Star`; `Calendar, Zap` also stay). Remove `Star`? No — `Star` is used in `typeIcons`. Keep all icon imports currently used by `typeIcons`/JSX.
- Add near the top:

```ts
import { experiences, type ExperienceData, type ExperienceType } from "@/lib/experience-data";
```

- [ ] **Step 3: Add a scroll scope to each timeline entry**

In `TimelineEntry`, add `id` and `data-skill-scope` to the outer `motion.div` (~line 116):

```tsx
    <motion.div
      id={`exp-${data.id}`}
      data-skill-scope
      ...existing props...
    >
```

- [ ] **Step 4: Verify lint + build + manual check**

Run: `npm run lint && npm run build`
Expected: succeeds. `npm run dev` → Experience section renders identically (data move only; the "Built with" row is added in Task 8).

- [ ] **Step 5: Commit**

```bash
git add src/lib/experience-data.ts src/components/Experience.tsx
git commit -m "refactor: extract experience data to lib with ecosystem skill links"
```

---

### Task 4: Skill-connections module (alias map + reverse index)

**Files:**
- Create: `src/lib/skill-connections.ts`

**Interfaces:**
- Consumes: `projects` from `@/lib/projects-data`, `experiences` from `@/lib/experience-data`, `skillsData` from `@/lib/skills-data`.
- Produces:
  - `type SkillUsageKind = "project" | "experience" | "ecosystem"`
  - `interface SkillUsage { kind: SkillUsageKind; id: string; title: string }`
  - `resolveCanonical(tag: string): string | null`
  - `getSkillUsages(canonical: string): SkillUsage[]`
  - `isCanonicalSkill(name: string): boolean`

- [ ] **Step 1: Create `src/lib/skill-connections.ts`**

```ts
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
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: succeeds, and the build console shows **no** `[skill-connections]` warnings (a warning means a mapping name is misspelled — fix it in the data module before continuing).

- [ ] **Step 3: Commit**

```bash
git add src/lib/skill-connections.ts
git commit -m "feat: add skill-connections alias map and reverse index"
```

---

### Task 5: Shared SkillToken component

**Files:**
- Create: `src/components/SkillToken.tsx`
- Modify: `src/app/globals.css` (append the `skill-pulse` keyframe + class)

**Interfaces:**
- Consumes: `useFocusedSkill`, `toggleFocusedSkill` from `@/lib/scene-store`.
- Produces: `export default function SkillToken(props: SkillTokenProps)` where
  `SkillTokenProps = { canonical: string | null; label: string; color: string; className?: string; emphasizedByDefault?: boolean }`

- [ ] **Step 1: Append the pulse keyframe to `globals.css`**

Add at the end of `src/app/globals.css`:

```css
/* One-shot pulse the SkillNavigator applies to a card when it scrolls to it. */
@keyframes skill-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.0); }
  30%  { box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.55), 0 0 40px -6px rgba(139, 92, 246, 0.7); }
  100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.0); }
}
.skill-pulse {
  animation: skill-pulse 1.2s ease-out;
  border-radius: 1rem;
}
@media (prefers-reduced-motion: reduce) {
  .skill-pulse { animation: none; }
}
```

- [ ] **Step 2: Create `src/components/SkillToken.tsx`**

```tsx
"use client";

import { motion } from "@/lib/motion";
import { useFocusedSkill, toggleFocusedSkill } from "@/lib/scene-store";

export interface SkillTokenProps {
  /** Canonical skill name for cross-linking, or null for a non-ecosystem tag. */
  canonical: string | null;
  label: string;
  /** Section accent color (hex). */
  color: string;
  className?: string;
  /** When no skill is focused, render in the emphasized (filled) style. */
  emphasizedByDefault?: boolean;
}

/**
 * One skill chip, shared by the Skills, Projects, and Experience sections.
 * - If `canonical` is set, the chip is clickable: it toggles the global focused
 *   skill and carries `data-skill` so the navigator can find/scroll to it.
 * - When a skill is focused elsewhere, matching chips glow and non-matching
 *   chips dim. Chips with no canonical mapping render as plain, inert tags.
 */
export default function SkillToken({ canonical, label, color, className, emphasizedByDefault }: SkillTokenProps) {
  const focused = useFocusedSkill();
  const linkable = canonical !== null;
  const isMatch = linkable && focused === canonical;
  const anyFocus = focused !== null;
  const dimmed = anyFocus && !isMatch;
  const emphasized = isMatch || (!anyFocus && !!emphasizedByDefault);

  const base = "inline-flex items-center gap-1.5 rounded-full border text-xs font-medium transition-all duration-300 px-2.5 py-1";

  const style: React.CSSProperties = {
    color: emphasized ? "#fff" : color,
    borderColor: emphasized ? color : `${color}30`,
    backgroundColor: emphasized ? `${color}22` : `${color}0a`,
    boxShadow: isMatch ? `0 0 18px -4px ${color}` : "none",
    opacity: dimmed ? 0.28 : 1,
    cursor: linkable ? "pointer" : "default",
  };

  const content = (
    <>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
      <span className="whitespace-nowrap">{label}</span>
    </>
  );

  if (!linkable) {
    return (
      <span className={`${base} ${className ?? ""}`} style={style}>
        {content}
      </span>
    );
  }

  return (
    <motion.button
      type="button"
      data-skill={canonical}
      aria-pressed={isMatch}
      title={isMatch ? `Clear ${label}` : `Show where I used ${label}`}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => toggleFocusedSkill(canonical)}
      className={`${base} ${className ?? ""}`}
      style={style}
    >
      {content}
    </motion.button>
  );
}
```

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: succeeds. (Component is not yet mounted anywhere; this only checks it compiles.)

- [ ] **Step 4: Commit**

```bash
git add src/components/SkillToken.tsx src/app/globals.css
git commit -m "feat: add shared SkillToken component and pulse keyframe"
```

---

### Task 6: Wire focus into the Technical Ecosystem grid

**Files:**
- Modify: `src/components/Skills.tsx` (make each grid `SkillTag` a focusable token)

**Interfaces:**
- Consumes: `useFocusedSkill`, `toggleFocusedSkill` from `@/lib/scene-store`.

**Note:** Ecosystem skill names are already canonical, so they map to themselves. Keep the existing `SkillTag` visual but add focus behavior. The simplest change is to extend `SkillTag` in place (it already has the emphasized styling) rather than swapping in `SkillToken`, to preserve the `layout`/`AnimatePresence` grid animation.

- [ ] **Step 1: Import the focus store in `Skills.tsx`**

Update the scene-store import (line 7) to add the focus helpers:

```ts
import { toggleSkillCategory, useActiveSkillCategories, useFocusedSkill, toggleFocusedSkill } from "@/lib/scene-store";
```

- [ ] **Step 2: Make `SkillTag` focus-aware**

Replace the `SkillTag` function (lines ~96-118) with:

```tsx
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
```

- [ ] **Step 3: Verify lint + build + manual check**

Run: `npm run lint && npm run build`
Expected: succeeds. `npm run dev` → in the Technical Ecosystem, clicking a tag lights it and dims the rest; clicking it again clears. (Cross-section highlight and navigator come next.)

- [ ] **Step 4: Commit**

```bash
git add src/components/Skills.tsx
git commit -m "feat: make ecosystem skill tags focusable"
```

---

### Task 7: Wire focus into project tags

**Files:**
- Modify: `src/components/Projects.tsx` (replace the inline tag `<span>` map with `SkillToken`)

- [ ] **Step 1: Import SkillToken and the resolver**

Add to `Projects.tsx` imports:

```ts
import SkillToken from "./SkillToken";
import { resolveCanonical } from "@/lib/skill-connections";
```

- [ ] **Step 2: Replace the tag rendering**

Replace the tags block (the `<div className="flex flex-wrap gap-2 mb-6">...{project.tags.map(...)}...</div>`, lines ~186-204) with:

```tsx
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <SkillToken key={tag} canonical={resolveCanonical(tag)} label={tag} color={project.accent} />
            ))}
          </div>
```

(This removes the manual `onMouseEnter`/`onMouseLeave` hover handlers — `SkillToken` handles hover via Framer Motion.)

- [ ] **Step 3: Verify lint + build + manual check**

Run: `npm run lint && npm run build`
Expected: succeeds. `npm run dev` → project tags with an ecosystem match (e.g. "React", "Next.js") are clickable and, when clicked, light the matching ecosystem tag and dim non-matches in the Skills section; non-ecosystem tags (e.g. "REST APIs", "Electron") render as plain inert chips.

- [ ] **Step 4: Commit**

```bash
git add src/components/Projects.tsx
git commit -m "feat: link project tags to the skill ecosystem"
```

---

### Task 8: Add the "Built with" row to experience cards

**Files:**
- Modify: `src/components/Experience.tsx` (add a concrete-tool token row below the conceptual pills)

- [ ] **Step 1: Import SkillToken**

Add to `Experience.tsx` imports:

```ts
import SkillToken from "./SkillToken";
```

- [ ] **Step 2: Render the "Built with" row**

In `TimelineEntry`, immediately after the conceptual-skills `<div className="flex flex-wrap gap-1.5">...</div>` block (the one mapping `data.skills`, ~line 174-196), add:

```tsx
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
```

(The conceptual `data.skills` pills stay exactly as they are — this row is additive.)

- [ ] **Step 3: Verify lint + build + manual check**

Run: `npm run lint && npm run build`
Expected: succeeds. `npm run dev` → technical experiences (Matters.AI, Introspect Labs, METAVERTEX) show a "Built with" row of clickable tools; non-technical roles (Perplexity, Hostel Prefect, Student Senator) show no such row. Clicking a tool highlights it across sections.

- [ ] **Step 4: Commit**

```bash
git add src/components/Experience.tsx
git commit -m "feat: add linkable Built with row to experience cards"
```

---

### Task 9: Floating SkillNavigator pill

**Files:**
- Create: `src/components/SkillNavigator.tsx`
- Modify: `src/app/layout.tsx` (mount it inside the provider tree)

**Interfaces:**
- Consumes: `useFocusedSkill`, `setFocusedSkill` from `@/lib/scene-store`; `getSkillUsages` from `@/lib/skill-connections`; `getCategoryColor` from `@/lib/skills-data`; `skillsData` (to derive the skill's category color); `smoothScrollTo` from `@/lib/utils`.

- [ ] **Step 1: Create `src/components/SkillNavigator.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useFocusedSkill, setFocusedSkill } from "@/lib/scene-store";
import { getSkillUsages } from "@/lib/skill-connections";
import { skillsData, getCategoryColor } from "@/lib/skills-data";
import { smoothScrollTo } from "@/lib/utils";

/** Distinct card scopes (in document order) that contain the focused skill. */
function collectScopes(skill: string): HTMLElement[] {
  const tokens = Array.from(document.querySelectorAll<HTMLElement>(`[data-skill="${CSS.escape(skill)}"]`));
  const scopes: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();
  for (const tok of tokens) {
    const scope = (tok.closest("[data-skill-scope]") as HTMLElement) ?? tok;
    if (!seen.has(scope)) {
      seen.add(scope);
      scopes.push(scope);
    }
  }
  // Order by vertical position so prev/next follow the page.
  return scopes.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
}

function pulse(el: HTMLElement) {
  el.classList.remove("skill-pulse");
  // Force reflow so re-adding the class restarts the animation.
  void el.offsetWidth;
  el.classList.add("skill-pulse");
  el.addEventListener("animationend", () => el.classList.remove("skill-pulse"), { once: true });
}

export default function SkillNavigator() {
  const focused = useFocusedSkill();
  const [cursor, setCursor] = useState(0);

  const usageCount = focused ? getSkillUsages(focused).length : 0;
  const color = focused
    ? getCategoryColor(skillsData.find((s) => s.name === focused)?.category ?? "")
    : "#8b5cf6";

  // Reset the cursor whenever the focused skill changes.
  const prevFocused = useRef<string | null>(null);
  useEffect(() => {
    if (focused !== prevFocused.current) {
      prevFocused.current = focused;
      setCursor(0);
    }
  }, [focused]);

  // Esc clears focus.
  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusedSkill(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused]);

  const go = (dir: 1 | -1) => {
    if (!focused) return;
    const scopes = collectScopes(focused);
    if (scopes.length === 0) return;
    const next = (cursor + dir + scopes.length) % scopes.length;
    setCursor(next);
    const target = scopes[next];
    if (target.id) smoothScrollTo(`#${target.id}`, -120);
    else target.scrollIntoView({ behavior: "smooth", block: "center" });
    pulse(target);
  };

  return (
    <AnimatePresence>
      {focused && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-white/15 bg-black/85 backdrop-blur-md px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          role="status"
          aria-live="polite"
        >
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
          <span className="text-sm font-semibold text-white whitespace-nowrap">{focused}</span>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            used in {usageCount} {usageCount === 1 ? "place" : "places"}
          </span>
          {usageCount > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous usage"
                className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next usage"
                className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setFocusedSkill(null)}
            aria-label="Clear focused skill"
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Mount `SkillNavigator` in `layout.tsx`**

Add the import alongside the other component imports (near line 9):

```ts
import SkillNavigator from "@/components/SkillNavigator";
```

Then render it inside `<SmoothScroll>`, after `<Footer />` (so it sits above content and Lenis is available), at ~line 176:

```tsx
              <SmoothScroll>
                <Navbar />
                <main id="main-content" className="min-h-screen">
                  {children}
                </main>
                <Footer />
                <SkillNavigator />
              </SmoothScroll>
```

- [ ] **Step 3: Verify lint + build + manual check**

Run: `npm run lint && npm run build`
Expected: succeeds. `npm run dev`:
- Click "React.js" in the ecosystem → pill appears bottom-center: "React.js · used in N places" with prev/next arrows.
- Prev/next scrolls to and pulses each project/experience card using it, and back to the ecosystem.
- × and Esc dismiss the pill and clear all highlights.
- A skill used in only one place shows no arrows.

- [ ] **Step 4: Commit**

```bash
git add src/components/SkillNavigator.tsx src/app/layout.tsx
git commit -m "feat: add floating SkillNavigator pill"
```

---

### Task 10: Focus the constellation on the selected skill

**Files:**
- Modify: `src/components/scene/CosmicScene.tsx` (frame loop ~lines 871-896)

**Interfaces:**
- Consumes: `getFocusedSkill` from `@/lib/scene-store`.

- [ ] **Step 1: Import the focus getter**

Update the scene-store import (line 35) to include `getFocusedSkill`:

```ts
import { getActiveSkillCategories, getFocusedSkill } from "@/lib/scene-store";
```

- [ ] **Step 2: Prefer the focused skill over the category filter in the per-star match**

In the constellation's `useFrame`, change the match computation (currently around lines 871-889). Replace:

```ts
    const activeCats = getActiveSkillCategories();
    const anyFilter = activeCats.size > 0;
```

with:

```ts
    const activeCats = getActiveSkillCategories();
    const focused = getFocusedSkill();
    const anyFilter = focused !== null || activeCats.size > 0;
```

and replace the per-star match line:

```ts
        const match = !anyFilter || activeCats.has(skillsData[i].category);
```

with:

```ts
        const match = focused
          ? skillsData[i].name === focused
          : !anyFilter || activeCats.has(skillsData[i].category);
```

(When a skill is focused, only its single star stays lit; otherwise the existing category behavior is unchanged.)

- [ ] **Step 3: Verify lint + build + manual check**

Run: `npm run lint && npm run build`
Expected: succeeds. `npm run dev` → scroll so the constellation is visible, click a skill anywhere → its single star stays bright while the rest fade; clearing restores the normal/category state.

- [ ] **Step 4: Commit**

```bash
git add src/components/scene/CosmicScene.tsx
git commit -m "feat: highlight the focused skill's star in the constellation"
```

---

## Final verification

- [ ] Run `npm run lint` — zero errors.
- [ ] Run `npm run build` — static export succeeds, no `[skill-connections]` warnings.
- [ ] Manual end-to-end in `npm run dev`:
  - Click a skill in each of the three sections; confirm bidirectional highlight + dim.
  - Navigator count matches the actual number of cards/sections using the skill.
  - Prev/next scrolls to and pulses each match; wraps around.
  - Non-canonical project tags are inert; non-technical experiences have no "Built with" row.
  - Constellation lights only the focused star.
  - ×, Esc, and re-clicking the focused token all reset cleanly.

## Self-review notes

- **Spec coverage:** data layer (T2-T4), focused-skill store (T1), shared token (T5), bidirectional wiring (T6-T8), navigator pill (T9), constellation focus (T10) — all spec sections mapped.
- **Type consistency:** `ecosystemSkills: string[]` on both data types; `resolveCanonical`/`getSkillUsages`/`getFocusedSkill`/`toggleFocusedSkill`/`setFocusedSkill` names used identically across tasks; `data-skill` + `data-skill-scope` attribute names consistent between token (T5/T6), cards (T2/T3), and navigator (T9).
- **No placeholders:** every code step contains complete code.
