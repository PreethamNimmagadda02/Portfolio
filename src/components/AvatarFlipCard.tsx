"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

const terminalLines = [
  { type: "command", text: "$ ./init_profile.sh" },
  { type: "success", text: "⚡ System initialized" },
  { type: "command", text: "$ cat identity.json" },
  { type: "output", text: '{ "name": "Preetham" }' },
  { type: "output", text: '{ "role": "AI Engineer" }' },
  { type: "command", text: "$ skills --list" },
  { type: "highlight", text: "► React • Next.js • Python" },
  { type: "highlight", text: "► LangChain • CrewAI" },
  { type: "command", text: "$ status" },
  { type: "success", text: "● READY FOR HIRE" },
];

// Floating particles around the avatar - use deterministic sizes to avoid hydration mismatch
const particles = [
  { id: 0, angle: 0, delay: 0, size: 5 },
  { id: 1, angle: 45, delay: 0.3, size: 6 },
  { id: 2, angle: 90, delay: 0.6, size: 4 },
  { id: 3, angle: 135, delay: 0.9, size: 7 },
  { id: 4, angle: 180, delay: 1.2, size: 5 },
  { id: 5, angle: 225, delay: 1.5, size: 6 },
  { id: 6, angle: 270, delay: 1.8, size: 4 },
  { id: 7, angle: 315, delay: 2.1, size: 7 },
];

export default function AvatarFlipCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true); 

  // Typing animation effect
  useEffect(() => {
    if (isFlipped && visibleLines < terminalLines.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else if (!isFlipped) {
      setVisibleLines(0);
    }
  }, [isFlipped, visibleLines]);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div
      className="relative w-64 h-80 cursor-pointer [perspective:1000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      {/* Outer pulsing glow ring - Desktop Only */}
      <motion.div
        className="absolute -inset-4 rounded-3xl opacity-60 hidden md:block"
        animate={{
          boxShadow: [
            "0 0 20px 5px rgba(139, 92, 246, 0.3)",
            "0 0 40px 10px rgba(139, 92, 246, 0.5)",
            "0 0 20px 5px rgba(139, 92, 246, 0.3)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbiting ring 1 - Desktop Only */}
      <motion.div
        className="absolute -inset-6 border border-purple-500/30 rounded-full pointer-events-none hidden md:block"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center center" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
      </motion.div>

      {/* Orbiting ring 2 (reverse) - Desktop Only */}
      <motion.div
        className="absolute -inset-10 border border-blue-500/20 rounded-full pointer-events-none hidden md:block"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center center" }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
      </motion.div>

      {/* Floating particles - Desktop Only */}
      <div className="hidden md:block">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute left-1/2 top-1/2 pointer-events-none"
            animate={{
              rotate: [particle.angle, particle.angle + 360],
            }}
            transition={{
              duration: 8 + particle.id,
              repeat: Infinity,
              ease: "linear",
              delay: particle.delay,
            }}
            style={{ transformOrigin: "center center" }}
          >
            <motion.div
              className="rounded-full bg-gradient-to-br from-purple-400 to-blue-400"
              style={{
                width: particle.size,
                height: particle.size,
                marginLeft: 140 + particle.id * 5,
              }}
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Main flip card */}
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Image
            src="/ai-headshot.jpeg"
            alt="Avatar Front"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Animated corner accents */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-purple-400/60 rounded-tl" />
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-purple-400/60 rounded-tr" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-purple-400/60 rounded-bl" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-purple-400/60 rounded-br" />
          
          {/* Name and hint */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <motion.p 
              className="font-bold text-lg"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Preetham
            </motion.p>
            <p className="text-sm text-gray-300 flex items-center gap-1">
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
              Hover to hack
            </p>
          </div>

          {/* Status indicator */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-green-400 font-medium">ACTIVE</span>
          </div>
        </div>

        {/* Back Side - Holographic ID Card (Refined) */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-[#030303]"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)" 
          }}
        >
          {/* Subtle Holographic Sheen */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-pink-500/5 to-transparent opacity-40 z-10 pointer-events-none"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          {/* Elegant Scanning Line */}
          <motion.div 
            className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent z-20 pointer-events-none opacity-50"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />

          {/* Center Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-500">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>

          {/* Clean Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Content Container */}
          <div className="absolute inset-0 p-6 flex flex-col z-10 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-purple-400 font-medium tracking-widest uppercase mb-0.5">Identity Card</span>
                <span className="text-sm font-bold text-white tracking-wide">IIT (ISM) DHANBAD</span>
              </div>
              {/* Small version in corner */}
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30">
                 <span className="text-xs font-bold text-purple-400">PN</span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-5">
              <div className="group">
                <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Name</div>
                <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-wide">PREETHAM N.</div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">ID Number</div>
                  <div className="font-mono text-sm text-purple-200">23JE0653</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-emerald-500 font-bold tracking-wider flex items-center justify-end gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    VERIFIED
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Role</div>
                <div className="text-sm font-medium text-white border-l-2 border-purple-500 pl-3 py-0.5">
                  Generative AI Engineer
                  <span className="block text-xs text-gray-400 font-normal mt-0.5">Full Stack Engineer</span>
                </div>
              </div>
            </div>

            {/* Bottom: Modern Barcode */}
            <div className="mt-auto pt-4 relative">
               {/* Decorative corner accents */}
              <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-purple-500/30" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-purple-500/30" />

              <div className="h-6 flex items-end justify-between opacity-40 gap-[3px]">
                {particles.slice(0, 28).map((p, i) => (
                  <div 
                    key={i} 
                    className="bg-purple-300 rounded-full" 
                    style={{ 
                      width: '2px', 
                      height: `${Math.abs(Math.sin(i * 1337)) * 60 + 20}%` 
                    }} 
                  />
                ))}
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-[8px] text-purple-500/40 tracking-[0.2em]">807-402-1047</div>
                <div className="text-[8px] text-purple-500/40 font-mono">LVL.5</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
