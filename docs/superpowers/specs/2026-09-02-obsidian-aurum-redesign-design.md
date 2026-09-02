# Obsidian & Aurum: Portfolio Redesign Design Spec

**Date:** 2026-09-02
**Branch:** `redesign/obsidian-aurum`
**Status:** Approved for implementation (autonomous run; owner review on the branch)
**Companion:** `2026-09-02-obsidian-aurum-art-direction.json` holds the full art direction that a three-director panel produced and two judges scored. This document is the binding summary; where the JSON is more specific, the JSON wins.

## 1. Motivation

The current site is a competent "cosmic" developer portfolio: six accent hues, glass cards, glows, a role typewriter, a stats row in the hero, pill badges, a marquee wall of testimonials and a purple WebGL nebula behind everything. That recipe now reads as a template. The owner wants the site to read as a million-dollar identity that positions him as a leader in autonomous AI, with state-of-the-art motion and micro-interactions, using the existing facts.

An earlier attempt (branch `worktree-portfolio-redesign`, Fraunces plus amber) re-skinned the same components and was not merged. This redesign recomposes every section instead.

## 2. Design read

Redesign, overhaul mode. Personal portfolio for founders, research leads, hiring committees and senior engineers judging an aspiring AI leader. Visual language: private-bank editorial in obsidian and gold. Dials: variance 8, motion 7, density 3. Aesthetic family: editorial luxury, no design-system package; built with Tailwind v4 utilities, Framer Motion and one React Three Fiber canvas.

Winning direction (43/50 from both judges): **Private Bank Editorial**. Its thesis: every number on this page is real, so the design's job is to make the record feel verified, not decorated. Grafts from the other two directions: velocity heat in the nebula, the loader-to-headline match cut, grid-row accordion animation, the Industry and Campus grouping in Experience, the testimonial dwell line, the heatmap today ring, the build-time copy check, plain-language error copy.

## 3. Scope

In scope: every visual, typographic, layout, motion and copy decision on the single page; the WebGL scene's palette and prominence; icon library; loader; metadata copy; OG image and PWA icons; project screenshots.

Out of scope: section lineup and ids (unchanged for SEO), stack changes, hosting, PWA plumbing, data fetching logic, EmailJS logic, any factual content change.

## 4. Preserved without exception

- Section ids: `home`, `about`, `experience`, `skills-sphere`, `projects`, `github-stats`, `achievements`, `testimonials`, `contact`. Nav labels: Home, About, Experiences, Skills, Projects, Activity, Achievements, Testimonials.
- GitHub and Codolio live fetching, caching, fallbacks and the baked lines-written figure (`src/data/github-loc.json`, `scripts/fetch-loc.mjs`).
- Skills filter state (`toggleSkillCategory`, `useActiveSkillCategories`) and its link to the WebGL constellation.
- EmailJS submission, env var names, validation rules and messages.
- One persistent `CosmicScene` canvas, `useIdle` deferral, `markSceneWarmed`, adaptive quality, hidden-tab pause, reduced-motion static fallback.
- Lenis smooth scroll, `smoothScrollTo`, static export, next-pwa, Firebase hosting, CI.
- The hidden "PN" Konami easter egg (restyled, kept).

## 5. Design system

### 5.1 Typography

| Role | Face | Loading | Rules |
|---|---|---|---|
| Display | Bodoni Moda | `next/font/google` `Bodoni_Moda`, `axes: ["opsz"]`, styles normal and italic, variable weight | Only at 22px and above. Weight 400 for h1, h2 and display numerals; 500 for h3-size titles. Italic for exactly one word on the page ("acts") and the testimonial pull quote. `font-optical-sizing: auto`. |
| Body | Geist | `next/font/google` `Geist` | 400 and 500 only. 16px/1.65 desktop, 15px/1.6 mobile. About prose 18px/1.7 on a 62ch measure. |
| Mono | Geist Mono | `next/font/google` `Geist_Mono` | Every numeral caption, period, tag, count and the three eyebrows. `font-variant-numeric: tabular-nums lining-nums`. |

Scale: h1 `clamp(3.5rem, 6.2vw, 5.25rem)` leading 1.04 (mobile 2.5rem); h2 3rem (mobile 2.125rem); h3 1.75rem (mobile 1.375rem); display numerals 3rem to 7.5rem, leading 0.95. Eyebrows: Geist Mono 11px uppercase tracking 0.18em ivory-200. Nav links: Geist 13px. Every clip mask around display type carries a 0.5rem bottom reserve so descenders never clip.

Why Bodoni Moda: engraving DNA (banknotes, certificates, mastheads), the only permitted serif with an optical-size axis, and not an AI-default pick. Fraunces, Instrument Serif and Playfair Display are banned.

### 5.2 Color

Single committed dark theme. The `deep-space` / `nebula` toggle, `ThemeProvider`, `ThemeToggle` and `data-theme` are removed.

| Token | Hex | Use |
|---|---|---|
| obsidian-0 | #0C0A08 | Page ground, html background, loader, mobile menu, scene colorC |
| obsidian-1 | #14110D | Scrolled navbar fill at 92% alpha, open accordion tint at 60%, input fill on focus |
| obsidian-2 | #1C1813 | Toast, heatmap level 0, skeleton rows |
| ivory-100 | #F2ECE0 | Headlines, display numerals, primary text, active nav link |
| ivory-200 | #B8AE9C | Body, subtext, inactive nav links, eyebrows |
| ivory-300 | #857D70 | Metadata at 12px and above only, never body |
| aurum-100 | #EBD9A8 | Nebula highlight, focus ring, heatmap level 4 |
| aurum-200 | #D9BE7C | Hover state of every gold element, heatmap level 3, form error text |
| aurum-300 | #C9A961 | The accent: CTA border and text, active nav hairline, drawn rules, live indicator, scene colorA, heatmap level 2, selection at 30% alpha |
| aurum-400 | #A8874A | Pressed state, heatmap level 1 |
| aurum-500 | #7A6134 | Scene colorB, the umber body of the cloud. Never brighter. |
| hairline | rgba(242,236,224,0.10) | Every structural rule |
| hairline-strong | rgba(242,236,224,0.18) | Hover rows, open accordion header, index column rules |
| hairline-gold | rgba(201,169,97,0.45) | Rule drawn under every headline, input underline on focus |

Tokens live once in `globals.css` `@theme inline` as hex values (the current HSL triples without `hsl()` are invalid CSS and are replaced). Tailwind utilities derive from them (`bg-obsidian-0`, `text-ivory-200`, `border-hairline`, `bg-aurum-300`). No component may introduce another hue. No red, green, purple, blue or cyan anywhere. Form errors use aurum-200 plus a Warning icon plus `aria-invalid`.

### 5.3 Shape, space, grid

- Radius: all sharp. Every container, image, input, button, toast, cell and overlay is `border-radius: 0`. The one exception is the 6px live-availability dot in Contact. A grep for `rounded-` in `src/components` must return only that one `rounded-full`.
- Grid: 12 columns inside `max-w-[1280px] px-6 lg:px-10`. Sections `py-32 lg:py-40` (Skills `py-28 lg:py-36`, Contact `py-32 lg:py-44`).
- Depth is expressed with hairlines and two-frame "double bezels" (outer frame at inset 0, inner at inset 12px), never with shadows, glows or blur. `backdrop-filter` is permitted only on the fixed navbar.
- Grain: the existing fixed `NoiseBackground` stays at about 4% opacity as paper texture.

### 5.4 Motion system

Easing tokens in `globals.css` and `src/lib/motion.ts`: `--ease-heavy: cubic-bezier(0.7, 0, 0.2, 1)` (masks, rules, panels), `--ease-settle: cubic-bezier(0.16, 1, 0.3, 1)` (fades, rises). Durations are long and deliberate: 700ms to 1400ms for reveals, 250ms to 450ms for feedback. Only `transform`, `opacity` and `clip-path` animate. No `window.addEventListener("scroll")` outside `viewport-store.ts`; use Framer `useScroll`, `useInView`, IntersectionObserver or CSS. Every animation has a stated reason (hierarchy, storytelling, feedback or state) and a reduced-motion fallback; `MotionConfig reducedMotion="user"` and the global CSS kill switch stay.

Signature moments (full sketches in the JSON):

1. **Plate lift**: every headline rises out of a clip mask while a 1px hairline-gold rule draws beneath it. Shared `SectionHeading` component.
2. **Golden nebula handover with velocity heat**: the scene is full intensity in the hero and contact chapters only, a faint gold star chart in Skills, and dark elsewhere. In the two live chapters scroll velocity warms colorB toward colorA.
3. **Ledger roll-in**: numerals slide up once out of per-character masks, staggered 40ms, tabular so nothing shifts. Shared `LedgerNumber` component replaces every count-up.
4. **Sticky year dossier**: Experience's left column swaps year, company and role as entries pass.
5. **Dossier open**: Projects accordion animates `grid-template-rows` 0fr to 1fr; the screenshot wipes in with `clip-path`.
6. **Match cut**: the loader's gold progress line stretches to full width, the panel wipes up, and the line contracts into the hero headline's rule.
7. **Portrait grade lift**: the headshot rests as a warm monochrome photogravure and returns to colour on hover or focus via a stacked colour layer's opacity.

Retired motion: role typewriter, count-ups, marquee rows, tilt cards, spotlight cursor, magnetic buttons, pulsing glows, particles, comet dividers, orbiting rings, footer watermark parallax, nav tilt.

### 5.5 Icons

`@phosphor-icons/react` at `weight="light"`, one family for the whole site. `lucide-react` is removed from `package.json` and the webpack cache group in `next.config.ts` points at Phosphor instead. No hand-drawn SVG icons.

## 6. Page structure

Shared chrome: `PageLoader` (obsidian panel, name wipe, gold progress line, MIN_SHOWN 1400ms, MAX_WAIT 5000ms), `ScrollProgress` (1px aurum-300 hairline at the very top), `Navbar` (64px letterhead bar, transparent over the hero, obsidian-1 at 92% with blur and a hairline once scrolled, active-link hairline via `layoutId`, "Get in touch" text link, full-screen mobile overlay with masked link rise), `Footer` (colophon: name, one-line description, six links, three social text links, copyright and back to top). No section dividers; whitespace and each headline's drawn rule separate sections.

Per-section direction (composition, copy, interaction and motion are fully specified in the JSON `sections[]`; this table is the summary):

| Section | Layout family | Headline | Eyebrow |
|---|---|---|---|
| home | Editorial split, text 7 cols, portrait plate 5 cols | AI that *acts*, not just answers. | AI ENGINEER, IIT (ISM) DHANBAD |
| about | Manifesto column with hanging figures | Engineering intelligence from first principles. | none |
| experience | Sticky year dossier, grouped Industry and Campus | Six roles since 2024. | none |
| skills-sphere | Filter rail plus typographic index in CSS columns | The working toolset. | none |
| projects | Single-open accordion dossier with screenshot plate | Selected work. | none |
| github-stats | Data plate: figure row, gold heatmap, distribution bar | Twelve months of commits, live. | LIVE FROM GITHUB AND CODOLIO |
| achievements | Asymmetric display-numeral quartet, ruled like a ledger | Competitive record. | none |
| testimonials | One pull quote at a time over a name strip, dwell line | In their words. | none |
| contact | Centred 640px letter column, ledger-line inputs | Get in touch. | AVAILABLE FOR INTERNSHIPS AND FULL-TIME ROLES |

Exactly four layout families never repeat, exactly three eyebrows, zero marquees, one live indicator.

Hero stack: eyebrow, two-line headline, 17-word subtext, primary CTA "View selected work" (bordered, fills gold on hover, trailing ArrowDownRight) and secondary text link "Get in touch". Nothing else. The hero fits the first viewport at 1440x900, 390x844 and 390x667.

## 7. Copy and branding

Voice: sentence case, short declaratives, concrete verbs, first person only in About and Contact, no superlative the record does not already state. Banned words: elevate, seamless, unleash, next-gen, revolutionize, delve, tapestry, empower, passionate, cutting-edge. Zero em dashes or en dashes anywhere in `src`, including comments, alt text and aria labels; date ranges use "to". One label per intent: "Get in touch" (contact), "View selected work" (portfolio), "Send message" (submit).

Facts are unchanged. Third-party quotes change only where a dash is replaced. Exact rewrites for every headline, subtext, description and label are in the JSON (`sections[]`, `copy_voice`).

Metadata: title "Preetham Nimmagadda | AI engineer, autonomous systems", description and Open Graph copy rewritten in the same voice, JSON-LD `jobTitle` "AI Engineer", manifest `theme_color` #C9A961 and `background_color` #0C0A08. New OG image (1200x630) and PWA icons rendered in the new identity if the tooling is available in the run; otherwise the existing files stay and this is listed as follow-up.

## 8. Retired features and where their figures live

Retired: theme toggle, role typewriter, hero stats row, hero badges, scroll cue, AvatarFlipCard and its ID card (replaced by PortraitPlate), About stat cards and pillar cards, Skills chips and stats bar, Experience rail and nodes, Projects zebra rows, GitHub gradient cards and linguist colours, Achievements icon cards and stat flare, Testimonials marquee, cards, stars, tags and orbs, Contact cards, completion bar and conic border, footer clock and watermark, section kickers and dividers, nav particles, tilt and spotlight, magnetic buttons.

Figures relocated: 95% and 100+ hours and 40% (About paragraph one), 0.8% and 0.07% (About paragraph two and Achievements), 20% (About paragraph three and Experience), 1,500+ and 1,800+ (About paragraph four and Experience), 1450 and 1,000+ (Achievements), 20+ leads (Experience highlight), 10,000+ hours of coding and 1,000+ problems and 5+ products (hero stats) are dropped from the hero; problems solved survives in Achievements, the other two have no home and are removed.

## 9. Shared components introduced

- `src/components/ui/SectionHeading.tsx`: optional eyebrow, h2 in a clip mask, drawn rule, optional subtext, alignment props.
- `src/components/ui/LedgerNumber.tsx`: per-character masked roll-in with `aria-label`, keyed on the resolved value.
- `src/components/ui/TextButton.tsx`: bordered primary CTA and underlined secondary link, shared by Hero, Contact and Projects.
- `src/components/PortraitPlate.tsx`: two-layer photogravure portrait with double hairline frame.
- `scripts/check-copy.mjs`: fails the build on U+2014, U+2013 or a banned word anywhere under `src`. Wired into `prebuild`.

## 10. Mechanical checks (must pass before the work is called done)

1. `npm run lint` reports zero errors.
2. `npx tsc --noEmit` passes.
3. `npm run build` succeeds (static export).
4. `node scripts/check-copy.mjs` passes.
5. `grep -rn "lucide-react" src` returns nothing; `lucide-react` is absent from `package.json`.
6. Exactly three eyebrows render. They are styled by the single `.eyebrow` class in `globals.css` rather than by repeated utilities, so the check is `grep -rnE 'eyebrow=|className="eyebrow' src/components` returning three call sites (Hero, GitHubStats, Contact) and `grep -rn "uppercase tracking" src/components` returning nothing.
7. `grep -rn "rounded-" src/components` returns exactly one match (the Contact indicator).
8. `grep -rn 'addEventListener("scroll"' src` matches only `viewport-store.ts`.
9. Hero fits 1440x900, 390x844 and 390x667 with both CTAs visible.
10. Nav renders on one line at 1024px.
11. Reduced-motion emulation: no canvas, no auto-advance, opacity-only reveals, all content present.

## 11. Rollout

Foundation first (tokens, fonts, globals, layout, motion tokens, shared components, scene recolour, page composition), then every section in parallel against the foundation, then integration (dead file removal, dependency cleanup, lint, types, build, mechanical checks), then a four-lens review (design pre-flight, motion standards, accessibility and performance, copy and facts) with fixes, then visual verification by screenshot. Nothing is committed automatically; the branch working tree is the deliverable for owner review.

## 12. Risks and owner decisions

- Bodoni hairlines on low-DPI Windows: never below 22px; verify `opsz` is applied.
- Gold nebula turning orange: colorB stays #7A6134; halve additive opacities; check on OLED and a mid-range laptop.
- Project screenshots depend on the three live sites being reachable at capture time; Complete projects get no image and no mock-up.
- Gold error text breaks the red convention; owner may approve one documented brick tone later.
- MIN_SHOWN drops from 2200ms to 1400ms; one constant to revert.
- One quote at a time shows fewer testimonials per screen than the wall; the name strip and 8s advance mitigate this.
- Retired features listed in section 8 are the owner's to veto; each is one component to restore from `main`.
