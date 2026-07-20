"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "@/lib/motion";
import { Star, Trophy, Code, Flame, LucideIcon } from "lucide-react";
import InteractiveCard from "./InteractiveCard";
import { InViewClass, SectionKicker } from "./Reveal";

interface Achievement {
  id: number;
  title: string;
  description: string;
  stat: string;
  icon: LucideIcon;
  color: string;
}

const achievements: Achievement[] = [
  {
    id: 0,
    title: "Codeforces Specialist",
    description: "Reached 1450 rating, outperforming 80% of global competitive programmers.",
    stat: "Top 20%",
    icon: Code,
    color: "#d3a662",
  },
  {
    id: 1,
    title: "CodeChef Elite",
    description: "4-Star status (1864 rating). Top 0.8% among 2 million+ coders worldwide.",
    stat: "Top 0.8%",
    icon: Star,
    color: "#fbbf24",
  },
  {
    id: 2,
    title: "HackerRank 6★ Gold",
    description: "Ranked in the top 0.07% of 26M+ developers on the platform.",
    stat: "Top 0.07%",
    icon: Trophy,
    color: "#4ade80",
  },
  {
    id: 3,
    title: "1,000+ Problems Solved",
    description: "Across Codeforces, CodeChef, and HackerRank — depth across every major judge.",
    stat: "1000+",
    icon: Flame,
    color: "#d3a662",
  },
];

function StatNumber({ value, color }: { value: string; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const match = value.match(/[\d.]+/);
  const numeric = match?.[0];
  const prefix = numeric ? value.slice(0, match!.index) : "";
  const suffix = numeric ? value.slice(match!.index! + numeric.length) : "";
  const [display, setDisplay] = useState(numeric ? `${prefix}0${suffix}` : value);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isInView || !numeric) return;
    const target = parseFloat(numeric);
    const duration = 1400;
    const start = Date.now();
    let frameId: number;
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numeric.includes(".") ? (target * eased).toFixed(2) : Math.floor(target * eased).toString();
      setDisplay(`${prefix}${current}${suffix}`);
      if (progress < 1) frameId = requestAnimationFrame(animate);
      else {
        setDisplay(value);
        setDone(true); // triggers the brief glow flare
      }
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, numeric, prefix, suffix, value]);

  return (
    <span ref={ref} style={{ color }} className={done ? "stat-flare" : undefined}>
      {display}
    </span>
  );
}

function AchievementCard({ item, index }: { item: Achievement; index: number }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
    >
      <InteractiveCard
        accent={item.color}
        className="card-hairline rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-white/20 transition-[border-color,box-shadow] duration-300 hover:shadow-[0_18px_50px_-24px_var(--ic-accent)] h-full"
      >
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity"
          style={{ backgroundColor: item.color }}
        />
        <div className="relative z-3">
          <div className="flex items-center justify-between mb-6">
            <div
              className="p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundColor: `${item.color}16`, color: item.color }}
            >
              <Icon size={22} />
            </div>
            <span className="text-3xl md:text-4xl font-black tabular-nums">
              <StatNumber value={item.stat} color={item.color} />
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2">{item.title}</h3>
          <p className="text-sm text-gray-300 leading-relaxed font-sans">
            {item.description}
          </p>
        </div>
      </InteractiveCard>
    </motion.div>
  );
}

export default function Achievements() {
  return (
    <section id="achievements" className="relative w-full py-20 md:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <InViewClass>
          <SectionKicker num="06" label="Milestones" />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-display text-3xl md:text-5xl text-white mb-3">
              <span className="line-mask">
                <span className="line-rise">
                  My <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-200 via-yellow-400 to-amber-500">Achievements</span>
                </span>
              </span>
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
              Numbers earned through thousands of hours at the keyboard.
            </p>
          </motion.div>
        </InViewClass>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          {achievements.map((item, i) => (
            <AchievementCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
