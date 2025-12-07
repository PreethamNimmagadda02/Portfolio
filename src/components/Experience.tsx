"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React from "react";
import { Briefcase, Calendar, Users, Award, Code, Trophy, Star, Zap } from "lucide-react";

type ExperienceType = "work" | "leadership" | "community" | "achievement" | "organization";

interface Experience {
  role: string;
  company: string;
  period: string;
  description: React.ReactNode;
  type: ExperienceType;
  skills: string[];
  highlight?: string;
}

const experiences: Experience[] = [
  {
    role: "Campus Ambassador",
    company: "Perplexity",
    period: "Sept 2025 - Nov 2025",
    description: (
      <>
        Promoted <span className="text-cyan-400 font-semibold">Perplexity</span> and Comet browsers, organized workshops, and collaborated with peers to drive adoption of <span className="text-blue-400 font-semibold">innovative browsing solutions</span>.
      </>
    ),
    type: "community",
    skills: ["Marketing", "Workshops", "Outreach"],
    highlight: "20+ Leads Generated"
  },
  {
    role: "Software Developer Intern",
    company: "METAVERTEX",
    period: "June 2025 – July 2025",
    description: (
      <>
        Built <span className="text-blue-400 font-semibold">Autonomous AI agents</span> reducing memory usage by <span className="text-green-400 font-semibold">20%</span>. Optimized page load time by <span className="text-green-400 font-semibold">15%</span> and improved SEO rankings by <span className="text-green-400 font-semibold">10%</span>.
      </>
    ),
    type: "work",
    skills: ["AI Agents", "React", "Performance"],
    highlight: "20% Memory Optimization"
  },
  {
    role: "Hostel Prefect",
    company: "Hostel Executive Committee",
    period: "Sept 2024 - Sept 2025",
    description: (
      <>
        Organized <span className="text-pink-400 font-semibold">10+ community events</span> boosting engagement by <span className="text-green-400 font-semibold">40%</span> and implemented conflict resolution strategies reducing disputes by <span className="text-green-400 font-semibold">30%</span>.
      </>
    ),
    type: "organization",
    skills: ["Event Management", "Conflict Resolution"],
    highlight: "40% Engagement Boost"
  },
  {
    role: "Student Senator",
    company: "Students' Gymkhana, IIT (ISM)",
    period: "March 2024 - March 2025",
    description: (
      <>
        Represented <span className="text-purple-400 font-semibold">1,500+ peers</span>, enhanced student engagement by <span className="text-green-400 font-semibold">30%</span>, and collaborated with administration to improve facilities.
      </>
    ),
    type: "achievement",
    skills: ["Leadership", "Advocacy", "Public Speaking"],
    highlight: "1,500+ Students Represented"
  }
];

const typeIcons = {
  work: Briefcase,
  leadership: Users,
  community: Award,
  achievement: Trophy,
  organization: Star,
};

const typeColors = {
  work: "from-blue-500 to-cyan-500",
  leadership: "from-purple-500 to-pink-500",
  community: "from-green-500 to-emerald-500",
  achievement: "from-amber-500 to-orange-500",
  organization: "from-purple-500 to-pink-500",
};

function ExperienceCard({ exp, index, gradient, TypeIcon }: { exp: Experience; index: number; gradient: string; TypeIcon: any }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-8deg", "8deg"]);

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
      className="relative [perspective:1500px] group"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Animated gradient border */}
      <motion.div
        className={`absolute -inset-[1px] bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative p-6 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
      >
        {/* Hover gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3 relative" style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-center gap-2">
            <motion.div 
              className={`p-1.5 rounded-lg bg-gradient-to-br ${gradient}`}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <TypeIcon size={14} className="text-white" />
            </motion.div>
            <span className="font-medium text-gray-300">{exp.company}</span>
          </div>
          {exp.highlight && (
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium">
              {exp.highlight}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 relative" style={{ transform: "translateZ(20px)" }}>{exp.role}</h3>
        
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4 relative" style={{ transform: "translateZ(15px)" }}>
          <Calendar size={14} />
          <span>{exp.period}</span>
        </div>
        
        <p className="text-gray-200 font-[var(--font-inter)] leading-relaxed mb-4 relative" style={{ transform: "translateZ(10px)" }}>
          {exp.description}
        </p>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-2 relative" style={{ transform: "translateZ(20px)" }}>
          {exp.skills.map((skill) => (
            <span 
              key={skill}
              className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 hover:scale-105 transition-all cursor-default"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Experience() {
  const [lineHeight, setLineHeight] = React.useState(0);
  const firstDotRef = React.useRef<HTMLDivElement>(null);
  const lastDotRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const calculateHeight = () => {
      if (firstDotRef.current && lastDotRef.current) {
        const first = firstDotRef.current.getBoundingClientRect();
        const last = lastDotRef.current.getBoundingClientRect();
        const distance = last.top - first.top;
        setLineHeight(distance);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.3 }}
          transition={{ duration: 0.8, type: "spring" as const, stiffness: 100 }}
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

          <motion.div 
            className="space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.1 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2, delayChildren: 0.1 }
              }
            }}
          >
            {experiences.map((exp, index) => {
              const TypeIcon = typeIcons[exp.type];
              const gradient = typeColors[exp.type];
              
              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 50, scale: 0.9 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring" as const, stiffness: 50, damping: 15 }
                    }
                  }}
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
                    
                    <div className="flex-1">
                      <ExperienceCard exp={exp} index={index} gradient={gradient} TypeIcon={TypeIcon} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

