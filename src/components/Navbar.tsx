"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Skills", href: "#skills-sphere" },
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Achievements", href: "#achievements" },
  { name: "Experience", href: "#experience" },
];

/* ─── Floating Particle ─── */
function NavParticle({ index }: { index: number }) {
  const style: React.CSSProperties = {
    position: "absolute",
    width: `${2 + Math.random() * 2}px`,
    height: `${2 + Math.random() * 2}px`,
    borderRadius: "50%",
    background: index % 2 === 0
      ? "rgba(139, 92, 246, 0.6)"
      : "rgba(59, 130, 246, 0.5)",
    left: `${10 + Math.random() * 80}%`,
    top: `${20 + Math.random() * 60}%`,
    animation: `navFloat${index % 4} ${3 + Math.random() * 3}s ease-in-out infinite`,
    animationDelay: `${Math.random() * 2}s`,
    pointerEvents: "none",
    filter: "blur(0.5px)",
    zIndex: 0,
  };
  return <div style={style} />;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Mouse state for 3D tilt — direct DOM manipulation for reliability
  const mouseState = useRef({ x: 0.5, y: 0.5, hovering: false });
  const tiltState = useRef({ rx: 0, ry: 0, spotX: 50, spotY: 50 });

  // ── Smooth tilt animation loop ──
  useEffect(() => {
    let running = true;

    const animate = () => {
      if (!running || !innerRef.current) return;
      const ms = mouseState.current;
      const ts = tiltState.current;

      if (ms.hovering) {
        // Lerp toward target with damping
        ts.ry += ((ms.x - 0.5) * 14 - ts.ry) * 0.08;
        ts.rx += ((0.5 - ms.y) * 8 - ts.rx) * 0.08;
        ts.spotX += (ms.x * 100 - ts.spotX) * 0.12;
        ts.spotY += (ms.y * 100 - ts.spotY) * 0.12;
      } else {
        // Decay back to flat
        ts.ry *= 0.92;
        ts.rx *= 0.92;
        ts.spotX += (50 - ts.spotX) * 0.06;
        ts.spotY += (50 - ts.spotY) * 0.06;
      }

      innerRef.current.style.transform = `perspective(800px) rotateX(${ts.rx}deg) rotateY(${ts.ry}deg) translateZ(0)`;

      // Update spotlight via CSS variable
      innerRef.current.style.setProperty("--spot-x", `${ts.spotX}%`);
      innerRef.current.style.setProperty("--spot-y", `${ts.spotY}%`);
      innerRef.current.style.setProperty("--spot-opacity", ms.hovering ? "1" : "0");

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    mouseState.current.x = (e.clientX - rect.left) / rect.width;
    mouseState.current.y = (e.clientY - rect.top) / rect.height;
  }, []);

  const handleMouseEnter = useCallback(() => {
    mouseState.current.hovering = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseState.current.hovering = false;
  }, []);

  // ── Scroll tracking ──
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);

          const viewportHeight = window.innerHeight;
          let bestSection = "home";
          let bestOverlap = 0;

          const allSections = [...navLinks.map(l => l.href.slice(1)), "contact"];

          for (const sectionId of allSections) {
            const el = document.getElementById(sectionId);
            if (!el) continue;

            const rect = el.getBoundingClientRect();
            const visibleTop = Math.max(0, rect.top);
            const visibleBottom = Math.min(viewportHeight, rect.bottom);
            const overlap = Math.max(0, visibleBottom - visibleTop);

            if (overlap > bestOverlap) {
              bestOverlap = overlap;
              bestSection = sectionId;
            }
          }

          setActiveSection(bestSection);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (!element) return;

    const lenis = (window as unknown as { lenis?: { scrollTo: (target: HTMLElement, options?: Record<string, unknown>) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo(element, {
        offset: -80,
        duration: 1.2,
        easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      });
    } else {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Keyframes for floating particles */}
      <style jsx global>{`
        @keyframes navFloat0 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          50% { transform: translate(8px, -6px) scale(1.3); opacity: 0.8; }
        }
        @keyframes navFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(-6px, 5px) scale(1.2); opacity: 0.7; }
        }
        @keyframes navFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.5; }
          50% { transform: translate(5px, 4px) scale(0.8); opacity: 0.9; }
        }
        @keyframes navFloat3 {
          0%, 100% { transform: translate(0, 0) scale(0.9); opacity: 0.35; }
          50% { transform: translate(-4px, -7px) scale(1.4); opacity: 0.75; }
        }
        @keyframes navShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50"
        ref={navRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* 3D-tilting container — transforms applied via rAF */}
        <div
          ref={innerRef}
          className={cn(
            "relative rounded-full transition-all duration-700 overflow-hidden will-change-transform",
            scrolled
              ? "px-4 py-2 bg-black/90 backdrop-blur-2xl border border-white/15 shadow-[0_8px_40px_rgba(139,92,246,0.2),0_0_80px_rgba(139,92,246,0.06)]"
              : "px-6 py-3 bg-black/30 backdrop-blur-md border border-white/8 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
          )}
        >
          {/* Cursor-following spotlight glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full z-0 transition-opacity duration-500"
            style={{
              opacity: "var(--spot-opacity, 0)",
              background: `radial-gradient(circle 200px at var(--spot-x, 50%) var(--spot-y, 50%), rgba(139,92,246,0.18), rgba(59,130,246,0.06) 50%, transparent 100%)`,
            }}
          />

          {/* Cursor-following border rim light */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full z-0 transition-opacity duration-500"
            style={{
              opacity: "var(--spot-opacity, 0)",
              background: `radial-gradient(circle 140px at var(--spot-x, 50%) var(--spot-y, 50%), rgba(139,92,246,0.4), transparent 70%)`,
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
              padding: "1.5px",
            }}
          />

          {/* Top specular highlight */}
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent z-0" />

          {/* Bottom shadow line for 3D depth */}
          <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-black/30 to-transparent z-0" />

          {/* Floating particles */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <NavParticle key={i} index={i} />
          ))}

          {/* Shimmer sweep on scroll transition */}
          <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full"
            style={{ opacity: scrolled ? 0.6 : 0 }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"
              style={{
                animation: scrolled ? "navShimmer 2s ease-in-out" : "none",
                animationFillMode: "forwards",
              }}
            />
          </div>

          {/* ── Content ── */}
          <div className="relative z-10 flex items-center justify-between">
            {/* Brand Logo */}
            <a
              href="#home"
              onClick={(e) => scrollToSection(e, "#home")}
              className="flex items-center gap-2.5 group"
            >
              <motion.div
                whileHover={{ scale: 1.12, rotateY: 20 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
                className="relative"
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div
                  className="absolute -inset-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-70 blur-lg transition-opacity duration-300"
                />
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 p-[2px] overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.35)]">
                  <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
                    <span className="text-sm font-black tracking-tighter text-white">
                      PN
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>
              </motion.div>
              <div className="flex flex-col">
                <span className="relative text-lg font-bold tracking-tight leading-none">
                  <span className="text-white group-hover:opacity-0 transition-opacity duration-300">Preetham Nimmagadda</span>
                  <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Preetham Nimmagadda</span>
                </span>
                <span className="text-[11px] text-purple-400/80 tracking-widest uppercase font-medium group-hover:text-blue-300 transition-colors duration-300">
                  AI & Full Stack Engineer
                </span>
              </div>
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-0.5 p-1 rounded-full bg-white/[0.03] border border-white/[0.04]">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.slice(1) && activeSection !== "contact";
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="relative px-4 py-1.5 text-sm font-medium group/link"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.15))",
                          border: "1px solid rgba(139,92,246,0.4)",
                          boxShadow: "0 0 16px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 2px rgba(0,0,0,0.3)",
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10 inline-block transition-all duration-200",
                        isActive
                          ? "text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]"
                          : "text-gray-400 group-hover/link:text-white group-hover/link:-translate-y-[2px] group-hover/link:drop-shadow-[0_0_6px_rgba(139,92,246,0.3)]"
                      )}
                    >
                      {link.name}
                    </span>

                    {/* Hover underline glow */}
                    {!isActive && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-purple-400 to-blue-400 rounded-full group-hover/link:w-3/4 transition-all duration-300 opacity-0 group-hover/link:opacity-70 blur-[0.5px]" />
                    )}
                  </a>
                );
              })}
            </div>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.06, rotateY: -6 }}
              whileTap={{ scale: 0.94 }}
              className="hidden md:block relative group"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className={cn(
                "absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-md transition-all duration-300",
                activeSection === "contact" ? "opacity-80 blur-lg" : "opacity-0 group-hover:opacity-80"
              )} />
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, "#contact")}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold transition-all overflow-hidden",
                  activeSection === "contact"
                    ? "ring-2 ring-purple-400/50"
                    : ""
                )}
                style={{
                  boxShadow: activeSection === "contact"
                    ? "0 0 24px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "0 4px 16px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                {/* Button shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                </span>
                <span className="relative">Hire Me</span>
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
                  const isActive = activeSection === link.href.slice(1) && activeSection !== "contact";
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
    </>
  );
}
