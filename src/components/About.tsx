"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "@/lib/motion";
import { Code, Rocket, Globe, BookOpen, Users, Zap, Target } from "lucide-react";
import InteractiveCard from "./InteractiveCard";
import { InViewClass, SectionKicker } from "./Reveal";

const features = [
  {
    id: 0,
    icon: Code,
    title: "AI & Autonomous Systems Innovator",
    description: (
      <>
        I build intelligent pipelines that <span className="text-blue-400 font-semibold">act, not just answer</span>. From self-healing data security models at Matters.AI to empathic GenAI companions, I push the boundaries of autonomous technology.
      </>
    ),
    color: "#60a5fa",
  },
  {
    id: 1,
    icon: Rocket,
    title: "Performance-Driven Engineer",
    description: (
      <>
        Ranked in the <span className="text-yellow-400 font-semibold">top 0.8% on CodeChef (4★)</span> and a Codeforces Specialist. I bring elite algorithmic rigor to production code, ensuring highly optimized, scalable, and resilient architectures.
      </>
    ),
    color: "#c084fc",
  },
  {
    id: 2,
    icon: Globe,
    title: "Strategic Tech Leader",
    description: (
      <>
        Led initiatives reaching <span className="text-teal-400 font-semibold">4,000+ students</span> as a Student Senator and drove strategic campus adoption for Perplexity. I bridge the gap between complex technology and large-scale user impact.
      </>
    ),
    color: "#34d399",
  },
  {
    id: 3,
    icon: BookOpen,
    title: "Multi-Agent Orchestrator",
    description: (
      <>
        Architecting <span className="text-amber-400 font-semibold">complex, event-driven platforms</span>. From automated financial trading swarms to logistical AI agents, I design systems where multiple intelligent components coordinate seamlessly.
      </>
    ),
    color: "#fbbf24",
  },
];

const stats = [
  { value: "95%", label: "AI Model Accuracy", color: "text-purple-400", accent: "#c084fc", icon: Target },
  { value: "99%", label: "Global Coder Percentile", color: "text-yellow-400", accent: "#facc15", icon: Zap },
  { value: "4000+", label: "Students Empowered", color: "text-emerald-400", accent: "#34d399", icon: Users },
];

function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState("0");
  const numericPart = value.match(/[\d.]+/)?.[0] || "0";
  const suffix = value.replace(/[\d.]+/, "");

  useEffect(() => {
    if (!isInView) return;
    const target = parseFloat(numericPart);
    const duration = 1400;
    const startTime = Date.now();
    let frameId: number;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(target * eased).toString());
      if (progress < 1) frameId = requestAnimationFrame(animate);
      else setDisplayValue(numericPart);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, numericPart]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

function PillarCard({
  feature,
  index,
  onActive,
}: {
  feature: (typeof features)[0];
  index: number;
  onActive: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const Icon = feature.icon;

  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <InteractiveCard
        accent={feature.color}
        className="card-hairline rounded-3xl p-6 md:p-8 transition-colors duration-500 group/pillar h-full flex flex-col justify-center"
        style={{ borderColor: inView ? `${feature.color}40` : undefined }}
      >
        <div className="flex items-start gap-4 relative z-3">
          <div
            className="p-3 rounded-2xl shrink-0 transition-all duration-500 group-hover/pillar:shadow-[0_0_24px_-4px_var(--ic-accent)]"
            style={{ backgroundColor: `${feature.color}14`, color: feature.color }}
          >
            <Icon size={22} />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-sm md:text-[15px] text-gray-300 leading-relaxed font-sans">
              {feature.description}
            </p>
          </div>
        </div>
      </InteractiveCard>
    </motion.div>
  );
}

export default function About() {
  const [activeId, setActiveId] = useState(0);

  return (
    <section id="about" className="relative w-full py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center w-full"
          >
            <InViewClass>
              <div className="flex justify-center w-full mb-3">
                <SectionKicker num="01" label="Who I Am" />
              </div>

              <h2 className="text-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
                <span className="line-mask">
                  <span className="line-rise">
                    About <span className="text-gradient-iris">Me</span>
                  </span>
                </span>
              </h2>
            </InViewClass>

            <div className="space-y-3 mb-8 text-gray-300 w-full" style={{ fontFamily: "var(--font-inter)" }}>
              <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                I build AI systems that <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-300 to-cyan-300">act</span>,
                {" "}not just <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-300 to-pink-300">answer</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {stats.map((stat, i) => (
                <InteractiveCard
                  key={i}
                  accent={stat.accent}
                  className="min-w-0 text-center p-6 rounded-2xl card-hairline bg-white/5 transition-all duration-300 group hover:bg-white/10 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="mb-3 flex justify-center text-gray-300 transition-transform duration-300 group-hover:scale-125 group-hover:text-white">
                    <stat.icon size={22} className={stat.color} />
                  </div>
                  <h4 className="text-3xl md:text-4xl font-bold text-white mb-2 transition-transform duration-300 group-hover:scale-105">
                    <AnimatedCounter value={stat.value} />
                  </h4>
                  <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
                    {stat.label}
                  </p>
                </InteractiveCard>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <PillarCard key={feature.id} feature={feature} index={i} onActive={setActiveId} />
          ))}
        </div>
      </div>
    </section>
  );
}
