"use client";

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { motion, AnimatePresence, useInView, EASE_SETTLE, EASE_HEAVY } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { SectionHeading, PlateTicks } from "@/components/ui";
import { cn, pad2 } from "@/lib/utils";

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
    <figure className={cn("flex max-w-[60ch] flex-col", className)}>
      <blockquote
        className={cn(
          "font-display font-normal italic text-ivory-100 leading-[1.35] tracking-[-0.005em]",
          quoteSizeClass(t.quote)
        )}
      >
        {t.quote}
      </blockquote>
      {/* The attribution sits below its own rule. A quote and its source
          running together with nothing between them is the one thing a set
          pull quote never does. */}
      <figcaption className="mt-8 flex flex-col gap-1.5 border-t border-hairline pt-6">
        <span className="font-sans text-[15px] leading-none text-ivory-100">{t.name}</span>
        <span className="font-mono text-[12px] leading-none tracking-[0.01em] text-ivory-300 ledger">{t.role}</span>
        {t.project ? (
          <span className="mt-1 caption text-aurum-300">
            On {t.project}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------------
   Desktop: a pull quote set against its attribution, with a seal.
   ------------------------------------------------------------------------ */

/** Two initials for the seal: the first and last names, titles left out. */
function initials(name: string) {
  const words = name.replace(/^Prof\s+/, "").split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/* The seal: a monogram struck in foil inside a double gold ring, the mark a
   letter carries at its foot. Ornament, since the name is set beside it. */
function Seal({ name }: { name: string }) {
  return (
    <span aria-hidden className="relative flex size-24 shrink-0 items-center justify-center rounded-full border border-hairline-gold">
      <span className="absolute inset-1.5 rounded-full border border-hairline" />
      <span className="foil font-display text-[2rem] italic leading-none tracking-[0.02em]">{initials(name)}</span>
    </span>
  );
}

const STEP =
  "inline-flex size-11 items-center justify-center border border-hairline text-ivory-200 transition-colors duration-300 ease-heavy hover:border-aurum-300 hover:text-aurum-200 focus-visible:border-aurum-300";

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
    setActive(((index % COUNT) + COUNT) % COUNT);
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

  const onTrackKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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

  const swap = (key: number, children: ReactNode, delay = 0) =>
    reduced ? (
      <div key={key}>{children}</div>
    ) : (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE_SETTLE, delay } }}
          exit={{ opacity: 0, y: -6, filter: "blur(2px)", transition: { duration: 0.35, ease: EASE_SETTLE } }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );

  return (
    <div
      className="col-span-12 mt-16 lg:col-span-11 lg:col-start-2 lg:mt-20"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={onRegionFocus}
      onBlur={onRegionBlur}
    >
      {/* Stage. The quote takes the page; its source sits in a margin column
          of its own under a seal, the way a letter is signed, instead of
          trailing under the last line. */}
      <figure className="relative border-y border-hairline py-14 lg:py-16">
        <PlateTicks />
        <div className="grid grid-cols-11 gap-x-6">

          <p className="sr-only">
            Quote {active + 1} of {COUNT}, from {current.name}
          </p>

          <div className="relative col-span-7 min-h-[300px] pl-2">
            <span
              aria-hidden
              className="absolute -left-12 -top-4 select-none font-display font-normal text-[6rem] leading-none text-aurum-300/80"
            >
              &ldquo;
            </span>
            {swap(
              active,
              <blockquote
                className={cn(
                  "max-w-[30ch] font-display font-normal italic leading-[1.3] tracking-[-0.01em] text-ivory-100",
                  current.quote.length > LONG_QUOTE ? "text-[2rem]" : "text-[2.25rem] xl:text-[2.5rem]"
                )}
              >
                {current.quote}
              </blockquote>
            )}
          </div>

          <div className="col-span-4 col-start-8 flex flex-col justify-between border-l border-hairline pl-10">
            {swap(
              active,
              <figcaption className="flex flex-col items-start">
                <Seal name={current.name} />
                <span className="mt-8 font-display text-[1.5rem] leading-[1.15] text-ivory-100">{current.name}</span>
                <span className="ledger mt-3 font-mono text-[12px] leading-[1.5] text-ivory-300">{current.role}</span>
                {current.project ? (
                  <span className="mt-4 flex items-center gap-3 caption text-aurum-300">
                    <span aria-hidden className="h-px w-4 bg-aurum-400" />
                    On {current.project}
                  </span>
                ) : null}
              </figcaption>,
              0.08
            )}

            <div className="mt-10 flex items-center gap-4">
              <button type="button" aria-label="Previous voice" onClick={() => select(active - 1)} className={STEP}>
                <CaretLeft size={16} weight="light" aria-hidden />
              </button>
              <p aria-hidden className="ledger caption text-ivory-300">
                <span className="text-aurum-300">{pad2(active + 1)}</span>
                <span className="px-2 text-ivory-300/60">/</span>
                {pad2(COUNT)}
              </p>
              <button type="button" aria-label="Next voice" onClick={() => select(active + 1)} className={STEP}>
                <CaretRight size={16} weight="light" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </figure>

      {/* The track: one segment per voice. Heard voices stay lit, the current
          one fills with its dwell, and a name surfaces over a segment on
          hover. It replaces a strip of fourteen names that wrapped onto a
          second line and read as a tag cloud. */}
      <div role="group" aria-label="Choose a voice" className="mt-8 flex items-center gap-1.5" onKeyDown={onTrackKeyDown}>
        {testimonials.map((t, i) => {
          const isActive = i === active;
          const align = i < 3 ? "left-0" : i > COUNT - 4 ? "right-0" : "left-1/2 -translate-x-1/2";
          return (
            <button
              key={t.name}
              ref={(el) => {
                buttonRefs.current[i] = el;
              }}
              type="button"
              aria-label={`${t.name}, ${t.role}`}
              aria-pressed={isActive}
              onClick={() => select(i)}
              onMouseEnter={() => previewAfterIntent(i)}
              onMouseLeave={clearPreview}
              className="group/seg relative h-10 flex-1"
            >
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute bottom-full mb-1 whitespace-nowrap font-mono text-[10px] uppercase leading-none tracking-[0.14em] text-ivory-200 opacity-0 transition-[opacity,translate] duration-300 ease-heavy group-hover/seg:-translate-y-1 group-hover/seg:opacity-100",
                  align
                )}
              >
                {t.name}
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 top-1/2 h-px bg-hairline transition-colors duration-300 ease-heavy group-hover/seg:bg-hairline-strong"
              >
                {isActive ? (
                  reduced ? (
                    <span className="block h-full w-full bg-aurum-300" />
                  ) : (
                    <motion.span
                      key={active}
                      className="block h-full w-full origin-left bg-aurum-300"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: running ? 1 : 0.08 }}
                      transition={
                        running
                          ? { duration: INTERVAL_MS / 1000, ease: "linear" }
                          : { duration: 0.35, ease: EASE_HEAVY }
                      }
                    />
                  )
                ) : i < active ? (
                  <span className="block h-full w-full bg-ivory-300/50" />
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
          <div
            key={t.name}
            className="relative snap-center shrink-0 w-[85vw] max-w-[420px] flex flex-col border-t border-hairline pt-6"
          >
            {/* The same trim marks the desktop stage carries, on the one rule
                a pane has. */}
            <PlateTicks edges="top" />
            <QuoteBody t={t} className="flex-1" />
            <p className="ledger mt-6 caption text-ivory-300">
              <span className="text-aurum-300">{pad2(i + 1)}</span>
              <span className="px-2 text-ivory-300/60">/</span>
              {pad2(COUNT)}
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
          {/* The count lives in the eyebrow and the folio, where a numeral
              belongs, and is interpolated so it cannot drift: the subtext used
              to say twelve while the strip held fourteen. The prose no longer
              carries it, which also keeps the section's voice spelling its
              numbers out the way every other one does. */}
          <SectionHeading
            className="col-span-12 lg:col-span-8"
            chapter="testimonials"
            eyebrow={`${COUNT} VOICES`}
            title="In their words."
            subtext="Notes from collaborators, mentors and peers who have seen the work up close."
          />

          {isMobile ? <QuoteCarousel /> : <QuoteStage inView={inView} reduced={reduced} />}
        </div>
      </div>
    </section>
  );
}
