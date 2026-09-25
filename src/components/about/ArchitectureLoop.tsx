"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  EASE_HEAVY,
  EASE_SETTLE,
  type MotionValue,
} from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { SectionHeading, LedgerNumber } from "@/components/ui";
import { InViewClass } from "../Reveal";
import { cn } from "@/lib/utils";

/**
 * The method, drawn as a blueprint.
 *
 * Every autonomous system runs the same loop: perceive, decide, act, adapt,
 * around one intent that every agent holds. The diagram draws itself on
 * entry, then a gold signal travels the loop stage by stage while the panel
 * beside it names where that stage was actually built. The claim that this
 * is an architect's work is carried by the evidence, not by the drawing:
 * every figure and every name in STAGES is already on the record elsewhere
 * on the page.
 *
 * Motion is storytelling here, so it is sequential and slow: the signal
 * travels (1.1s, heavy), then dwells on a stage long enough to read it.
 * Hover, focus or selection hands control to the reader and pauses the
 * advance. The signal and its trail are written straight to the SVG from one
 * MotionValue, so a whole lap costs four React renders, one per stage.
 */

interface Stage {
  name: string;
  /** What the stage is, in one sentence. */
  line: string;
  /** The figure the stage is proven by: a numeral, or one word where the record has no number. */
  figure: string;
  figureCaption: string;
  /** Where it was built. */
  proof: string;
  where: string;
  /** What flows out of this stage along the loop to the next one. */
  carries: string;
}

const STAGES: Stage[] = [
  {
    name: "Perceive",
    line: "Read the world in whatever form it arrives: text and hours of video, in more than one language.",
    figure: "95%",
    figureCaption: "accuracy across 100+ hours of video",
    proof: "A multimodal, multilingual VideoRAG companion, built at Introspect Labs.",
    where: "Introspect Labs",
    carries: "Context",
  },
  {
    name: "Decide",
    line: "Many agents, one intent. Plans come from independent components that agree on the goal.",
    figure: "20%",
    figureCaption: "system resource load reduced",
    proof: "Autonomous agents architected at METAVERTEX, and FestFlow, which turns an event brief into schedules, budgets and vendors.",
    where: "METAVERTEX",
    carries: "Plan",
  },
  {
    name: "Act",
    line: "Close the loop without being asked. The system does the work, not just the report.",
    figure: "Self-healing",
    figureCaption: "exposures found and remediated automatically",
    proof: "The Matters.AI copilot finds data exposures the moment they open and remediates them unattended.",
    where: "Matters.AI",
    carries: "Outcome",
  },
  {
    name: "Adapt",
    line: "Every outcome tunes the next response. The system learns from the people it serves.",
    figure: "40%",
    figureCaption: "lift in retention",
    proof: "An empathic core at Introspect Labs that adapts its responses in real time.",
    where: "Introspect Labs",
    carries: "Feedback",
  },
];

const COUNT = STAGES.length;
const pad2 = (n: number) => String(n).padStart(2, "0");

/** Dwell on a stage before the signal moves on, in milliseconds. */
const DWELL_MS = 5600;

/* ------------------------------------------------------------------------
   Geometry, in SVG user units. The loop is a true circle, so every point on
   it is a sine and a cosine away and the trail can be a dash on one path.
   ------------------------------------------------------------------------ */

const VB_W = 640;
const VB_H = 560;
const CX = 320;
const CY = 280;
const R = 190;

/** Stage i sits at this angle, clockwise from twelve o'clock, in degrees. */
const stageAngle = (i: number) => -90 + (i * 360) / COUNT;

/* Geometry is rendered on the server and again in the browser, and the two
   engines' Math.cos and Math.sin can differ in the last digit, which React
   reports as a hydration mismatch on every attribute. Rounding to a
   thousandth of a unit, far below a device pixel, makes both agree. */
const fix = (v: number) => Math.round(v * 1000) / 1000;

function pointAt(angleDeg: number, radius = R) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: fix(CX + radius * Math.cos(a)), y: fix(CY + radius * Math.sin(a)) };
}

const NODES = STAGES.map((_, i) => pointAt(stageAngle(i)));

/* Starts at twelve o'clock and runs clockwise, matching the stage order. */
const LOOP_PATH = [
  `M ${CX} ${CY - R}`,
  `A ${R} ${R} 0 0 1 ${CX + R} ${CY}`,
  `A ${R} ${R} 0 0 1 ${CX} ${CY + R}`,
  `A ${R} ${R} 0 0 1 ${CX - R} ${CY}`,
  `A ${R} ${R} 0 0 1 ${CX} ${CY - R}`,
].join(" ");

/* The bezel: a ring of ticks outside the loop, one every three degrees and a
   long one every thirty, broken wherever a label sits (the four stations and
   the four quarter captions) the way a dial leaves room for its numerals. */
const BEZEL_IN = 254;
const BEZEL_OUT = 262;
const BEZEL_MAJOR_IN = 248;
const BEZEL_TICKS = (() => {
  const ticks: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = [];
  for (let deg = 0; deg < 360; deg += 3) {
    const fromStation = Math.min(...[0, 90, 180, 270, 360].map((a) => Math.abs(deg - a)));
    const fromQuarter = Math.min(...[45, 135, 225, 315].map((a) => Math.abs(deg - a)));
    if (fromStation < 14 || fromQuarter < 8) continue;
    const major = deg % 30 === 0;
    const a = ((deg - 90) * Math.PI) / 180;
    const r1 = major ? BEZEL_MAJOR_IN : BEZEL_IN;
    ticks.push({
      x1: fix(CX + r1 * Math.cos(a)),
      y1: fix(CY + r1 * Math.sin(a)),
      x2: fix(CX + BEZEL_OUT * Math.cos(a)),
      y2: fix(CY + BEZEL_OUT * Math.sin(a)),
      major,
    });
  }
  return ticks;
})();

/** An arc of the bezel's radius spanning `half` degrees either side of twelve o'clock. */
function bezelArc(half: number) {
  const r = (BEZEL_OUT + BEZEL_MAJOR_IN) / 2;
  const a = pointAt(-90 - half, r);
  const b = pointAt(-90 + half, r);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

/** The trail is measured against pathLength, so the browser's own arc length never matters. */
const PATH_UNITS = 1000;
const TRAIL = 150;

/** As a percentage of the drawing, for the HTML labels laid over it. */
const pct = (p: { x: number; y: number }) => ({ left: `${(p.x / VB_W) * 100}%`, top: `${(p.y / VB_H) * 100}%` });

/* Label placement per stage: outside the loop, away from the centre. On a
   phone the two side labels sit above their nodes instead, because beside
   them they would run off a 342px drawing. */
const LABEL_PLACE = [
  "-translate-x-1/2 -translate-y-[calc(100%_+_20px)] items-center text-center",
  "-translate-x-1/2 -translate-y-[calc(100%_+_16px)] items-center text-center sm:translate-x-[22px] sm:-translate-y-1/2 sm:items-start sm:text-left",
  "-translate-x-1/2 translate-y-[20px] items-center text-center",
  "-translate-x-1/2 -translate-y-[calc(100%_+_16px)] items-center text-center sm:-translate-x-[calc(100%_+_22px)] sm:-translate-y-1/2 sm:items-end sm:text-right",
];

/* ------------------------------------------------------------------------
   Diagram
   ------------------------------------------------------------------------ */

function Diagram({
  active,
  position,
  onSelect,
  reduced,
}: {
  active: number;
  position: MotionValue<number>;
  onSelect: (i: number) => void;
  reduced: boolean;
}) {
  const signalRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const bezelLightRef = useRef<SVGGElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  /* Fixed ids: the loop appears once, and useId cannot be trusted inside a
     next/dynamic chunk, whose server render carries preload siblings the
     client tree does not, so the generated ids differ across hydration. */
  const gridId = "loop-grid";
  const glowId = "loop-glow";
  const fadeId = "loop-fade";
  const ticksId = "loop-ticks";

  /* One write per frame while the signal travels, none while it rests. */
  const paint = useCallback((pos: number) => {
    const lap = ((pos % COUNT) + COUNT) % COUNT;
    const p = pointAt(-90 + (lap / COUNT) * 360);
    signalRef.current?.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
    // The dash covers [s - TRAIL, s]; the pattern repeats every PATH_UNITS,
    // so a trail straddling twelve o'clock wraps cleanly onto both ends.
    const s = (lap / COUNT) * PATH_UNITS;
    trailRef.current?.setAttribute("stroke-dashoffset", (TRAIL - s).toFixed(2));
    // The bezel catches the light where the signal is, like a dial under a lamp.
    bezelLightRef.current?.setAttribute("transform", `rotate(${((lap / COUNT) * 360).toFixed(2)} ${CX} ${CY})`);
  }, []);

  /* The drawing leans a few degrees toward the mouse, as a plate on a desk
     does when it is picked up to be read. Its own listener, written straight
     to the node; still under reduced motion and on touch. */
  const onTilt = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (reduced || e.pointerType !== "mouse") return;
      const el = tiltRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1400px) rotateX(${(-ny * 7).toFixed(2)}deg) rotateY(${(nx * 7).toFixed(2)}deg)`;
    },
    [reduced]
  );
  const onTiltEnd = useCallback(() => {
    if (tiltRef.current) tiltRef.current.style.transform = "";
  }, []);

  useMotionValueEvent(position, "change", paint);
  useEffect(() => paint(position.get()), [paint, position]);

  return (
    <InViewClass amount={0.35} className="relative mx-auto w-full max-w-[620px] py-10 sm:py-6">
      <div
        ref={tiltRef}
        onPointerMove={onTilt}
        onPointerLeave={onTiltEnd}
        className="relative transition-transform duration-700 ease-settle [transform-style:preserve-3d]"
      >
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="block h-auto w-full overflow-visible" aria-hidden>
          <defs>
            <pattern id={gridId} width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="14" cy="14" r="0.9" className="fill-ivory-100" fillOpacity="0.09" />
            </pattern>
            <radialGradient id={fadeId} cx="50%" cy="50%" r="50%">
              <stop offset="55%" stopColor="#fff" stopOpacity="1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id={`${fadeId}-mask`}>
              <rect width={VB_W} height={VB_H} fill={`url(#${fadeId})`} />
            </mask>
            <mask id={ticksId} maskUnits="userSpaceOnUse" x="0" y="0" width={VB_W} height={VB_H}>
              <g stroke="#fff" strokeWidth={1.6}>
                {BEZEL_TICKS.map((t, i) => (
                  <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
                ))}
              </g>
            </mask>
            <radialGradient id={glowId}>
              <stop offset="0%" className="[stop-color:var(--color-aurum-100)]" stopOpacity="0.85" />
              <stop offset="100%" className="[stop-color:var(--color-aurum-300)]" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Drafting ground: a dot grid that thins out toward the edges. */}
          <rect width={VB_W} height={VB_H} fill={`url(#${gridId})`} mask={`url(#${fadeId}-mask)`} />

          {/* Construction: the two axes and a dimension ring, dashed. */}
          <g className="stroke-hairline" fill="none" strokeWidth={1} strokeDasharray="2 7">
            <line x1={CX - R - 80} y1={CY} x2={CX + R + 80} y2={CY} />
            <line x1={CX} y1={CY - R - 70} x2={CX} y2={CY + R + 70} />
            <circle cx={CX} cy={CY} r={R + 40} />
            <circle cx={CX} cy={CY} r={R * 0.42} />
          </g>

          {/* The bezel, and the light it catches from the signal: gold arcs
              that turn with the signal, visible only through the ticks. */}
          <g className="stroke-hairline-strong" strokeWidth={1}>
            {BEZEL_TICKS.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeOpacity={t.major ? 1 : 0.6} />
            ))}
          </g>
          <g mask={`url(#${ticksId})`}>
            <g ref={bezelLightRef}>
              <path d={bezelArc(34)} fill="none" strokeWidth={18} className="stroke-aurum-400" strokeOpacity={0.35} />
              <path d={bezelArc(18)} fill="none" strokeWidth={18} className="stroke-aurum-300" strokeOpacity={0.7} />
              <path d={bezelArc(7)} fill="none" strokeWidth={18} className="stroke-aurum-100" />
            </g>
          </g>

          {/* Registration marks, the way a drawing is squared on the sheet. */}
          <g className="stroke-hairline-strong" strokeWidth={1}>
            {[
              [28, 28],
              [VB_W - 28, 28],
              [28, VB_H - 28],
              [VB_W - 28, VB_H - 28],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <line x1={x - 7} y1={y} x2={x + 7} y2={y} />
                <line x1={x} y1={y - 7} x2={x} y2={y + 7} />
              </g>
            ))}
          </g>

          {/* Spokes: every stage answers to the intent at the centre. */}
          <g className="stroke-hairline-strong" strokeWidth={1}>
            {NODES.map((n, i) => (
              <line
                key={i}
                x1={n.x}
                y1={n.y}
                x2={CX}
                y2={CY}
                pathLength={1}
                className="draw-path"
                style={{ "--draw-delay": `${700 + i * 90}ms` } as CSSProperties}
              />
            ))}
          </g>

          {/* The loop, drawn once from twelve o'clock as the section arrives. */}
          <path
            d={LOOP_PATH}
            pathLength={1}
            fill="none"
            strokeWidth={1}
            className="draw-path stroke-ivory-300"
            style={{ "--draw-delay": "150ms" } as CSSProperties}
          />

          {/* Direction: a chevron at each quarter, pointing the way the loop runs. */}
          <g className="stroke-aurum-400" fill="none" strokeWidth={1.2}>
            {STAGES.map((_, i) => {
              const angle = stageAngle(i) + 360 / COUNT / 2;
              const p = pointAt(angle);
              return (
                <path
                  key={i}
                  d="M -4 -5 L 2 0 L -4 5"
                  transform={`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${angle + 90})`}
                />
              );
            })}
          </g>

          {/* Trail: a gold segment of the loop, ending at the signal. */}
          <path
            ref={trailRef}
            d={LOOP_PATH}
            pathLength={PATH_UNITS}
            fill="none"
            strokeWidth={1.6}
            className="stroke-aurum-300"
            strokeDasharray={`${TRAIL} ${PATH_UNITS - TRAIL}`}
            strokeDashoffset={TRAIL}
          />

          {/* Intent */}
          <rect
            x={CX - 7}
            y={CY - 7}
            width={14}
            height={14}
            transform={`rotate(45 ${CX} ${CY})`}
            className="fill-obsidian-0 stroke-aurum-300"
            strokeWidth={1}
          />
          <rect
            x={CX - 2.5}
            y={CY - 2.5}
            width={5}
            height={5}
            transform={`rotate(45 ${CX} ${CY})`}
            className="fill-aurum-300"
          />

          {/* Stage nodes */}
          {NODES.map((n, i) => (
            <rect
              key={i}
              x={n.x - 6.5}
              y={n.y - 6.5}
              width={13}
              height={13}
              transform={`rotate(45 ${n.x} ${n.y})`}
              strokeWidth={1}
              className={cn(
                "transition-[fill,stroke] duration-500 ease-heavy",
                i === active ? "fill-aurum-200 stroke-aurum-200" : "fill-obsidian-0 stroke-ivory-300"
              )}
            />
          ))}

          {/* Signal */}
          <g ref={signalRef} transform={`translate(${NODES[0].x} ${NODES[0].y})`}>
            <circle r={16} fill={`url(#${glowId})`} opacity={0.6} />
            <circle r={2.6} className="fill-aurum-100" />
          </g>
        </svg>

        {/* HTML over the drawing: labels stay at their set size at every
            width, where SVG text would shrink with the drawing on a phone. */}
        <div aria-hidden className="absolute inset-0">
          {/* The centre */}
          <div className="absolute flex -translate-x-1/2 translate-y-[18px] flex-col items-center" style={pct({ x: CX, y: CY })}>
            {/* A drawing breaks its line where a label sits, so the spoke
                beneath does not strike through the word. */}
            <span className="bg-obsidian-0 px-2 font-display text-[22px] italic leading-none text-ivory-100">Intent</span>
            <span className="mt-1 hidden whitespace-nowrap bg-obsidian-0 px-2 py-1 font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-ivory-300 sm:block">
              Held by every agent
            </span>
          </div>

          {/* What travels along each quarter */}
          {STAGES.map((stage, i) => {
            const angle = stageAngle(i) + 360 / COUNT / 2;
            return (
              <span
                key={stage.carries}
                className="absolute hidden -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-ivory-300 sm:block"
                style={pct(pointAt(angle, R + 40))}
              >
                <span className="bg-obsidian-0 px-1.5">{stage.carries}</span>
              </span>
            );
          })}

          {/* Stage labels and their pulse. The labels are also a pointer
              shortcut; the keyboard route is the tab list beside the drawing. */}
          {STAGES.map((stage, i) => {
            const isActive = i === active;
            return (
              <div key={stage.name}>
                {isActive && !reduced ? (
                  <span
                    className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2"
                    style={pct(NODES[i])}
                  >
                    <span className="node-pulse block size-full rotate-45 border border-aurum-200" />
                  </span>
                ) : null}
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => onSelect(i)}
                  data-cursor="Select"
                  className={cn("group absolute flex flex-col gap-1.5", LABEL_PLACE[i])}
                  style={pct(NODES[i])}
                >
                  <span
                    className={cn(
                      "ledger font-mono text-[10px] leading-none tracking-[0.16em] transition-colors duration-500 ease-heavy",
                      isActive ? "text-aurum-300" : "text-ivory-300 group-hover:text-ivory-200"
                    )}
                  >
                    {pad2(i + 1)}
                  </span>
                  <span
                    className={cn(
                      "font-display text-[22px] leading-none transition-colors duration-500 ease-heavy sm:text-[26px]",
                      isActive ? "text-aurum-200" : "text-ivory-100 group-hover:text-aurum-200"
                    )}
                  >
                    {stage.name}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </InViewClass>
  );
}

/* ------------------------------------------------------------------------
   Section block
   ------------------------------------------------------------------------ */

export default function ArchitectureLoop() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const inView = useInView(rootRef, { amount: 0.35 });

  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  /* Position on the loop in stage units. Only ever increases: the loop runs
     one way, so a step back is three quarters forward, never a reversal. */
  const position = useMotionValue(0);

  const go = useCallback(
    (next: number) => {
      setActive(next);
      const current = position.get();
      let target = Math.floor(current / COUNT) * COUNT + next;
      if (target < current - 0.001) target += COUNT;
      const distance = target - current;
      if (distance < 0.001) return;
      if (reduced) position.set(target);
      else animate(position, target, { duration: Math.min(0.8 + distance * 0.3, 1.9), ease: EASE_HEAVY });
    },
    [position, reduced]
  );

  const running = inView && !hovered && !focused && !reduced;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => go((active + 1) % COUNT), DWELL_MS);
    return () => window.clearTimeout(id);
  }, [running, active, go]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (active + 1) % COUNT;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (active - 1 + COUNT) % COUNT;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = COUNT - 1;
    if (next === null) return;
    e.preventDefault();
    go(next);
    tabRefs.current[next]?.focus();
  };

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
  };

  const stage = STAGES[active];
  const panelId = "loop-panel";
  const tabId = (i: number) => `loop-tab-${i}`;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 pb-32 lg:px-10 lg:pb-40">
      {/* A section break between the thesis and its method: two rules drawn
          out from a gold lozenge, the ornament a printed book sets between
          movements of one chapter. */}
      <InViewClass amount={0.8} className="mb-20 flex items-center justify-center gap-5 lg:mb-28">
        <span aria-hidden className="rule-draw !w-20 [transform-origin:right] sm:!w-32" />
        <span aria-hidden className="size-2 rotate-45 border border-aurum-300" />
        <span aria-hidden className="rule-draw !w-20 sm:!w-32" />
      </InViewClass>

      <div className="grid grid-cols-12 gap-x-6">
        <div className="col-span-12 lg:col-span-8">
          <SectionHeading
            eyebrow="THE METHOD"
            title="The architecture of autonomy."
            subtext="Every system I ship runs one loop: four stages around a single intent. Choose a stage to see where I built it."
          />
        </div>
      </div>

      <div
        ref={rootRef}
        className="mt-12 grid grid-cols-12 items-center gap-x-6 gap-y-10 lg:mt-16 lg:gap-x-10"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={onBlur}
      >
        <div className="col-span-12 lg:col-span-7">
          <Diagram active={active} position={position} onSelect={go} reduced={reduced} />
        </div>

        <div className="col-span-12 lg:col-span-5">
          {/* Stage panel */}
          <div
            id={panelId}
            role="tabpanel"
            tabIndex={0}
            aria-labelledby={tabId(active)}
            className="relative isolate min-h-[23rem] sm:min-h-[21rem]"
          >
            {/* The stage's numeral, struck in outline behind the panel at a
                scale nothing else on the page uses. */}
            <AnimatePresence initial={false}>
              <motion.span
                key={active}
                aria-hidden
                className="pointer-events-none absolute -right-1 -top-3 -z-10 select-none font-display text-[8rem] sm:-top-20 sm:text-[9rem] leading-none text-transparent [-webkit-text-stroke:1px_var(--color-hairline-gold)] lg:-top-24 lg:text-[12.5rem]"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0, transition: { duration: reduced ? 0.15 : 1.1, ease: EASE_SETTLE } }}
                exit={{ opacity: 0, transition: { duration: reduced ? 0.1 : 0.4, ease: EASE_SETTLE } }}
              >
                {pad2(active + 1)}
              </motion.span>
            </AnimatePresence>

            <div className="flex items-center justify-between gap-6 border-b border-hairline pb-4 font-mono text-[11px] uppercase leading-none tracking-[0.14em]">
              <span className="ledger text-ivory-300">
                Stage <span className="text-aurum-300">{pad2(active + 1)}</span>
                <span className="px-1.5 text-ivory-300/60">/</span>
                {pad2(COUNT)}
              </span>
              <span className="text-ivory-200">{stage.where}</span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={reduced ? { duration: 0.15 } : { duration: 0.5, ease: EASE_SETTLE }}
              >
                <h3 className="mt-7 font-display text-[2.5rem] leading-none text-ivory-100 lg:text-[3.25rem]">
                  {stage.name}
                </h3>
                <p className="mt-5 max-w-[42ch] font-sans text-[16px] leading-[1.65] text-ivory-200 lg:text-[17px]">
                  {stage.line}
                </p>

                <div className="mt-8 flex flex-wrap items-end gap-x-5 gap-y-3 border-t border-hairline pt-6">
                  <LedgerNumber
                    value={stage.figure}
                    className="font-display text-[2.5rem] leading-[0.95] text-aurum-200 lg:text-[3rem]"
                  />
                  <span className="pb-1 font-mono text-[11px] uppercase leading-[1.5] tracking-[0.14em] text-ivory-300">
                    {stage.figureCaption}
                  </span>
                </div>

                <p className="mt-5 max-w-[46ch] font-sans text-[15px] leading-[1.6] text-ivory-300">{stage.proof}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stages: the keyboard route through the loop. The active tab
              carries the dwell line, so the advance is never a surprise. */}
          <div
            role="tablist"
            aria-label="Stages of the loop"
            onKeyDown={onKeyDown}
            className="mt-8 grid grid-cols-4 border-t border-hairline"
          >
            {STAGES.map((s, i) => {
              const isActive = i === active;
              return (
                <button
                  key={s.name}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={tabId(i)}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => go(i)}
                  className={cn(
                    "group relative flex flex-col items-start gap-2 pb-1 pt-4 text-left transition-colors duration-300 ease-heavy",
                    isActive ? "text-ivory-100" : "text-ivory-300 hover:text-ivory-200"
                  )}
                >
                  <span aria-hidden className="absolute inset-x-0 -top-px h-px">
                    {isActive ? (
                      reduced ? (
                        <span className="block h-full w-full bg-aurum-300" />
                      ) : (
                        <motion.span
                          key={`${active}-${running}`}
                          className="block h-full w-full origin-left bg-aurum-300"
                          initial={{ scaleX: running ? 0 : 1 }}
                          animate={{ scaleX: 1 }}
                          transition={running ? { duration: DWELL_MS / 1000, ease: "linear" } : { duration: 0.35, ease: EASE_HEAVY }}
                        />
                      )
                    ) : (
                      <span className="block h-full w-full origin-left scale-x-0 bg-hairline-strong transition-transform duration-300 ease-heavy group-hover:scale-x-100" />
                    )}
                  </span>
                  <span aria-hidden className={cn("ledger font-mono text-[10px] leading-none tracking-[0.16em]", isActive && "text-aurum-300")}>
                    {pad2(i + 1)}
                  </span>
                  <span className="font-sans text-[13px] leading-none sm:text-[14px]">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
