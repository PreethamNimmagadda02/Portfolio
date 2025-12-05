"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import AvatarFlipCard from "./AvatarFlipCard";
import MagneticButton from "./MagneticButton";

// Animated gradient text component
function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative ${className}`}>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-[length:200%_100%] animate-gradient">
        {children}
      </span>
    </span>
  );
}

// Floating badge component
function FloatingBadge({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: "spring" }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm text-gray-300"
    >
      <Sparkles size={14} className="text-purple-400" />
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax values
  const yLeft = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yRight = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const yCenter = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Mouse position for 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]), { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Letter animation variants
  const letterVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: "easeOut" as const,
      },
    }),
  };

  const AnimatedWord = ({ word, className }: { word: string; className?: string }) => (
    <span className={`inline-flex overflow-hidden ${className}`}>
      {word.split("").map((letter, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          className="inline-block"
          style={{ transformStyle: "preserve-3d" }}
        >
          {letter}
        </motion.span>
      ))}
    </span>
  );

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Gradient orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]"
        />
      </div>

      <motion.div 
        style={{ scale, rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        {/* Top badge */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FloatingBadge delay={0.3}>
            Available for exciting opportunities
          </FloatingBadge>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20">
          
          {/* Left Side */}
          <motion.div 
            style={{ y: yLeft, opacity }}
            className="flex flex-col items-end text-right [transform-style:preserve-3d]"
          >
            <motion.div 
              className="mb-[-10px] z-10"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-lg md:text-xl font-medium text-gray-400 tracking-wide">
                Preetham
              </p>
            </motion.div>
            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter leading-none [transform-style:preserve-3d]">
              <AnimatedWord word="BUILDING" className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-300 to-white" />
            </h1>
          </motion.div>

          {/* Center Avatar */}
          <motion.div
            style={{ y: yCenter }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="z-20 my-8 lg:my-0"
          >
            <AvatarFlipCard />
          </motion.div>

          {/* Right Side */}
          <motion.div 
            style={{ y: yRight, opacity }}
            className="flex flex-col items-start text-left [transform-style:preserve-3d]"
          >
            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter leading-none">
              <AnimatedWord word="AGENTS" className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-purple-300" />
            </h1>
            <motion.div 
              className="mt-4 max-w-xs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-lg text-gray-400 leading-relaxed text-right lg:text-left">
                Upcoming Generative AI Intern @ Introspect Labs. <span className="text-purple-400">Specialist @ Codeforces.</span>
              </p>
            </motion.div>
          </motion.div>

        </div>

        {/* CTA Buttons - Centered below */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-6 mt-16"
        >
          <MagneticButton strength={0.2}>
            <Link
              href="#projects"
              className="relative px-8 py-4 rounded-full bg-white text-black font-bold overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                View My Work
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </MagneticButton>
          
          <MagneticButton strength={0.2}>
            <Link
              href="#contact"
              className="px-8 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm relative overflow-hidden group"
            >
              <span className="relative z-10">Contact Me</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div 
          className="flex flex-col items-center gap-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-9 border border-white/20 rounded-full flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-1 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
