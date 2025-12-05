"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Detect active section
      const sections = navLinks.map(link => link.href.slice(1));
      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 transition-all duration-500 rounded-full px-6 py-3",
        scrolled
          ? "bg-black/80 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
          : "bg-black/20 backdrop-blur-sm border border-white/5"
      )}
    >
      <div className="flex items-center justify-between">
        {/* Logo with terminal icon */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 group-hover:border-purple-500/60 transition-colors"
          >
            <Terminal size={16} className="text-purple-400" />
          </motion.div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
            Preetham<span className="text-purple-400">.</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/5">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <Link
                key={link.name}
                href={link.href}
                className="relative px-4 py-1.5 text-sm font-medium transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={cn(
                  "relative z-10",
                  isActive ? "text-white" : "text-gray-400 hover:text-white"
                )}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* CTA Button */}
        <Link
          href="#contact"
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-shadow"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Hire Me
        </Link>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-16 left-0 w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:hidden shadow-2xl"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link, i) => {
                const isActive = activeSection === link.href.slice(1);
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block px-4 py-3 rounded-xl text-lg font-medium transition-colors",
                        isActive 
                          ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30" 
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
              
              {/* Mobile CTA */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="pt-2"
              >
                <Link
                  href="#contact"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Hire Me
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
