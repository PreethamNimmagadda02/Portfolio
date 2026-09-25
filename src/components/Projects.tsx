"use client";

/**
 * Projects: the selected-work dossier.
 *
 * Six rows, one open at a time. Each header is a button (aria-expanded,
 * aria-controls) and each panel a region whose height is animated by the
 * foundation's .grid-accordion class (grid-template-rows 0fr to 1fr), so no
 * height is ever measured. Inside an open panel the copy fades in and the
 * live product's screenshot wipes in from the left behind a hairline frame.
 *
 * Screenshots rest in the same warm photogravure grade as the portrait, so
 * three products built in three palettes sit in this one, and lift to full
 * colour under the hand. On a desktop, a closed row with a screenshot sends a
 * small graded plate after the cursor, the way a print is slid across a
 * table for a closer look.
 */

import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowUpRight, GithubLogo, Plus, X } from "@phosphor-icons/react";
import { motion, AnimatePresence, useInView, EASE_HEAVY, EASE_SETTLE, type Variants } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSheen } from "@/hooks/use-sheen";
import { useFollowPointer } from "@/hooks/use-follow-pointer";
import { useMediaQuery } from "@/lib/viewport-store";
import { SectionHeading, TextButton } from "@/components/ui";
import { cn, pad2 } from "@/lib/utils";
import shotsJson from "@/data/project-shots.json";

/* Public paths to the committed screenshots, keyed by project slug. The map
   may be empty or partial: rows without a key render no image column. */
const shots = shotsJson as Record<string, string>;

type ProjectStatus = "Live" | "Complete";

interface ProjectData {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  links: { demo: string; repo: string };
  status: ProjectStatus;
}

const projects: ProjectData[] = [
  {
    slug: "college-central",
    title: "College Central",
    description:
      "One platform for academic records, campus navigation and event coordination at IIT (ISM) Dhanbad, used daily by the student body.",
    tags: ["React", "TypeScript", "Firebase", "REST APIs", "Tailwind CSS", "Vite", "Framer Motion"],
    links: { demo: "https://collegecentral.live/#/", repo: "https://github.com/PreethamNimmagadda02/College-Central" },
    status: "Live",
  },
  {
    slug: "careerops",
    title: "CareerOps",
    description:
      "A fully automated command center for the job search: discovering the right roles, scoring fit with AI, and managing the whole application pipeline end to end.",
    tags: ["TypeScript", "Playwright", "PostgreSQL", "Next.js", "OpenAI", "AWS"],
    links: {
      demo: "http://careerops-alb-328156002.ap-southeast-2.elb.amazonaws.com/",
      repo: "https://github.com/PreethamNimmagadda02/CareerOps",
    },
    status: "Live",
  },
  {
    slug: "festflow",
    title: "FestFlow",
    description:
      "Multi-agent AI that turns event requirements into complete logistical plans. Scheduling, budgets and vendor coordination, generated automatically.",
    tags: ["Agentic AI", "AI Agents", "React", "Firebase", "Gemini API"],
    links: { demo: "https://festflow.co.in/", repo: "https://github.com/PreethamNimmagadda02/FestFlow" },
    status: "Live",
  },
  {
    slug: "ai-trading-system",
    title: "AI Trading System",
    description:
      "A swarm of AI agents that reads market signals and executes trading strategies autonomously, in real time.",
    tags: ["Python", "CrewAI", "GPT API", "Financial Tech"],
    links: {
      demo: "https://github.com/PreethamNimmagadda02/Automated-Financial-Trading-Strategy-System",
      repo: "https://github.com/PreethamNimmagadda02/Automated-Financial-Trading-Strategy-System",
    },
    status: "Complete",
  },
  {
    slug: "agentic-vs-code",
    title: "Agentic VS Code",
    description:
      "A custom VS Code build with agentic AI at its core. Natural language becomes working code, and routine project work runs itself.",
    tags: ["Electron", "TypeScript", "Agentic AI", "LLMs"],
    links: {
      demo: "https://github.com/PreethamNimmagadda02/Agentic-VS-Code",
      repo: "https://github.com/PreethamNimmagadda02/Agentic-VS-Code",
    },
    status: "Complete",
  },
  {
    slug: "slack-ai-data-bot",
    title: "Slack AI Data Bot",
    description:
      "A Slack assistant that turns plain English into PostgreSQL insights, with auto-generated charts, one-click CSV exports and smart query caching built in.",
    tags: ["Node.js", "LangChain", "OpenAI", "PostgreSQL", "Slack API", "NLP"],
    links: {
      demo: "https://github.com/PreethamNimmagadda02/Slack-AI-Data-Bot",
      repo: "https://github.com/PreethamNimmagadda02/Slack-AI-Data-Bot",
    },
    status: "Complete",
  },
];

const DEFAULT_OPEN = "college-central";

/* Rows rise 12px once, 800ms, staggered 70ms (hierarchy). */
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_SETTLE, delay: i * 0.07 },
  }),
};

/* Panel copy fades in after the grid has begun to open (state). */
const copyVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, delay: 0.2, ease: EASE_SETTLE } },
};

/* The product is unveiled: a left-to-right wipe behind the frame
   (storytelling). Both keyframes carry the same units so every
   intermediate value is valid CSS. */
const plateVariants: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  show: { clipPath: "inset(0 0% 0 0)", transition: { duration: 0.9, delay: 0.2, ease: EASE_HEAVY } },
};

/* On close the copy is gone within the first 230ms but the node stays
   mounted for the full 650ms grid collapse, so the panel keeps its height
   while the rows above it settle. */
const EXIT_SLOW = { opacity: [1, 0, 0], transition: { duration: 0.65, times: [0, 0.35, 1], ease: "linear" as const } };
const EXIT_FAST = { opacity: 0, transition: { duration: 0.2 } };

interface ProjectRowProps {
  project: ProjectData;
  index: number;
  open: boolean;
  /** True once the list has scrolled into view; gates the panel reveal. */
  ready: boolean;
  reduced: boolean;
  onToggle: (slug: string) => void;
  /** Reports the row under the hand, for the preview plate. */
  onHover: (slug: string | null) => void;
}

function ProjectRow({ project, index, open, ready, reduced, onToggle, onHover }: ProjectRowProps) {
  const { slug, title, description, tags, links, status } = project;
  const triggerId = `project-${slug}-trigger`;
  const panelId = `project-${slug}-panel`;
  const shot = shots[slug];
  const isLive = status === "Live";

  return (
    <motion.div
      variants={rowVariants}
      custom={index}
      initial={reduced ? false : "hidden"}
      animate={ready ? "show" : "hidden"}
      data-open={open ? "true" : "false"}
      className={cn(
        "border-t border-hairline last:border-b",
        "transition-colors duration-300 ease-[var(--ease-heavy)]",
        "has-[button:hover]:border-t-hairline-strong data-[open=true]:border-t-hairline-strong"
      )}
    >
      <h3>
        <button
          type="button"
          id={triggerId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            onToggle(slug);
            onHover(null);
          }}
          onPointerEnter={() => onHover(open ? null : slug)}
          onPointerLeave={() => onHover(null)}
          data-cursor={open ? "Close" : "Open"}
          className="group w-full grid grid-cols-12 items-center h-[84px] lg:h-[112px] text-left"
        >
          {/* Hanging index. Six rows in a dossier should be numbered. */}
          <span
            aria-hidden
            className="ledger hidden lg:block lg:col-span-1 font-mono text-[11px] leading-none tracking-[0.14em] text-ivory-300 transition-colors duration-300 ease-[var(--ease-heavy)] group-hover:text-aurum-300"
          >
            {pad2(index + 1)}
          </span>

          {/* No text colour utility here: .foil paints the glyphs from a
              gradient and needs the transparent fill it sets to survive. */}
          <span
            className={cn(
              "col-span-11 sm:col-span-8 lg:col-span-5 pr-4",
              "font-display font-normal text-[26px] leading-none tracking-[-0.01em] lg:text-[clamp(2rem,3.1vw,2.75rem)]",
              "foil transition-transform duration-500 ease-[var(--ease-heavy)] group-hover:translate-x-[10px]"
            )}
          >
            {title}
          </span>

          <span
            className={cn(
              "sr-only sm:not-sr-only sm:flex sm:items-center sm:gap-2.5 sm:col-span-3 lg:col-span-2",
              "caption tabular-nums",
              isLive ? "text-aurum-300" : "text-ivory-300"
            )}
          >
            {/* A live build gets a breathing gold detent. Nothing else on the
                row moves on its own, so it is the one thing that reads as
                still running. */}
            {isLive ? <span aria-hidden className="breathe size-1.5 shrink-0 bg-aurum-300" /> : null}
            {status}
          </span>

          <span className="hidden lg:block lg:col-span-3 caption tabular-nums text-ivory-300">
            {tags[0]}
          </span>

          <span
            aria-hidden
            className="col-span-1 justify-self-end inline-flex text-ivory-200 transition-colors duration-300 group-hover:text-ivory-100"
          >
            {reduced ? (
              open ? (
                <X size={20} weight="light" />
              ) : (
                <Plus size={20} weight="light" />
              )
            ) : (
              <motion.span
                className="inline-flex"
                animate={{ rotate: open ? 45 : 0 }}
                transition={{ duration: 0.4, ease: EASE_HEAVY }}
              >
                <Plus size={20} weight="light" />
              </motion.span>
            )}
          </span>
        </button>
      </h3>

      {/* The tint bleeds to the container's padding edges while the content
          stays on the grid; the inner div is the foundation's clipped track. */}
      <div id={panelId} role="region" aria-labelledby={triggerId} className="grid-accordion -mx-6 lg:-mx-10" data-open={open ? "true" : "false"}>
        <div className="bg-obsidian-1/60" inert={!open}>
          <AnimatePresence>
            {open ? (
              <motion.div
                key="panel"
                exit={reduced ? EXIT_FAST : EXIT_SLOW}
                className="grid grid-cols-12 gap-x-6 lg:gap-x-10 gap-y-8 px-6 lg:px-10 pt-2 pb-10"
              >
                <motion.div
                  variants={copyVariants}
                  initial="hidden"
                  animate={ready ? "show" : "hidden"}
                  transition={reduced ? { duration: 0.2, delay: 0 } : undefined}
                  className={cn("col-span-12 flex flex-col items-start", shot ? "lg:col-span-6" : "lg:col-span-9")}
                >
                  <p className="font-sans text-[17px] leading-[1.6] text-ivory-200 max-w-[52ch]">{description}</p>

                  {/* Small caps and a wide gutter carry the separation here.
                      A hairline between items does not survive the wrap: the
                      stack runs to two lines at this column width, and a
                      divider drawn before each entry leaves the second line
                      starting with a rule and no tag in front of it. */}
                  <ul
                    className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2.5 caption tabular-nums text-ivory-300"
                    aria-label="Stack"
                  >
                    {tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                    {isLive ? (
                      <TextButton
                        variant="secondary"
                        href={links.demo}
                        className="rule-hover text-aurum-300 hover:text-aurum-200"
                        icon={<ArrowUpRight size={14} weight="light" />}
                      >
                        Open live site
                      </TextButton>
                    ) : null}
                    <TextButton
                      variant="secondary"
                      href={links.repo}
                      className="rule-hover text-aurum-300 hover:text-aurum-200"
                      icon={<GithubLogo size={14} weight="light" />}
                    >
                      View source
                    </TextButton>
                  </div>
                </motion.div>

                {shot ? (
                  <div className="col-span-12 lg:col-span-6">
                    {reduced ? (
                      <ScreenshotPlate src={shot} title={title} href={isLive ? links.demo : undefined} />
                    ) : (
                      <motion.div variants={plateVariants} initial="hidden" animate={ready ? "show" : "hidden"}>
                        <ScreenshotPlate src={shot} title={title} href={isLive ? links.demo : undefined} />
                      </motion.div>
                    )}
                  </div>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * A product screenshot as a framed plate. It rests in the photogravure grade
 * and lifts to colour under the hand (or keyboard focus) by raising a colour
 * layer's opacity, so the filter is painted once and never animated. For a
 * live product the whole plate is the way in.
 */
function ScreenshotPlate({ src, title, href }: { src: string; title: string; href?: string }) {
  const sheen = useSheen();
  const frame = (
    <>
      <div className="absolute inset-0 transition-transform duration-[1400ms] ease-settle group-hover:scale-[1.035]">
        <Image
          src={src}
          alt={`Screenshot of ${title}`}
          width={1600}
          height={1000}
          loading="lazy"
          decoding="async"
          className="plate-mono block h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-[900ms] ease-heavy group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <Image
            src={src}
            alt=""
            width={1600}
            height={1000}
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Bottom scrim, so a bright screenshot does not run straight into the
          panel tint beneath it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--color-obsidian-0) 55%, transparent))",
        }}
      />

      {href ? (
        <span
          aria-hidden
          className="absolute bottom-6 left-6 z-[2] inline-flex translate-y-1 items-center gap-2 caption text-ivory-100 opacity-0 transition-[opacity,translate] duration-500 ease-heavy group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        >
          Visit the live site
          <ArrowUpRight size={12} weight="light" />
        </span>
      ) : null}

      {/* The same double bezel PortraitPlate carries: outer frame at the edge,
          inner frame inset 12px. One frame grammar for every plate. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 border border-hairline" />
      <span aria-hidden className="pointer-events-none absolute inset-3 border border-hairline" />
    </>
  );

  const classes = "group sheen relative block aspect-[16/10] overflow-hidden";

  if (href) {
    return (
      <a
        {...sheen}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${title}, opens the live site`}
        data-cursor="Visit"
        className={classes}
      >
        {frame}
      </a>
    );
  }

  return (
    <div {...sheen} className={classes}>
      {frame}
    </div>
  );
}

/**
 * The preview plate that follows the cursor over a closed row. Every plate
 * is mounted once and cross-fades by opacity, so moving from one row to the
 * next dissolves the prints rather than swapping them. The plate leans a few
 * degrees into its travel and straightens as it catches up.
 *
 * Portalled to the body: the section sits inside a content-visibility
 * wrapper, and containment makes that wrapper the containing block for fixed
 * descendants, which would measure the plate from the section instead of the
 * viewport. It only ever renders on the client (enabled is false on the
 * server and through hydration), so the portal target always exists.
 */
function HoverPreview({ slug, enabled, preload }: { slug: string | null; enabled: boolean; preload: boolean }) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const write = useCallback((x: number, y: number, dx: number) => {
    const el = nodeRef.current;
    if (!el) return;
    const lean = Math.max(-7, Math.min(7, dx * 0.12));
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${lean.toFixed(2)}deg)`;
  }, []);

  useFollowPointer({ lerp: 0.14, enabled, write });

  /* The plate sits in the viewport's corner, so the browser treats its prints
     as visible and lazy loading never defers them. They are mounted once the
     list scrolls into view (or on a first hover, whichever comes first), so
     about 430 KB of screenshots never compete with the cover. */
  const [primed, setPrimed] = useState(false);
  if ((slug || preload) && !primed) setPrimed(true);

  if (!enabled) return null;
  const entries = Object.entries(shots);

  return createPortal(
    <div ref={nodeRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-40 origin-top-left will-change-transform">
      <div
        className={cn(
          "relative -translate-x-1/2 -translate-y-1/2 transition-[opacity,scale] duration-500 ease-heavy",
          slug ? "scale-100 opacity-100" : "scale-[0.86] opacity-0"
        )}
      >
        <div className="relative aspect-[16/10] w-[21rem] overflow-hidden bg-obsidian-1">
          {primed && entries.map(([key, src]) => (
            <Image
              key={key}
              src={src}
              alt=""
              width={672}
              height={420}
              loading="lazy"
              decoding="async"
              className={cn(
                "plate-mono absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-heavy",
                key === slug ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
          <span className="pointer-events-none absolute inset-0 border border-hairline-strong" />
          <span className="pointer-events-none absolute inset-2 border border-hairline" />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Projects() {
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const inView = useInView(listRef, { once: true, amount: 0.1 });
  const [openSlug, setOpenSlug] = useState<string | null>(DEFAULT_OPEN);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 1024px)", false);
  const previewEnabled = finePointer && !reduced;

  const toggle = (slug: string) => setOpenSlug((current) => (current === slug ? null : slug));
  // Only rows that have a print to show send the plate out.
  const hover = useCallback((slug: string | null) => setHoverSlug(slug && shots[slug] ? slug : null), []);

  return (
    <section id="projects" aria-labelledby="projects-heading" className="relative w-full py-32 lg:py-40">
      <HoverPreview slug={hoverSlug} enabled={previewEnabled} preload={inView} />
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-x-6 lg:gap-x-10">
          <div className="col-span-12 lg:col-span-8">
            <SectionHeading
              id="projects-heading"
              chapter="projects"
              eyebrow="SOURCE LINKED FOR EVERY BUILD"
              title="Selected work."
              subtext="Six builds, three of them live."
            />
          </div>

          <div ref={listRef} className="col-span-12 mt-16 lg:mt-20">
            {projects.map((project, i) => (
              <ProjectRow
                key={project.slug}
                project={project}
                index={i}
                open={openSlug === project.slug}
                ready={inView}
                reduced={reduced}
                onToggle={toggle}
                onHover={hover}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
