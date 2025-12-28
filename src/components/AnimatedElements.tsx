"use client";

import { motion, useMotionValue, useSpring, useTransform, Variants } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";

// Shimmer Border - Animated gradient that travels around cards
export function ShimmerBorder({ 
  children, 
  gradient = "from-purple-500 via-pink-500 to-blue-500",
  className = "" 
}: { 
  children: React.ReactNode; 
  gradient?: string;
  className?: string;
}) {
  return (
    <div className={`relative group ${className}`}>
      {/* Animated shimmer border */}
      <motion.div 
        className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${gradient} opacity-60 blur-sm`}
        animate={{ 
          backgroundPosition: ["0% 50%", "100% 50%", "200% 50%"],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "linear",
        }}
        style={{ backgroundSize: "200% 200%" }}
      />
      {/* Inner content */}
      <div className="relative bg-zinc-900/95 rounded-2xl h-full">
        {children}
      </div>
    </div>
  );
}

// Glowing Badge - Pulsing glow effect for badges and tags
export function GlowingBadge({ 
  children, 
  color = "purple",
  className = "" 
}: { 
  children: React.ReactNode; 
  color?: "purple" | "blue" | "green" | "orange" | "pink" | "cyan";
  className?: string;
}) {
  const colorMap = {
    purple: "bg-purple-500/20 border-purple-500/30 text-purple-400 shadow-purple-500/20",
    blue: "bg-blue-500/20 border-blue-500/30 text-blue-400 shadow-blue-500/20",
    green: "bg-green-500/20 border-green-500/30 text-green-400 shadow-green-500/20",
    orange: "bg-orange-500/20 border-orange-500/30 text-orange-400 shadow-orange-500/20",
    pink: "bg-pink-500/20 border-pink-500/30 text-pink-400 shadow-pink-500/20",
    cyan: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400 shadow-cyan-500/20",
  };

  return (
    <motion.span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${colorMap[color]} ${className}`}
      animate={{ 
        boxShadow: [
          "0 0 0px 0px currentColor",
          "0 0 15px 3px currentColor",
          "0 0 0px 0px currentColor",
        ],
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.span>
  );
}

// Animated Section Title - Wave letter reveal
export function AnimatedSectionTitle({ 
  children, 
  className = "",
  gradient = "from-white to-gray-400"
}: { 
  children: string; 
  className?: string;
  gradient?: string;
}) {
  const letters = children.split("");
  
  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.span
      className={`inline-flex flex-wrap [perspective:1000px] ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          variants={letterVariants}
          className={`inline-block [transform-style:preserve-3d] bg-clip-text text-transparent bg-gradient-to-b ${gradient}`}
          style={{ 
            marginRight: letter === " " ? "0.25em" : "0",
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Floating Element wrapper - Continuous subtle floating
export function FloatingElement({ 
  children, 
  delay = 0,
  amplitude = 8,
  duration = 3,
  className = "" 
}: { 
  children: React.ReactNode;
  delay?: number;
  amplitude?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={{ 
        y: [0, -amplitude, 0],
      }}
      transition={{ 
        duration,
        repeat: Infinity, 
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// Staggered Grid Container - For animating grid children
export function StaggeredGrid({ 
  children, 
  className = "",
  staggerDelay = 0.1
}: { 
  children: React.ReactNode; 
  className?: string;
  staggerDelay?: number;
}) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

// Staggered Grid Item
export function StaggeredGridItem({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 60, 
      scale: 0.8,
      rotateX: 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: { 
        type: "spring", 
        stiffness: 60, 
        damping: 12,
      },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

// Pulse Glow - For interactive elements
export function PulseGlow({ 
  children, 
  color = "rgba(139, 92, 246, 0.3)",
  className = "" 
}: { 
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <motion.div
        className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {children}
    </motion.div>
  );
}

// Text Shimmer Effect
export function TextShimmer({ 
  children, 
  className = "" 
}: { 
  children: string; 
  className?: string;
}) {
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      style={{
        background: "linear-gradient(90deg, #fff 0%, #fff 40%, #a855f7 50%, #fff 60%, #fff 100%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
      animate={{
        backgroundPosition: ["200% 0%", "-200% 0%"],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}
    </motion.span>
  );
}

// Magnetic hover effect wrapper
export function MagneticHover({ 
  children, 
  strength = 0.3,
  className = "" 
}: { 
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

// Number Counter with glow effect
export function GlowingCounter({ 
  value, 
  suffix = "",
  duration = 2000,
  gradient = "from-purple-400 to-pink-400"
}: { 
  value: number; 
  suffix?: string;
  duration?: number;
  gradient?: string;
}) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.floor(value * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <motion.span 
      ref={ref}
      className={`font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}
      animate={isAnimating ? {
        textShadow: [
          "0 0 10px rgba(168, 85, 247, 0.5)",
          "0 0 20px rgba(168, 85, 247, 0.8)",
          "0 0 10px rgba(168, 85, 247, 0.5)",
        ],
      } : {}}
      transition={{
        duration: 0.5,
        repeat: isAnimating ? Infinity : 0,
        ease: "easeInOut",
      }}
    >
      {count}{suffix}
    </motion.span>
  );
}

// Bouncing icon animation
export function BouncingIcon({ 
  children, 
  delay = 0,
  className = "" 
}: { 
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0, rotate: -180 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay,
      }}
      whileHover={{ 
        scale: 1.2, 
        rotate: [0, -10, 10, 0],
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
}
