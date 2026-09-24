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
 * The dial can be turned three ways: a label on the rim, the crown buttons
 * beneath it (and the arrow keys), or a hand on the face. The hand drives a
 * MotionValue directly, so the frame follows at display rate with no React
 * render in the loop, through a tight spring that smooths pointer jitter into
 * the motion of a weighted bezel. Lifting off, the dial carries a little of
 * the hand's speed and settles into the nearest detent.
 *
 * The exclusive selection lives in scene-store, shared with the CosmicScene
 * star chart, so turning the dial also lights the matching points behind the
 * page.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  EASE_HEAVY,
  EASE_SETTLE,
  type MotionValue,
} from "@/lib/motion";
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

/** Graduations between two stops, the way a bezel carries minutes between hours. */
const MINORS_PER_STEP = 10;
const MINOR_STEP = STEP / MINORS_PER_STEP;

/**
 * Shortest signed number of stops from a to b. A bezel never travels the long
 * way round to reach its neighbour, so a move from the last stop to the first
 * is one step forward, not seven back.
 */
function shortestStepDelta(from: number, to: number): number {
  const forward = (to - from + STOPS) % STOPS;
  return forward > STOPS / 2 ? forward - STOPS : forward;
}

/** The stop that sits under the index for a given cumulative rotation. */
function stopAt(rotation: number): number {
  return ((Math.round(-rotation / STEP) % STOPS) + STOPS) % STOPS;
}

/** Folds a raw angular delta into (-180, 180] so a pointer crossing the seam does not spin the dial. */
function foldDelta(delta: number): number {
  return ((((delta + 180) % 360) + 360) % 360) - 180;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------------
   Motion: the three ways the dial turns, each with its own character.
   ------------------------------------------------------------------------ */

/** Under the hand: follows closely, but as a mass, not a cursor. */
const FOLLOW = { type: "spring", stiffness: 520, damping: 46, mass: 0.55, restDelta: 0.01 } as const;

/** Released: carries into the detent and seats with a whisper of overshoot. */
const SEAT = { type: "spring", stiffness: 170, damping: 24, mass: 1, restDelta: 0.01 } as const;

/** Selected from a distance: the weighted turn of a bezel. */
const TRAVEL = { duration: 0.95, ease: EASE_HEAVY } as const;

/** Seconds of the hand's angular velocity carried into the throw on release. */
const THROW = 0.14;

/** A throw will not skip more than this many stops, so the dial never runs away. */
const MAX_THROW_STOPS = 2;

/* ------------------------------------------------------------------------
   Dial
   ------------------------------------------------------------------------ */

/**
 * A rim label's seat: the frame is rotated to the stop's angle and pushed out
 * to the rim. The label inside counter-rotates (see RimLabel) so the text
 * itself never tilts. The radius comes from --dial-r so it stays responsive
 * while React owns only the angle.
 */
function rimTransform(angle: number): string {
  return `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(var(--dial-r) * -1))`;
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

interface RimLabelProps {
  group: CategoryGroup;
  angle: number;
  selected: boolean;
  rotation: MotionValue<number>;
  onSelect: () => void;
  register: (el: HTMLButtonElement | null) => void;
}

/**
 * One label on the rim. It rides the turning frame and counter-rotates by the
 * frame's own value, read off the same MotionValue, so it stays upright at
 * every instant of a drag without a render.
 */
function RimLabel({ group, angle, selected, rotation, onSelect, register }: RimLabelProps) {
  const upright = useTransform(rotation, (r) => -angle - r);
  return (
    <button
      ref={register}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      className="absolute left-1/2 top-1/2 cursor-pointer p-2.5 focus-visible:outline-none"
      style={{ transform: rimTransform(angle) } as CSSProperties}
    >
      <motion.span
        className={cn(
          "flex flex-col items-center gap-1.5 whitespace-nowrap",
          "font-mono text-[10px] uppercase leading-none tracking-[0.14em] sm:text-[11px]",
          "transition-colors duration-500 ease-heavy",
          // Gold marks the stop under the index, so the dial's position is
          // unmistakable without reading the figure.
          selected ? "text-aurum-200" : "text-ivory-300 hover:text-ivory-100"
        )}
        style={{ rotate: upright }}
      >
        <span aria-hidden>{group.cat}</span>
        <span
          aria-hidden
          className={cn(
            "tabular-nums transition-colors duration-500 ease-heavy",
            selected ? "text-aurum-400" : "text-ivory-300/70"
          )}
        >
          {pad2(group.count)}
        </span>
        <span className="sr-only">
          {group.label}, {group.count} {group.count === 1 ? "tool" : "tools"}
        </span>
      </motion.span>
    </button>
  );
}

interface DialProps {
  index: number;
  rotation: MotionValue<number>;
  dragging: boolean;
  onSelect: (index: number) => void;
  /** Turns by a signed number of stops and returns where it landed. */
  onStep: (delta: number) => number;
  onDragStart: () => void;
  /** Live: the hand has moved by this many degrees. */
  onDrag: (deltaDegrees: number) => void;
  onDragEnd: () => void;
  reduced: boolean;
}

function Dial({ index, rotation, dragging, onSelect, onStep, onDragStart, onDrag, onDragEnd, reduced }: DialProps) {
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const face = useRef<HTMLDivElement>(null);

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

  /* Drag to turn. The hand is tracked on the window rather than with pointer
     capture: capture would redirect the click to the face and the rim labels
     would stop working as buttons. A press that never travels stays a click;
     one that does is swallowed at the capture phase so lifting off a label
     does not also select it. */
  const hand = useRef<{ id: number; angle: number; x: number; y: number; moved: boolean } | null>(null);
  const swallowClick = useRef(false);

  const angleOf = (x: number, y: number) => {
    const rect = face.current!.getBoundingClientRect();
    return (Math.atan2(y - (rect.top + rect.height / 2), x - (rect.left + rect.width / 2)) * 180) / Math.PI;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !face.current) return;
    hand.current = {
      id: event.pointerId,
      angle: angleOf(event.clientX, event.clientY),
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };

    const move = (e: PointerEvent) => {
      const h = hand.current;
      if (!h || e.pointerId !== h.id) return;
      if (!h.moved) {
        if (Math.hypot(e.clientX - h.x, e.clientY - h.y) < 4) return;
        h.moved = true;
        onDragStart();
      }
      const angle = angleOf(e.clientX, e.clientY);
      onDrag(foldDelta(angle - h.angle));
      h.angle = angle;
    };
    const lift = (e: PointerEvent) => {
      const h = hand.current;
      if (!h || e.pointerId !== h.id) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", lift);
      window.removeEventListener("pointercancel", lift);
      hand.current = null;
      if (h.moved) {
        onDragEnd();
        swallowClick.current = true;
        // A click follows pointerup in the same task; if the hand lifted off
        // the dial none arrives, so the flag must not linger.
        setTimeout(() => {
          swallowClick.current = false;
        }, 0);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", lift);
    window.addEventListener("pointercancel", lift);
  };

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const minors = useMemo(
    () => Array.from({ length: STOPS * MINORS_PER_STEP }, (_, i) => i).filter((i) => i % MINORS_PER_STEP !== 0),
    []
  );

  const group = GROUPS[index];

  return (
    <div
      className={cn(
        // --dial-r is the radius the labels ride, --dial-tick the graduated
        // band against the bezel, --dial-in the inset of the subdial rule
        // around the figure. The three are set so the widest label clears both
        // the ticks outside it and the subdial inside it.
        "mx-auto w-[300px] [--dial-in:85px] [--dial-r:100px] [--dial-tick:142px]",
        "sm:w-[340px] sm:[--dial-in:95px] sm:[--dial-r:114px] sm:[--dial-tick:162px]",
        "lg:mx-0 lg:w-[380px] lg:[--dial-in:105px] lg:[--dial-r:128px] lg:[--dial-tick:176px]"
      )}
    >
      <div
        ref={face}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        className={cn("relative aspect-square w-full select-none", dragging ? "cursor-grabbing" : "cursor-grab")}
        // pan-y leaves vertical page scroll to the browser on touch; a finger
        // travelling around the rim still turns the dial.
        style={{ touchAction: "pan-y" }}
      >
        {/* The face: a shallow dome of ground, darker at the bezel, so the
            dial reads as an object set into the page rather than a line
            drawing on it. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 42%, var(--color-obsidian-2) 0%, var(--color-obsidian-1) 48%, transparent 74%)",
            boxShadow:
              "inset 0 1px 0 color-mix(in srgb, var(--color-ivory-100) 6%, transparent), inset 0 0 56px rgba(12, 10, 8, 0.65)",
          }}
        />

        {/* Bezel sheen: a brushed ring that catches light at ten o'clock and
            again, fainter and cooler, opposite. Masked to the outer 14px. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 200deg, transparent 0deg, color-mix(in srgb, var(--color-aurum-300) 26%, transparent) 42deg, color-mix(in srgb, var(--color-aurum-100) 10%, transparent) 70deg, transparent 110deg, transparent 200deg, color-mix(in srgb, var(--color-ivory-100) 9%, transparent) 250deg, transparent 300deg)",
            WebkitMaskImage:
              "radial-gradient(circle closest-side, transparent calc(100% - 14px), #000 calc(100% - 13px))",
            maskImage: "radial-gradient(circle closest-side, transparent calc(100% - 14px), #000 calc(100% - 13px))",
          }}
        />

        {/* Bezel and inner rule. Two concentric hairlines, the same double frame
            the portrait plate uses, plus the bezel's inner edge. */}
        <span aria-hidden className="absolute inset-0 rounded-full border border-hairline-strong" />
        <span aria-hidden className="absolute inset-[13px] rounded-full border border-hairline" />
        <span aria-hidden className="absolute rounded-full border border-hairline" style={{ inset: "var(--dial-in)" }} />

        {/* Detent window: a gold arc one stop wide, fixed under the index, so
            the reader can see the zone a label has to settle into. */}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "calc(var(--dial-tick) * 2 + 18px)",
            height: "calc(var(--dial-tick) * 2 + 18px)",
            background: `conic-gradient(from ${-STEP / 2}deg, transparent 0deg, var(--color-hairline-gold) ${STEP * 0.2}deg, var(--color-hairline-gold) ${STEP * 0.8}deg, transparent ${STEP}deg, transparent 360deg)`,
            WebkitMaskImage:
              "radial-gradient(circle closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1px))",
            maskImage: "radial-gradient(circle closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1px))",
          }}
        />

        {/* Index mark at twelve o'clock: the one thing on the dial that never
            moves, so the reader always knows where to read. It strikes once
            each time a new stop lands under it, which under the hand is the
            click of a detent. */}
        <motion.span
          key={index}
          aria-hidden
          className="absolute left-1/2 top-[-3px] flex origin-top -translate-x-1/2 flex-col items-center"
          initial={reduced ? false : { scaleY: 0.6, opacity: 0.4 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE_SETTLE }}
        >
          <span className="h-1.5 w-1.5 rotate-45 bg-aurum-200 shadow-[0_0_10px_var(--color-aurum-300)]" />
          <span className="h-5 w-px bg-aurum-300 shadow-[0_0_8px_var(--color-aurum-400)]" />
        </motion.span>

        {/* Everything that turns: graduations, stop ticks and the labels. The
            frame is bound straight to the MotionValue, so it moves at display
            rate whether a spring or the hand is driving it. */}
        <motion.div
          role="radiogroup"
          aria-label="Discipline"
          onKeyDown={onKeyDown}
          className="absolute inset-0 will-change-transform"
          style={{ rotate: rotation }}
        >
          {/* Minor graduations, the fifth in each run a touch longer, purely
              to give the rim the graduated face of an instrument. */}
          {minors.map((i) => {
            const mid = i % MINORS_PER_STEP === MINORS_PER_STEP / 2;
            return (
              <span
                key={`minor-${i}`}
                aria-hidden
                className={cn(
                  "absolute left-1/2 top-1/2 w-px origin-center",
                  mid ? "h-2 bg-hairline-strong" : "h-1 bg-hairline"
                )}
                style={{ transform: tickTransform(i * MINOR_STEP, mid ? "1px" : "2px") }}
              />
            );
          })}

          {GROUPS.map((g, i) => (
            <span
              key={`tick-${g.cat}`}
              aria-hidden
              className={cn(
                "absolute left-1/2 top-1/2 h-3.5 w-px origin-center transition-colors duration-500 ease-heavy",
                i === index ? "bg-aurum-300" : "bg-ivory-300"
              )}
              style={{ transform: tickTransform(i * STEP, "0px") }}
            />
          ))}

          {GROUPS.map((g, i) => (
            <RimLabel
              key={g.cat}
              group={g}
              angle={i * STEP}
              selected={i === index}
              rotation={rotation}
              onSelect={() => onSelect(i)}
              register={(el) => {
                radios.current[i] = el;
              }}
            />
          ))}
        </motion.div>

        {/* Read window: the figure under the mark. */}
        <div
          className="pointer-events-none absolute flex flex-col items-center justify-center px-6 text-center"
          style={{ inset: "var(--dial-in)" }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={group.cat}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={reduced ? { duration: 0.15 } : { duration: 0.5, ease: EASE_SETTLE }}
              className="flex flex-col items-center"
            >
              <span className="ledger font-display font-normal text-[3rem] leading-none text-ivory-100 lg:text-[3.5rem]">
                {group.count}
              </span>
              <span aria-hidden className="mt-3 h-px w-4 bg-hairline-gold" />
              <span className="mt-3 font-mono text-[10px] uppercase leading-none tracking-[0.2em] text-ivory-300">
                {group.count === 1 ? "tool" : "tools"}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Crown: step controls and the position, for anyone who would rather
          not drag or read the rim. */}
      <div className="mt-7 flex items-center justify-between">
        <StepButton label="Previous discipline" onClick={() => onStep(-1)}>
          <CaretLeft size={16} weight="light" aria-hidden />
        </StepButton>
        <span className="ledger font-mono text-[11px] uppercase leading-none tracking-[0.18em] text-ivory-300">
          <span className="text-ivory-100">{pad2(index + 1)}</span>
          <span className="mx-2 text-ivory-300/60">/</span>
          {pad2(STOPS)}
        </span>
        <StepButton label="Next discipline" onClick={() => onStep(1)}>
          <CaretRight size={16} weight="light" aria-hidden />
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-11 w-11 cursor-pointer items-center justify-center border border-hairline text-ivory-300",
        "transition-colors duration-300 ease-heavy hover:border-hairline-gold hover:text-aurum-200 active:text-aurum-100"
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------------
   Section
   ------------------------------------------------------------------------ */

export default function Skills() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);

  // The dial's angle is a MotionValue, not state: the hand and the springs
  // write to it every frame and nothing in React needs to re-render for that.
  // `target` is where the dial is heading, in cumulative degrees (never
  // wrapped, so a step back from the first stop is 45 degrees, not 315), and
  // the stop under the index is always read from the target rather than the
  // moving value, so the panel changes once per turn, not once per stop
  // passed on the way.
  const rotation = useMotionValue(0);
  const target = useRef(0);
  const lastIndex = useRef(0);

  const point = useCallback((next: number) => {
    if (next === lastIndex.current) return;
    lastIndex.current = next;
    setIndex(next);
    selectSkillCategory(GROUPS[next].cat);
  }, []);

  /** Turns the dial to a stop the way a hand would set a bezel: the short way round, with weight. */
  const select = useCallback(
    (next: number) => {
      target.current -= shortestStepDelta(lastIndex.current, next) * STEP;
      point(next);
      if (reduced) rotation.set(target.current);
      else animate(rotation, target.current, TRAVEL);
    },
    [point, reduced, rotation]
  );

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

  /* The hand. On the first movement the target is re-based to wherever the
     dial actually is, so grabbing a dial mid-turn takes it over cleanly
     instead of yanking it to the end of its journey. Each move advances the
     target and lets a tight spring carry the frame there: the spring is what
     makes a shaky pointer feel like a smooth, heavy turn. */
  const onDragStart = useCallback(() => {
    target.current = rotation.get();
    setDragging(true);
  }, [rotation]);

  const onDrag = useCallback(
    (delta: number) => {
      target.current += delta;
      point(stopAt(target.current));
      if (reduced) rotation.set(target.current);
      else animate(rotation, target.current, FOLLOW);
    },
    [point, reduced, rotation]
  );

  /* Lifting off. The dial keeps a fraction of the hand's speed, then seats
     itself in the nearest detent to where that carry would have taken it,
     never more than two stops on. */
  const onDragEnd = useCallback(() => {
    setDragging(false);
    const here = target.current;
    const thrown = reduced ? here : here + rotation.getVelocity() * THROW;
    const limit = MAX_THROW_STOPS * STEP;
    const carried = Math.max(here - limit, Math.min(here + limit, thrown));
    target.current = Math.round(carried / STEP) * STEP;
    point(stopAt(target.current));
    if (reduced) rotation.set(target.current);
    else animate(rotation, target.current, SEAT);
  }, [point, reduced, rotation]);

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
              chapter="skills-sphere"
              eyebrow={`${TOTAL_TOOLS} TOOLS, ${STOPS} DISCIPLINES`}
              title="The working toolset."
              subtext="Turn the dial to a discipline, by hand or by the crown. The star chart behind the page follows."
            />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-12 items-start gap-x-6 gap-y-14 lg:mt-20 lg:gap-x-10">
          <div className="col-span-12 lg:col-span-5">
            <Dial
              index={index}
              rotation={rotation}
              dragging={dragging}
              onSelect={select}
              onStep={step}
              onDragStart={onDragStart}
              onDrag={onDrag}
              onDragEnd={onDragEnd}
              reduced={reduced}
            />
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
