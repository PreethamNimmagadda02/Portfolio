"use client";

import { Github, Linkedin, Mail, ArrowUp, MapPin } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "@/lib/motion";
import MagneticButton from "./MagneticButton";
import { useState, useEffect, useRef } from "react";
import { smoothScrollTo } from "@/lib/utils";

const socialLinks = [
  { icon: Github, href: "https://github.com/PreethamNimmagadda02", label: "GitHub", gradient: "from-gray-500 to-gray-700" },
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
    <span className="inline-flex items-center gap-1.5 text-gray-300 text-xs md:text-sm tabular-nums">
      <MapPin size={12} className="text-purple-400/70" />
      India · {time} IST
    </span>
  );
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  // Giant watermark name tilts up & rises into view as the footer is revealed.
  const watermarkY = useTransform(scrollYProgress, [0, 1], [70, -10]);
  const watermarkRotateX = useTransform(scrollYProgress, [0, 1], [38, 0]);
  const watermarkOpacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    smoothScrollTo(id);
  };

  const scrollToTop = () => {
    smoothScrollTo(0);
  };

  return (
    <footer ref={footerRef} className="relative z-10 overflow-hidden">
      {/* Animated gradient hairline */}
      <div className="relative h-px w-full">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-purple-500/60 to-transparent" />
        <div className="absolute inset-0 animate-shimmer" />
      </div>

      <div className="relative bg-black/50 perspective-[1000px]">
        {/* Background glows — cheap gradients, no backdrop blur */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 700px 260px at 50% 0%, rgba(168,85,247,0.08), transparent 70%), radial-gradient(ellipse 400px 200px at 100% 100%, rgba(59,130,246,0.05), transparent 70%)",
          }}
        />

        {/* Giant watermark name — tilts up into view in 3D */}
        <motion.div
          aria-hidden
          style={{ y: watermarkY, rotateX: watermarkRotateX, opacity: watermarkOpacity, transformStyle: "preserve-3d", transformOrigin: "bottom" }}
          className="absolute inset-x-0 -bottom-6 md:-bottom-12 text-center font-black tracking-tighter select-none pointer-events-none text-[18vw] md:text-[11rem] leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.045)]"
        >
          PREETHAM
        </motion.div>

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
                <span className="bg-clip-text text-transparent bg-linear-to-r from-white to-gray-200 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">Preetham</span>
                <span className="text-purple-400 group-hover:text-white transition-colors"> Nimmagadda</span>
              </Link>
              <p className="text-gray-300 text-sm mt-3 max-w-sm mx-auto md:mx-0 leading-relaxed">
                AI Engineer crafting <span className="text-purple-300">autonomous agents</span> and{" "}
                <span className="text-blue-300">immersive web experiences</span>. Building the future, one innovation at a time.
              </p>

              {/* Availability badge */}
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "contact")}
                className="mt-5 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-400/40 hover:bg-emerald-500/10 transition-colors group cursor-pointer"
              >
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span className="text-xs font-medium text-emerald-300/90 group-hover:text-emerald-200 transition-colors">
                  Available for opportunities
                </span>
              </a>
            </motion.div>

            {/* Navigate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.1, duration: 0.6, type: "spring" as const, stiffness: 100 }}
              className="md:col-span-3 text-center md:text-left"
            >
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300 mb-4">
                Navigate
              </h3>
              <nav className="grid grid-cols-3 md:grid-cols-1 gap-x-2 gap-y-2.5 justify-items-center md:justify-items-start">
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => handleNavClick(e, link.id)}
                    className="group inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="hidden md:block w-0 group-hover:w-3 h-px bg-linear-to-r from-purple-400 to-pink-400 transition-all duration-300" />
                    {link.label}
                  </a>
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
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300 md:self-end">
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
                        className={`absolute -inset-px bg-linear-to-r ${social.gradient} rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300`}
                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: "200% 200%" }}
                      />
                      <Link
                        href={social.href}
                        target="_blank"
                        className="relative flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-zinc-900/90 border border-white/20 text-white transition-all duration-300 hover:border-white/40 hover:bg-zinc-800/90"
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
            <p className="text-gray-300 text-xs md:text-sm text-center md:text-left">
              © {new Date().getFullYear()} Preetham Nimmagadda. All rights reserved.
            </p>

            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="group flex items-center gap-2 text-xs md:text-sm text-gray-300 hover:text-purple-400 transition-colors"
            >
              <span>Back to Top</span>
              <div className="p-1.5 md:p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 group-hover:shadow-[0_0_16px_rgba(139,92,246,0.25)] transition-all">
                <ArrowUp size={12} className="text-gray-300 group-hover:text-purple-400 md:w-4 md:h-4 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
