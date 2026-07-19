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
    title: "Multimodal & Agent Systems",
    description: (
      <>
        I build AI that <span className="text-blue-400 font-semibold">acts, not just answers</span> — vision-language
        pipelines and autonomous agents that reason over real-world data and make decisions without a human in the loop.
      </>
    ),
    color: "#60a5fa",
  },
  {
    id: 1,
    icon: Rocket,
    title: "Competitive Problem Solver",
    description: (
      <>
        <span className="text-yellow-400 font-semibold">CodeChef 4★, top 0.8%</span> of 2M+ coders. Codeforces
        Specialist, top 20%. 1,000+ problems solved — the same rigor I bring to production systems.
      </>
    ),
    color: "#c084fc",
  },
  {
    id: 2,
    icon: Globe,
    title: "Community Builder",
    description: (
      <>
        Led initiatives reaching <span className="text-teal-400 font-semibold">4,000+ students</span>, managing
        budgets and logistics for large-scale campus operations.
      </>
    ),
    color: "#34d399",
  },
  {
    id: 3,
    icon: BookOpen,
    title: "Agent Systems Architect",
    description: (
      <>
        Designing <span className="text-amber-400 font-semibold">multi-agent orchestration</span> for trading and
        logistics — systems that coordinate, not just execute.
      </>
    ),
    color: "#fbbf24",
  },
];

const stats = [
  { value: "4000+", label: "Students Influenced", color: "text-purple-400", icon: Users },
  { value: "20%", label: "Memory Reduction", color: "text-yellow-400", icon: Zap },
  { value: "350+", label: "Participants Led", color: "text-emerald-400", icon: Target },
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
    >
      <InteractiveCard
        accent={feature.color}
        className="card-hairline rounded-3xl p-6 md:p-8 transition-colors duration-500 group/pillar"
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
  const activeFeature = features.find((f) => f.id === activeId) || features[0];
  const ActiveIcon = activeFeature.icon;

  return (
    <section id="about" className="relative w-full py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* LEFT — sticky intro + live feature */}
          <div className="lg:sticky lg:top-32 lg:self-start space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <InViewClass>
                <SectionKicker num="01" label="Who I Am" />

                <h2 className="text-display text-4xl md:text-5xl lg:text-6xl text-white mb-6">
                  <span className="line-mask">
                    <span className="line-rise">
                      About <span className="text-gradient-iris">Me</span>
                    </span>
                  </span>
                </h2>
              </InViewClass>

              <div className="space-y-5 mb-8 text-gray-300 max-w-prose font-sans">
                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                  I build AI systems that <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-300 to-cyan-300">act</span>,
                  {" "}not just <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-300 to-pink-300">answer</span>
                </h3>
                <p className="text-base md:text-lg leading-relaxed">
                  Autonomous agents, multimodal pipelines, and infrastructure engineered for real efficiency gains —
                  I ship systems that reason and decide, not just respond.
                </p>
              </div>

              {/* Live feature card — updates as pillars scroll past on the right */}
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="p-6 rounded-2xl card-hairline relative overflow-hidden mb-8 hidden lg:block"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: activeFeature.color }} />
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/5 shrink-0">
                    <ActiveIcon size={24} style={{ color: activeFeature.color }} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">{activeFeature.title}</h4>
                    <div className="text-gray-300 text-sm leading-relaxed">{activeFeature.description}</div>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="min-w-0 text-center p-3 rounded-xl card-hairline">
                    <div className="mb-2 flex justify-center text-gray-300">
                      <stat.icon size={18} />
                    </div>
                    <h4 className="text-xl sm:text-2xl font-bold text-white mb-1">
                      <AnimatedCounter value={stat.value} />
                    </h4>
                    <p className={`text-[10px] md:text-xs font-medium uppercase tracking-wider ${stat.color}`}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT — pillar cards, drive the sticky feature above */}
          <div className="space-y-5 md:space-y-6">
            {features.map((feature, i) => (
              <PillarCard key={feature.id} feature={feature} index={i} onActive={setActiveId} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
