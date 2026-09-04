"use client";

/**
 * Skills: a rotary dial over a reading window.
 *
 * The eight disciplines ride the rim of a dial, the way a watch bezel or a
 * vault mechanism carries its stops. Selecting one turns the dial until that
 * discipline sits under a fixed index mark at twelve o'clock, and its tools
 * set beneath in the panel. The rim is the overview, so nothing is hidden by
 * showing one discipline at a time: every discipline and its count is legible
 * on the dial at once.
 *
 * The exclusive selection lives in scene-store, shared with the CosmicScene
 * star chart, so turning the dial also lights the matching points behind the
 * page.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useInView, EASE_HEAVY, EASE_SETTLE } from "@/lib/motion";
import { skillsData, categoryLabels } from "@/lib/skills-data";
import { selectSkillCategory } from "@/lib/scene-store";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";

interface CategoryGroup {
  cat: string;
  label: string;
  count: number;
  skills: string[];
}

/**
 * Groups the shared dataset by category, alphabetises the names inside each
 * group and orders the groups by count descending (ties alphabetical). Pure
 * and module-level: the data is static, so this runs once per bundle.
 */
function buildGroups(): CategoryGroup[] {
  const byCat = new Map<string, string[]>();
  for (const { name, category } of skillsData) {
    const list = byCat.get(category);
    if (list) list.push(name);
    else byCat.set(category, [name]);
  }
  const groups: CategoryGroup[] = [];
  for (const [cat, names] of byCat) {
    groups.push({
      cat,
      label: categoryLabels[cat] ?? cat,
      count: names.length,
      skills: [...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
    });
  }
  return groups.sort((a, b) => b.count - a.count || a.cat.localeCompare(b.cat, "en"));
}

const GROUPS = buildGroups();
const TOTAL_TOOLS = skillsData.length;
const STOPS = GROUPS.length;

/** Degrees between two stops on the rim. */
const STEP = 360 / STOPS;

/**
 * Shortest signed number of stops from a to b. A bezel never travels the long
 * way round to reach its neighbour, so a move from the last stop to the first
 * is one step forward, not seven back.
 */
function shortestStepDelta(from: number, to: number): number {
  const forward = (to - from + STOPS) % STOPS;
  return forward > STOPS / 2 ? forward - STOPS : forward;
}

/* ------------------------------------------------------------------------
   Dial
   ------------------------------------------------------------------------ */

/**
 * A rim label. Placement and uprightness are one transform: the frame is
 * rotated to the stop's angle, pushed out to the rim, then rotated back so the
 * text itself never tilts. The radius comes from --dial-r so it stays
 * responsive while React owns only the angle.
 */
function rimTransform(angle: number): string {
  return `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(var(--dial-r) * -1)) rotate(${-angle}deg)`;
}

/**
 * A tick is radial, so it keeps the frame's rotation instead of undoing it.
 *
 * Ticks ride their own radius, --dial-tick, out in the graduated band against
 * the bezel. They cannot share the labels' radius: an upright label at three
 * o'clock extends along the radius rather than across it, so its full width
 * has to clear the tick band or the tick strikes through the text.
 */
function tickTransform(angle: number, trim: string): string {
  return `translate(-50%, -50%) rotate(${angle}deg) translateY(calc((var(--dial-tick) - ${trim}) * -1))`;
}

interface DialProps {
  index: number;
  rotation: number;
  onSelect: (index: number) => void;
  /** Turns by a signed number of stops and returns where it landed. */
  onStep: (delta: number) => number;
  reduced: boolean;
}

function Dial({ index, rotation, onSelect, onStep, reduced }: DialProps) {
  const radios = useRef<(HTMLButtonElement | null)[]>([]);

  // Standard radiogroup keys. Selection follows focus, which is also how a
  // physical dial behaves: there is no way to point at a stop without turning
  // to it.
  //
  // Arrows step rather than naming a target index. Held down, a key repeats
  // faster than React re-renders, so anything derived from the `index` prop
  // would compute every repeat from the same stale stop and the dial would
  // advance once and then stall.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    let landed: number | null = null;
    if (event.key in steps) landed = onStep(steps[event.key]);
    else if (event.key === "Home") {
      onSelect(0);
      landed = 0;
    } else if (event.key === "End") {
      onSelect(STOPS - 1);
      landed = STOPS - 1;
    }
    if (landed === null) return;
    event.preventDefault();
    radios.current[landed]?.focus();
  };

  const turn = reduced
    ? { duration: 0 }
    : { duration: 0.95, ease: EASE_HEAVY };

  return (
    <div
      className={cn(
        // --dial-r is the radius the labels ride, --dial-tick the graduated
        // band against the bezel, --dial-in the inset of the subdial rule
        // around the figure. The three are set so the widest label clears both
        // the ticks outside it and the subdial inside it.
        "relative mx-auto aspect-square w-[300px] [--dial-in:85px] [--dial-r:100px] [--dial-tick:142px]",
        "sm:w-[340px] sm:[--dial-in:95px] sm:[--dial-r:114px] sm:[--dial-tick:162px]",
        "lg:mx-0 lg:w-[380px] lg:[--dial-in:105px] lg:[--dial-r:128px] lg:[--dial-tick:176px]"
      )}
    >
      {/* Bezel and inner rule. Two concentric hairlines, the same double frame
          the portrait plate uses. */}
      <span aria-hidden className="absolute inset-0 rounded-full border border-hairline-strong" />
      <span
        aria-hidden
        className="absolute rounded-full border border-hairline"
        style={{ inset: "var(--dial-in)" }}
      />

      {/* Index mark at twelve o'clock: the one thing on the dial that never
          moves, so the reader always knows where to read. */}
      <span
        aria-hidden
        className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-aurum-300"
      />

      {/* Everything that turns. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        animate={{ rotate: rotation }}
        transition={turn}
      >
        {GROUPS.map((group, i) => (
          <span
            key={`tick-${group.cat}`}
            className="absolute left-1/2 top-1/2 h-3 w-px origin-center bg-ivory-300"
            style={{ transform: tickTransform(i * STEP, "0px") }}
          />
        ))}
        {/* A finer tick between each pair of stops, purely to give the rim the
            graduated face of an instrument. */}
        {GROUPS.map((group, i) => (
          <span
            key={`half-${group.cat}`}
            className="absolute left-1/2 top-1/2 h-1.5 w-px origin-center bg-hairline-strong"
            style={{ transform: tickTransform(i * STEP + STEP / 2, "1px") }}
          />
        ))}
      </motion.div>

      {/* The labels. They ride the same rotation but each one counter-rotates
          so the text stays upright, which a rim of tangential type would not. */}
      <div
        role="radiogroup"
        aria-label="Discipline"
        onKeyDown={onKeyDown}
        className="absolute inset-0"
      >
        {GROUPS.map((group, i) => {
          const selected = i === index;
          return (
            <button
              key={group.cat}
              ref={(el) => {
                radios.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(i)}
              className={cn(
                "absolute left-1/2 top-1/2 flex flex-col items-center gap-1 whitespace-nowrap px-1 focus-visible:outline-none",
                "font-mono text-[10px] uppercase leading-none tracking-[0.12em] sm:text-[11px]",
                "transition-[color,transform] ease-heavy",
                reduced ? "duration-0" : "duration-950",
                // Gold marks the stop under the index, so the dial's position
                // is unmistakable without reading the figure.
                selected ? "text-aurum-200" : "text-ivory-300 hover:text-ivory-200"
              )}
              style={{ transform: rimTransform(i * STEP + rotation) } as CSSProperties}
            >
              <span aria-hidden>{group.cat}</span>
              <span aria-hidden className="tabular-nums text-ivory-300">
                {group.count}
              </span>
              <span className="sr-only">
                {group.label}, {group.count} {group.count === 1 ? "tool" : "tools"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Read window: the full name of whatever the mark is pointing at. */}
      <div
        className="pointer-events-none absolute flex flex-col items-center justify-center px-6 text-center"
        style={{ inset: "var(--dial-in)" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={GROUPS[index].cat}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={reduced ? { duration: 0.15 } : { duration: 0.5, ease: EASE_SETTLE }}
            className="flex flex-col items-center"
          >
            <span className="ledger font-display font-normal text-[2.75rem] leading-none text-ivory-100 lg:text-[3.25rem]">
              {GROUPS[index].count}
            </span>
            <span className="mt-2 font-mono text-[10px] uppercase leading-none tracking-[0.18em] text-ivory-300">
              tools
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
   Section
   ------------------------------------------------------------------------ */

export default function Skills() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  // Cumulative degrees, not index times step: accumulating the shortest signed
  // delta is what keeps the dial from unwinding 315 degrees to step back one.
  const [rotation, setRotation] = useState(0);
  const lastIndex = useRef(0);

  const select = useCallback((next: number) => {
    setRotation((current) => current - shortestStepDelta(lastIndex.current, next) * STEP);
    lastIndex.current = next;
    setIndex(next);
    selectSkillCategory(GROUPS[next].cat);
  }, []);

  // The ref, not the state, is the base: it is current the moment select
  // returns, so repeated steps in one frame each move a stop.
  const step = useCallback(
    (delta: number) => {
      const next = (lastIndex.current + delta + STOPS) % STOPS;
      select(next);
      return next;
    },
    [select]
  );

  // The dial always points somewhere, so the star chart is told what it is
  // pointing at on mount rather than waiting for a first interaction.
  useEffect(() => {
    selectSkillCategory(GROUPS[0].cat);
  }, []);

  const group = GROUPS[index];
  const panelRef = useRef<HTMLDivElement>(null);
  const panelInView = useInView(panelRef, { once: true, amount: 0.2 });

  const columns = useMemo(() => (group.skills.length > 8 ? "columns-2" : "columns-1"), [group.skills.length]);

  return (
    <section id="skills-sphere" className="relative w-full py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-8">
            <SectionHeading
              title="The working toolset."
              subtext="Turn the dial to a discipline. The star chart behind the page follows."
            />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-12 items-start gap-x-6 gap-y-14 lg:mt-20 lg:gap-x-10">
          <div className="col-span-12 lg:col-span-5">
            <Dial index={index} rotation={rotation} onSelect={select} onStep={step} reduced={reduced} />
          </div>

          {/* Reading window */}
          <div ref={panelRef} className="col-span-12 lg:col-span-6 lg:col-start-7">
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={panelInView ? { opacity: 1, y: 0 } : undefined}
              transition={reduced ? { duration: 0.2 } : { duration: 0.8, ease: EASE_SETTLE }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-hairline pb-4">
                <h3 className="font-display font-medium text-[26px] leading-[1.15] text-ivory-100 lg:text-[30px]">
                  {group.label}
                </h3>
                <span className="ledger font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ivory-300">
                  {group.count} of {TOTAL_TOOLS}
                </span>
              </div>

              {/* Keyed on the discipline so the list crossfades as one plate
                  rather than reflowing item by item. */}
              <div className="relative mt-8 min-h-80">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.ul
                    key={group.cat}
                    className={cn(columns, "gap-x-10")}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
                    transition={reduced ? { duration: 0.15 } : { duration: 0.45, ease: EASE_HEAVY }}
                  >
                    {group.skills.map((name) => (
                      <li
                        key={name}
                        className="break-inside-avoid font-sans text-[16px] leading-loose text-ivory-200 transition-colors duration-300 ease-heavy hover:text-ivory-100"
                      >
                        {name}
                      </li>
                    ))}
                  </motion.ul>
                </AnimatePresence>
              </div>

              <p className="mt-6 border-t border-hairline pt-4 font-mono text-[12px] leading-none tabular-nums text-ivory-300">
                {TOTAL_TOOLS} tools across {STOPS} disciplines
              </p>
            </motion.div>
          </div>
        </div>

        {/* Announces the dial's position without adding anything visual. */}
        <p className="sr-only" aria-live="polite">
          {`${group.label}, ${group.count} ${group.count === 1 ? "tool" : "tools"}.`}
        </p>
      </div>
    </section>
  );
}
