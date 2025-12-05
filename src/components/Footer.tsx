"use client";

import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const socialLinks = [
  { icon: Github, href: "https://github.com/preethamnimmagadda", label: "GitHub", color: "hover:text-white" },
  { icon: Linkedin, href: "https://linkedin.com/in/preethamnimmagadda", label: "LinkedIn", color: "hover:text-blue-400" },
  { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-cyan-400" },
  { icon: Mail, href: "mailto:23je0653@iitism.ac.in", label: "Email", color: "hover:text-purple-400" },
];

export default function Footer() {
  return (
    <footer className="py-12 relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo/Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="text-2xl font-bold tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">PREETHAM</span>
              <span className="text-purple-400">.</span>
            </Link>
            <p className="text-gray-500 text-sm mt-2">
              Building the future, one agent at a time.
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {socialLinks.map((social, i) => (
              <motion.div
                key={social.label}
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link 
                  href={social.href} 
                  target="_blank"
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-gray-500 ${social.color} transition-all duration-300 hover:border-white/20 hover:bg-white/10`}
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div 
          className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Preetham Nimmagadda. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Built with Next.js, Three.js & Framer Motion
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
