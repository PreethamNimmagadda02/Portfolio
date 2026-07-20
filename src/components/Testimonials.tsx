"use client";

import { motion, useInView } from "@/lib/motion";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Quote, Star, Sparkles, MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { InViewClass, SectionKicker } from "./Reveal";
import InteractiveCard from "./InteractiveCard";

const testimonials = [
  {
    quote: "Preetham's ability to architect AI systems from scratch is genuinely rare for someone his age. His VideoRAG pipeline was production-grade.",
    name: "Dr. Rahul Verma",
    role: "AI Research Lead, Introspect Labs",
    initials: "RV",
    gradient: "from-blue-500 to-cyan-500",
    accent: "#06b6d4",
    tag: "AI Systems",
  },
  {
    quote: "College Central became the most-used student app on campus within weeks. Preetham doesn't just build — he ships products people love.",
    name: "Ankit Sharma",
    role: "Fellow Developer, IIT (ISM)",
    initials: "AS",
    gradient: "from-purple-500 to-pink-500",
    accent: "#a855f7",
    tag: "Product",
  },
  {
    quote: "His competitive programming skills are exceptional. Solving 1000+ problems shows the kind of relentless drive you rarely see.",
    name: "Prof. S. Mukherjee",
    role: "CS Faculty, IIT (ISM) Dhanbad",
    initials: "SM",
    gradient: "from-emerald-500 to-teal-500",
    accent: "#10b981",
    tag: "CP",
  },
  {
    quote: "As Hostel Prefect, Preetham managed 1800+ residents with incredible composure. A natural leader who inspires trust.",
    name: "Vikram Reddy",
    role: "Students' Gymkhana, IIT (ISM)",
    initials: "VR",
    gradient: "from-amber-500 to-orange-500",
    accent: "#f59e0b",
    tag: "Leadership",
  },
  {
    quote: "The FestFlow AI agent system was revolutionary for our college fest. It handled logistics that would take a team of 10 people.",
    name: "Sneha Patil",
    role: "Event Coordinator, IIT (ISM)",
    initials: "SP",
    gradient: "from-rose-500 to-pink-500",
    accent: "#f43f5e",
    tag: "AI Agents",
  },
  {
    quote: "Working with Preetham on autonomous trading agents was eye-opening. His understanding of multi-agent systems is deeply impressive.",
    name: "Karthik Nair",
    role: "FinTech Developer",
    initials: "KN",
    gradient: "from-indigo-500 to-blue-500",
    accent: "#6366f1",
    tag: "FinTech",
  },
  {
    quote: "His real-time speech-to-speech translation system using LiveKit was mind-blowing. Sub-second latency across languages — that's production-level engineering.",
    name: "Meera Iyer",
    role: "NLP Engineer, Language AI Startup",
    initials: "MI",
    gradient: "from-teal-500 to-emerald-500",
    accent: "#14b8a6",
    tag: "NLP",
  },
  {
    quote: "Preetham set up our entire AWS infrastructure — EC2, GPU instances, networking — like a seasoned DevOps engineer. Truly full-stack in every sense.",
    name: "Rohan Gupta",
    role: "CTO, Early-Stage Startup",
    initials: "RG",
    gradient: "from-sky-500 to-blue-500",
    accent: "#0ea5e9",
    tag: "DevOps",
  },
  {
    quote: "He mentored our junior dev team through complex DSA concepts with patience and clarity. A brilliant engineer who makes others better too.",
    name: "Divya Krishnan",
    role: "Software Engineer, Google",
    initials: "DK",
    gradient: "from-violet-500 to-purple-500",
    accent: "#8b5cf6",
    tag: "Mentorship",
  },
  {
    quote: "Preetham's College Central app genuinely changed campus life. The attention to UX detail and performance optimization was way beyond typical student projects.",
    name: "Arjun Mehta",
    role: "Product Manager, IIT (ISM)",
    initials: "AM",
    gradient: "from-orange-500 to-red-500",
    accent: "#f97316",
    tag: "UX",
  },
  {
    quote: "At the hackathon, his team delivered a fully functional AI prototype in 24 hours. His speed of execution combined with clean architecture is unmatched.",
    name: "Neha Srinivasan",
    role: "Hackathon Organizer, MLH",
    initials: "NS",
    gradient: "from-fuchsia-500 to-pink-500",
    accent: "#d946ef",
    tag: "Hackathon",
  },
  {
    quote: "The way he integrated Sarvam AI APIs for multilingual support showed deep understanding of both API design and user-centric engineering.",
    name: "Rajesh Sundaram",
    role: "Senior Engineer, Sarvam AI",
    initials: "RS",
    gradient: "from-lime-500 to-green-500",
    accent: "#84cc16",
    tag: "APIs",
  },
];

/* ── Floating micro-particles inside card ── */
function CardParticles({ accent, active }: { accent: string; active: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        left: 10 + i * 14,
        size: 2 + (i % 3),
      })),
    []
  );
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: "-8px",
            width: p.size,
            height: p.size,
            backgroundColor: accent,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}

/* ── Rotating conic border on hover ── */
function RotatingBorder({ accent, active }: { accent: string; active: boolean }) {
  return (
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none z-0 transition-opacity duration-500"
      style={{
        opacity: active ? 1 : 0,
        padding: "1px",
        background: `conic-gradient(from var(--tw-rotate, 0deg), ${accent}00 0deg, ${accent}80 90deg, ${accent}00 180deg, ${accent}40 270deg, ${accent}00 360deg)`,
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    />
  );
}

/* ── Premium testimonial card ── */
function TestimonialCard({
  t,
  mobile = false,
}: {
  t: (typeof testimonials)[0];
  mobile?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setGlowPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const inner = (
    <div
      ref={cardRef}
      className="relative w-full h-full flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rotating conic border */}
      <RotatingBorder accent={t.accent} active={hovered} />

      {/* Mouse-following inner glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-0 transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(220px circle at ${glowPos.x}px ${glowPos.y}px, ${t.accent}20, transparent 65%)`,
        }}
      />

      {/* Floating particles */}
      <CardParticles accent={t.accent} active={hovered} />

      {/* Accent top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl z-10 transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0.45,
          background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-5">
        {/* Tag + stars */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg border transition-colors duration-300"
              style={{
                backgroundColor: hovered ? `${t.accent}15` : "rgba(255,255,255,0.03)",
                borderColor: hovered ? `${t.accent}50` : "rgba(255,255,255,0.06)",
              }}
            >
              <Quote size={14} style={{ color: t.accent }} />
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all duration-300"
              style={{
                color: t.accent,
                borderColor: `${t.accent}${hovered ? "60" : "35"}`,
                backgroundColor: `${t.accent}${hovered ? "18" : "0d"}`,
              }}
            >
              {t.tag}
            </span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                className="transition-all duration-300"
                style={{
                  fill: hovered ? "#facc15" : "rgba(250,204,21,0.6)",
                  color: hovered ? "#facc15" : "rgba(250,204,21,0.6)",
                  transform: hovered ? `scale(${1 + i * 0.05}) translateY(${-i * 0.5}px)` : "none",
                  transitionDelay: `${i * 30}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Quote text */}
        <p className="flex-1 text-[13.5px] leading-[1.78] mb-4 tracking-[-0.01em] transition-colors duration-300"
          style={{ color: hovered ? "rgb(229,231,235)" : "rgb(156,163,175)" }}>
          &ldquo;{t.quote}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-3 border-t border-white/6">
          <div
            className={`relative w-10 h-10 rounded-full bg-linear-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all duration-500`}
            style={{
              boxShadow: hovered ? `0 0 0 3px ${t.accent}40, 0 0 16px ${t.accent}30` : "none",
            }}
          >
            {t.initials}
            {/* Avatar pulse ring on hover */}
            {hovered && (
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: t.accent, opacity: 0.15 }}
              />
            )}
          </div>
          <div>
            <p className="text-white font-semibold text-[13px] tracking-tight">{t.name}</p>
            <p className="text-[11px] mt-0.5 transition-colors duration-300"
              style={{ color: hovered ? t.accent : "rgb(107,114,128)" }}>
              {t.role}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom-right ambient glow blob */}
      <div
        className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${t.accent}30, transparent 70%)`,
          transform: `scale(${hovered ? 2.2 : 1})`,
          opacity: hovered ? 1 : 0.4,
        }}
      />
    </div>
  );

  if (mobile) {
    return (
      <div
        className="w-full h-full rounded-2xl bg-zinc-900/95 border border-white/8 overflow-hidden relative"
        style={{ boxShadow: `0 4px 32px -8px ${t.accent}20` }}
      >
        {inner}
      </div>
    );
  }

  return (
    <InteractiveCard
      accent={t.accent}
      tilt={5}
      className="shrink-0 w-[320px] md:w-[390px] mx-3 rounded-2xl bg-zinc-900/95 border border-white/8 overflow-hidden cursor-default"
      style={{
        boxShadow: `0 4px 32px -8px ${t.accent}20, 0 0 0 1px rgba(255,255,255,0.03)`,
      }}
    >
      {inner}
    </InteractiveCard>
  );
}

/* ── Mobile swipeable carousel ── */
function MobileCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) return;
    setActiveIndex(Math.round((track.scrollLeft / maxScroll) * (testimonials.length - 1)));
  }, []);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-[7.5vw] pb-2 items-stretch"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {testimonials.map((t, i) => (
          <div key={"m-" + i} className="snap-center shrink-0 w-[85vw] max-w-[360px] flex">
            <TestimonialCard t={t} mobile />
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center gap-1.5 mt-5">
        {testimonials.map((t, i) => (
          <div
            key={"dot-" + i}
            className="rounded-full transition-all duration-300"
            style={{
              width: activeIndex === i ? 20 : 6,
              height: 6,
              backgroundColor: activeIndex === i ? t.accent : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
      <p className="text-center text-[11px] text-gray-600 tracking-widest uppercase mt-3">Swipe to explore</p>
    </div>
  );
}

/* ── Marquee row ── */
function MarqueeRow({
  items,
  direction,
  speed,
  active,
}: {
  items: (typeof testimonials)[0][];
  direction: "left" | "right";
  speed: number;
  active: boolean;
}) {
  return (
    <div className="relative mb-5">
      {/* Edge fade masks — match the actual page bg */}
      <div className="absolute left-0 top-0 bottom-0 w-28 md:w-48 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #050508 0%, #050508cc 60%, transparent 100%)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-28 md:w-48 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #050508 0%, #050508cc 60%, transparent 100%)" }} />
      <div
        className={
          direction === "left"
            ? "flex animate-marquee-left hover:[animation-play-state:paused] motion-reduce:animate-none"
            : "flex animate-marquee-right hover:[animation-play-state:paused] motion-reduce:animate-none"
        }
        style={{
          animationDuration: speed + "s",
          animationPlayState: active ? undefined : "paused",
        }}
      >
        {items.map((t, i) => (
          <TestimonialCard key={direction + "-" + i} t={t} />
        ))}
      </div>
    </div>
  );
}

/* ── Live counter badge ── */
function CounterBadge({ count, isInView }: { count: number; isInView: boolean }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const start = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - start) / 1200, 1);
      setDisplay(Math.round(count * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, count]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300 mb-6"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <MessageCircle size={13} className="text-gray-500" />
      <span>
        <span className="font-bold text-white">{display}</span> voices from the community
      </span>
    </motion.div>
  );
}

/* ── Drifting orb background ── */
function DriftingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Large slow drifters */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(201,151,74,0.07) 0%, transparent 70%)",
          top: "10%", left: "5%",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(201,151,74,0.06) 0%, transparent 70%)",
          bottom: "5%", right: "8%",
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(201,151,74,0.05) 0%, transparent 70%)",
          top: "40%", right: "30%",
        }}
      />
    </div>
  );
}

/* ── Main export ── */
export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const marqueeActive = useInView(sectionRef);
  const isMobile = useIsMobile();

  const row1 = useMemo(() => [...testimonials, ...testimonials], []);
  const rotated4 = useMemo(() => [...testimonials.slice(4), ...testimonials.slice(0, 4)], []);
  const row2 = useMemo(() => [...rotated4, ...rotated4], []);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative w-full py-20 md:py-28 overflow-hidden"
    >
      <DriftingOrbs />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <InViewClass>
          <SectionKicker num="07" label="Voices" />
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65 }}
            className="text-center mb-10"
          >
            <h2 className="text-display text-3xl md:text-5xl text-white mb-4">
              <span className="line-mask">
                <span className="line-rise">
                  What People{" "}
                  <span className="relative inline-block">
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-400 to-rose-400">
                      Say
                    </span>
                    <motion.span
                      className="absolute -bottom-1 left-0 h-[2px] rounded-full bg-linear-to-r from-purple-400 to-pink-400"
                      initial={{ width: "0%" }}
                      animate={isInView ? { width: "100%" } : {}}
                      transition={{ delay: 0.75, duration: 0.7 }}
                    />
                  </span>
                </span>
              </span>
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-4"
            >
              Words from collaborators, mentors, and peers who have seen the work up close.
            </motion.p>

            <CounterBadge count={testimonials.length} isInView={isInView} />

            {/* Floating sparkles row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.65 }}
              className="flex justify-center gap-3"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0], opacity: [0.25, 0.85, 0.25] }}
                  transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                >
                  <Sparkles size={12} className="text-purple-400/60" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </InViewClass>
      </div>

      {/* Cards */}
      {isMobile ? (
        <MobileCarousel />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="relative z-10"
        >
          {/* Row 1 — full opacity, scrolls left, fast */}
          <MarqueeRow items={row1} direction="left" speed={35} active={marqueeActive} />
          {/* Row 2 — scrolls right, slower */}
          <MarqueeRow items={row2} direction="right" speed={52} active={marqueeActive} />
        </motion.div>
      )}
    </section>
  );
}
