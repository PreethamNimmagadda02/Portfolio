"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ExternalLink, Github, ArrowUpRight, GraduationCap, Ticket, TrendingUp } from "lucide-react";
import Link from "next/link";
import React from "react";

const projects = [
  {
    title: "College Central",
    description: (
      <>
        The <span className="text-purple-400 font-semibold">Digital Backbone</span> of IIT(ISM) Dhanbad. A centralized platform empowering students with <span className="text-pink-400 font-semibold">real-time academic insights</span>, campus navigation, and event integration.
      </>
    ),
    tags: ["React", "TypeScript", "Firebase", "REST APIs", "Tailwind CSS", "Vite", "Framer Motion"],
    links: { demo: "https://collegecentral.live/#/", repo: "https://github.com/PreethamNimmagadda02/College-Central" },
    gradient: "from-purple-500 to-pink-500",
    status: "Live",
    featured: true,
    icon: GraduationCap
  },
  {
    title: "FestFlow",
    description: (
      <>
        <span className="text-blue-400 font-semibold">Autonomous Event Orchestration</span> at scale. Leveraging <span className="text-cyan-400 font-semibold">multi-agent AI</span> to transform abstract constraints into executable logistical plans.
      </>
    ),
    tags: ["React", "Firebase", "Gemini API", "AI Agents"],
    links: { demo: "https://festflow.co.in/", repo: "https://github.com/PreethamNimmagadda02/FestFlow" },
    gradient: "from-blue-500 to-cyan-500",
    status: "Live",
    featured: false,
    icon: Ticket
  },
  {
    title: "AI Trading System",
    description: (
      <>
        <span className="text-emerald-400 font-semibold">Algorithmic Trading Infrastructure</span>. A swarm of <span className="text-green-400 font-semibold">AI agents</span> analyzing market signals to execute high-frequency trading strategies with precision.
      </>
    ),
    tags: ["Python", "CrewAI", "GPT API", "Financial Tech"],
    links: { demo: "https://github.com/PreethamNimmagadda02/Automated-Financial-Trading-Strategy-System", repo: "https://github.com/PreethamNimmagadda02/Automated-Financial-Trading-Strategy-System" },
    gradient: "from-green-500 to-emerald-500",
    status: "Complete",
    featured: false,
    icon: TrendingUp
  }
];

function ProjectCard({ project, index, isFeatured = false }: { project: { title: string, description: React.ReactNode, tags: string[], links: { demo: string, repo: string }, gradient: string, status: string, featured: boolean, icon: any }, index: number, isFeatured?: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smoother spring configuration
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

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
    <motion.div
      className="relative [perspective:1500px] h-full"
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      {/* Animated shimmer border - Traveling glow effect */}
      <motion.div
        className={`absolute -inset-[2px] bg-gradient-to-r ${project.gradient} rounded-3xl opacity-50 blur-md`}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "200% 50%"],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ backgroundSize: "200% 200%" }}
      />
      {/* Inner glow pulse */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${project.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full rounded-3xl bg-zinc-900/90 border border-white/10 overflow-hidden transition-all duration-500 group backdrop-blur-xl"
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-5 group-hover:opacity-15 transition-opacity duration-500`} />

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

        <div className={`relative p-6 md:p-8 h-full flex flex-col [transform-style:preserve-3d]`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4" style={{ transform: "translateZ(50px)" }}>
            <div className="flex items-center gap-3">
              <motion.div
                className={`p-2 rounded-xl bg-gradient-to-br ${project.gradient} shadow-lg shrink-0`}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon size={isFeatured ? 24 : 20} className="text-white" />
              </motion.div>
              <div className="min-w-0">
                <h3 className={`${isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'} font-bold text-white truncate`}>
                  {project.title}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${project.status === "Live"
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
              aria-label={`Visit ${project.title} live demo`}
              className={`p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition-all z-20 hover:scale-110 hover:rotate-45 active:scale-95`}
            >
              <ArrowUpRight size={isFeatured ? 22 : 18} />
            </Link>
          </div>

          <p className={`text-gray-200 font-[var(--font-inter)] mb-6 flex-grow leading-relaxed ${isFeatured ? 'text-base' : 'text-sm'}`} style={{ transform: "translateZ(25px)" }}>
            {project.description}
          </p>

          {/* Tags with pop animation */}
          <motion.div
            className="flex flex-wrap gap-2 mb-6"
            style={{ transform: "translateZ(30px)" }}
          >
            {project.tags.map((tag, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                }}
                whileHover={{
                  scale: 1.15,
                  y: -3,
                  boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                }}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-purple-500/30 transition-colors cursor-default"
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>

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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.3 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4"
          >
            Portfolio
          </motion.span>
          <motion.h2
            className="text-3xl md:text-5xl font-black text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Featured{" "}
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"
              style={{
                background: "linear-gradient(90deg, #c084fc 0%, #60a5fa 50%, #c084fc 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              Ventures
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-gray-400 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Building products that define the future
          </motion.p>
        </motion.div>

        {/* Featured Project */}
        {featuredProject && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ amount: 0.2 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 50 }}
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
              transition: { staggerChildren: 0.2, delayChildren: 0.1 }
            }
          }}
        >
          {otherProjects.map((project, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.9 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 50, damping: 15 }
                }
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
