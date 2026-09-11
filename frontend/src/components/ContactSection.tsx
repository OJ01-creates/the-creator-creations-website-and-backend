import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Send, Mail, Sparkles, CheckCircle } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useSettings } from "@/lib/useSiteData";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message too long"),
});

const newsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
});

type FormTab = "message" | "newsletter";

const inputClasses =
  "w-full bg-background/50 border border-border/50 rounded-xl px-5 py-4 text-foreground font-body text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_20px_hsl(45_100%_55%/0.1)] transition-all duration-500";

const ContactSection = () => {
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const contactEmail = settings?.contactEmail || "hello@thecreatorcreations.com";
  const contactPhone = settings?.contactPhone || "+234 (916) 784-5271, +234 (902) 625-0712";
  const contactLocation = settings?.contactLocation || "Abuja, Nigeria";
  const [activeTab, setActiveTab] = useState<FormTab>("message");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<FormTab | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    // Send to the backend if configured; the local success UX shows either way.
    api.sendContactMessage(formData);
    setSubmitted("message");
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(null);
    }, 3000);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = newsletterSchema.safeParse({ email: newsletterEmail });
    if (!result.success) {
      setErrors({ newsletter: result.error.errors[0].message });
      return;
    }
    api.subscribeNewsletter(result.data.email);
    setSubmitted("newsletter");
    toast({ title: "Subscribed!", description: "Welcome to our creative circle." });
    setTimeout(() => {
      setNewsletterEmail("");
      setSubmitted(null);
    }, 3000);
  };

  return (
    <section id="contact" className="py-24 md:py-40 bg-card noise-overlay relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-80 h-80 border border-primary/5 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-32 -left-32 w-96 h-96 border border-accent/5 rounded-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-px bg-primary" />
            <span className="text-xs tracking-[0.4em] uppercase text-primary font-body">Get in Touch</span>
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-display text-4xl md:text-7xl font-extrabold text-foreground leading-tight">
            Let's create something{" "}
            <span className="text-gradient-accent">extraordinary</span>
          </h2>
          <p className="text-muted-foreground text-lg font-body mt-6 max-w-lg mx-auto">
            Have a project in mind? We'd love to hear about it. Drop us a line and let's start a conversation.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl border border-border/50 bg-background/30 backdrop-blur-xl p-8 md:p-10 relative overflow-hidden">
            {/* Glow accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 mb-8 relative">
              {(["message", "newsletter"] as FormTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setErrors({}); }}
                  className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-body font-medium transition-colors duration-300 ${
                    activeTab === tab ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "message" ? <Send className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  {tab === "message" ? "Send Message" : "Newsletter"}
                </button>
              ))}
              {/* Animated tab indicator */}
              <motion.div
                layoutId="contactTab"
                className="absolute top-1 bottom-1 rounded-lg bg-gradient-primary"
                style={{ width: "calc(50% - 4px)" }}
                animate={{ left: activeTab === "message" ? "4px" : "calc(50% + 0px)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "message" ? (
                <motion.form
                  key="message"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleMessageSubmit}
                  className="space-y-5 relative z-10"
                >
                  {submitted === "message" ? (
                    <SuccessState message="Your message has been sent!" />
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <input
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            className={inputClasses}
                            maxLength={100}
                          />
                          {errors.name && <p className="text-destructive text-xs mt-1 font-body">{errors.name}</p>}
                        </div>
                        <div>
                          <input
                            name="email"
                            type="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={handleChange}
                            className={inputClasses}
                            maxLength={255}
                          />
                          {errors.email && <p className="text-destructive text-xs mt-1 font-body">{errors.email}</p>}
                        </div>
                      </div>
                      <div>
                        <input
                          name="subject"
                          placeholder="Subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className={inputClasses}
                          maxLength={200}
                        />
                        {errors.subject && <p className="text-destructive text-xs mt-1 font-body">{errors.subject}</p>}
                      </div>
                      <div>
                        <textarea
                          name="message"
                          placeholder="Tell us about your project..."
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          className={`${inputClasses} resize-none`}
                          maxLength={2000}
                        />
                        {errors.message && <p className="text-destructive text-xs mt-1 font-body">{errors.message}</p>}
                      </div>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-primary text-primary-foreground font-display font-bold py-4 rounded-xl text-sm tracking-wider uppercase glow-primary flex items-center justify-center gap-3"
                      >
                        Send Message <Send className="w-4 h-4" />
                      </motion.button>
                    </>
                  )}
                </motion.form>
              ) : (
                <motion.form
                  key="newsletter"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleNewsletterSubmit}
                  className="relative z-10"
                >
                  {submitted === "newsletter" ? (
                    <SuccessState message="You're subscribed to our newsletter!" />
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center mb-4">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          className="inline-block mb-4"
                        >
                          <Sparkles className="w-10 h-10 text-primary" />
                        </motion.div>
                        <h3 className="font-display text-xl font-bold text-foreground">
                          Join our creative circle
                        </h3>
                        <p className="text-muted-foreground text-sm font-body mt-2">
                          Get design inspiration, behind-the-scenes content, and exclusive updates delivered to your inbox.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <input
                            type="email"
                            placeholder="Enter your email"
                            value={newsletterEmail}
                            onChange={(e) => {
                              setNewsletterEmail(e.target.value);
                              if (errors.newsletter) setErrors({});
                            }}
                            className={inputClasses}
                            maxLength={255}
                          />
                          {errors.newsletter && (
                            <p className="text-destructive text-xs mt-1 font-body">{errors.newsletter}</p>
                          )}
                        </div>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-accent text-accent-foreground font-display font-bold px-6 py-4 rounded-xl text-sm tracking-wider uppercase glow-accent"
                        >
                          Subscribe
                        </motion.button>
                      </div>
                      <p className="text-muted-foreground/50 text-xs font-body text-center">
                        No spam. Unsubscribe anytime. We respect your inbox.
                      </p>
                    </div>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Start a project CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.a
            href={`mailto:${contactEmail}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 bg-gradient-primary text-primary-foreground font-display font-bold px-10 py-5 rounded-full text-lg tracking-wider uppercase glow-primary"
          >
            Start a Project <ArrowUpRight className="w-5 h-5" />
          </motion.a>
        </motion.div>

        {/* Contact info */}
        <div className="mt-20 flex flex-wrap justify-center gap-12 text-muted-foreground font-body text-sm">
          <div>
            <p className="text-foreground font-display font-semibold mb-1">Email</p>
            <p>{contactEmail}</p>
          </div>
          <div>
            <p className="text-foreground font-display font-semibold mb-1">Phone</p>
            <p>{contactPhone}</p>
          </div>
          <div>
            <p className="text-foreground font-display font-semibold mb-1">Location</p>
            <p>{contactLocation}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const SuccessState = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="py-12 text-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <CheckCircle className="w-16 h-16 text-primary mx-auto" />
    </motion.div>
    <h3 className="font-display text-xl font-bold text-foreground mt-4">{message}</h3>
    <p className="text-muted-foreground text-sm font-body mt-2">Thank you for reaching out!</p>
  </motion.div>
);

export default ContactSection;
