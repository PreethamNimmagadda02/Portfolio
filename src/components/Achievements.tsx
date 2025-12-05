"use client";

import { motion } from "framer-motion";
import { Trophy, Award, Star, Code } from "lucide-react";

const achievements = [
  {
    title: "Codeforces Specialist",
    description: "Attained a rating of 1450, placing in the top 20% of competitive programmers.",
    icon: <Code className="w-8 h-8 text-blue-400" />,
    stats: "Rating: 1450",
  },
  {
    title: "CodeChef 4-Star",
    description: "Achieved a rating of 1864, placing in the top 0.8% of over 2 million coders.",
    icon: <Star className="w-8 h-8 text-yellow-400" />,
    stats: "Top 0.8%",
  },
  {
    title: "HackerRank Gold",
    description: "Earned a 6-Star Gold badge, ranking in the top 0.07% of 26 million+ coders worldwide.",
    icon: <Trophy className="w-8 h-8 text-yellow-400" />,
    stats: "6-Star Gold",
  },
  {
    title: "Problem Solving",
    description: "Mastered DSA by completing 800+ coding challenges across various platforms.",
    icon: <Award className="w-8 h-8 text-green-400" />,
    stats: "800+ Solved",
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
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Achievements</h2>
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
              
              <div className="relative h-full bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-white/20 transition-colors duration-300 flex flex-col items-center text-center">
                <div className="mb-6 p-4 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <div className="text-primary font-mono font-bold text-lg mb-4">{item.stats}</div>
                <p className="text-gray-400 text-sm leading-relaxed">
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
