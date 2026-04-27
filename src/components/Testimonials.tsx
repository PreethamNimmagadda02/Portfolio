"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote, MessageCircle } from "lucide-react";

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

function TestimonialCard({ t, index }: { t: typeof testimonials[0]; index: number }) {
  return (
    <div
      className="flex-shrink-0 w-[340px] md:w-[400px] p-6 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden mx-3"
      style={{ boxShadow: `0 0 30px -15px ${t.accent}30` }}
    >
      {/* Accent top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }} />

      {/* Quote icon */}
      <Quote size={28} className="text-white/10 mb-3" />

      {/* Quote text */}
      <p className="text-gray-300 text-sm leading-relaxed mb-5 font-[var(--font-inter)]">
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
          {t.initials}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{t.name}</p>
          <p className="text-gray-500 text-xs">{t.role}</p>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${t.accent}08, transparent 70%)` }} />
    </div>
  );
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // Duplicate for infinite scroll effect
  const row1 = [...testimonials, ...testimonials];
  const row2 = [...testimonials.slice(6), ...testimonials.slice(0, 6), ...testimonials.slice(6), ...testimonials.slice(0, 6)];

  return (
    <section ref={sectionRef} id="testimonials" className="py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-full h-[400px] -translate-y-1/2 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4"
          >
            <MessageCircle size={16} />
            <span>Testimonials</span>
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
            What People{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Say</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">Words from collaborators, mentors, and peers.</p>
        </motion.div>
      </div>

      {/* Marquee Row 1 — scrolls left */}
      <div className="relative mb-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        <div className="flex animate-marquee-left hover:[animation-play-state:paused]">
          {row1.map((t, i) => (
            <TestimonialCard key={`r1-${i}`} t={t} index={i} />
          ))}
        </div>
      </div>

      {/* Marquee Row 2 — scrolls right (hidden on mobile) */}
      <div className="relative hidden md:block">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        <div className="flex animate-marquee-right hover:[animation-play-state:paused]">
          {row2.map((t, i) => (
            <TestimonialCard key={`r2-${i}`} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
