"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const skills = [
  { name: "VideoRAG", color: "from-orange-400 to-pink-600" },
  { name: "React", color: "from-cyan-400 to-blue-500" },
  { name: "Mem0", color: "from-purple-500 to-indigo-500" },
  { name: "Whisper", color: "from-emerald-400 to-green-500" },
  { name: "AWS EC2", color: "from-orange-400 to-yellow-500" },
  { name: "Digital Ocean", color: "from-blue-500 to-cyan-400" },
  { name: "Context Engineering", color: "from-fuchsia-400 to-pink-500" },
  { name: "Meta Llama", color: "from-blue-600 to-indigo-600" },
  { name: "PostgreSQL", color: "from-blue-400 to-slate-500" },
  { name: "Redis", color: "from-red-500 to-orange-600" },
  { name: "TypeScript", color: "from-blue-400 to-blue-600" },
  { name: "FalkorDB", color: "from-violet-500 to-purple-600" },
  { name: "Python", color: "from-yellow-400 to-green-500" },
  { name: "Qdrant", color: "from-red-500 to-pink-600" },
  { name: "Qwen", color: "from-blue-600 to-indigo-600" },
  { name: "Firebase", color: "from-yellow-400 to-orange-500" },
  { name: "OpenAI API", color: "from-emerald-500 to-green-600" },
  { name: "DeepInfra", color: "from-cyan-400 to-blue-500" },
  { name: "CrewAI", color: "from-purple-400 to-pink-500" },
  { name: "Next.js", color: "from-gray-400 to-gray-100" },
  { name: "SQL", color: "from-orange-400 to-red-500" },
  { name: "Gemini API", color: "from-blue-400 to-cyan-400" },
  { name: "MongoDB", color: "from-green-500 to-emerald-600" },
  { name: "n8n", color: "from-orange-400 to-amber-500" },
  { name: "C/C++", color: "from-blue-500 to-indigo-600" },
  { name: "Postman", color: "from-orange-500 to-orange-600" },
  { name: "Tailwind CSS", color: "from-cyan-400 to-blue-400" },
  { name: "Git/GitHub", color: "from-gray-400 to-gray-600" },
  { name: "Node.js", color: "from-green-400 to-emerald-500" },
  { name: "Ollama", color: "from-gray-100 to-gray-400" },
];

export default function SkillsMarquee() {
  // Split skills into two rows
  const { topRow, bottomRow } = useMemo(() => {
    const halfLength = Math.ceil(skills.length / 2);
    return {
      topRow: skills.slice(0, halfLength),
      bottomRow: skills.slice(halfLength)
    };
  }, []);

  return (
    <section id="skills-marquee" className="py-20 overflow-hidden relative z-10 w-full">

      {/* Container with mask for fade effect */}
      <div
        className="flex flex-col gap-10 w-full"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
        }}
      >
        {/* Top Row: Left to Right */}
        <MarqueeRow items={topRow} direction="left" speed={30} />

        {/* Bottom Row: Right to Left */}
        <MarqueeRow items={bottomRow} direction="right" speed={35} />
      </div>
    </section>
  );
}

function MarqueeRow({ items, direction, speed }: { items: typeof skills; direction: "left" | "right"; speed: number }) {
  return (
    <div className="flex overflow-hidden py-5">
      <motion.div
        initial={{ x: direction === "left" ? 0 : "-50%" }}
        animate={{ x: direction === "left" ? "-50%" : 0 }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex flex-shrink-0 gap-8 px-4"
      >
        {[...items, ...items].map((skill, index) => (
          <SkillBadge key={`${skill.name}-${index}`} skill={skill} />
        ))}
      </motion.div>
    </div>
  );
}

function SkillBadge({ skill }: { skill: (typeof skills)[0] }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className="group relative px-6 py-3 rounded-2xl bg-white/5 border border-white/10 whitespace-nowrap cursor-pointer overflow-hidden backdrop-blur-sm"
    >
      {/* Glowing background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`} />

      {/* Animated border gradient */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ padding: "1px" }}>
        <div className="w-full h-full rounded-2xl bg-black/90" />
      </div>

      {/* Shimmer sweep effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
        initial={{ x: "-200%" }}
        animate={{ x: "200%" }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "linear",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        {/* We can add icons here in future if needed */}
        <span className={`text-lg font-medium text-gray-400 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${skill.color} transition-all duration-300`}>
          {skill.name}
        </span>
      </div>
    </motion.div>
  )
}
