"use client";

import { motion, useScroll, useTransform, AnimatePresence, Variants, useSpring, useInView } from "framer-motion";
import { ArrowRight, Sparkles, ChevronDown, Code2, Zap, Library } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import AvatarFlipCard from "./AvatarFlipCard";
import MagneticButton from "./MagneticButton";

// Roles to cycle through in the typing rotator
const ROLES = [
  "Perpetual Learner",
  "AI Engineer",
  "Full Stack Developer",
  "AI Security Visionary",
  "Open Source Builder",
  "Competitive Programmer",
  "Agent Systems Architect",
  "Relentless Innovator"
];

// Typing role rotator component
function RoleRotator() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = ROLES[roleIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayed.length < currentRole.length) {
        timeout = setTimeout(() => {
          setDisplayed(currentRole.slice(0, displayed.length + 1));
        }, 80);
      } else {
        // Pause at full text
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, 40);
      } else {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, roleIndex]);

  return (
    <span className="inline-flex items-center">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 font-bold">
        {displayed}
      </span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-[3px] h-[1.1em] bg-purple-400 ml-0.5 rounded-full"
      />
    </span>
  );
}

// Currently Building widget
function CurrentlyBuilding() {
  return (
    <motion.a
      href="https://www.matters.ai/"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.6 }}
      className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer group"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
      </span>
      <span className="text-sm text-gray-400 font-medium group-hover:text-gray-300 transition-colors">
        Building: <span className="text-white font-semibold text-base group-hover:text-blue-400 transition-colors">Matters.AI</span>
      </span>
    </motion.a>
  );
}

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
  const [started, setStarted] = useState(false);
  // Strip commas for parsing, keep suffix like "+"
  const rawNumeric = value.replace(/,/g, "").match(/[\d.]+/)?.[0] || "0";
  const suffix = value.replace(/,/g, "").replace(/[\d.]+/, "");
  const hasComma = value.includes(",");

  // Start counting as soon as the page loader finishes
  useEffect(() => {
    const onDone = () => setStarted(true);
    window.addEventListener("loader-done", onDone);
    return () => window.removeEventListener("loader-done", onDone);
  }, []);

  useEffect(() => {
    if (!started) return;

    const target = parseFloat(rawNumeric);
    const duration = 2000;
    const start = Date.now();

    let animationFrameId: number;
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      const current = Math.floor(target * eased);
      // Format with commas if the original value had them
      const formatted = hasComma ? current.toLocaleString() : current.toString();
      setDisplayValue(formatted);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        const final = hasComma ? parseFloat(rawNumeric).toLocaleString() : rawNumeric;
        setDisplayValue(final);
      }
    };
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [started, rawNumeric, hasComma]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={started ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, type: "spring" }}
      className="text-center"
    >
      <div className={`text-xl sm:text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
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

// AnimatedWord component — waits for loader to finish before revealing
function AnimatedWord({ word, className, isOutline = false, reverse = false }: { word: string; className?: string; isOutline?: boolean; reverse?: boolean }) {
  const isGradient = className?.includes("bg-clip-text");
  const letters = reverse ? word.split("").reverse() : word.split("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onDone = () => setReady(true);
    window.addEventListener("loader-done", onDone);
    return () => window.removeEventListener("loader-done", onDone);
  }, []);

  return (
    <motion.span
      className={`inline-flex px-1 [perspective:1000px] ${!isGradient && !isOutline ? className : ""} ${reverse ? "flex-row-reverse" : ""}`}
      variants={containerVariants}
      initial="hidden"
      animate={ready ? "visible" : "hidden"}
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
    offset: ["start start", "end start"], // Hero starts at the top, so "start start" is appropriate
  });

  // Re-enable physics spring on the normalized progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax values
  // Reset parallax values to map the normalized [0, 1] spring progress
  const yLeft = useTransform(smoothProgress, [0, 1], [0, 200]);
  const yRight = useTransform(smoothProgress, [0, 1], [0, -200]);
  const yCenter = useTransform(smoothProgress, [0, 1], [0, 80]);
  const opacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);

  // Derived transforms for background effects - outside render cycle

  // Hydration fix & Mobile detection
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    const onLoaderDone = () => setLoaderDone(true);
    window.addEventListener("loader-done", onLoaderDone);
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("loader-done", onLoaderDone);
    };
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
            <h1 className="flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-4 text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
              <AnimatedWord
                word="REDEFINING"
                className="bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-300 to-blue-400 drop-shadow-2xl"
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
              animate={loaderDone ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 0.2 }}
            >
              <FloatingBadge delay={0.3}>
                🚀 Innovating at the Edge of AI
              </FloatingBadge>
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={loaderDone ? { scale: 1, rotate: 0 } : undefined}
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
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mt-2 lg:mt-0">
              <AnimatedWord
                word="AI SECURITY"
                className="bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-300 to-purple-400 drop-shadow-2xl"
              />
            </h1>
            <motion.div
              className="mt-8 max-w-sm sm:max-w-md lg:max-w-lg mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={loaderDone ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 0.8 }}
            >
              <p className="text-lg sm:text-xl text-gray-200 font-medium leading-relaxed text-center lg:text-left font-[var(--font-inter)]">
                Forging the <span className="text-blue-400 font-bold">autonomous AI copilot</span> at <span className="text-white font-bold">Matters.AI</span> that doesn't wait for breaches—it <span className="text-purple-400 font-bold">eliminates them before they exist</span>. Turning DSPM into a living, self-healing system where every threat is detected, analysed and <span className="text-pink-400 font-bold">autonomously remediated</span> at the speed of thought.
              </p>
            </motion.div>
          </motion.div>

        </div>

        {/* Stats Row */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 md:gap-16 mt-12 px-4"
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

        {/* Role Rotator */}
        <motion.div
          className="flex justify-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <div className="text-lg sm:text-xl md:text-2xl font-medium text-gray-300 font-[var(--font-inter)]">
            Roles: <RoleRotator />
          </div>
        </motion.div>

        {/* Currently Building Widget + Available Badge */}
        <div className="flex flex-wrap justify-center items-center gap-3 mt-5">
          {mounted && <CurrentlyBuilding />}
          {mounted && (
            <motion.a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("contact");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0, duration: 0.6 }}
              className="relative inline-flex items-center gap-2.5 px-4 py-2 rounded-full cursor-pointer group"
            >
              {/* Animated gradient border */}
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-60 group-hover:opacity-100 blur-[1px] transition-opacity duration-300 animate-pulse-glow" />
              <span className="absolute inset-[1px] rounded-full bg-black/90 backdrop-blur-sm" />

              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              </span>
              <span className="relative text-sm text-gray-300 font-medium group-hover:text-white transition-colors">
                Open to <span className="text-white font-semibold">Opportunities</span>
              </span>
            </motion.a>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator opacity={opacity} />
    </section >
  );
}
