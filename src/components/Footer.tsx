"use client";

import { Github, Linkedin, Mail, ArrowUp, MapPin, Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import MagneticButton from "./MagneticButton";
import { useState, useEffect } from "react";

const socialLinks = [
  { icon: Github, href: "https://github.com/preethamnimmagadda", label: "GitHub", gradient: "from-gray-500 to-gray-700" },
  { icon: Linkedin, href: "https://linkedin.com/in/preethamnimmagadda", label: "LinkedIn", gradient: "from-blue-500 to-cyan-500" },
  { icon: Mail, href: "mailto:preethamnimmagadda@gmail.com", label: "Email", gradient: "from-purple-500 to-pink-500" },
];

const navLinks = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Experience", id: "experience" },
  { label: "Projects", id: "projects" },
  { label: "Achievements", id: "achievements" },
  { label: "Contact", id: "contact" },
];

// Live local time (IST) — small premium touch
function LocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs md:text-sm tabular-nums">
      <MapPin size={12} className="text-purple-400/70" />
      India · {time} IST
    </span>
  );
}

export default function Footer() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative z-10 overflow-hidden">
      {/* Animated gradient hairline */}
      <div className="relative h-px w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
        <div className="absolute inset-0 animate-shimmer" />
      </div>

      <div className="relative bg-black/30 backdrop-blur-md">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[700px] h-[260px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[60vw] max-w-[400px] h-[200px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Giant watermark name */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-[-1.5rem] md:bottom-[-3rem] text-center font-black tracking-tighter select-none pointer-events-none text-[18vw] md:text-[11rem] leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.045)]"
        >
          PREETHAM
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-12 md:pt-16 pb-6 md:pb-8">
          {/* ── Top grid: brand / nav / connect ── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, type: "spring" as const, stiffness: 100 }}
              className="md:col-span-5 text-center md:text-left"
            >
              <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter group">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">Preetham</span>
                <span className="text-purple-400 group-hover:text-white transition-colors"> Nimmagadda</span>
              </Link>
              <p className="text-gray-400 text-sm mt-3 max-w-sm mx-auto md:mx-0 leading-relaxed">
                AI Engineer crafting <span className="text-purple-300">autonomous agents</span> and{" "}
                <span className="text-blue-300">immersive web experiences</span>. Building the future, one innovation at a time.
              </p>

              {/* Availability badge */}
              <button
                onClick={() => scrollToSection("contact")}
                className="mt-5 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-400/40 hover:bg-emerald-500/10 transition-colors group cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                </span>
                <span className="text-xs font-medium text-emerald-300/90 group-hover:text-emerald-200 transition-colors">
                  Available for opportunities
                </span>
              </button>
            </motion.div>

            {/* Navigate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.1, duration: 0.6, type: "spring" as const, stiffness: 100 }}
              className="md:col-span-3 text-center md:text-left"
            >
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">
                Navigate
              </h3>
              <nav className="grid grid-cols-3 md:grid-cols-1 gap-x-2 gap-y-2.5 justify-items-center md:justify-items-start">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="group inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="hidden md:block w-0 group-hover:w-3 h-px bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300" />
                    {link.label}
                  </button>
                ))}
              </nav>
            </motion.div>

            {/* Connect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" as const, stiffness: 100 }}
              className="md:col-span-4 flex flex-col items-center md:items-end gap-4"
            >
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 md:self-end">
                Connect
              </h3>
              <div className="flex items-center gap-3 md:gap-4">
                {socialLinks.map((social) => (
                  <MagneticButton key={social.label} strength={0.3}>
                    <motion.div
                      className="relative group"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      {/* Animated gradient border */}
                      <motion.div
                        className={`absolute -inset-[1px] bg-gradient-to-r ${social.gradient} rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300`}
                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: "200% 200%" }}
                      />
                      <Link
                        href={social.href}
                        target="_blank"
                        className="relative flex items-center justify-center w-11 h-11 md:w-13 md:h-13 rounded-full bg-zinc-900/90 border border-white/20 text-white transition-all duration-300 hover:border-white/40 hover:bg-zinc-800/90"
                        aria-label={social.label}
                      >
                        <social.icon size={18} className="md:w-[22px] md:h-[22px]" />
                      </Link>
                    </motion.div>
                  </MagneticButton>
                ))}
              </div>
              <LocalTime />
            </motion.div>
          </div>

          {/* ── Bottom bar ── */}
          <motion.div
            className="mt-10 md:mt-14 pt-5 md:pt-6 border-t border-white/5 flex flex-col-reverse md:flex-row justify-between items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="text-gray-500 text-[11px] md:text-sm text-center md:text-left">
              © {new Date().getFullYear()} Preetham Nimmagadda. All rights reserved.
            </p>

            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="group flex items-center gap-2 text-[11px] md:text-sm text-gray-500 hover:text-purple-400 transition-colors"
            >
              <span>Back to Top</span>
              <div className="p-1.5 md:p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 group-hover:shadow-[0_0_16px_rgba(139,92,246,0.25)] transition-all">
                <ArrowUp size={12} className="text-gray-400 group-hover:text-purple-400 md:w-4 md:h-4 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
