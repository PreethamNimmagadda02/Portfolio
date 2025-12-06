"use client";

import { motion } from "framer-motion";
import React from "react";
import { Briefcase, Calendar, Users, Award, Code, Trophy, Star, Zap } from "lucide-react";

type ExperienceType = "work" | "leadership" | "community";

interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
  type: ExperienceType;
  skills: string[];
  highlight?: string;
}

const experiences: Experience[] = [
  {
    role: "Software Developer Intern",
    company: "METAVERTEX",
    period: "June 2025 – July 2025",
    description: "Built Autonomous AI agents reducing memory usage by 20%. Optimized page load time by 15% and improved SEO rankings by 10%.",
    type: "work",
    skills: ["AI Agents", "React", "Performance"],
    highlight: "20% Memory Optimization"
  },
  {
    role: "Campus Ambassador",
    company: "Perplexity",
    period: "Sept 2025 - Nov 2025",
    description: "Promoted Perplexity and Comet browsers, organized workshops, and collaborated with peers to drive adoption of innovative browsing solutions.",
    type: "community",
    skills: ["Marketing", "Workshops", "Outreach"],
    highlight: "20+ Leads Generated"
  },
  {
    role: "Student Senator",
    company: "Students' Gymkhana, IIT (ISM)",
    period: "March 2024 - March 2025",
    description: "Represented 1,500+ peers, enhanced student engagement by 30%, and collaborated with administration to improve facilities.",
    type: "leadership",
    skills: ["Leadership", "Advocacy", "Public Speaking"],
    highlight: "1,500+ Students Represented"
  },
  {
    role: "Hostel Prefect",
    company: "Hostel Executive Committee",
    period: "Sept 2024 - Sept 2025",
    description: "Organized 10+ community events boosting engagement by 40% and implemented conflict resolution strategies reducing disputes by 30%.",
    type: "leadership",
    skills: ["Event Management", "Conflict Resolution"],
    highlight: "40% Engagement Boost"
  }
];

const achievements = [
  { icon: Trophy, title: "1864 Peak Rating", subtitle: "Codeforces", color: "from-yellow-500 to-orange-500" },
  { icon: Code, title: "500+ Problems", subtitle: "DSA Solved", color: "from-blue-500 to-cyan-500" },
  { icon: Star, title: "5+ Projects", subtitle: "Built & Shipped", color: "from-purple-500 to-pink-500" },
  { icon: Zap, title: "3 Hackathons", subtitle: "Participated", color: "from-green-500 to-emerald-500" },
];

const typeIcons = {
  work: Briefcase,
  leadership: Users,
  community: Award,
};

const typeColors = {
  work: "from-blue-500 to-cyan-500",
  leadership: "from-purple-500 to-pink-500",
  community: "from-green-500 to-emerald-500",
};

export default function Experience() {
  const [lineHeight, setLineHeight] = React.useState(0);
  const firstDotRef = React.useRef<HTMLDivElement>(null);
  const lastDotRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const calculateHeight = () => {
      if (firstDotRef.current && lastDotRef.current) {
        // Calculate the vertical distance between the top of the first dot and the top of the last dot
        // The dots are 16px (h-4), so the line should connect their centers.
        // We will make the line height exactly the distance between the two dots' tops plus half a dot height if we want centers,
        // but typically "connecting dots" means border to border or center to center.
        // Let's go center-to-center.
        
        const first = firstDotRef.current.getBoundingClientRect();
        const last = lastDotRef.current.getBoundingClientRect();
        // Distance from top of first dot to top of last dot
        const distance = last.top - first.top;
        setLineHeight(distance);
      }
    };

    // Calculate initial
    calculateHeight();

    // Recalculate on resize
    window.addEventListener('resize', calculateHeight);
    
    // Mutation observer for content changes causing reflow
    const observer = new ResizeObserver(calculateHeight);
    if (firstDotRef.current?.parentElement?.parentElement) {
      observer.observe(firstDotRef.current.parentElement.parentElement);
    }

    return () => {
      window.removeEventListener('resize', calculateHeight);
      observer.disconnect();
    };
  }, []);

  return (
    <section id="experience" className="py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Experiences & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Ventures</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">Building expertise through diverse roles and continuous learning</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Central glowing line - Dynamic Height */}
          <div 
            className="absolute left-4 md:left-1/2 top-6 md:-translate-x-1/2 w-px overflow-hidden"
            style={{ height: lineHeight + 10}}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500 via-blue-500 to-purple-500 opacity-30" />
            <motion.div
              className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-purple-500 to-transparent"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="space-y-8">
            {experiences.map((exp, index) => {
              const TypeIcon = typeIcons[exp.type];
              const gradient = typeColors[exp.type];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative pl-12 md:pl-0"
                >
                  {/* Timeline Dot */}
                  <motion.div 
                    ref={index === 0 ? firstDotRef : index === experiences.length - 1 ? lastDotRef : null}
                    className={`absolute left-2 md:left-1/2 top-6 w-4 h-4 rounded-full bg-gradient-to-br ${gradient} md:-translate-x-1/2 ring-4 ring-black shadow-lg z-10`}
                    whileHover={{ scale: 1.5 }}
                  />

                  <div className={`md:flex items-start gap-8 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                    <div className="hidden md:block flex-1" />
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex-1 group"
                    >
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden">
                        {/* Hover gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                        
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-3 relative">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${gradient}`}>
                              <TypeIcon size={14} className="text-white" />
                            </div>
                            <span className="font-medium text-gray-300">{exp.company}</span>
                          </div>
                          {exp.highlight && (
                            <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium">
                              {exp.highlight}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">{exp.role}</h3>
                        
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                          <Calendar size={14} />
                          <span>{exp.period}</span>
                        </div>
                        
                        <p className="text-gray-400 leading-relaxed mb-4">
                          {exp.description}
                        </p>
                        
                        {/* Skills */}
                        <div className="flex flex-wrap gap-2">
                          {exp.skills.map((skill) => (
                            <span 
                              key={skill}
                              className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
