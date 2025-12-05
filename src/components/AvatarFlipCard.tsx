"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function AvatarFlipCard() {
  const [isFlipped, setIsFlipped] = useState(false);

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
            <p className="text-sm text-gray-300">Student</p>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)" 
          }}
        >
          <Image
            src="https://framerusercontent.com/images/VRQgkdWsjawSg1qpCm45HfSY1I.jpeg"
            alt="Avatar Back"
            fill
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <h3 className="text-xl font-bold text-white mb-2">Entrepreneur</h3>
            <p className="text-sm text-gray-300">
              Building the future with code and creativity.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
