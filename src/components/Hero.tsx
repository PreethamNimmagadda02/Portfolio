"use client";

import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight, Sparkles, ChevronDown, Code2, Zap, Library } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useState, useMemo } from "react";
import AvatarFlipCard from "./AvatarFlipCard";
import MagneticButton from "./MagneticButton";

// Animated gradient text component
function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative ${className}`}>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-white bg-[length:200%_100%] animate-gradient">
        {children}
      </span>
    </span>
  );
}

// Floating badge component — simplified for performance
function FloatingBadge({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: [0, -8, 0],
      }}
      transition={{
        opacity: { delay, duration: 0.6 },
        y: { delay: delay + 0.6, duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/10 text-sm text-gray-300"
    >
      <Sparkles size={14} className="text-purple-400" />
      {children}
    </motion.div>
  );
}

// Glitch text effect on hover
function GlitchText({ children, className = "" }: { children: string; className?: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [canHover, setCanHover] = useState(false);

  // Calculate animation duration: (length * stagger) + initial delay + buffer
  // Stagger is 0.1s (from containerVariants), delayChildren is 0.1s
  useEffect(() => {
    const duration = (children.length * 100) + 500;
    const timer = setTimeout(() => {
      setCanHover(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [children]);

  return (
    <motion.span
      className={`relative inline-block cursor-pointer ${className}`}
      onMouseEnter={() => canHover && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative z-10">
        <AnimatedWord word={children} />
      </span>
      {isHovered && (
        <>
          <motion.span
            className="absolute inset-0 text-cyan-400 z-0"
            animate={{ x: [-2, 2, -2], opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 0.15, repeat: Infinity }}
            style={{ clipPath: "inset(10% 0 60% 0)" }}
          >
            {children}
          </motion.span>
          <motion.span
            className="absolute inset-0 text-red-400 z-0"
            animate={{ x: [2, -2, 2], opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 0.15, repeat: Infinity, delay: 0.05 }}
            style={{ clipPath: "inset(50% 0 20% 0)" }}
          >
            {children}
          </motion.span>
        </>
      )}
    </motion.span>
  );
}

// Scroll indicator component
function ScrollIndicator({ opacity }: { opacity: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <motion.div style={{ opacity }} className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <ChevronDown size={20} className="text-gray-500" />
          <ChevronDown size={20} className="text-gray-600 -mt-3" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Stats counter with count-up animation
function AnimatedStat({ value, label, delay, gradient }: { value: string; label: React.ReactNode; delay: number; gradient: string }) {
  const [displayValue, setDisplayValue] = useState("0");
  const numericPart = value.match(/[\d.]+/)?.[0] || "0";
  const suffix = value.replace(/[\d.]+/, "");

  useEffect(() => {
    const target = parseFloat(numericPart);
    const duration = 2000;
    const startTime = Date.now();
    const delayMs = delay * 1000;

    // Only start animation after mount
    const timer = setTimeout(() => {
      let animationFrameId: number;
      const animate = () => {
        const elapsed = Date.now() - startTime - delayMs;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

        const current = Math.floor(target * eased);
        setDisplayValue(current.toString());

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setDisplayValue(numericPart);
        }
      };
      animate();
      return () => cancelAnimationFrame(animationFrameId);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [numericPart, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay + 0.5, duration: 0.5, type: "spring" }}
      className="text-center"
    >
      <div className={`text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
        {displayValue}{suffix}
      </div>
      <div className="text-sm text-gray-200 mt-1 font-medium font-[var(--font-inter)]">{label}</div>
    </motion.div>
  );
}

// Container variants with staggerChildren for sequential reveal
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Letter animation variants - Classy Fade Reveal (no blur filter for perf)
const letterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// AnimatedWord component
function AnimatedWord({ word, className, isOutline = false, reverse = false }: { word: string; className?: string; isOutline?: boolean; reverse?: boolean }) {
  const isGradient = className?.includes("bg-clip-text");
  const letters = reverse ? word.split("").reverse() : word.split("");

  return (
    <motion.span
      className={`inline-flex px-1 [perspective:1000px] ${!isGradient && !isOutline ? className : ""} ${reverse ? "flex-row-reverse" : ""}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          variants={letterVariants}
          className={`inline-block ${isGradient ? className : ""} ${isOutline ? "text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.9)]" : ""}`}
          style={{
            marginRight: letter === " " ? "0.25em" : "0"
          }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax values
  const yLeft = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const yRight = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const yCenter = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Derived transforms for background effects - outside render cycle

  // Hydration fix & Mobile detection
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-24 md:pt-40 md:pb-24"
    >
      {/* Static grid background (Replaced with Ecosystem radial gradient) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black/80 to-black/90 pointer-events-none z-0" />

      <div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center"
      >
        <div className="flex flex-col lg:flex-row items-center justify-center lg:items-center w-full mt-8 lg:mt-0 relative z-10">

          {/* Left Side - Text */}
          <motion.div
            style={{ y: isMobile ? 0 : yLeft, opacity }}
            className="flex flex-col flex-1 w-full items-center lg:items-end text-center lg:text-right order-2 lg:order-1 relative z-10"
          >
            <h1 className="flex flex-wrap items-center justify-center lg:justify-end gap-3 sm:gap-4 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
              <AnimatedWord
                word="GENERATIVE"
                className="bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-300 to-blue-400 drop-shadow-2xl"
              />
              <AnimatedWord
                word="AI"
                className="bg-clip-text text-transparent bg-gradient-to-b from-white via-purple-300 to-pink-400 drop-shadow-2xl"
              />
            </h1>
          </motion.div>

          {/* Center Avatar - Dead Center */}
          <motion.div
            style={{ y: isMobile ? 0 : yCenter }}
            className="relative z-20 my-2 lg:my-0 order-1 lg:order-2 flex flex-col items-center flex-none px-4 lg:px-12"
          >
            {/* Badge - Absolute Positioned */}
            <motion.div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 lg:mb-12 whitespace-nowrap"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FloatingBadge delay={0.3}>
                🚀 Innovating at the Edge of AI
              </FloatingBadge>
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="scale-[0.65] sm:scale-90 md:scale-100"
            >
              <AvatarFlipCard />
            </motion.div>
          </motion.div>

          {/* Right Side - Text */}
          <motion.div
            style={{ y: isMobile ? 0 : yRight, opacity }}
            className="flex flex-col flex-1 w-full items-center lg:items-start text-center lg:text-left order-3 relative z-10"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
              <AnimatedWord
                word="SPECIALIST"
                className="bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-300 to-purple-400 drop-shadow-2xl"
              />
            </h1>
            <motion.div
              className="mt-8 max-w-sm sm:max-w-md lg:max-w-lg mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-lg sm:text-xl text-gray-200 font-medium leading-relaxed text-center lg:text-left font-[var(--font-inter)]">
                Synthesizing <span className="text-purple-400 font-bold">Vision, Logic & Empathy</span> to architect the senses of the Agentic Age. At <span className="text-white font-bold">Introspect Labs</span>, I pioneer <span className="text-blue-400 font-bold">VideoRAG</span> systems—weaving the <span className="text-pink-400 font-bold">Neural Fabric</span> for machines that perceive, reason and understand.
              </p>
            </motion.div>
          </motion.div>

        </div>

        {/* Stats Row */}
        <motion.div
          className="flex justify-center gap-8 md:gap-16 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {mounted && (
            <>
              <AnimatedStat
                value="10,000+"
                label={<><span className="text-pink-400 font-bold">Hours</span> of Coding</>}
                delay={1.2}
                gradient="from-[#a855f7] via-[#ec4899] to-[#fb923c]"
              />
              <AnimatedStat
                value="1000+"
                label={<><span className="text-cyan-400 font-bold">Problems</span> Solved</>}
                delay={1}
                gradient="from-[#3b82f6] via-[#2dd4bf] to-[#4ade80]"
              />
              <AnimatedStat
                value="5+"
                label={<><span className="text-orange-400 font-bold">Products</span> Built</>}
                delay={1.4}
                gradient="from-[#f43f5e] via-[#f59e0b] to-[#fbbf24]"
              />
            </>
          )}
        </motion.div>

        {/* CTA Buttons - Centered below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-6 mt-10"
        >

        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator opacity={opacity} />
    </section >
  );
}
