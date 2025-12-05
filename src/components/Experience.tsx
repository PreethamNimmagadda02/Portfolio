"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar } from "lucide-react";

const experiences = [
  {
    role: "Software Developer Intern",
    company: "METAVERTEX",
    period: "June 2025 – July 2025",
    description: "Built Autonomous AI agents reducing memory usage by 20%. Optimized page load time by 15% and improved SEO rankings by 10%."
  },
  {
    role: "Campus Ambassador",
    company: "Perplexity",
    period: "Sept 2025 - Nov 2025",
    description: "Promoted Perplexity and Comet browsers, organized workshops, and collaborated with peers to drive adoption of innovative browsing solutions."
  },
  {
    role: "Student Senator",
    company: "Students' Gymkhana, IIT (ISM)",
    period: "March 2024 - March 2025",
    description: "Represented 1,500+ peers, enhanced student engagement by 30%, and collaborated with administration to improve facilities."
  },
  {
    role: "Hostel Prefect",
    company: "Hostel Executive Committee",
    period: "Sept 2024 - Sept 2025",
    description: "Organized 10+ community events boosting engagement by 40% and implemented conflict resolution strategies reducing disputes by 30%."
  }
];

export default function Experience() {
  return (
    <section id="experience" className="py-20 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Experience & Ventures</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full" />
        </motion.div>

        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative pl-8 md:pl-0"
            >
              {/* Timeline Line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2" />
              
              {/* Timeline Dot */}
              <div className="absolute left-[-4px] md:left-1/2 top-0 w-2 h-2 rounded-full bg-primary md:-translate-x-1/2 mt-1.5 ring-4 ring-black" />

              <div className={`md:flex items-start justify-between gap-8 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                <div className="hidden md:block flex-1" />
                
                <div className="flex-1 mb-1 bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-primary/30 transition-colors duration-300">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Briefcase size={16} />
                    <span className="font-semibold">{exp.company}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{exp.role}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <Calendar size={14} />
                    <span>{exp.period}</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
