"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Trophy, Award, Star, Code } from "lucide-react";
import React from "react";

const achievements = [
  {
    title: "Codeforces Specialist",
    description: (
      <>
        Conquered algorithmic challenges to reach <span className="text-cyan-400 font-semibold">1450 rating</span>, outperforming <span className="text-cyan-400 font-semibold">80%</span> of competitive programmers globally.
      </>
    ),
    icon: <Code className="w-8 h-8 text-cyan-400" />,
    stats: "Top 20%",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "CodeChef Elite",
    description: (
      <>
        Achieved <span className="text-orange-400 font-semibold">4-Star status</span> with <span className="text-orange-400 font-semibold">1864 rating</span>, placing in the elite <span className="text-orange-400 font-semibold">top 0.8%</span> among 2 million+ coders worldwide.
      </>
    ),
    icon: <Star className="w-8 h-8 text-orange-400" />,
    stats: "Top 0.8%",
    gradient: "from-orange-500 to-yellow-500",
  },
  {
    title: "HackerRank Legend",
    description: (
      <>
        Earned the prestigious <span className="text-green-500 font-semibold">6-Star Gold badge</span>, ranking in the ultra-elite <span className="text-green-500 font-semibold">top 0.07%</span> of 26 million+ coders.
      </>
    ),
    icon: <Trophy className="w-8 h-8 text-green-400" />,
    stats: "Top 0.07%",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Problem Crusher",
    description: (
      <>
        Demolished <span className="text-pink-400 font-semibold">1000+ algorithmic challenges</span> across multiple platforms, mastering <span className="text-pink-400 font-semibold">DSA</span> inside and out.
      </>
    ),
    icon: <Award className="w-8 h-8 text-pink-400" />,
    stats: "1000+ Solved",
    gradient: "from-pink-500 to-purple-500",
  },
];

function AchievementCard({ item, index }: { item: typeof achievements[0]; index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left) / width - 0.5);
    y.set((clientY - top) / height - 0.5);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className="relative h-full [perspective:1500px] group"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Animated gradient border */}
      <motion.div
        className={`absolute -inset-[1px] bg-gradient-to-r ${item.gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:border-white/20 transition-all duration-300 flex flex-col items-center text-center"
      >
        {/* Floating Icon */}
        <motion.div
          className="mb-6 p-4 rounded-full bg-white/5 border border-white/10"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "translateZ(30px)" }}
        >
          {item.icon}
        </motion.div>

        <h3 className="text-xl font-bold text-white mb-2" style={{ transform: "translateZ(20px)" }}>{item.title}</h3>
        <div className={`font-mono font-bold text-lg mb-4 bg-clip-text text-transparent bg-gradient-to-r ${item.gradient}`} style={{ transform: "translateZ(20px)" }}>{item.stats}</div>
        <p className="text-gray-200 font-[var(--font-inter)] text-sm leading-relaxed" style={{ transform: "translateZ(10px)" }}>
          {item.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function Achievements() {
  return (
    <section id="achievements" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Achievements</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full" />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.1 }
            }
          }}
        >
          {achievements.map((item, index) => (
            <motion.div
              key={index}
              className="h-full"
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.9 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 50, damping: 15 }
                }
              }}
            >
              <AchievementCard item={item} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

