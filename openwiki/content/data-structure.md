# Content & Data Structure

**This page explains where content lives, how to update it, and the data structures for projects, experience, skills, and achievements.**

---

## Overview

All portfolio content is **hardcoded in component files**. There is no CMS, database, or API calls. Each section has a TypeScript array or object containing the content.

| Section | Component | File | Data Type |
|---------|-----------|------|-----------|
| Hero | `Hero.tsx` | `src/components/Hero.tsx` | ROLES array, links |
| About | `About3D.tsx` | `src/components/About3D.tsx` | features, stats arrays |
| Experience | `Experience.tsx` | `src/components/Experience.tsx` | experiences array |
| Projects | `Projects.tsx` | `src/components/Projects.tsx` | projects array |
| Achievements | `Achievements3D.tsx` | `src/components/Achievements3D.tsx` | stats, badges arrays |
| Skills | `SkillsMarquee.tsx` | `src/components/SkillsMarquee.tsx` | skills array |
| GitHub Stats | `GitHubStats.tsx` | `src/components/GitHubStats.tsx` | GitHub API (live fetch) |
| Testimonials | `Testimonials.tsx` | `src/components/Testimonials.tsx` | testimonials array |

---

## Hero Section

**File:** `src/components/Hero.tsx`

### Roles (Typing Rotator)

```tsx
const ROLES = [
  "Perpetual Learner",
  "AI Engineer",
  "Full Stack Developer",
  "AI Security Visionary",
  "Open Source Builder",
  "Competitive Programmer",
  "Agent Systems Architect",
  "Relentless Innovator"
];
```

**How to Edit:**
1. Open `src/components/Hero.tsx`
2. Find the `ROLES` array
3. Add, remove, or edit strings
4. The typing rotator automatically cycles through all roles

**How It Works:** Component types each role character-by-character, then deletes, then moves to next.

### CV/CTA Links

In the same file, look for button links:
```tsx
<Link href="https://drive.google.com/..." target="_blank">
  Download CV
</Link>
```

Change the `href` to point to your CV or any URL.

---

## About Section (About3D.tsx)

**File:** `src/components/About3D.tsx`

### Features Array

Defines the four orbiting feature cards:

```tsx
const features = [
  {
    id: 0,
    icon: Code,           // Lucide icon
    title: "Generative AI Specialist",
    shortTitle: "Gen AI",
    description: (
      <>
        Pioneering <span className="text-blue-400 font-bold">Multimodal Systems</span>...
      </>
    ),
    color: "#60a5fa",     // blue-400 (hex for RGB)
    position: [3, 0, 0],  // 3D position
    orbitSpeed: 0.5
  },
  // ... more features
];
```

**How to Edit:**
1. Open `src/components/About3D.tsx`
2. Find the `features` array
3. Modify `title`, `description`, `color`, or `icon`
4. Icons are from `lucide-react` (Code, Rocket, Globe, BookOpen, etc.)
5. Colors are hex strings; description supports JSX

**Position & Orbit:**
- `position: [x, y, z]` — Position in 3D space (relative to torus)
- `orbitSpeed: number` — How fast the card orbits (larger = faster)

### Stats Array

Small statistics displayed at bottom:

```tsx
const stats = [
  { value: "4000+", label: "Students Influenced", color: "text-purple-400", icon: Users },
  { value: "20%", label: "Memory Reduction", color: "text-yellow-400", icon: Zap },
  { value: "350+", label: "Participants Led", color: "text-emerald-400", icon: Target }
];
```

**How to Edit:**
1. Find `stats` array
2. Change `value`, `label`, `color` (Tailwind class), `icon` (Lucide icon)
3. Stats render in a row at the bottom of the section

---

## Experience Section (Experience.tsx)

**File:** `src/components/Experience.tsx`

### Experience Data Structure

```tsx
interface ExperienceData {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
  type: "work" | "leadership" | "community" | "achievement" | "organization";
  skills: string[];
  highlight: string;
  color: string;
  accent: string;
  geometry: string;
}

const experiences: ExperienceData[] = [
  {
    id: 0,
    role: "Machine Learning Intern",
    company: "Matters.AI",
    period: "Mar 2026 - Present",
    description: "Forging the autonomous AI copilot that hunts data threats...",
    type: "work",
    skills: ["Autonomous AI", "DSPM", "ML Engineering", "Data Security"],
    highlight: "Autonomous AI Copilot",
    color: "#ef4444",          // red-500
    accent: "#f87171",         // red-400
    geometry: "crystal"
  },
  // ... more experiences
];
```

**How to Edit:**
1. Open `src/components/Experience.tsx`
2. Find the `experiences` array
3. **Add new:** Copy an existing entry, change id (increment), fill in fields
4. **Remove:** Delete the entry
5. **Edit:** Modify any field
6. After changes, rebuild to see updates: `npm run build` or `npm run dev`

**Fields Explained:**
- `id` — Unique identifier (must be unique, used as React key)
- `role` — Job title
- `company` — Company/organization name
- `period` — Date range (e.g., "Mar 2026 - Present")
- `description` — Full description (supports JSX like About)
- `type` — Category; used to filter by tab. Options: "work", "leadership", "community", "achievement", "organization"
- `skills` — Array of skill tags
- `highlight` — Key achievement (bold text highlight)
- `color` — Primary hex color for card
- `accent` — Secondary hex color
- `geometry` — 3D shape type: "crystal", "prism", "nexus", "flow" (see source for mapping)

**Type System:** The component filters experiences by clicking tabs. If you want a new category, you'll need to:
1. Update the `ExperienceType` union type to include the new type
2. Add the tab button in the component's tab list
3. Ensure at least one experience has the new type

---

## Projects Section (Projects.tsx)

**File:** `src/components/Projects.tsx`

### Projects Array

```tsx
interface ProjectData {
  id: number;
  title: string;
  description: string;
  tags: string[];
  links: { demo: string; repo: string };
  status: string;
  featured: boolean;
  icon: any;
  color: string;
  accent: string;
  geometry: string;
}

const projects: ProjectData[] = [
  {
    id: 0,
    title: "College Central",
    description: "The Digital Backbone of IIT(ISM) Dhanbad...",
    tags: ["React", "TypeScript", "Firebase", "REST APIs", "Tailwind CSS"],
    links: {
      demo: "https://collegecentral.live/#/",
      repo: "https://github.com/PreethamNimmagadda02/College-Central",
    },
    status: "Live",
    featured: true,
    icon: GraduationCap,
    color: "#a855f7",          // purple-500
    accent: "#ec4899",         // pink-500
    geometry: "nexus"
  },
  // ... more projects
];
```

**How to Edit:**
1. Open `src/components/Projects.tsx`
2. Find `projects` array
3. **Add:** Copy an entry, increment id, fill in fields
4. **Remove:** Delete entry
5. **Edit:** Modify any field

**Fields Explained:**
- `id` — Unique identifier
- `title` — Project name
- `description` — 1-2 sentence description
- `tags` — Technology tags (e.g., "React", "Three.js")
- `links.demo` — URL to live demo
- `links.repo` — URL to GitHub repo (make both public or update accordingly)
- `status` — Display status badge (e.g., "Live", "In Progress", "Archived")
- `featured` — If `true`, appears first in carousel (highlight featured projects)
- `icon` — Lucide React icon (GraduationCap, Ticket, Zap, Bot, Code, etc.)
- `color` — Primary hex color
- `accent` — Secondary hex color
- `geometry` — 3D shape: "nexus", "flow", "crystal", "prism" (determines shape in 3D card)

---

## Skills Section (SkillsMarquee.tsx)

**File:** `src/components/SkillsMarquee.tsx`

### Skills Array

Horizontal scrolling list of technologies:

```tsx
const skills = [
  { name: "React", color: "#61dafb" },
  { name: "TypeScript", color: "#3178c6" },
  { name: "Next.js", color: "#ffffff" },
  { name: "Three.js", color: "#ffffff" },
  { name: "Framer Motion", color: "#0099ff" },
  { name: "Tailwind CSS", color: "#06b6d4" },
  { name: "Firebase", color: "#ffa724" },
  { name: "Python", color: "#3776ab" },
  { name: "LLMs & RAG", color: "#10a37f" },
  { name: "CrewAI", color: "#ff6b6b" },
  // ... more
];
```

**How to Edit:**
1. Open `src/components/SkillsMarquee.tsx`
2. Find `skills` array
3. **Add:** `{ name: "Your Skill", color: "#hexcolor" }`
4. **Remove:** Delete entry
5. **Edit:** Change `name` or `color`

**Colors:** Hex color strings. Use colors that match the skill's branding:
- React: `#61dafb`
- Python: `#3776ab`
- JavaScript: `#f7df1e`
- Or use Tailwind hex values for consistency

---

## Achievements Section (Achievements3D.tsx)

**File:** `src/components/Achievements3D.tsx`

### Stat Cards

```tsx
const stats = [
  { 
    value: "1864", 
    label: "CodeChef Rating", 
    color: "text-yellow-400", 
    icon: Trophy 
  },
  { 
    value: "Top 1%", 
    label: "Global Ranking", 
    color: "text-orange-400", 
    icon: Star 
  },
  // ... more stats
];
```

**How to Edit:**
1. Open `src/components/Achievements3D.tsx`
2. Find `stats` array
3. Change `value` (the big number), `label` (description), `color` (Tailwind), `icon` (Lucide)

### Badges

```tsx
const badges = [
  { 
    title: "CodeChef Elite", 
    subtitle: "Top 1%", 
    color: "#c084fc" 
  },
  // ... more badges
];
```

**How to Edit:**
1. Find `badges` array
2. Change `title`, `subtitle`, `color`

---

## Testimonials Section (Testimonials.tsx)

**File:** `src/components/Testimonials.tsx`

### Testimonials Array

```tsx
const testimonials = [
  {
    id: 0,
    name: "Founder Name",
    title: "CEO, Company",
    quote: "Preetham is an exceptional engineer...",
    image: "https://example.com/avatar.jpg",
    company: "Company",
    gradient: "from-purple-500 to-blue-500"
  },
  // ... more testimonials
];
```

**How to Edit:**
1. Open `src/components/Testimonials.tsx`
2. Find `testimonials` array
3. **Add:** Create new object with above fields
4. **Edit:** Change `name`, `title`, `quote`, `image`, `company`, `gradient`
5. **Image:** Use a URL to an image (typically a headshot). Ensure the URL is public and CORS-accessible.

**Gradient:** Tailwind gradient string (e.g., "from-purple-500 to-pink-500")

---

## Common Changes Workflow

### 1. Update a Single Field

**Example:** Change your CV link in Hero

```bash
# Open the file
nano src/components/Hero.tsx
# Find and update the link
# Save: Ctrl+O, Enter, Ctrl+X

# Test locally
npm run dev
# Visit http://localhost:3001

# Commit and push
git add src/components/Hero.tsx
git commit -m "docs: update CV link"
git push origin main
# GitHub Actions auto-builds and deploys
```

### 2. Add a New Project

```bash
nano src/components/Projects.tsx
# Find projects array
# Copy last entry
# Paste, increment id, fill in your fields
# Save

npm run dev
# Verify it appears in the Projects section

git add src/components/Projects.tsx
git commit -m "feat: add new project"
git push origin main
```

### 3. Update Experience

```bash
nano src/components/Experience.tsx
# Find experiences array
# Add, edit, or remove entries
# Save

npm run dev
# Click tabs to filter by type

git add src/components/Experience.tsx
git commit -m "docs: update experience"
git push origin main
```

### 4. Add a New Skill

```bash
nano src/components/SkillsMarquee.tsx
# Find skills array
# Add { name: "Your Skill", color: "#yourcolor" }
# Save

npm run dev
# Scroll to Skills section to verify

git add src/components/SkillsMarquee.tsx
git commit -m "docs: add skill"
git push origin main
```

---

## Data Types Reference

### Color Format

All colors are hex strings:
- `"#a855f7"` — Purple 500 (from Tailwind)
- `"#ef4444"` — Red 500
- `"#0ea5e9"` — Sky 500

**Find hex values:** Use Tailwind color picker or online hex converter.

### Lucide Icons

Available icons (used throughout):
```tsx
Code, Rocket, Globe, BookOpen, Sparkles, Users, Zap, Target,
GraduationCap, Ticket, TrendingUp, Bot, ExternalLink, Github,
Trophy, Star, Award, Briefcase, Calendar, ChevronLeft, ChevronRight,
// ... 60+ more in @lucide/react
```

To use a new icon:
1. Import at top: `import { YourIcon } from "lucide-react";`
2. Use in data: `icon: YourIcon`

---

## GitHub Stats (Live Data)

**File:** `src/components/GitHubStats.tsx`

This component fetches live data from GitHub API (no hardcoding needed):
- Contributions heatmap
- Stats (total repos, followers, etc.)
- Latest repository

**API:** Uses GitHub GraphQL API with public token (no secrets exposed).

**To Update:**
- Change GitHub username in the GraphQL query
- Or update the component's API call logic

---

## Notes on Content Updates

### After Editing Content

Always test locally before pushing:
```bash
npm run dev
# Open http://localhost:3001
# Manually verify your changes
```

### Git Workflow

```bash
# 1. Edit content
nano src/components/SomeSection.tsx

# 2. Test locally
npm run dev

# 3. Build production version
npm run build

# 4. Commit with clear message
git add src/components/SomeSection.tsx
git commit -m "docs: update [section] content"
git push origin main

# 5. Wait for GitHub Actions to deploy (1-2 min)
# Check https://preethamnimmagaddaportfolio.web.app
```

### Common Mistakes

1. **Mismatched IDs:** Ensure each entry has a unique `id`. React uses this as the key.
2. **Invalid URLs:** Double-check demo/repo links. They should be publicly accessible.
3. **Missing Icons:** If you use a Lucide icon not imported, the component will error. Add import at top.
4. **Typos in Type:** If `type` doesn't match the union (e.g., "internship" vs "work"), the filter tab won't work.
5. **Hardcoded Tailwind Colors:** Use hex instead for consistency. Tailwind utilities are for component rendering, not data.

---

## See Also

- [Component Architecture](../components/structure.md) — How components render and use hooks
- [Architecture Overview](../architecture/overview.md) — How data flows through the app
- [Development Guide](../development.md) — Build and test commands
