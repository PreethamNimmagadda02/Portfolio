"use client";

import { motion } from "framer-motion";
import { Send, Mail, MapPin, Phone } from "lucide-react";
import { useState, useRef } from "react";
import emailjs from '@emailjs/browser';

const ContactItem = ({ 
  icon: Icon, 
  label, 
  value, 
  href, 
  delay, 
  color 
}: { 
  icon: any, 
  label: string, 
  value: string, 
  href?: string, 
  delay: number,
  color: { border: string, bg: string, text: string, hoverBorder: string, hoverBg: string, hoverText: string, labelHover: string }
}) => (
  <motion.a
    href={href}
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ amount: 0.3 }}
    transition={{ delay, duration: 0.5 }}
    className={`flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 ${color.hoverBorder} hover:bg-white/10 transition-all group cursor-pointer`}
  >
    <div className={`p-3 rounded-full bg-white/5 border border-white/10 ${color.hoverBorder} ${color.hoverBg} transition-colors`}>
      <Icon size={24} className={`text-gray-400 ${color.hoverText} transition-colors`} />
    </div>
    <div>
      <p className={`text-sm text-gray-500 ${color.labelHover} transition-colors`}>{label}</p>
      <p className="font-medium text-white group-hover:text-white transition-colors">{value}</p>
    </div>
  </motion.a>
);

// Color schemes for each contact type
const contactColors = {
  email: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    hoverBorder: "hover:border-blue-500/50 group-hover:border-blue-500/50",
    hoverBg: "group-hover:bg-blue-500/10",
    hoverText: "group-hover:text-blue-400",
    labelHover: "group-hover:text-blue-300"
  },
  location: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    hoverBorder: "hover:border-emerald-500/50 group-hover:border-emerald-500/50",
    hoverBg: "group-hover:bg-emerald-500/10",
    hoverText: "group-hover:text-emerald-400",
    labelHover: "group-hover:text-emerald-300"
  },
  phone: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    hoverBorder: "hover:border-cyan-500/50 group-hover:border-cyan-500/50",
    hoverBg: "group-hover:bg-cyan-500/10",
    hoverText: "group-hover:text-cyan-400",
    labelHover: "group-hover:text-cyan-300"
  }
};

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

    // Check for environment variables
    const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS environment variables missing");
      alert("Email service is not configured correctly. Please define NEXT_PUBLIC_SERVICE_ID, NEXT_PUBLIC_TEMPLATE_ID, and NEXT_PUBLIC_PUBLIC_KEY.");
      setIsSubmitting(false);
      return;
    }

    try {
      await emailjs.sendForm(
        serviceId,
        templateId,
        formRef.current!,
        publicKey
      );
      

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
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Get in Touch</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
            >
              <h3 className="text-3xl font-bold text-white mb-6">
                Let's build something <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">extraordinary</span>.
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Got a groundbreaking idea? Looking for a driven developer? I'm always excited to collaborate on projects that push boundaries.
              </p>
            </motion.div>

            <div className="space-y-4">
              <ContactItem 
                icon={Mail} 
                label="Email" 
                value="preethamnimmagadda@gmail.com" 
                href="mailto:preethamnimmagadda@gmail.com"
                delay={0.2}
                color={contactColors.email}
              />
              <ContactItem 
                icon={MapPin} 
                label="Location" 
                value="Hyderabad, Telangana" 
                delay={0.3}
                color={contactColors.location}
              />
              <ContactItem 
                icon={Phone} 
                label="Phone" 
                value="807-402-1047" 
                href="tel:+918074021047"
                delay={0.4}
                color={contactColors.phone}
              />
            </div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
            >
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                    placeholder="Your message here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <>
                      Send Message
                      <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
