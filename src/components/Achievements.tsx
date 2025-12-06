"use client";

import { motion } from "framer-motion";
import { Trophy, Award, Star, Code } from "lucide-react";

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
  },
];

export default function Achievements() {
  return (
    <section id="achievements" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Achievements</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {achievements.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative h-full bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-white/20 transition-all duration-300 flex flex-col items-center text-center card-hover">
                <motion.div 
                  className="mb-6 p-4 rounded-full bg-white/5 border border-white/10"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {item.icon}
                </motion.div>
                
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <div className="text-primary font-mono font-bold text-lg mb-4">{item.stats}</div>
                <p className="text-gray-200 font-[var(--font-inter)] text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
