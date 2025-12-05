"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

const terminalLines = [
  { type: "command", text: "$ whoami" },
  { type: "output", text: "preetham_nimmagadda" },
  { type: "command", text: "$ cat skills.txt" },
  { type: "output", text: "→ Full Stack Development" },
  { type: "output", text: "→ AI Agents & LLMs" },
  { type: "output", text: "→ System Architecture" },
  { type: "command", text: "$ status --check" },
  { type: "success", text: "✓ Open to opportunities" },
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
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Image
            src="/ai-headshot.jpeg"
            alt="Avatar Front"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <p className="font-bold text-lg">Preetham</p>
            <p className="text-sm text-gray-300">Hover to hack →</p>
          </div>
        </div>

        {/* Back Side - Terminal Theme */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-green-500/30 shadow-2xl bg-[#0a0a0a]"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)" 
          }}
        >
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.03)_2px,rgba(0,255,0,0.03)_4px)]" />
          
          {/* CRT flicker overlay */}
          <motion.div 
            className="absolute inset-0 bg-green-500/5 pointer-events-none"
            animate={{ opacity: [0.02, 0.05, 0.02] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />

          {/* Terminal content */}
          <div className="absolute inset-0 p-4 font-mono text-xs">
            {/* Terminal header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-500/20">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-green-400/60 text-[10px]">preetham@portfolio ~ </span>
            </div>

            {/* Terminal lines */}
            <div className="space-y-1.5 overflow-hidden">
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
                        ? "text-emerald-400"
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
              <span>v2.0.25</span>
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
