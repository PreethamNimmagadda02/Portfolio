"use client";

import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MagneticButton from "./MagneticButton";
import { useState, useEffect } from "react";

const socialLinks = [
  { icon: Github, href: "https://github.com/preethamnimmagadda", label: "GitHub", gradient: "from-gray-500 to-gray-700" },
  { icon: Linkedin, href: "https://linkedin.com/in/preethamnimmagadda", label: "LinkedIn", gradient: "from-blue-500 to-cyan-500" },
  { icon: Mail, href: "mailto:preethamnimmagadda@gmail.com", label: "Email", gradient: "from-purple-500 to-pink-500" },
];

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="py-6 md:py-12 relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
          {/* Logo/Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.6, type: "spring" as const, stiffness: 100 }}
            className="text-center md:text-left"
          >
            <Link href="/" className="text-xl md:text-2xl font-bold tracking-tighter group">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">Preetham</span>
              <span className="text-purple-400 group-hover:text-white transition-colors"> Nimmagadda</span>
            </Link>
            <p className="text-gray-500 text-xs md:text-sm mt-1 md:mt-2">
              Building the future, one product at a time.
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="flex items-center gap-3 md:gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.6, type: "spring" as const, stiffness: 100 }}
          >
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
                    className={`relative flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full bg-zinc-900/90 border border-white/20 text-white transition-all duration-300 hover:border-white/40 hover:bg-zinc-800/90`}
                    aria-label={social.label}
                  >
                    <social.icon size={18} className="md:w-[26px] md:h-[26px]" />
                  </Link>
                </motion.div>
              </MagneticButton>
            ))}
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div 
          className="mt-4 pt-4 md:mt-8 md:pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-1 md:gap-8">
            <p className="text-gray-500 text-[10px] md:text-sm">
              © {new Date().getFullYear()} Preetham Nimmagadda. All rights reserved.
            </p>
          </div>

          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            className="group flex items-center gap-2 text-[10px] md:text-sm text-gray-500 hover:text-purple-400 transition-colors"
          >
            <span>Back to Top</span>
            <div className="p-1.5 md:p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 transition-all">
              <ArrowUp size={12} className="text-gray-400 group-hover:text-purple-400 md:w-4 md:h-4" />
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Floating Scroll Top Button (Visible when scrolling) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 p-3 md:p-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/30 backdrop-blur-sm border border-white/10 hover:shadow-purple-500/40 transition-shadow"
          >
            <ArrowUp size={20} className="md:w-6 md:h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}

