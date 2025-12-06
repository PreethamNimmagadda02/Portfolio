"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, ChevronDown, Code2, Brain, Cpu, Zap, Terminal, Rocket } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useState, useMemo } from "react";
import AvatarFlipCard from "./AvatarFlipCard";
import MagneticButton from "./MagneticButton";

// Floating tech icons that orbit around the hero
const floatingIcons = [
  { Icon: Code2, delay: 0, size: 24, gradient: "from-blue-400 to-cyan-400" },
  { Icon: Brain, delay: 0.5, size: 28, gradient: "from-purple-400 to-pink-400" },
  { Icon: Cpu, delay: 1, size: 22, gradient: "from-green-400 to-emerald-400" },
  { Icon: Zap, delay: 1.5, size: 26, gradient: "from-yellow-400 to-orange-400" },
  { Icon: Terminal, delay: 2, size: 24, gradient: "from-red-400 to-rose-400" },
  { Icon: Rocket, delay: 2.5, size: 26, gradient: "from-indigo-400 to-violet-400" },
];

// Floating Icon Component with mouse reactivity
function FloatingIcon({ 
  Icon, 
  delay, 
  size, 
  gradient, 
  index, 
  mouseX, 
  mouseY 
}: { 
  Icon: any; 
  delay: number; 
  size: number; 
  gradient: string; 
  index: number;
  mouseX: number;
  mouseY: number;
}) {
  const angle = (index / floatingIcons.length) * Math.PI * 2;
  const radius = 280 + Math.sin(index * 1.5) * 60;
  
  // Base position in a circle
  const baseX = Math.cos(angle) * radius;
  const baseY = Math.sin(angle) * radius * 0.4; // Elliptical orbit
  
  // Mouse reactivity - icons get pushed away slightly
  const pushX = mouseX * 0.05;
  const pushY = mouseY * 0.05;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0.4, 0.8, 0.4],
        scale: [1, 1.1, 1],
        x: baseX + pushX,
        y: baseY + pushY,
        rotate: [0, 360],
      }}
      transition={{
        opacity: { duration: 3, repeat: Infinity, delay },
        scale: { duration: 3, repeat: Infinity, delay },
        x: { duration: 0.3 },
        y: { duration: 0.3 },
        rotate: { duration: 20 + index * 5, repeat: Infinity, ease: "linear" },
      }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    >
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-20 backdrop-blur-sm border border-white/10 shadow-lg`}>
        <Icon size={size} className="text-white/90" />
      </div>
    </motion.div>
  );
}

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
      animate={{ 
        opacity: 1, 
        y: [0, -8, 0],
      }}
      transition={{ 
        opacity: { delay, duration: 0.6 },
        y: { delay: delay + 0.6, duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm text-gray-300 animate-pulse-glow"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles size={14} className="text-purple-400" />
      </motion.div>
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
    
    const timer = setTimeout(() => {
      const animate = () => {
        const elapsed = Date.now() - startTime - delayMs;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        
        const current = Math.floor(target * eased);
        setDisplayValue(current.toString());
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(numericPart);
        }
      };
      animate();
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

// Letter animation variants - Classy 3D Flip Reveal
const letterVariants = {
  hidden: { 
    opacity: 0, 
    rotateX: 90,
    y: 20,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.2, 0.65, 0.3, 0.9], // Dramatic ease-out
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
          className={`inline-block [transform-style:preserve-3d] ${isGradient ? className : ""} ${isOutline ? "text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.9)]" : ""}`}
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
  const yLeft = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yRight = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const yCenter = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Mouse position tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    requestAnimationFrame(() => {
      const x = (e.clientX - rect.left - rect.width / 2) / 25;
      const y = (e.clientY - rect.top - rect.height / 2) / 25;
      setTilt({ x, y });
      setMousePos({ 
        x: (e.clientX - rect.left - rect.width / 2), 
        y: (e.clientY - rect.top - rect.height / 2) 
      });
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setMousePos({ x: 0, y: 0 });
  };

  // Mobile detection for parallax
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic grid background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          backgroundPosition: `${mousePos.x * 0.02}px ${mousePos.y * 0.02}px`,
          transition: "background-position 0.3s ease-out",
        }}
      />

      {/* Enhanced searchlight effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 500px at ${tilt.x * 25 + 50 + "%"} ${tilt.y * 25 + 50 + "%"}, rgba(139, 92, 246, 0.2), transparent 70%)`
        }}
      />

      {/* Floating tech icons - Desktop Only */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
        {floatingIcons.map((icon, index) => (
          <FloatingIcon 
            key={index} 
            {...icon} 
            index={index}
            mouseX={mousePos.x}
            mouseY={mousePos.y}
          />
        ))}
      </div>

      {/* Gradient orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"
        />
      </div>

      <div 
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center"
      >
        {/* Top badge */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FloatingBadge delay={0.3}>
            🚀 Open to Internship & Full-time Opportunities
          </FloatingBadge>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 mt-8 lg:mt-0">
          
          {/* Left Side - Text */}
          <motion.div 
            style={{ y: isMobile ? 0 : yLeft, opacity }}
            className="flex flex-col items-center lg:items-end text-center lg:text-right order-2 lg:order-1 relative z-10"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
              <AnimatedWord 
                word="ENGINEERING" 
                className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500 drop-shadow-2xl"
              />
            </h1>
          </motion.div>

          {/* Center Avatar - Scaled on Mobile */}
          <motion.div
            style={{ y: isMobile ? 0 : yCenter }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="z-20 my-2 lg:my-0 order-1 lg:order-2 scale-[0.65] sm:scale-90 md:scale-100"
          >
            <AvatarFlipCard />
          </motion.div>

          {/* Right Side - Text */}
          <motion.div 
            style={{ y: isMobile ? 0 : yRight, opacity }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left order-3 relative z-10"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
              <AnimatedWord 
                word="INTELLIGENCE" 
                className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500 drop-shadow-2xl"
              />
            </h1>
            <motion.div 
              className="mt-6 max-w-xs sm:max-w-md lg:max-w-xs mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-base sm:text-lg text-gray-200 font-medium leading-relaxed text-center lg:text-left font-[var(--font-inter)]">
                Generative AI Intern @ <span className="text-purple-400 font-bold">Introspect Labs</span>. Crafting scalable systems & <span className="text-blue-400 font-bold">Autonomous Agents</span>.
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
          <AnimatedStat 
            value="1000+" 
            label={<><span className="text-cyan-400 font-bold">Problems</span> Solved</>} 
            delay={1} 
            gradient="from-blue-400 to-cyan-400"
          />
          <AnimatedStat 
            value="1864" 
            label={<><span className="text-orange-400 font-bold">Max</span> Rating</>} 
            delay={1.2} 
            gradient="from-yellow-400 to-orange-400"
          />
          <AnimatedStat 
            value="5+" 
            label={<><span className="text-purple-400 font-bold">Products</span> Built</>} 
            delay={1.4} 
            gradient="from-purple-400 to-pink-400"
          />
        </motion.div>

        {/* CTA Buttons - Centered below */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-6 mt-10"
        >
          <MagneticButton strength={0.2}>
            <Link
              href="#projects"
              className="relative px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold overflow-hidden group hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 ease-out"
            >
              <span className="relative z-10 flex items-center gap-2">
                View My Work
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Sleek light beam effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out skew-x-12" />
            </Link>
          </MagneticButton>

          <MagneticButton strength={0.2}>
            <Link
              href="#contact"
              className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/10 transition-colors font-semibold"
            >
              Contact Me
            </Link>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator opacity={opacity} />
    </section>
  );
}
