import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const servicesRow1 = [
  "Brand Identity",
  "Visual Design",
  "Typography",
  "Packaging",
  "Editorial",
];

const servicesRow2 = [
  "Motion Graphics",
  "UI/UX Design",
  "Art Direction",
  "Illustration",
  "Print Design",
];

const MarqueeSlider = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax offset based on scroll
  const row1X = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const row2X = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const doubled1 = [...servicesRow1, ...servicesRow1, ...servicesRow1];
  const doubled2 = [...servicesRow2, ...servicesRow2, ...servicesRow2];

  return (
    <div ref={ref} className="py-12 md:py-16 overflow-hidden relative">
      {/* Decorative side gradients */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      />

      {/* Row 1 - filled text, moves left */}
      <motion.div style={{ x: row1X }} className="mb-6">
        <div className="animate-marquee flex whitespace-nowrap">
          {doubled1.map((s, i) => (
            <span key={i} className="flex items-center gap-8 mx-4">
              <span className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground/10 hover:text-primary transition-colors duration-700 cursor-default">
                {s}
              </span>
              <span className="text-primary/40 text-sm">✦</span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* Row 2 - stroke/outline text, moves right */}
      <motion.div style={{ x: row2X }}>
        <div className="animate-marquee-reverse flex whitespace-nowrap">
          {doubled2.map((s, i) => (
            <span key={i} className="flex items-center gap-8 mx-4">
              <span
                className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight cursor-default transition-all duration-700 hover:text-accent"
                style={{
                  WebkitTextStroke: "1.5px hsl(var(--muted-foreground) / 0.2)",
                  color: "transparent",
                }}
              >
                {s}
              </span>
              <span className="text-accent/30 text-sm">◆</span>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MarqueeSlider;
