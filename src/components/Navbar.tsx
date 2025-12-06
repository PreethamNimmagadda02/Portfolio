"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
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
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          
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
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

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
        {/* Brand Logo */}
        <a 
          href="#home" 
          onClick={(e) => scrollToSection(e, "#home")}
          className="flex items-center gap-2.5 group"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="relative"
          >
            <motion.div
              className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-300"
            />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 p-[2px] overflow-hidden">
              <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
                <span className="text-sm font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-purple-400 via-white to-blue-400">
                  PN
                </span>
              </div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
              />
            </div>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-none text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 transition-all duration-300">
              Preetham
            </span>
            <span className="text-[10px] text-gray-500 tracking-widest uppercase group-hover:text-purple-400/70 transition-colors">
              AI Engineer
            </span>
          </div>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/5">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
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
              </a>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:block relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-0 group-hover:opacity-75 blur transition-opacity duration-300" />
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, "#contact")}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold border border-white/10 hover:border-white/30 transition-all"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            Hire Me
          </a>
        </motion.div>

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
                    <a
                      href={link.href}
                      onClick={(e) => scrollToSection(e, link.href)}
                      className={cn(
                        "block px-4 py-3 rounded-xl text-lg font-medium transition-colors",
                        isActive 
                          ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30" 
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {link.name}
                    </a>
                  </motion.div>
                );
              })}
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="pt-2"
              >
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, "#contact")}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Hire Me
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
