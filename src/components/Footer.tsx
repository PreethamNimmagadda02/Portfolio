"use client";

import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MagneticButton from "./MagneticButton";
import { useState, useEffect } from "react";

const socialLinks = [
  { icon: Github, href: "https://github.com/preethamnimmagadda", label: "GitHub", color: "hover:text-white" },
  { icon: Linkedin, href: "https://linkedin.com/in/preethamnimmagadda", label: "LinkedIn", color: "hover:text-blue-400" },
  { icon: Mail, href: "mailto:preethamnimmagadda@gmail.com", label: "Email", color: "hover:text-purple-400" },
];

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="py-12 relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo/Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
          >
            <Link href="/" className="text-2xl font-bold tracking-tighter group">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">Preetham</span>
              <span className="text-purple-400 group-hover:text-white transition-colors"> Nimmagadda</span>
            </Link>
            <p className="text-gray-500 text-sm mt-2">
              Building the future, one product at a time.
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ delay: 0.1 }}
          >
            {socialLinks.map((social, i) => (
              <MagneticButton key={social.label} strength={0.3}>
                <Link 
                  href={social.href} 
                  target="_blank"
                  className={`flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 text-gray-400 ${social.color} transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]`}
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </Link>
              </MagneticButton>
            ))}
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div 
          className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ amount: 0.3 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Preetham Nimmagadda. All rights reserved.
            </p>
          </div>

          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            className="group flex items-center gap-2 text-sm text-gray-500 hover:text-purple-400 transition-colors"
          >
            <span>Back to Top</span>
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 transition-all">
              <ArrowUp size={16} className="text-gray-400 group-hover:text-purple-400" />
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
            className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-purple-600/90 text-white shadow-lg shadow-purple-900/20 backdrop-blur-sm border border-white/10 hover:bg-purple-500 transition-colors"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}
