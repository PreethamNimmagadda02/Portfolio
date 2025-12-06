"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ExternalLink, Github, ArrowUpRight, Sparkles, Rocket, Cpu } from "lucide-react";
import Link from "next/link";
import React from "react";

const projects = [
  {
    title: "College Central",
    description: "A comprehensive student hub for IIT(ISM) Dhanbad, featuring a personalized dashboard, grade tracking, class schedules, an interactive campus map, and real-time event updates.",
    tags: ["React", "TypeScript", "Firebase", "REST APIs", "Tailwind CSS", "Vite", "Framer Motion"],
    links: { demo: "https://collegecentral.live/#/", repo: "https://github.com/PreethamNimmagadda02/College-Central" },
    gradient: "from-purple-500 to-pink-500",
    status: "Live",
    featured: true,
    icon: Sparkles
  },
  {
    title: "FestFlow",
    description: "Revolutionary AI-powered event orchestration platform. Transforms complex goals into executable plans using specialized autonomous agents.",
    tags: ["React", "Firebase", "Gemini API", "AI Agents"],
    links: { demo: "https://festflow.co.in/", repo: "https://github.com/PreethamNimmagadda02/FestFlow" },
    gradient: "from-blue-500 to-cyan-500",
    status: "Live",
    featured: false,
    icon: Rocket
  },
  {
    title: "AI Trading System",
    description: "Multi-agent financial intelligence system. Deploys specialized AI agents for real-time market analysis and strategic decision-making.",
    tags: ["Python", "CrewAI", "GPT API", "Financial Tech"],
    links: { demo: "https://github.com/PreethamNimmagadda02/Automated-Financial-Trading-Strategy-System", repo: "https://github.com/PreethamNimmagadda02/Automated-Financial-Trading-Strategy-System" },
    gradient: "from-green-500 to-emerald-500",
    status: "Complete",
    featured: false,
    icon: Cpu
  }
];

function ProjectCard({ project, index, isFeatured = false }: { project: typeof projects[0], index: number, isFeatured?: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);
  
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const Icon = project.icon;

  return (
    <motion.div className="relative [perspective:1500px] h-full">
      {/* Animated gradient border */}
      <div className={`absolute -inset-[1px] bg-gradient-to-r ${project.gradient} rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`} />
      
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full rounded-3xl bg-zinc-900/80 border border-white/10 overflow-hidden transition-all duration-500 group"
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
        
        {/* Glare Effect */}
        <motion.div 
          className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.2) 0%, transparent 80%)`
            )
          }}
        />

        <div className={`relative p-6 ${isFeatured ? 'md:p-8' : ''} h-full flex flex-col [transform-style:preserve-3d]`}>
          {/* Header */}
          <div className="flex justify-between items-start mb-4" style={{ transform: "translateZ(50px)" }}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${project.gradient} shadow-lg`}>
                <Icon size={isFeatured ? 24 : 20} className="text-white" />
              </div>
              <div>
                <h3 className={`${isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'} font-bold text-white`}>
                  {project.title}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${
                  project.status === "Live" 
                    ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${project.status === "Live" ? "bg-green-400 animate-pulse" : "bg-blue-400"}`} />
                  {project.status}
                </span>
              </div>
            </div>
            <Link 
              href={project.links.demo}
              target="_blank"
              className={`p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition-all z-20 hover:scale-110`}
            >
              <ArrowUpRight size={isFeatured ? 22 : 18} />
            </Link>
          </div>

          <p className={`text-gray-400 mb-6 flex-grow leading-relaxed ${isFeatured ? 'text-base' : 'text-sm'}`} style={{ transform: "translateZ(25px)" }}>
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6" style={{ transform: "translateZ(30px)" }}>
            {project.tags.map((tag, i) => (
              <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors">
                {tag}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 mt-auto pt-4 border-t border-white/5" style={{ transform: "translateZ(40px)" }}>
            <Link
              href={project.links.demo}
              target="_blank"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-20 group/link"
            >
              <ExternalLink size={16} className="group-hover/link:scale-110 transition-transform" />
              Live Demo
            </Link>
            <Link
              href={project.links.repo}
              target="_blank"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-20 group/link"
            >
              <Github size={16} className="group-hover/link:scale-110 transition-transform" />
              Source
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const featuredProject = projects.find(p => p.featured);
  const otherProjects = projects.filter(p => !p.featured);

  return (
    <section id="projects" className="py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4"
          >
            Portfolio
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Projects</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">Crafting solutions that make an impact</p>
        </motion.div>

        {/* Featured Project */}
        {featuredProject && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <ProjectCard project={featuredProject} index={0} isFeatured={true} />
          </motion.div>
        )}

        {/* Other Projects Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.2 }
            }
          }}
        >
          {otherProjects.map((project, index) => (
            <motion.div 
              key={index}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
            >
              <ProjectCard project={project} index={index + 1} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
