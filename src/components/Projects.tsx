"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ExternalLink, Github, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React, { useRef } from "react";

const projects = [
  {
    title: "College Central",
    description: "A comprehensive student hub for IIT(ISM) Dhanbad, featuring a personalized dashboard, grade tracking, class schedules, an interactive campus map, and real-time event updates.",
    tags: ["React", "Typescript", "Firebase", "REST APIs", "Tailwind CSS"],
    links: { demo: "https://collegecentral.live/#/", repo: "https://github.com/PreethamNimmagadda02/College-Central" },
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "group-hover:border-purple-500/50"
  },
  {
    title: "FestFlow",
    description: "Revolutionary AI-powered event orchestration platform. Transforms complex goals into executable plans using specialized autonomous agents.",
    tags: ["React", "Firebase", "Gemini API", "AI Agents"],
    links: { demo: "https://festflow.co.in/", repo: "https://github.com/PreethamNimmagadda02/FestFlow" },
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "group-hover:border-blue-500/50"
  },
  // {
  //   title: "BlinkIt Clone",
  //   description: "Enterprise-grade e-commerce platform with JWT authentication, MVC architecture, and bulletproof email verification.",
  //   tags: ["MERN Stack", "Redis", "REST APIs", "Multer"],
  //   links: { demo: "#", repo: "#" },
  //   gradient: "from-purple-500/20 to-pink-500/20",
  //   border: "group-hover:border-purple-500/50"
  // },
  
  {
    title: "AI Trading System",
    description: "Multi-agent financial intelligence system. Deploys specialized AI agents for real-time market analysis and strategic decision-making.",
    tags: ["Python", "CrewAI", "GPT API", "Financial Tech"],
    links: { demo: "https://github.com/PreethamNimmagadda02/Automated-Financial-Trading-Strategy-System", repo: "https://github.com/PreethamNimmagadda02/Automated-Financial-Trading-Strategy-System" },
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "group-hover:border-green-500/50"
  }
];

function ProjectCard({ project, index }: { project: typeof projects[0], index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  // Increased rotation range for "better 3d effect"
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["25deg", "-25deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-25deg", "25deg"]);
  
  // Glare effect
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

  return (
    <motion.div
      className="relative [perspective:1500px]"
    >
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`relative h-full rounded-3xl bg-white/5 border border-white/10 overflow-hidden transition-all duration-500 ${project.border} group card-hover`}
      >
        <div
          style={{ transform: "translateZ(75px)" }}
          className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />
        
        {/* Glare Effect */}
        <motion.div 
          className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.3) 0%, transparent 80%)`
            )
          }}
        />

        <div className="relative p-8 h-full flex flex-col [transform-style:preserve-3d]">
          <div className="flex justify-between items-start mb-6" style={{ transform: "translateZ(50px)" }}>
            <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <Link 
              href={project.links.demo}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
            >
              <ArrowUpRight size={20} />
            </Link>
          </div>

          <p className="text-gray-400 mb-6 flex-grow leading-relaxed" style={{ transform: "translateZ(25px)" }}>
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8" style={{ transform: "translateZ(30px)" }}>
            {project.tags.map((tag, i) => (
              <span key={i} className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-auto" style={{ transform: "translateZ(40px)" }}>
            <Link
              href={project.links.demo}
              className="text-sm font-medium text-white hover:text-primary transition-colors flex items-center gap-2 z-20"
            >
              <ExternalLink size={16} />
              Live Demo
            </Link>
            <Link
              href={project.links.repo}
              className="text-sm font-medium text-white hover:text-primary transition-colors flex items-center gap-2 z-20"
            >
              <Github size={16} />
              Source Code
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  return (
    <section id="projects" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Featured Projects</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full" />
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.2 }}
        >
          {projects.map((project, index) => (
            <motion.div key={index} variants={itemVariants}>
              <ProjectCard project={project} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
