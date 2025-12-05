"use client";

import { motion } from "framer-motion";

const skills = {
  Languages: ["C/C++", "Python", "JavaScript", "TypeScript", "SQL", "HTML/CSS"],
  "AI & ML": ["CrewAI", "Google Gemini API", "n8n", "Firebase Studio", "Claude Code", "Ollama"],
  "Web & Tools": ["React.js", "Node.js", "Express.js", "MongoDB", "Git/GitHub", "Postman", "Firebase"]
};

export default function Skills() {
  return (
    <section id="skills" className="py-20 bg-black/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Skills & Technologies</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(skills).map(([category, items], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-colors duration-300"
            >
              <h3 className="text-xl font-semibold text-white mb-6 text-center">{category}</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {items.map((skill, index) => (
                  <motion.span
                    key={skill}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                    className="px-4 py-2 rounded-full bg-white/10 text-gray-300 text-sm cursor-default border border-transparent hover:border-primary/50 transition-colors"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
