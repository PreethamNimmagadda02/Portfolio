# Skill ↔ Project/Experience Connections — Design

**Date:** 2026-07-22
**Status:** Approved (design) — pending spec review

## Goal

Make the portfolio behave like LinkedIn: every project and experience is
connected to the concrete skills in the **Technical Ecosystem** section, and the
relationship is navigable in **both directions**. Focusing a skill anywhere on
the page (ecosystem tag, project tag, experience chip) highlights every place
that skill was used, across all three far-apart sections, with a floating
navigator to jump between the matches.

## Decisions (from brainstorming)

1. **Interaction:** bidirectional highlight — a focused skill highlights every
   matching token across ecosystem + projects + experiences.
2. **Data reconciliation:** explicit canonical skill IDs on every project *and*
   experience (not fuzzy runtime matching); experiences are expanded with the
   concrete tools they used so they participate fully.
3. **Cross-section surfacing:** a floating navigator pill (skill name, usage
   count, prev/next jump, clear).
4. **Experience cards:** keep the conceptual pills *and* add a compact
   "Built with" concrete-tool chip row (the linkable tokens).
5. **Focus trigger:** click to focus (touch-friendly, no pill jitter); hover is
   a subtle local glow only.
6. **Mappings:** proposed here by inference; user corrects during spec review.

## Architecture

### Data layer

- **Extract inline data to `src/lib/`** mirroring `skills-data.ts`:
  - `src/lib/projects-data.ts` — the `ProjectData[]` currently inline in
    `Projects.tsx`. Lucide icon components are imported directly into this data
    module (it's a plain `.ts` module, so `import { GraduationCap } from
    "lucide-react"` works), keeping the `icon: LucideIcon` field intact.
  - `src/lib/experience-data.ts` — the `ExperienceData[]` from `Experience.tsx`.
  This de-clutters two churn hotspots and gives the reverse index something to
  import without circular deps.
- **Add `ecosystemSkills: string[]`** to every project and experience entry,
  holding *canonical* names exactly as they appear in `skills-data.ts`. This is
  the link source; the existing `tags` / `skills` stay as human-facing display.
- **`src/lib/skill-connections.ts`:**
  - An **alias map** resolving display tags to canonical names
    (`"React" → "React.js"`, `"OpenAI" → "OpenAI API"`, `"GPT API" → "OpenAI API"`,
    `"TypeScript" → "Typescript"`). Tags with no canonical match (e.g. `"REST APIs"`,
    `"Agentic AI"`, `"NLP"`, `"Electron"`, `"Gemini API"`, `"Slack API"`) resolve
    to `null` and render as plain, non-interactive tags.
  - `resolveCanonical(tag): string | null`.
  - A reverse index built once: `canonical → SkillUsage[]` where
    `SkillUsage = { kind: "project" | "experience" | "ecosystem", id, title, domId }`,
    ordered by on-page position (experiences, then skills, then projects — matching
    section order in `page.tsx`).
  - `getSkillUsages(canonical): SkillUsage[]`.

### Focused-skill store (extend `scene-store.ts`)

Parallel to the existing category store, same `useSyncExternalStore` pattern:

```ts
let focusedSkill: string | null = null;         // canonical name
export function setFocusedSkill(name: string | null) { ... notify ... }
export function toggleFocusedSkill(name: string) { ... }   // click same tag clears
export function useFocusedSkill(): string | null { ... }
```

Focusing a skill also drives the constellation: derive the skill's category and
reuse the existing category-highlight path so the 3D background emphasizes it.
This is additive and must not fight the manual category chips (focus takes
precedence while set; clearing focus restores chip state).

### Shared token component

`src/components/SkillToken.tsx` — one component used by all three sections so
highlight/dim/click behavior is defined once:

- Props: `canonical: string | null`, `label`, plus per-section style (color).
- Renders `data-skill={canonical}` when linkable; plain span when `canonical`
  is `null`.
- Reads `useFocusedSkill()`: if a skill is focused, matching tokens glow
  (existing `emphasized` styling), non-matching dim (reduced opacity). No focus →
  normal.
- `onClick` → `toggleFocusedSkill(canonical)`. Hover → local scale/glow only.
- Keyboard accessible (button role, Enter/Space) and `aria-pressed`.

Existing `SkillTag` in `Skills.tsx`, the project tag `<span>`s, and the
experience skill `<span>`s are refactored onto this component (display styling
preserved per section).

### Experience "Built with" row

Below the conceptual pill row, render a second compact chip row from
`ecosystemSkills` (linkable `SkillToken`s), labeled "Built with" / "Stack".
Hidden entirely when `ecosystemSkills` is empty (non-technical roles).

### Floating navigator pill

`src/components/SkillNavigator.tsx`, rendered once in `layout.tsx` (fixed,
bottom-center, above content). Visible only when `focusedSkill` is set:

- Category-colored dot + canonical name + "used in N places".
- Prev / next arrows: cycle through `getSkillUsages(focusedSkill)`, smooth-scroll
  to each match's `domId` (via the existing Lenis instance, falling back to
  `scrollIntoView`) and briefly pulse the target card.
- Clear (×) → `setFocusedSkill(null)`.
- `Esc` also clears; respects reduced-motion for the scroll/pulse.

Each project row and experience card gets a stable `id` (`domId`) so the
navigator can target it.

## Data flow

1. User clicks a `SkillToken` → `toggleFocusedSkill(canonical)` updates the store.
2. Store notifies: all `SkillToken`s re-render (glow/dim), the constellation
   highlights the category, and `SkillNavigator` appears with usages.
3. Prev/next scrolls to and pulses each usage's card.
4. Clicking the focused token again, ×, or Esc clears the store → everything
   returns to normal.

## Proposed mappings (REVIEW THESE)

Canonical names are from `skills-data.ts`. Correct freely.

### Projects
| Project | ecosystemSkills |
|---|---|
| College Central | React.js, Typescript, Firebase, Tailwind CSS, Vite, Framer Motion |
| CareerOps | Typescript, Playwright, PostgreSQL, Next.js, OpenAI API, AWS EC2 |
| FestFlow | React.js, Firebase |
| AI Trading System | Python, CrewAI, OpenAI API |
| Agentic VS Code | Typescript |
| Slack AI Data Bot | Node.js, LangChain, OpenAI API, PostgreSQL |

Non-canonical display tags left as plain text: REST APIs, Agentic AI, AI Agents,
Gemini API, Electron, LLMs, GPT API (aliased to OpenAI API), Financial Tech,
Slack API, NLP.

### Experiences (concrete "Built with" — inferred, please verify)
| Experience | ecosystemSkills |
|---|---|
| Matters.AI — ML Intern | Python, LangGraph, AWS Lambda, Qdrant, OpenAI API |
| Introspect Labs — Gen AI | Python, VideoRAG, Whisper, LangChain, Qdrant |
| Perplexity — Campus Ambassador | *(none — non-technical)* |
| METAVERTEX — SWE Intern | Python, LangChain, React.js |
| Hostel Prefect | *(none — non-technical)* |
| Student Senator | *(none — non-technical)* |

## Error handling / edge cases

- `ecosystemSkills` name not found in `skills-data.ts` → dev-time `console.warn`
  (guarded to non-production), token still renders but won't match.
- Skill focused that has only one usage → navigator hides prev/next arrows.
- Empty `ecosystemSkills` → no "Built with" row, no warning.
- Reduced-motion → no pulse, instant scroll.
- Focus state is ephemeral (not persisted / not in URL) for v1.

## Testing

No test framework is configured. Verification is manual + `npm run build` +
`npm run lint`:
- Click a skill in the ecosystem → matching project/experience tokens glow,
  others dim, navigator shows correct count, prev/next scrolls to each.
- Click a project tag → ecosystem + other sections highlight the same skill.
- Non-canonical tag → plain, not clickable.
- Non-technical experience → no "Built with" row.
- Clear via ×, Esc, and re-click all reset state.
- Build and lint pass.

## Out of scope (YAGNI)

- URL/deep-link state for a focused skill.
- Proficiency levels or endorsements.
- Multi-skill (AND/OR) focus.
- Changing the existing category-chip filter behavior.

## Files

**New:** `src/lib/projects-data.ts`, `src/lib/experience-data.ts`,
`src/lib/skill-connections.ts`, `src/components/SkillToken.tsx`,
`src/components/SkillNavigator.tsx`.

**Edited:** `src/lib/scene-store.ts`, `src/components/Skills.tsx`,
`src/components/Projects.tsx`, `src/components/Experience.tsx`,
`src/app/layout.tsx`, and the constellation component
(`src/components/scene/CosmicScene.tsx`) for the focus→category highlight.
