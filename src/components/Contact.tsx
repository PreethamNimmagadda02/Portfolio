"use client";

/**
 * Contact: the letter column.
 *
 * A single centred 640px measure with left-aligned text, three ledger-line
 * fields and one full-width submit, followed by the address line. The gold
 * nebula returns behind it through the shared CosmicScene (page.tsx); under
 * reduced motion a static gradient stands in, painted here with CSS only.
 *
 * EmailJS submission, env var names, validation rules, messages and the
 * touched-field logic are unchanged from the previous version.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import emailjs from "@emailjs/browser";
import { Check, CircleNotch, Warning, X } from "@phosphor-icons/react";
import { motion, AnimatePresence, useInView, EASE_HEAVY, EASE_SETTLE } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { SectionHeading, TextButton } from "@/components/ui";

/* ------------------------------------------------------------------------
   Validation (unchanged rules and messages)
   ------------------------------------------------------------------------ */

type FormValues = { name: string; email: string; message: string };
type FieldName = keyof FormValues;
type Touched = Record<FieldName, boolean>;
type Errors = Partial<Record<FieldName, string>>;

const MESSAGE_MAX = 500;

const EMPTY_VALUES: FormValues = { name: "", email: "", message: "" };
const UNTOUCHED: Touched = { name: false, email: false, message: false };

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/* Derived during render (no effect, no extra state): the same touched-field
   rules and copy as before, one render earlier. */
function validate(values: FormValues, touched: Touched): Errors {
  const errors: Errors = {};

  if (touched.name && values.name.length === 0) {
    errors.name = "Name is required";
  } else if (touched.name && values.name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (touched.email && values.email.length === 0) {
    errors.email = "Email is required";
  } else if (touched.email && !isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (touched.message && values.message.length === 0) {
    errors.message = "Message is required";
  } else if (touched.message && values.message.length < 10) {
    errors.message = "Message must be at least 10 characters";
  }

  return errors;
}

/* ------------------------------------------------------------------------
   Toast
   ------------------------------------------------------------------------ */

type ToastState = { message: string; type: "success" | "error" };

function Toast({ message, type, onClose }: ToastState & { onClose: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : 12 }}
      transition={{ duration: 0.4, ease: EASE_SETTLE }}
      className="fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-[420px] z-50 flex items-center gap-3 px-5 py-4 bg-obsidian-2 border border-hairline text-ivory-100 font-sans text-[14px] leading-[1.5]"
    >
      <span aria-hidden className="inline-flex shrink-0">
        {type === "success" ? (
          <Check size={18} weight="light" className="text-aurum-300" />
        ) : (
          <Warning size={18} weight="light" className="text-aurum-200" />
        )}
      </span>
      <span className="flex-1 min-w-0 wrap-break-word">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="shrink-0 -m-2 inline-flex size-9 items-center justify-center text-ivory-300 transition-colors duration-300 ease-heavy hover:text-ivory-100"
      >
        <X size={16} weight="light" aria-hidden />
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------------
   Ledger-line field
   ------------------------------------------------------------------------ */

/* Transparent fill, hairline bottom border only. A sibling span reads the
   input's focus through `peer` and draws a hairline-gold overlay from the
   left over 450ms, while the border itself eases to gold over 350ms. */
const CONTROL =
  "peer block w-full bg-transparent border-0 border-b border-hairline focus:border-hairline-gold outline-none font-sans text-[17px] leading-[1.5] text-ivory-100 py-3 placeholder:text-ivory-300 transition-colors duration-350 ease-heavy";

const FOCUS_LINE =
  "pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-hairline-gold transition-transform duration-450 ease-heavy peer-focus:scale-x-100";

function FieldError({ id, error }: { id: string; error?: string }) {
  return (
    <AnimatePresence initial={false}>
      {error ? (
        <motion.p
          key="error"
          id={id}
          role="alert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_SETTLE }}
          className="mt-3 flex items-center gap-2 font-sans text-[13px] leading-none text-aurum-200"
        >
          <Warning size={14} weight="light" aria-hidden className="shrink-0" />
          <span>{error}</span>
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-mono text-[12px] leading-none tracking-[0.04em] text-ivory-200 transition-colors duration-350 ease-heavy group-focus-within/field:text-ivory-100"
    >
      {children}
    </label>
  );
}

interface InputFieldProps {
  id: string;
  name: FieldName;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "email";
  autoComplete?: string;
  placeholder?: string;
  error?: string;
}

function InputField({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  error,
}: InputFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="group/field">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative mt-2">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={CONTROL}
        />
        <span aria-hidden className={FOCUS_LINE} />
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  );
}

interface TextareaFieldProps {
  id: string;
  name: FieldName;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  rows?: number;
}

function TextareaField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
  maxLength = MESSAGE_MAX,
  rows = 4,
}: TextareaFieldProps) {
  const errorId = `${id}-error`;
  const countId = `${id}-count`;
  return (
    <div className="group/field">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative mt-2">
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          maxLength={maxLength}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(error && errorId, countId)}
          className={cn(CONTROL, "resize-none")}
        />
        <span aria-hidden className={FOCUS_LINE} />
      </div>
      <div className="mt-2 flex items-start justify-between gap-6">
        <FieldError id={errorId} error={error} />
        <span id={countId} className="ledger ml-auto shrink-0 pt-1 font-mono text-[12px] leading-none text-ivory-300">
          {value.length} / {maxLength}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
   Reveal: column contents rise 12px over 900ms, staggered 80ms, once
   ------------------------------------------------------------------------ */

function Rise({
  index,
  inView,
  reduced,
  children,
  className,
}: {
  index: number;
  inView: boolean;
  reduced: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={false}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : 12 }}
      transition={{ duration: reduced ? 0.2 : 0.9, ease: EASE_SETTLE, delay: inView ? index * 0.08 : 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------------
   Address line
   ------------------------------------------------------------------------ */

const CONTACT_LINK =
  "inline-block border-b border-hairline-gold pb-px text-ivory-200 transition-colors duration-300 ease-heavy hover:text-aurum-200 hover:border-aurum-200";

const EMAIL = "preethamnimmagadda@gmail.com";

/** How long the confirmation holds before the label returns to "Copy". */
const COPIED_HOLD = 2200;

/**
 * The address stays a mailto link, which is what a visitor expects and what
 * assistive technology announces. Beside it sits a discreet mono affordance
 * for the more common intent: taking the address somewhere else. The
 * confirmation is announced politely as well as shown, so it is not a
 * visual-only acknowledgement.
 */
function CopyEmail() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_HOLD);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      // Clipboard access can be refused outright (insecure origin, permission
      // policy, no user gesture). The address is on screen and the mailto link
      // still works, so there is nothing to recover: leave the label at rest
      // rather than claiming a copy that did not happen.
    }
  };

  return (
    <span className="inline-flex items-baseline gap-3">
      <a href={`mailto:${EMAIL}`} className={CONTACT_LINK}>
        {EMAIL}
      </a>
      <button
        type="button"
        onClick={copy}
        className="font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ivory-300 transition-colors duration-300 ease-heavy hover:text-aurum-200"
      >
        <span aria-hidden>{copied ? "Copied" : "Copy"}</span>
        <span className="sr-only" aria-live="polite">
          {copied ? "Address copied to the clipboard" : `Copy ${EMAIL} to the clipboard`}
        </span>
      </button>
    </span>
  );
}

/* ------------------------------------------------------------------------
   Section
   ------------------------------------------------------------------------ */

export default function Contact() {
  const reduced = useReducedMotion();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const columnInView = useInView(columnRef, { once: true, amount: 0.15 });

  const [formState, setFormState] = useState<FormValues>(EMPTY_VALUES);
  const [touched, setTouched] = useState<Touched>(UNTOUCHED);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const errors = validate(formState, touched);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleSubmit = async (e: FormEvent) => {
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
      setFormState(EMPTY_VALUES);
      setTouched(UNTOUCHED);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setToast({ message: `Failed to send message: ${errorMessage}`, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as FieldName;
    const { value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  const nameId = `${uid}-name`;
  const emailId = `${uid}-email`;
  const messageId = `${uid}-message`;

  return (
    <section id="contact" className="relative w-full py-32 lg:py-44">
      {/* Reduced-motion stand-in for the returning nebula: a static gold
          gradient low behind the column, CSS-gated so it never hydrates. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 hidden motion-reduce:block"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 85%, color-mix(in srgb, var(--color-aurum-300) 10%, transparent), transparent 70%)",
        }}
      />

      <AnimatePresence>
        {toast ? <Toast message={toast.message} type={toast.type} onClose={dismissToast} /> : null}
      </AnimatePresence>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        <div ref={columnRef} className="mx-auto w-full max-w-[640px]">
          <SectionHeading
            indicator
            eyebrow="CURRENTLY TAKING ON NEW WORK"
            title="Start a conversation."
            subtext="Autonomous systems, applied AI and data security, whether that is an internship, a full-time role or a build. Tell me what needs making and I will say plainly whether I am the right person. Every message gets a reply inside a day."
          />

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            aria-busy={isSubmitting || undefined}
            className="mt-14 space-y-10"
          >
            <Rise index={0} inView={columnInView} reduced={reduced}>
              <InputField
                id={nameId}
                name="name"
                label="Name"
                value={formState.name}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Your full name"
                error={errors.name}
              />
            </Rise>

            <Rise index={1} inView={columnInView} reduced={reduced}>
              <InputField
                id={emailId}
                name="email"
                type="email"
                label="Email"
                value={formState.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="Where I can reply"
                error={errors.email}
              />
            </Rise>

            <Rise index={2} inView={columnInView} reduced={reduced}>
              <TextareaField
                id={messageId}
                name="message"
                label="Message"
                value={formState.message}
                onChange={handleChange}
                placeholder="A few lines about the role or the project"
                error={errors.message}
                maxLength={MESSAGE_MAX}
                rows={4}
              />
            </Rise>

            <Rise index={3} inView={columnInView} reduced={reduced}>
              <TextButton type="submit" variant="primary" full disabled={isSubmitting}>
                <AnimatePresence mode="wait" initial={false}>
                  {isSubmitting ? (
                    <motion.span
                      key="sending"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE_HEAVY }}
                      className="inline-flex items-center gap-3"
                    >
                      <CircleNotch size={16} weight="light" aria-hidden className="animate-spin" />
                      Sending
                    </motion.span>
                  ) : (
                    <motion.span
                      key="send"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE_HEAVY }}
                      className="inline-flex items-center"
                    >
                      Send message
                    </motion.span>
                  )}
                </AnimatePresence>
              </TextButton>
            </Rise>
          </form>

          <Rise index={4} inView={columnInView} reduced={reduced} className="mt-12">
            <address className="flex flex-col gap-3 font-sans text-[15px] not-italic leading-[1.6] text-ivory-200 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-10 sm:gap-y-3">
              <CopyEmail />
              <a href="tel:+918074021047" className={cn(CONTACT_LINK, "ledger")}>
                +91 80740 21047
              </a>
              <span>Hyderabad, Telangana</span>
            </address>
          </Rise>
        </div>
      </div>
    </section>
  );
}
