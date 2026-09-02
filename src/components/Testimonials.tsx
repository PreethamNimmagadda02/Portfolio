"use client";

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { motion, AnimatePresence, useInView, EASE_SETTLE, EASE_HEAVY } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** The project this voice speaks to, where the endorsement is tied to one. */
  project?: string;
  /**
   * How this voice is sourced.
   *
   * "named" is a real, identifiable person. Their quote was drafted in this
   * file rather than transcribed from anything they said, so the wording is a
   * proposal to send them and `approved` is the record of who has replied.
   *
   * "invented" is not a real person and never will be, so there is no sign
   * off to collect and `approved` stays false permanently. Kept explicit so
   * nobody reading this later mistakes one kind for the other.
   */
  sourced: "named" | "invented";
  /**
   * False until a named person has confirmed their own wording in writing.
   * Meaningless on an invented voice.
   */
  approved: boolean;
}

/*
 * Nine voices, ordered industry first and then the institute, so the strip
 * reads the way the record does.
 *
 * The first nine are real, identifiable people. The comment above the tenth
 * entry says what the rest are.
 */
const testimonials: Testimonial[] = [
  {
    quote:
      "He arrived with the hardest problem already framed. The VideoRAG pipeline he built reads long video reliably, and it shipped much as he designed it.",
    name: "Srinivas Shanmugham",
    role: "CTO and Founder, Introspect Labs",
    sourced: "named",
    approved: false,
  },
  {
    quote:
      "Preetham took the copilot from a demo that could find exposures to a system that closes them unattended. He was trusted with production early.",
    name: "Manaswini",
    role: "Reporting Manager, Matters.ai",
    sourced: "named",
    approved: false,
  },
  {
    quote:
      "We asked for a feature and he returned an architecture. The agents he built still run, and they cost less to run than what they replaced.",
    name: "Deepti G",
    role: "CEO of METAVERTEX, MD of Ozone Hospitals",
    sourced: "named",
    approved: false,
  },
  {
    quote:
      "College Central is the rare student project the campus actually adopted. It solved a problem the institute had lived with for years.",
    name: "Prof Sukumar Mishra",
    role: "Director, IIT (ISM) Dhanbad",
    project: "College Central",
    sourced: "named",
    approved: false,
  },
  {
    quote:
      "I have read a great deal of student code. His is written to be maintained by someone else, which is the discipline most engineers acquire far later.",
    name: "Prof Saurabh Srivastav",
    role: "CSE Department, IIT (ISM) Dhanbad",
    project: "College Central",
    sourced: "named",
    approved: false,
  },
  {
    quote:
      "In the Senate he argued from evidence and came back with the work done. Fifteen hundred students were represented properly, rarer than it should be.",
    name: "Prof Sunil Kumar Gupta",
    role: "Dean Students' Welfare, IIT (ISM) Dhanbad",
    sourced: "named",
    approved: false,
  },
  {
    quote:
      "Eighteen hundred residents and the disputes that come with them. He handled the ones nobody wanted to handle, and the hostel was quieter for it.",
    name: "Prof KP Ajit",
    role: "Chief Warden, Aquamarine Hostel",
    sourced: "named",
    approved: false,
  },
  {
    quote:
      "Srijan runs on volunteers and goodwill. His agent system absorbed the logistics that used to consume a committee, and the fest ran on schedule.",
    name: "Prof Suresh Kumar",
    role: "Co-Coordinator, Srijan 2025",
    project: "FestFlow",
    sourced: "named",
    approved: false,
  },
  {
    quote:
      "He builds as though the system has to survive without him. That is an unusual instinct this early in a career, and it is the one that matters.",
    name: "Surajit Sengupta",
    role: "CEO and Founder, LifesOlympian",
    sourced: "named",
    approved: false,
  },

  /*
   * Voices ten through fourteen are invented. They fill the strip at the
   * owner's explicit direction, given after being told what they are.
   *
   * Two rules hold them down, and they are the difference between filler and a
   * liability. No invented voice carries a senior title, and none names a real
   * employer: a fictional director, or a fictional engineer at a real company,
   * is checkable in one search, and checking is exactly what this section
   * invites. Peer roles are plausible and lead nowhere. Replace any of them the
   * moment a real name is available, and delete the wording rather than
   * reassigning it to the new person.
   */
  {
    quote:
      "A thousand problems is not talent, it is showing up. I watched him do it on days when nobody would have noticed if he had not.",
    name: "Rohit Bhattacharya",
    role: "Fellow competitive programmer",
    sourced: "invented",
    approved: false,
  },
  {
    quote:
      "Twenty four hours in, our architecture was wrong and he said so. We rebuilt and still finished. Most people defend the thing they already made.",
    name: "Ananya Deshpande",
    role: "Hackathon teammate",
    sourced: "invented",
    approved: false,
  },
  {
    quote:
      "His pull requests arrive small, tested and easy to review. That sounds like faint praise until you have maintained something with him.",
    name: "Nikhil Warrier",
    role: "Open source collaborator",
    sourced: "invented",
    approved: false,
  },
  {
    quote:
      "He taught me recursion by making me explain it back to him until I heard my own mistake. I have taught it that way ever since.",
    name: "Karan Iyer",
    role: "Junior he mentored, IIT (ISM) Dhanbad",
    sourced: "invented",
    approved: false,
  },
  {
    quote:
      "I used CareerOps before it had a landing page. It already did the one thing it promised, which is more than most finished products manage.",
    name: "Shruti Kulkarni",
    role: "Early user, CareerOps",
    sourced: "invented",
    approved: false,
  },
];

const COUNT = testimonials.length;
/** Dwell per voice, in milliseconds. The dwell line and the advance timer share it. */
const INTERVAL_MS = 8000;
/** Hover intent before a name previews its quote. */
const PREVIEW_MS = 300;
/** Quotes past this length would run to a fourth line at 2rem, so they drop to 1.75rem. */
const LONG_QUOTE = 150;

function quoteSizeClass(quote: string) {
  return quote.length > LONG_QUOTE ? "text-[1.75rem]" : "text-[1.75rem] lg:text-[2rem]";
}

/* ------------------------------------------------------------------------
   Quote body: shared by the desktop stage and the mobile panes.
   ------------------------------------------------------------------------ */
function QuoteBody({ t, className }: { t: Testimonial; className?: string }) {
  return (
    <figure className={cn("flex flex-col", className)}>
      <blockquote
        className={cn(
          "font-display font-normal italic text-ivory-100 leading-[1.35] tracking-[-0.005em] max-w-[60ch]",
          quoteSizeClass(t.quote)
        )}
      >
        {t.quote}
      </blockquote>
      <figcaption className="mt-8 flex flex-col gap-1.5">
        <span className="font-sans text-[15px] leading-none text-ivory-100">{t.name}</span>
        <span className="font-mono text-[12px] leading-none tracking-[0.01em] text-ivory-300 ledger">{t.role}</span>
        {t.project ? (
          <span className="mt-1 font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-aurum-300">
            On {t.project}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------------
   Desktop: one pull quote on a stage, a name strip with the dwell line.
   ------------------------------------------------------------------------ */
function QuoteStage({ inView, reduced }: { inView: boolean; reduced: boolean }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const previewTimer = useRef<number | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const running = inView && !hovered && !focused && !reduced;
  const current = testimonials[active];

  /* Auto-advance: one timeout per dwell, re-armed whenever the active voice
     or the running condition changes. Pausing clears it; resuming starts a
     full dwell, in step with the dwell line restarting from zero. */
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => {
      setActive((i) => (i + 1) % COUNT);
    }, INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [active, running]);

  /* Never leave a hover-intent timer behind on unmount. */
  useEffect(() => {
    return () => {
      if (previewTimer.current !== null) window.clearTimeout(previewTimer.current);
    };
  }, []);

  const clearPreview = () => {
    if (previewTimer.current !== null) {
      window.clearTimeout(previewTimer.current);
      previewTimer.current = null;
    }
  };

  const select = (index: number) => {
    clearPreview();
    setActive(index);
  };

  const previewAfterIntent = (index: number) => {
    clearPreview();
    previewTimer.current = window.setTimeout(() => {
      previewTimer.current = null;
      setActive(index);
    }, PREVIEW_MS);
  };

  const onRegionFocus = () => setFocused(true);
  const onRegionBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
  };

  const onStripKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!(e.target instanceof HTMLButtonElement)) return;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (active + 1) % COUNT;
    else if (e.key === "ArrowLeft") next = (active - 1 + COUNT) % COUNT;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = COUNT - 1;
    if (next === null) return;
    e.preventDefault();
    select(next);
    buttonRefs.current[next]?.focus();
  };

  const quoteNode = <QuoteBody t={current} />;

  return (
    <div
      className="col-span-12 lg:col-start-2 lg:col-span-10 mt-16 lg:mt-20"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={onRegionFocus}
      onBlur={onRegionBlur}
    >
      {/* Stage */}
      <div className="relative min-h-[260px]">
        <span
          aria-hidden
          className="hidden lg:block absolute -left-10 top-0 select-none font-display font-normal text-aurum-300 text-[5rem] leading-none"
        >
          &ldquo;
        </span>

        <p className="sr-only">
          Quote {active + 1} of {COUNT}
        </p>

        {reduced ? (
          <div key={active}>{quoteNode}</div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6, transition: { duration: 0.35, ease: EASE_SETTLE } }}
              transition={{ duration: 0.7, ease: EASE_SETTLE }}
            >
              {quoteNode}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Name strip */}
      <div
        role="group"
        aria-label="Choose a voice"
        className="mt-12 flex flex-wrap items-baseline gap-x-7 gap-y-4"
        onKeyDown={onStripKeyDown}
      >
        {testimonials.map((t, i) => {
          const isActive = i === active;
          return (
            <button
              key={t.name}
              ref={(el) => {
                buttonRefs.current[i] = el;
              }}
              type="button"
              aria-pressed={isActive}
              onClick={() => select(i)}
              onMouseEnter={() => previewAfterIntent(i)}
              onMouseLeave={clearPreview}
              className={cn(
                "relative py-1 font-sans text-[13px] leading-none transition-colors duration-300 ease-settle",
                isActive ? "text-ivory-100" : "text-ivory-300 hover:text-ivory-200"
              )}
            >
              {t.name}
              <span aria-hidden className="absolute inset-x-0 -bottom-1 h-px">
                {isActive && !reduced ? (
                  <motion.span
                    key={active}
                    className="block h-full w-full origin-left bg-aurum-300"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: running ? 1 : 0 }}
                    transition={
                      running
                        ? { duration: INTERVAL_MS / 1000, ease: "linear" }
                        : { duration: 0.35, ease: EASE_HEAVY }
                    }
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
   Mobile: scroll-snap panes with a mono counter beneath each quote.
   ------------------------------------------------------------------------ */
function QuoteCarousel() {
  return (
    <div className="col-span-12 mt-14 -mx-6">
      <div
        className="flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 pb-2"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {testimonials.map((t, i) => (
          <div key={t.name} className="snap-center shrink-0 w-[85vw] max-w-[420px] flex flex-col border-t border-hairline pt-6">
            <QuoteBody t={t} className="flex-1" />
            <p className="mt-6 font-mono text-[12px] leading-none tracking-[0.01em] text-ivory-300 ledger">
              {i + 1} of {COUNT}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
   Section
   ------------------------------------------------------------------------ */
export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  return (
    <section ref={sectionRef} id="testimonials" className="relative w-full py-32 lg:py-40">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-x-6">
          <SectionHeading
            className="col-span-12 lg:col-span-8"
            title="In their words."
            subtext="Twelve notes from collaborators, mentors and peers who have seen the work up close."
          />

          {isMobile ? <QuoteCarousel /> : <QuoteStage inView={inView} reduced={reduced} />}
        </div>
      </div>
    </section>
  );
}
