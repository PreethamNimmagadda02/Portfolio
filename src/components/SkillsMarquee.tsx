"use client";

import { motion } from "framer-motion";

const skills = [
  { name: "React", color: "from-cyan-400 to-blue-500" },
  { name: "Next.js", color: "from-gray-400 to-gray-100" },
  { name: "TypeScript", color: "from-blue-400 to-blue-600" },
  { name: "Python", color: "from-yellow-400 to-green-500" },
  { name: "CrewAI", color: "from-purple-400 to-pink-500" },
  { name: "Gemini API", color: "from-blue-400 to-cyan-400" },
  { name: "Tailwind CSS", color: "from-cyan-400 to-blue-400" },
  { name: "Node.js", color: "from-green-400 to-emerald-500" },
  { name: "Firebase", color: "from-yellow-400 to-orange-500" },
  { name: "MongoDB", color: "from-green-500 to-emerald-600" },
  { name: "C/C++", color: "from-blue-500 to-indigo-600" },
  { name: "Git/GitHub", color: "from-gray-400 to-gray-600" },
  { name: "SQL", color: "from-orange-400 to-red-500" },
];

export default function SkillsMarquee() {
  return (
    <section className="py-12 bg-black overflow-hidden relative z-10 border-y border-white/5">
      {/* Gradient fade edges */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
      
      <div className="flex">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex flex-shrink-0 gap-6 pr-6"
        >
          {[...skills, ...skills].map((skill, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1, y: -5 }}
              className="group relative px-6 py-3 rounded-full bg-white/5 border border-white/10 whitespace-nowrap cursor-pointer overflow-hidden"
            >
              {/* Glowing background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`} />
              
              {/* Animated border */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} style={{ padding: "1px" }}>
                <div className="w-full h-full rounded-full bg-black" />
              </div>
              
              {/* Text */}
              <span className={`relative z-10 text-gray-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${skill.color} font-medium transition-all duration-300`}>
                {skill.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex flex-shrink-0 gap-6 pr-6"
        >
          {[...skills, ...skills].map((skill, index) => (
            <motion.div
              key={`duplicate-${index}`}
              whileHover={{ scale: 1.1, y: -5 }}
              className="group relative px-6 py-3 rounded-full bg-white/5 border border-white/10 whitespace-nowrap cursor-pointer overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`} />
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} style={{ padding: "1px" }}>
                <div className="w-full h-full rounded-full bg-black" />
              </div>
              <span className={`relative z-10 text-gray-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${skill.color} font-medium transition-all duration-300`}>
                {skill.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
