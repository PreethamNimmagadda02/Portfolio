"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Send, Mail, MapPin, Phone } from "lucide-react";
import { useState, useRef } from "react";
import emailjs from '@emailjs/browser';
import React from "react";

// Color schemes for each contact type
const contactColors = {
  email: { gradient: "from-blue-500 to-cyan-500" },
  location: { gradient: "from-emerald-500 to-teal-500" },
  phone: { gradient: "from-purple-500 to-pink-500" }
};

function ContactCard({ 
  icon: Icon, 
  label, 
  value, 
  href, 
  gradient 
}: { 
  icon: any, 
  label: string, 
  value: string, 
  href?: string,
  gradient: string
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-8deg", "8deg"]);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left) / width - 0.5);
    y.set((clientY - top) / height - 0.5);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const content = (
    <motion.div
      className="relative [perspective:1500px] group"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Animated gradient border */}
      <motion.div
        className={`absolute -inset-[1px] bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative flex items-center gap-4 p-5 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all"
      >
        {/* Floating Icon */}
        <motion.div 
          className={`p-3 rounded-full bg-gradient-to-br ${gradient} shadow-lg`}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "translateZ(20px)" }}
        >
          <Icon size={24} className="text-white" />
        </motion.div>
        <div style={{ transform: "translateZ(15px)" }} className="min-w-0 flex-1">
          <p className="text-sm text-gray-400">{label}</p>
          <p className="font-semibold text-white text-sm sm:text-base break-all">{value}</p>
        </div>
      </motion.div>
    </motion.div>
  );

  return href ? (
    <a href={href} className="block">
      {content}
    </a>
  ) : (
    content
  );
}

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS environment variables missing");
      alert("Email service is not configured correctly.");
      setIsSubmitting(false);
      return;
    }

    try {
      await emailjs.sendForm(serviceId, templateId, formRef.current!, publicKey);
      alert("Message sent successfully! I'll get back to you soon.");
      setFormState({ name: "", email: "", message: "" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to send message: ${errorMessage}. Please try again later.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.3 }}
          transition={{ duration: 0.8, type: "spring" as const, stiffness: 100 }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4"
          >
            Contact
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Get in Touch</h2>
          <p className="text-gray-400 max-w-lg mx-auto">Let's build something extraordinary together</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <motion.div 
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
            }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50 } } }}
            >
              <h3 className="text-3xl font-bold text-white mb-4">
                Let's build something <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">extraordinary</span>.
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Got a groundbreaking idea? Looking for a driven developer? I'm always excited to collaborate on projects that push boundaries.
              </p>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 30, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 50 } } }}>
              <ContactCard icon={Mail} label="Email" value="preethamnimmagadda@gmail.com" href="mailto:preethamnimmagadda@gmail.com" gradient={contactColors.email.gradient} />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 30, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 50 } } }}>
              <ContactCard icon={MapPin} label="Location" value="Hyderabad, Telangana" gradient={contactColors.location.gradient} />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 30, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 50 } } }}>
              <ContactCard icon={Phone} label="Phone" value="807-402-1047" href="tel:+918074021047" gradient={contactColors.phone.gradient} />
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ amount: 0.2 }}
            transition={{ duration: 0.6, type: "spring" as const, stiffness: 50 }}
            className="relative [perspective:1500px] group"
          >
            {/* Animated gradient border for form */}
            <motion.div
              className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-3xl opacity-50 group-hover:opacity-100 blur-sm transition-opacity duration-500"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 200%" }}
            />

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="relative bg-zinc-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                  <input
                    type="text" id="name" name="name" value={formState.name} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email" id="email" name="email" value={formState.email} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                  <textarea
                    id="message" name="message" value={formState.message} onChange={handleChange} required rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none placeholder:text-gray-600"
                    placeholder="Your message here..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <>
                      Send Message
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

