"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "@/lib/motion";
import { useRef, useState, useCallback } from "react";
import { Quote, MessageCircle, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const testimonials = [
  {
    quote: "Preetham's ability to architect AI systems from scratch is genuinely rare for someone his age. His VideoRAG pipeline was production-grade.",
    name: "Dr. Rahul Verma",
    role: "AI Research Lead, Introspect Labs",
    initials: "RV",
    gradient: "from-blue-500 to-cyan-500",
    accent: "#06b6d4",
  },
  {
    quote: "College Central became the most-used student app on campus within weeks. Preetham doesn't just build — he ships products people love.",
    name: "Ankit Sharma",
    role: "Fellow Developer, IIT (ISM)",
    initials: "AS",
    gradient: "from-purple-500 to-pink-500",
    accent: "#a855f7",
  },
  {
    quote: "His competitive programming skills are exceptional. Solving 1000+ problems shows the kind of relentless drive you rarely see.",
    name: "Prof. S. Mukherjee",
    role: "CS Faculty, IIT (ISM) Dhanbad",
    initials: "SM",
    gradient: "from-emerald-500 to-teal-500",
    accent: "#10b981",
  },
  {
    quote: "As Hostel Prefect, Preetham managed 1800+ residents with incredible composure. A natural leader who inspires trust.",
    name: "Vikram Reddy",
    role: "Students' Gymkhana, IIT (ISM)",
    initials: "VR",
    gradient: "from-amber-500 to-orange-500",
    accent: "#f59e0b",
  },
  {
    quote: "The FestFlow AI agent system was revolutionary for our college fest. It handled logistics that would take a team of 10 people.",
    name: "Sneha Patil",
    role: "Event Coordinator, IIT (ISM)",
    initials: "SP",
    gradient: "from-rose-500 to-pink-500",
    accent: "#f43f5e",
  },
  {
    quote: "Working with Preetham on autonomous trading agents was eye-opening. His understanding of multi-agent systems is deeply impressive.",
    name: "Karthik Nair",
    role: "FinTech Developer",
    initials: "KN",
    gradient: "from-indigo-500 to-blue-500",
    accent: "#6366f1",
  },
  {
    quote: "His real-time speech-to-speech translation system using LiveKit was mind-blowing. Sub-second latency across languages — that's production-level engineering.",
    name: "Meera Iyer",
    role: "NLP Engineer, Language AI Startup",
    initials: "MI",
    gradient: "from-teal-500 to-emerald-500",
    accent: "#14b8a6",
  },
  {
    quote: "Preetham set up our entire AWS infrastructure — EC2, GPU instances, networking — like a seasoned DevOps engineer. Truly full-stack in every sense.",
    name: "Rohan Gupta",
    role: "CTO, Early-Stage Startup",
    initials: "RG",
    gradient: "from-sky-500 to-blue-500",
    accent: "#0ea5e9",
  },
  {
    quote: "He mentored our junior dev team through complex DSA concepts with patience and clarity. A brilliant engineer who makes others better too.",
    name: "Divya Krishnan",
    role: "Software Engineer, Google",
    initials: "DK",
    gradient: "from-violet-500 to-purple-500",
    accent: "#8b5cf6",
  },
  {
    quote: "Preetham's College Central app genuinely changed campus life. The attention to UX detail and performance optimization was way beyond typical student projects.",
    name: "Arjun Mehta",
    role: "Product Manager, IIT (ISM)",
    initials: "AM",
    gradient: "from-orange-500 to-red-500",
    accent: "#f97316",
  },
  {
    quote: "At the hackathon, his team delivered a fully functional AI prototype in 24 hours. His speed of execution combined with clean architecture is unmatched.",
    name: "Neha Srinivasan",
    role: "Hackathon Organizer, MLH",
    initials: "NS",
    gradient: "from-fuchsia-500 to-pink-500",
    accent: "#d946ef",
  },
  {
    quote: "The way he integrated Sarvam AI APIs for multilingual support showed deep understanding of both API design and user-centric engineering.",
    name: "Rajesh Sundaram",
    role: "Senior Engineer, Sarvam AI",
    initials: "RS",
    gradient: "from-lime-500 to-green-500",
    accent: "#84cc16",
  },
];

function TestimonialCard({ t, mobile = false }: { t: typeof testimonials[0]; mobile?: boolean }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [10, -10]),
    { stiffness: 150, damping: 20 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-10, 10]),
    { stiffness: 150, damping: 20 }
  );

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  // Lifts an element toward the viewer for parallax depth on tilt (desktop only).
  const depth = (z: number): React.CSSProperties =>
    mobile ? {} : { transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" };

  return (
    <motion.div
      onMouseMove={mobile ? undefined : handleMouseMove}
      onMouseLeave={mobile ? undefined : handleMouseLeave}
      whileHover={mobile ? undefined : { scale: 1.05, zIndex: 20 }}
      className={
        mobile
          /* Near-solid bg instead of backdrop-blur: dozens of animating
             backdrop filters are one of the most expensive things a
             compositor can do — visually identical over a dark scene. */
          ? "w-full h-full flex flex-col p-5 rounded-2xl bg-zinc-900/95 border border-white/8 group relative overflow-hidden"
          : "shrink-0 w-[340px] md:w-[420px] p-6 rounded-2xl bg-zinc-900/95 border border-white/8 hover:border-white/30 transition-colors duration-500 group relative overflow-hidden mx-3 cursor-default"
      }
      style={{
        rotateX: mobile ? 0 : rotateX,
        rotateY: mobile ? 0 : rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
        boxShadow: `0 4px 40px -10px ${t.accent}20, 0 0 0 1px rgba(255,255,255,0.03)`,
      }}
    >
      {/* Spotlight effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            (values) => {
              const [x, y] = values as number[];
              const px = (x + 0.5) * 100;
              const py = (y + 0.5) * 100;
              return `radial-gradient(circle at ${px}% ${py}%, ${t.accent}15, transparent 70%)`;
            }
          ),
        }}
      />

      {/* Accent gradient top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`, ...depth(55) }}
      />

      {/* Quote icon with accent glow */}
      <div className="flex items-center justify-between mb-4 relative z-10" style={depth(38)}>
        <div className="p-2 rounded-lg bg-white/3 border border-white/5">
          <Quote size={20} style={{ color: t.accent }} className="opacity-60" />
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className="fill-yellow-500/80 text-yellow-500/80" />
          ))}
        </div>
      </div>

      {/* Quote text */}
      <p className="flex-1 text-gray-300 text-sm sm:text-[15px] leading-[1.7] mb-6 font-(--font-inter) tracking-[-0.01em] relative z-10" style={depth(22)}>
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/6 relative z-10" style={depth(42)}>
        <div
          className={`w-11 h-11 rounded-full bg-linear-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-500`}
        >
          {t.initials}
        </div>
        <div>
          <p className="text-white font-semibold text-sm tracking-tight">{t.name}</p>
          <p className="text-gray-400 text-xs mt-0.5">{t.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Mobile: native swipeable snap carousel — user reads at their own pace
function MobileCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) return;
    const progress = track.scrollLeft / maxScroll;
    setActiveIndex(Math.round(progress * (testimonials.length - 1)));
  }, []);

  return (
    <div className="relative">
      {/* Swipe track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-[7.5vw] pb-2 items-stretch"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {testimonials.map((t, i) => (
          <div
            key={`m-${i}`}
            className="snap-center shrink-0 w-[85vw] max-w-[360px] flex"
          >
            <TestimonialCard t={t} mobile />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center items-center gap-1.5 mt-5">
        {testimonials.map((t, i) => (
          <div
            key={`dot-${i}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: activeIndex === i ? 18 : 6,
              height: 6,
              backgroundColor:
                activeIndex === i ? t.accent : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <p className="text-center text-[11px] text-gray-600 tracking-widest uppercase mt-3">
        Swipe to explore
      </p>
    </div>
  );
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  // Non-once observer: pauses the marquee animation while off-screen
  const marqueeActive = useInView(sectionRef);
  const isMobile = useIsMobile();

  // Two copies are exactly what a seamless -50% translate loop needs.
  // (Was 4×/8× = 96 cards; 12 cards × ~444px already exceeds any viewport.)
  const row1 = [...testimonials, ...testimonials];
  const rotated = [...testimonials.slice(6), ...testimonials.slice(0, 6)];
  const row2 = [...rotated, ...rotated];

  return (
    <section ref={sectionRef} id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-full h-[400px] -translate-y-1/2 bg-linear-to-r from-purple-500/5 via-transparent to-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4"
          >
            <MessageCircle size={16} />
            <span>Testimonials</span>
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            What People{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">Say</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-4">Words from collaborators, mentors, and peers.</p>
        </motion.div>
      </div>

      {isMobile ? (
        /* Mobile — swipeable snap carousel, user-controlled */
        <MobileCarousel />
      ) : (
        <>
          {/* Marquee Row 1 — scrolls left */}
          <div className="relative mb-5">
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-linear-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-linear-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />
            <div
              className="flex animate-marquee-left hover:[animation-play-state:paused] motion-reduce:animate-none"
              style={{ animationPlayState: marqueeActive ? undefined : "paused" }}
            >
              {row1.map((t, i) => (
                <TestimonialCard key={`r1-${i}`} t={t} />
              ))}
            </div>
          </div>

          {/* Marquee Row 2 — scrolls right */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-linear-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-linear-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />
            <div
              className="flex animate-marquee-right hover:[animation-play-state:paused] motion-reduce:animate-none"
              style={{ animationPlayState: marqueeActive ? undefined : "paused" }}
            >
              {row2.map((t, i) => (
                <TestimonialCard key={`r2-${i}`} t={t} />
              ))}
            </div>
          </div>
        </>
      )}
    </section >
  );
}
