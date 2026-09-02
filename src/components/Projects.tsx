"use client";

/**
 * Projects: the selected-work dossier.
 *
 * Six rows, one open at a time. Each header is a button (aria-expanded,
 * aria-controls) and each panel a region whose height is animated by the
 * foundation's .grid-accordion class (grid-template-rows 0fr to 1fr), so no
 * height is ever measured. Inside an open panel the copy fades in and the
 * live product's screenshot wipes in from the left behind a hairline frame.
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, GithubLogo, Plus, X } from "@phosphor-icons/react";
import { motion, AnimatePresence, useInView, EASE_HEAVY, EASE_SETTLE, type Variants } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSheen } from "@/hooks/use-sheen";
import { SectionHeading, TextButton } from "@/components/ui";
import { cn } from "@/lib/utils";
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
}

function ProjectRow({ project, index, open, ready, reduced, onToggle }: ProjectRowProps) {
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
          onClick={() => onToggle(slug)}
          className="group w-full grid grid-cols-12 items-center h-[72px] lg:h-[88px] text-left"
        >
          {/* No text colour utility here: .foil paints the glyphs from a
              gradient and needs the transparent fill it sets to survive. */}
          <span
            className={cn(
              "col-span-11 sm:col-span-8 lg:col-span-6 pr-4",
              "font-display font-medium text-[22px] lg:text-[28px] leading-none",
              "foil transition-transform duration-300 ease-[var(--ease-heavy)] group-hover:translate-x-[6px]"
            )}
          >
            {title}
          </span>

          <span
            className={cn(
              "sr-only sm:not-sr-only sm:block sm:col-span-3 lg:col-span-2",
              "font-mono text-[12px] leading-none tabular-nums",
              isLive ? "text-aurum-300" : "text-ivory-300"
            )}
          >
            {status}
          </span>

          <span className="hidden lg:block lg:col-span-3 font-mono text-[12px] leading-none tabular-nums text-ivory-300">
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

                  <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[12px] leading-none tabular-nums text-ivory-300" aria-label="Stack">
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
                      <ScreenshotPlate src={shot} title={title} />
                    ) : (
                      <motion.div variants={plateVariants} initial="hidden" animate={ready ? "show" : "hidden"}>
                        <ScreenshotPlate src={shot} title={title} />
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

function ScreenshotPlate({ src, title }: { src: string; title: string }) {
  const sheen = useSheen();

  return (
    <div {...sheen} className="sheen relative border border-hairline aspect-[16/10] overflow-hidden">
      <Image
        src={src}
        alt={`Screenshot of ${title}`}
        width={1600}
        height={1000}
        loading="lazy"
        decoding="async"
        className="block h-full w-full object-cover"
      />
    </div>
  );
}

export default function Projects() {
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const inView = useInView(listRef, { once: true, amount: 0.1 });
  const [openSlug, setOpenSlug] = useState<string | null>(DEFAULT_OPEN);

  const toggle = (slug: string) => setOpenSlug((current) => (current === slug ? null : slug));

  return (
    <section id="projects" aria-labelledby="projects-heading" className="relative w-full py-32 lg:py-40">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-x-6 lg:gap-x-10">
          <div className="col-span-12 lg:col-span-8">
            <SectionHeading id="projects-heading" title="Selected work." subtext="Six builds, three of them live." />
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
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
