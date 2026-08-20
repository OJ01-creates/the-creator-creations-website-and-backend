import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import { useSettings } from "@/lib/useSiteData";
import { resolveImageUrl } from "@/lib/api";

const HeroSection = () => {
  const { data: settings } = useSettings();

  const tagline = settings?.tagline || "Creative Design Studio";
  const line1 = settings?.heroTitleLine1 || "We craft";
  const highlight = settings?.heroTitleHighlight || "visual";
  const line2 = settings?.heroTitleLine2 || "stories";
  const subtitle =
    settings?.heroSubtitle ||
    "Pushing boundaries in brand identity, editorial design, and digital experiences that leave lasting impressions.";
  const bgImage = resolveImageUrl(settings?.heroImage) || heroBg;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise-overlay">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={bgImage} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-border text-xs tracking-[0.3em] uppercase text-muted-foreground font-body">
            {tagline}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-display text-5xl sm:text-7xl lg:text-9xl font-extrabold leading-[0.9] tracking-tight mb-8"
        >
          <span className="text-foreground">{line1}</span>
          <br />
          <span className="text-gradient-primary">{highlight}</span>{" "}
          <span className="text-foreground">{line2}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-xl mx-auto text-muted-foreground text-lg font-body mb-10"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-gradient-primary text-primary-foreground font-display font-semibold px-8 py-4 rounded-full text-sm tracking-wider uppercase hover:opacity-90 transition-opacity glow-primary"
          >
            View Work
          </button>
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="border border-border text-foreground font-display font-semibold px-8 py-4 rounded-full text-sm tracking-wider uppercase hover:border-primary hover:text-primary transition-colors"
          >
            Get in Touch
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-5 h-8 rounded-full border-2 border-muted-foreground flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-primary" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
