"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Briefcase, Buildings, Gavel, Users, type Icon } from "@phosphor-icons/react";
import { AnimatePresence, motion, EASE_HEAVY, EASE_SETTLE } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------
   Record
   ------------------------------------------------------------------------ */

type ExperienceType = "work" | "community" | "achievement" | "organization";
type ExperienceGroup = "Industry" | "Campus";

interface ExperienceEntry {
  id: number;
  group: ExperienceGroup;
  role: string;
  company: string;
  /** Written with "to": the start year is read from the first four digits. */
  period: string;
  description: string;
  type: ExperienceType;
  skills: string[];
  highlight: string;
}

const entries: ExperienceEntry[] = [
  {
    id: 0,
    group: "Industry",
    role: "Machine Learning Intern",
    company: "Matters.AI",
    period: "Mar 2026 to Aug 2026",
    description:
      "Built the AI copilot that finds data exposures in real time and remediates them automatically, turning data security from passive monitoring into a self-healing defense layer.",
    type: "work",
    skills: ["Autonomous AI", "DSPM", "ML Engineering", "Data Security"],
    highlight: "Autonomous AI copilot",
  },
  {
    id: 1,
    group: "Industry",
    role: "Generative AI Intern",
    company: "Introspect Labs",
    period: "Dec 2025 to Mar 2026",
    description:
      "Built a multimodal & multilingual AI companion powered by VideoRAG that processes 100+ hours of video with 95% accuracy. Designed its empathic core for real-time adaptive responses, boosting retention by 40%.",
    type: "work",
    skills: ["VideoRAG", "Vision-Language Models", "Empathic AI"],
    highlight: "Architected an AI companion",
  },
  {
    id: 3,
    group: "Industry",
    role: "Software Developer Intern",
    company: "METAVERTEX",
    period: "June 2025 to July 2025",
    description:
      "Architected autonomous AI agents reducing system resource load by 20%. Engineered performance optimizations that boosted SEO visibility by 10%.",
    type: "work",
    skills: ["AI Architecture", "System Optimization", "Scalable Tech"],
    highlight: "20% efficiency gain",
  },
  {
    id: 2,
    group: "Campus",
    role: "Campus Ambassador",
    company: "Perplexity",
    period: "Sept 2025 to Nov 2025",
    description:
      "Led campus adoption for Perplexity: built the partnerships and campaigns that drove real user growth across the university.",
    type: "community",
    skills: ["Growth Hacking", "Strategic Partnerships", "Brand Strategy"],
    highlight: "20+ strategic leads",
  },
  {
    id: 4,
    group: "Campus",
    role: "Hostel Prefect",
    company: "Hostel Executive Committee",
    period: "Sept 2024 to Sept 2025",
    description:
      "Managed operations for 1,800+ residents. Implemented conflict resolution protocols reducing disputes by 30% and boosted community engagement by 40%.",
    type: "organization",
    skills: ["Operations Management", "Conflict Resolution", "Community Building"],
    highlight: "Led 1,800+ residents",
  },
  {
    id: 5,
    group: "Campus",
    role: "Student Senator",
    company: "Students' Gymkhana, IIT (ISM)",
    period: "March 2024 to March 2025",
    description:
      "Elected representative for 1,500+ peers. Facilitated policy changes and infrastructure improvements, enhancing student satisfaction and campus life quality.",
    type: "achievement",
    skills: ["Strategic Leadership", "Policy Advocacy", "Governance"],
    highlight: "Elected representative",
  },
];

const GROUPS: ExperienceGroup[] = ["Industry", "Campus"];

const typeIcons: Record<ExperienceType, Icon> = {
  work: Briefcase,
  community: Users,
  organization: Buildings,
  achievement: Gavel,
};

/** The start year of a period written as "Mon YYYY to ...". */
function startYear(period: string): string {
  return period.match(/\d{4}/)?.[0] ?? period;
}

/* ------------------------------------------------------------------------
   Sticky year dossier (left column, lg and up)
   The column duplicates facts already present in the entries, so it is
   hidden from assistive technology.
   ------------------------------------------------------------------------ */

function YearDossier({ entry, index, reduced }: { entry: ExperienceEntry; index: number; reduced: boolean }) {
  const year = startYear(entry.period);
  const yearIn = reduced ? { duration: 0 } : { duration: 0.7, ease: EASE_HEAVY };
  const yearOut = reduced ? { duration: 0 } : { duration: 0.5, ease: EASE_HEAVY };
  const fade = reduced ? { duration: 0 } : { duration: 0.4, ease: EASE_SETTLE };

  // A sticky box detaches once its bottom edge reaches the bottom of its
  // parent. The aside is as tall as the column of entries, so the dossier's
  // bottom meets the last entry's bottom and the two leave the viewport
  // together instead of the dossier lingering after the record has gone.
  return (
    <div className="sticky top-32" aria-hidden>
      <div className="flex flex-col">
        {/* The numeral mask: outgoing year slides up and out while the next rises in. */}
        <div className="relative h-20 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={year}
              className="ledger block font-display font-normal text-[5rem] leading-none text-ivory-100"
              initial={{ y: "100%" }}
              animate={{ y: 0, transition: yearIn }}
              exit={{ y: "-100%", transition: yearOut }}
            >
              {year}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* A gold rule closing the numeral, so the year reads as the head of a
            dossier rather than a figure floating above the details. */}
        <div className="mt-4 h-px w-full max-w-[220px] bg-hairline-gold" />

        <div className="relative mt-5">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={entry.id}
              className="flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: fade }}
              exit={{ opacity: 0, transition: fade }}
            >
              <span className="ledger font-mono text-[13px] leading-none text-ivory-300">{entry.period}</span>
              <span className="mt-6 font-display font-medium text-[28px] leading-[1.15] text-ivory-100">
                {entry.company}
              </span>
              <span className="mt-2 font-sans text-[15px] leading-normal text-ivory-200">{entry.role}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Where the reader is in the record: six ticks, the roles read so
            far held in ivory and the current one in gold. */}
        <div className="mt-12 flex max-w-[220px] items-center gap-4">
          <span className="ledger font-mono text-[11px] leading-none tracking-[0.14em] text-aurum-300">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex flex-1 gap-1">
            {entries.map((e, i) => (
              <span
                key={e.id}
                className={cn(
                  "h-px flex-1 transition-colors duration-500 ease-heavy",
                  i === index ? "bg-aurum-300" : i < index ? "bg-ivory-300/60" : "bg-hairline"
                )}
              />
            ))}
          </span>
          <span className="ledger font-mono text-[11px] leading-none tracking-[0.14em] text-ivory-300">
            {String(entries.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
   Entry (right column). No card: type, role, metadata, highlight, prose,
   and the skills under a hairline that strengthens on hover.
   ------------------------------------------------------------------------ */

function Entry({
  entry,
  index,
  reduced,
  register,
}: {
  entry: ExperienceEntry;
  index: number;
  reduced: boolean;
  register: (el: HTMLElement | null) => void;
}) {
  const Icon = typeIcons[entry.type];

  return (
    <motion.article
      ref={register}
      data-entry={entry.id}
      /* Its own rule, so six roles read as six entries in a ledger rather
         than six paragraphs separated by air. */
      className="group border-t border-hairline pt-7 transition-colors duration-300 ease-heavy hover:border-hairline-strong"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: reduced ? 0.2 : 0.9,
        ease: EASE_SETTLE,
        delay: reduced ? 0 : index * 0.06,
      }}
    >
      {/* Mobile only: the period sits above the role, where the sticky column would have said it. */}
      <p className="ledger mb-3 font-mono text-[13px] leading-none text-ivory-300 lg:hidden">{entry.period}</p>

      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="ledger w-6 shrink-0 font-mono text-[11px] leading-none tracking-[0.14em] text-ivory-300 transition-colors duration-300 ease-heavy group-hover:text-aurum-300"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <Icon size={18} weight="light" className="shrink-0 text-ivory-300" aria-hidden />
        <h4 className="foil font-display font-medium text-[22px] leading-[1.15] transition-transform duration-300 ease-heavy group-hover:translate-x-1.5 lg:text-[28px]">
          {entry.role}
        </h4>
      </div>

      <p className="ledger mt-3 pl-9 font-mono text-[13px] leading-none text-ivory-300">
        {entry.company}
        <span className="hidden lg:inline">
          <span aria-hidden> &middot; </span>
          <span className="sr-only">, </span>
          {entry.period}
        </span>
      </p>

      {/* The one gold fact per role, marked as such: a gold tick, then small
          caps. It used to be mono body text carrying figures like 1,800+. */}
      <p className="mt-5 flex items-center gap-3 pl-9 font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-aurum-300">
        <span aria-hidden className="h-px w-4 shrink-0 bg-aurum-400" />
        {entry.highlight}
      </p>

      <p className="mt-5 max-w-[58ch] pl-9 font-sans text-[16px] leading-[1.65] text-ivory-200">
        {entry.description}
      </p>

      <ul
        aria-label="Skills"
        className="mt-6 ml-9 flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-4 transition-colors duration-300 ease-heavy group-hover:border-hairline-strong"
      >
        {entry.skills.map((skill) => (
          <li
            key={skill}
            className="font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ivory-300 transition-colors duration-300 ease-heavy group-hover:text-ivory-200"
          >
            {skill}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

/* The heading over a run of entries. Small caps and a count, so it reads as a
   ledger's section head rather than a stray bold line. */
function GroupLabel({ children, count }: { children: ReactNode; count: number }) {
  /* The rule has to live on a block, not on the eyebrow itself: .eyebrow is
     inline-flex, so a border on it would stop at the end of the words instead
     of running the width of the column. */
  return (
    <h3 className="border-t border-hairline pt-4">
      <span className="eyebrow">
        {children}
        <span aria-hidden className="h-px w-5 bg-hairline-gold" />
        <span className="ledger text-ivory-300">{String(count).padStart(2, "0")}</span>
      </span>
    </h3>
  );
}

/* ------------------------------------------------------------------------
   Section
   ------------------------------------------------------------------------ */

export default function Experience() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const nodes = useRef<Map<number, HTMLElement>>(new Map());

  // One observer for all six entries. An entry is a candidate once half of it
  // is visible; the topmost candidate is the chapter the reader is in. When
  // no entry qualifies (a tall gap, or between groups) the last chapter holds.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Set<number>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const id = Number((record.target as HTMLElement).dataset.entry);
          if (record.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        if (visible.size === 0) return;
        let next = Number.POSITIVE_INFINITY;
        for (const id of visible) {
          const index = entries.findIndex((e) => e.id === id);
          if (index < next) next = index;
        }
        if (Number.isFinite(next)) setActive(next);
      },
      { threshold: 0.5 }
    );
    for (const el of nodes.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const register = (el: HTMLElement | null) => {
    const id = Number(el?.dataset.entry);
    if (el) nodes.current.set(id, el);
  };

  return (
    <section id="experience" aria-labelledby="experience-heading" className="relative w-full py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-9">
            <SectionHeading
              id="experience-heading"
              chapter="experience"
              eyebrow="TWO TRACKS, INDUSTRY AND CAMPUS"
              title="Six roles since 2024."
            />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-12 gap-x-6 lg:mt-24">
          <aside className="hidden lg:col-span-4 lg:block">
            <YearDossier entry={entries[active]} index={active} reduced={reduced} />
          </aside>

          <div className="col-span-12 flex flex-col gap-y-24 lg:col-span-7 lg:col-start-6">
            {GROUPS.map((group) => {
              const groupEntries = entries.filter((entry) => entry.group === group);
              return (
                <div key={group}>
                  <GroupLabel count={groupEntries.length}>{group}</GroupLabel>
                  {/* Tighter than before: each entry now carries its own rule,
                      so the gap no longer has to do the separating. */}
                  <div className="mt-10 flex flex-col gap-y-12 lg:gap-y-14">
                    {groupEntries.map((entry) => (
                      <Entry
                        key={entry.id}
                        entry={entry}
                        index={entries.indexOf(entry)}
                        reduced={reduced}
                        register={register}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
