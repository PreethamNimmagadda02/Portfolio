"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Send, Mail, MapPin, Phone, CheckCircle, AlertCircle, User, MessageSquare, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import emailjs from '@emailjs/browser';
import React from "react";

// Color schemes for each contact type
const contactColors = {
  email: { gradient: "from-blue-500 to-cyan-500" },
  location: { gradient: "from-emerald-500 to-teal-500" },
  phone: { gradient: "from-purple-500 to-pink-500" }
};

// Toast notification component
function Toast({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: "success" | "error"; 
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl ${
        type === "success" 
          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" 
          : "bg-red-500/20 border-red-500/30 text-red-300"
      }`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
      >
        {type === "success" ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <AlertCircle className="w-6 h-6" />
        )}
      </motion.div>
      <span className="font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 text-white/50 hover:text-white transition-colors"
      >
        ×
      </button>
    </motion.div>
  );
}

// Floating label input component
function FloatingInput({
  id,
  name,
  type = "text",
  value,
  onChange,
  label,
  icon: Icon,
  error,
  required = false,
}: {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  icon: any;
  error?: string;
  required?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue;

  return (
    <div className="relative">
      {/* Animated glow effect */}
      <motion.div
        className={`absolute -inset-[1px] rounded-xl bg-gradient-to-r ${
          error ? "from-red-500 to-pink-500" : "from-purple-500 to-blue-500"
        } opacity-0 blur-sm`}
        animate={{ opacity: isFocused ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative">
        {/* Icon */}
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          animate={{ 
            color: isFocused ? "#a855f7" : error ? "#ef4444" : "#6b7280",
            scale: isFocused ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={18} />
        </motion.div>

        {/* Floating Label */}
        <motion.label
          htmlFor={id}
          className={`absolute left-11 pointer-events-none font-medium transition-colors ${
            error ? "text-red-400" : isActive ? "text-purple-400" : "text-gray-500"
          }`}
          animate={{
            top: isActive ? "8px" : "50%",
            y: isActive ? 0 : "-50%",
            fontSize: isActive ? "11px" : "14px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </motion.label>

        {/* Input */}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          className={`w-full pl-11 pr-4 pt-6 pb-2 rounded-xl bg-white/5 border text-white transition-all duration-300 ${
            error 
              ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
              : "border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          } focus:outline-none`}
        />

        {/* Validation indicator */}
        <AnimatePresence>
          {hasValue && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400"
            >
              <CheckCircle size={18} />
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400"
            >
              <AlertCircle size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-red-400 text-xs mt-1 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Floating label textarea component
function FloatingTextarea({
  id,
  name,
  value,
  onChange,
  label,
  icon: Icon,
  error,
  required = false,
  maxLength = 500,
  rows = 4,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label: string;
  icon: any;
  error?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue;
  const charCount = value.length;
  const charPercentage = (charCount / maxLength) * 100;

  return (
    <div className="relative">
      {/* Animated glow effect */}
      <motion.div
        className={`absolute -inset-[1px] rounded-xl bg-gradient-to-r ${
          error ? "from-red-500 to-pink-500" : "from-purple-500 to-blue-500"
        } opacity-0 blur-sm`}
        animate={{ opacity: isFocused ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative">
        {/* Icon */}
        <motion.div
          className="absolute left-4 top-4 pointer-events-none"
          animate={{ 
            color: isFocused ? "#a855f7" : error ? "#ef4444" : "#6b7280",
            scale: isFocused ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={18} />
        </motion.div>

        {/* Floating Label */}
        <motion.label
          htmlFor={id}
          className={`absolute left-11 pointer-events-none font-medium transition-colors ${
            error ? "text-red-400" : isActive ? "text-purple-400" : "text-gray-500"
          }`}
          animate={{
            top: isActive ? "8px" : "16px",
            fontSize: isActive ? "11px" : "14px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </motion.label>

        {/* Textarea */}
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          maxLength={maxLength}
          rows={rows}
          className={`w-full pl-11 pr-4 pt-6 pb-10 rounded-xl bg-white/5 border text-white transition-all duration-300 resize-none ${
            error 
              ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
              : "border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          } focus:outline-none`}
        />

        {/* Character counter */}
        <div className="absolute bottom-3 right-4 flex items-center gap-2">
          {/* Progress bar */}
          <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                charPercentage > 90 ? "bg-red-500" : charPercentage > 70 ? "bg-yellow-500" : "bg-purple-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${charPercentage}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span className={`text-xs font-mono ${
            charPercentage > 90 ? "text-red-400" : charPercentage > 70 ? "text-yellow-400" : "text-gray-500"
          }`}>
            {charCount}/{maxLength}
          </span>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-red-400 text-xs mt-1 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

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

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [touched, setTouched] = useState<{ name: boolean; email: boolean; message: boolean }>({
    name: false,
    email: false,
    message: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Real-time validation
  useEffect(() => {
    const newErrors: typeof errors = {};
    
    if (touched.name && formState.name.length === 0) {
      newErrors.name = "Name is required";
    } else if (touched.name && formState.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (touched.email && formState.email.length === 0) {
      newErrors.email = "Email is required";
    } else if (touched.email && !isValidEmail(formState.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (touched.message && formState.message.length === 0) {
      newErrors.message = "Message is required";
    } else if (touched.message && formState.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
  }, [formState, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ name: true, email: true, message: true });

    // Validate all fields
    if (formState.name.length < 2 || !isValidEmail(formState.email) || formState.message.length < 10) {
      setToast({ message: "Please fix the errors in the form", type: "error" });
      return;
    }

    setIsSubmitting(true);

    const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS environment variables missing");
      setToast({ message: "Email service is not configured correctly.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      await emailjs.sendForm(serviceId, templateId, formRef.current!, publicKey);
      setToast({ message: "Message sent successfully! I'll get back to you soon.", type: "success" });
      setFormState({ name: "", email: "", message: "" });
      setTouched({ name: false, email: false, message: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setToast({ message: `Failed to send message: ${errorMessage}`, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
    if (!touched[name as keyof typeof touched]) {
      setTouched({ ...touched, [name]: true });
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
    if (!touched[name as keyof typeof touched]) {
      setTouched({ ...touched, [name]: true });
    }
  };

  // Calculate form completion percentage
  const formCompletion = [
    formState.name.length >= 2,
    isValidEmail(formState.email),
    formState.message.length >= 10
  ].filter(Boolean).length / 3 * 100;

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

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
              {/* Form progress indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">Form completion</span>
                  <span className="text-xs text-purple-400 font-mono">{Math.round(formCompletion)}%</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${formCompletion}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="space-y-5">
                <FloatingInput
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  label="Your Name"
                  icon={User}
                  error={errors.name}
                  required
                />

                <FloatingInput
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  label="Email Address"
                  icon={Mail}
                  error={errors.email}
                  required
                />

                <FloatingTextarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleTextareaChange}
                  label="Your Message"
                  icon={MessageSquare}
                  error={errors.message}
                  required
                  maxLength={500}
                  rows={4}
                />

                <motion.button
                  type="submit"
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(168, 85, 247, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
                >
                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                    animate={{ x: ["0%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                  />
                  
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 relative z-10"
                      >
                        <span>Send Message</span>
                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

