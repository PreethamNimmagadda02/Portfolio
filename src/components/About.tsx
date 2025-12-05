"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Code, Rocket, Globe, BookOpen, Sparkles } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: <Code className="w-6 h-6" />,
    title: "AI Specialist",
    description: "Building autonomous agents with CrewAI, Gemini API, and cutting-edge LLMs.",
    gradient: "from-blue-500 to-cyan-500",
    glow: "group-hover:shadow-blue-500/25"
  },
  {
    icon: <Rocket className="w-6 h-6" />,
    title: "Competitive Coder",
    description: "Codeforces Specialist (1450) and 4-Star Coder on CodeChef (1864).",
    gradient: "from-purple-500 to-pink-500",
    glow: "group-hover:shadow-purple-500/25"
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Community Leader",
    description: "Student Senator representing 1500+ peers and organizing major campus events.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "group-hover:shadow-emerald-500/25"
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Full Stack Dev",
    description: "Developing scalable web apps with Next.js, React, Node.js, and Firebase.",
    gradient: "from-orange-500 to-yellow-500",
    glow: "group-hover:shadow-orange-500/25"
  }
];

// 3D Tilt Card Component
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPos);
    y.set(yPos);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`[perspective:1000px] ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-sm text-gray-400">Who I Am</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Me</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              A <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Tech Innovator</span> &{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Community Leader</span>
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Currently pursuing a B.Tech in Electronics and Communication Engineering at IIT (ISM) Dhanbad. 
              My focus lies in building autonomous AI agents and scalable full-stack applications.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              As a Student Senator, I actively represent over <span className="text-white font-semibold">1,500 peers</span>, 
              advocating for better facilities and driving community engagement. I combine technical expertise with 
              leadership to solve real-world problems.
            </p>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              {[
                { value: "800+", label: "Problems Solved" },
                { value: "1500+", label: "Peers Represented" },
                { value: "3+", label: "Projects Shipped" }
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <TiltCard>
                  <div className={`group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 ${feature.glow} hover:shadow-2xl h-full`}>
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    {/* Icon */}
                    <div 
                      className={`relative mb-4 p-3 rounded-xl bg-gradient-to-br ${feature.gradient} w-fit group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      style={{ transform: "translateZ(20px)" }}
                    >
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    
                    {/* Content */}
                    <h4 
                      className="relative text-xl font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all"
                      style={{ transform: "translateZ(15px)" }}
                    >
                      {feature.title}
                    </h4>
                    <p 
                      className="relative text-gray-400 text-sm leading-relaxed"
                      style={{ transform: "translateZ(10px)" }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
