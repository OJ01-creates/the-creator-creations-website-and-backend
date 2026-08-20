import { useMemo } from "react";
import { motion } from "framer-motion";
import { useStats, useSettings } from "@/lib/useSiteData";

const defaultStats = [
  { id: 1, value: "150+", label: "Projects Completed" },
  { id: 2, value: "12", label: "Years Experience" },
  { id: 3, value: "40+", label: "Global Clients" },
  { id: 4, value: "8", label: "Design Awards" },
];

const AboutSection = () => {
  const { data: apiStats } = useStats();
  const { data: settings } = useSettings();

  const stats = useMemo(() => {
    if (!apiStats || apiStats.length === 0) return defaultStats;
    return [...apiStats].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [apiStats]);

  const heading = settings?.aboutHeading || "Design is our obsession";
  const headingWords = heading.split(" ");
  const headingHighlight = headingWords[headingWords.length - 1];
  const headingStart = headingWords.slice(0, -1).join(" ");

  const paragraph1 =
    settings?.aboutParagraph1 ||
    "We're a collective of designers, thinkers, and visual storytellers who believe that great design isn't just seen — it's felt. Every pixel, every curve, every color choice is deliberate.";
  const paragraph2 =
    settings?.aboutParagraph2 ||
    "From brand identities to immersive digital experiences, we bring ideas to life with precision and passion. Our work spans across industries, cultures, and mediums.";

  return (
    <section id="about" className="py-24 md:py-32 bg-card noise-overlay">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-body">About Us</span>
            <h2 className="font-display text-4xl md:text-6xl font-bold mt-3 text-foreground leading-tight">
              {headingStart}{" "}
              <span className="text-gradient-accent">{headingHighlight}</span>
            </h2>
            <p className="text-muted-foreground text-lg font-body mt-6 leading-relaxed">
              {paragraph1}
            </p>
            <p className="text-muted-foreground font-body mt-4 leading-relaxed">
              {paragraph2}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="p-6 rounded-xl border border-border bg-background/50 backdrop-blur-sm"
              >
                <span className="font-display text-3xl md:text-4xl font-bold text-gradient-primary">
                  {stat.value}
                </span>
                <p className="text-muted-foreground text-sm font-body mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
