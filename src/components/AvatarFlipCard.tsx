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
      {/* Outer pulsing glow ring */}
      <motion.div
        className="absolute -inset-4 rounded-3xl opacity-60"
        animate={{
          boxShadow: [
            "0 0 20px 5px rgba(139, 92, 246, 0.3)",
            "0 0 40px 10px rgba(139, 92, 246, 0.5)",
            "0 0 20px 5px rgba(139, 92, 246, 0.3)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbiting ring 1 */}
      <motion.div
        className="absolute -inset-6 border border-purple-500/30 rounded-full pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center center" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
      </motion.div>

      {/* Orbiting ring 2 (reverse) */}
      <motion.div
        className="absolute -inset-10 border border-blue-500/20 rounded-full pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center center" }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
      </motion.div>

      {/* Floating particles */}
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

        {/* Back Side - Terminal Theme */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border-2 border-green-500/30 shadow-2xl bg-[#0a0a0a]"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)" 
          }}
        >
          {/* Matrix rain effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-green-500 text-[8px] font-mono leading-none"
                style={{ left: `${15 + i * 15}%` }}
                animate={{ y: [-20, 320] }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.4,
                }}
              >
                {["0", "1", "0", "1", "0", "1"].map((char, j) => (
                  <div key={j} className="my-1">{char}</div>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.03)_2px,rgba(0,255,0,0.03)_4px)]" />
          
          {/* CRT flicker overlay */}
          <motion.div 
            className="absolute inset-0 bg-green-500/5 pointer-events-none"
            animate={{ opacity: [0.02, 0.05, 0.02] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />

          {/* Glowing border effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              boxShadow: [
                "inset 0 0 20px rgba(34, 197, 94, 0.1)",
                "inset 0 0 40px rgba(34, 197, 94, 0.2)",
                "inset 0 0 20px rgba(34, 197, 94, 0.1)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Terminal content */}
          <div className="absolute inset-0 p-4 font-mono text-xs">
            {/* Terminal header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-500/20">
              <div className="flex gap-1.5">
                <motion.div 
                  className="w-2.5 h-2.5 rounded-full bg-red-500/80"
                  whileHover={{ scale: 1.2 }}
                />
                <motion.div 
                  className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"
                  whileHover={{ scale: 1.2 }}
                />
                <motion.div 
                  className="w-2.5 h-2.5 rounded-full bg-green-500/80"
                  whileHover={{ scale: 1.2 }}
                />
              </div>
              <span className="text-green-400/60 text-[10px]">preetham@portfolio ~ </span>
            </div>

            {/* Terminal lines */}
            <div className="space-y-1 overflow-hidden">
              <AnimatePresence>
                {terminalLines.slice(0, visibleLines).map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`${
                      line.type === "command" 
                        ? "text-green-400" 
                        : line.type === "success"
                        ? "text-emerald-400 font-bold"
                        : line.type === "highlight"
                        ? "text-cyan-400"
                        : "text-green-300/70"
                    }`}
                  >
                    {line.text}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Blinking cursor */}
              {isFlipped && (
                <div className="flex items-center text-green-400">
                  <span>$</span>
                  <motion.span
                    animate={{ opacity: cursorVisible ? 1 : 0 }}
                    className="ml-1 w-2 h-4 bg-green-400"
                  />
                </div>
              )}
            </div>

            {/* Bottom status bar */}
            <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[9px] text-green-500/40 border-t border-green-500/10 pt-2">
              <span className="flex items-center gap-1">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ▶
                </motion.span>
                v2.0.25
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                CONNECTED
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
