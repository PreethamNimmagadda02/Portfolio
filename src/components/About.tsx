"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Code, Rocket, Globe, BookOpen, Sparkles, Trophy, Users, Target, Zap } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import React from "react";

const features = [
  {
    icon: <Code className="w-6 h-6" />,
    title: "AI Architect",
    description: (
      <>
        Pioneering <span className="text-blue-400 font-semibold">autonomous agent systems</span> with <span className="text-purple-400 font-semibold">CrewAI</span>, <span className="text-green-400 font-semibold">Gemini API</span>, and state-of-the-art <span className="text-pink-400 font-semibold">LLMs</span>.
      </>
    ),
    gradient: "from-blue-500 to-cyan-500",
    glow: "group-hover:shadow-blue-500/25"
  },
  {
    icon: <Rocket className="w-6 h-6" />,
    title: "Elite Coder",
    description: (
      <>
        Top <span className="text-yellow-400 font-semibold">1% on CodeChef</span> (1864 rating). <span className="text-purple-400 font-semibold">Codeforces Specialist</span> with <span className="text-blue-400 font-semibold">1000+ problems</span> conquered.
      </>
    ),
    gradient: "from-purple-500 to-pink-500",
    glow: "group-hover:shadow-purple-500/25"
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Campus Leader",
    description: (
      <>
        <span className="text-emerald-400 font-semibold">Student Senator</span> championing <span className="text-teal-400 font-semibold">1500+ peers</span>. Orchestrated <span className="text-green-400 font-semibold">10+ major events</span>.
      </>
    ),
    gradient: "from-emerald-500 to-teal-500",
    glow: "group-hover:shadow-emerald-500/25"
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Full Stack Engineer",
    description: (
      <>
        Shipping production-ready apps with <span className="text-orange-400 font-semibold">Next.js</span>, <span className="text-yellow-400 font-semibold">React</span>, <span className="text-red-400 font-semibold">Node.js</span>, and <span className="text-amber-400 font-semibold">Firebase</span> at scale.
      </>
    ),
    gradient: "from-orange-500 to-yellow-500",
    glow: "group-hover:shadow-orange-500/25"
  }
];

const skills = [
  "React", "Next.js", "TypeScript", "Python", "CrewAI", "LangChain", 
  "Node.js", "Firebase", "Tailwind CSS", "Gemini API"
];

// Animated counter component
function AnimatedCounter({ value, suffix = "", duration = 2000 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(value * eased));
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// 3D Tilt Card Component with Framer Motion springs
function TiltCard({ children, gradient, className = "" }: { children: React.ReactNode; gradient: string; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

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
      className={`relative [perspective:1500px] group ${className}`}
      whileHover={{ scale: 1.03 }}
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
        className="relative h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function About() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

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
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 50, damping: 15 }
    }
  };

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ amount: 0.3 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={14} className="text-purple-400" />
            </motion.div>
            <span className="text-sm text-gray-400">Who I Am</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            About <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 font-black">Me</span>
          </h2>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ amount: 0.3 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 text-center lg:text-left"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              A <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 font-bold">Tech Innovator</span> &{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 font-bold">Community Leader</span>
            </h3>
            <p className="text-gray-100 font-[var(--font-inter)] text-lg leading-relaxed">
              Engineering student at <span className="text-white font-bold">IIT (ISM) Dhanbad</span> with a laser focus on 
              building autonomous AI systems that solve real-world problems. Engineered <span className="text-yellow-300 font-bold">20% memory optimization</span> in multi-agent architectures, pushing the boundaries of efficient AI at scale.
            </p>
            <p className="text-gray-100 font-[var(--font-inter)] text-lg leading-relaxed">
              Former <span className="text-white font-bold">Student Senator</span> shaping policies for <span className="text-purple-300 font-bold">4,000+ students</span> & 
              <span className="text-white font-bold"> Hostel Prefect</span> managing operations for <span className="text-purple-300 font-bold">1,800+ residents</span>.
            </p>

            {/* Animated Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { value: 4000, suffix: "+", label: <><span className="text-purple-400 font-semibold">Students</span> Influenced</>, icon: Users, color: "from-purple-400 to-pink-400" },
                { value: 20, suffix: "%", label: <><span className="text-yellow-400 font-semibold">Memory</span> Reduction</>, icon: Zap, color: "from-yellow-400 to-orange-400" },
                { value: 350, suffix: "+", label: <><span className="text-emerald-400 font-semibold">Participants</span> Led</>, icon: Target, color: "from-emerald-400 to-cyan-400" }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                >
                  <stat.icon size={16} className="mx-auto mb-2 text-gray-500 group-hover:text-white transition-colors" />
                  <div className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-200 mt-1 group-hover:text-gray-100 transition-colors font-medium font-[var(--font-inter)]">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.3 }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <TiltCard gradient={feature.gradient}>
                  <div className={`relative p-6 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 ${feature.glow} hover:shadow-2xl h-full`}>
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    {/* Floating Icon */}
                    <motion.div 
                      className={`relative mb-4 p-3 rounded-xl bg-gradient-to-br ${feature.gradient} w-fit`}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      style={{ transform: "translateZ(30px)" }}
                    >
                      <div className="text-white">{feature.icon}</div>
                    </motion.div>
                    
                    {/* Content */}
                    <h4 className="relative text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="relative text-gray-200 font-[var(--font-inter)] text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover indicator */}
                    <motion.div 
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                    </motion.div>
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
