import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";
import project5 from "@/assets/project-5.jpg";
import project6 from "@/assets/project-6.jpg";
import { useFeaturedSlides } from "@/lib/useSiteData";
import { resolveImageUrl } from "@/lib/api";
import { slugify } from "@/lib/slug";

const localFallbackImages = [project1, project3, project5, project2, project6, project4];

// Mirrors the actual live content as of the last sync — see ProjectSlider.tsx for why.
const defaultSlides = [
  { title: "SipStop Brand", subtitle: "A bold exploration of color and form", tag: "Brand Identity", img: "https://res.cloudinary.com/c2bvnlic/image/upload/v1788601965/creator-creations/cpgrgpw3xbwyqjlntbdw.png", liveUrl: "" },
  { title: "Pantheons of Art", subtitle: "Creative Events series", tag: "Poster Design", img: "https://res.cloudinary.com/c2bvnlic/image/upload/v1787742198/creator-creations/xibmapuydeo32c865xtx.jpg", liveUrl: "" },
  { title: "Cafeteria Deluxe", subtitle: "Mind-blowing University Cafeteria Website", tag: "Web Design", img: "https://res.cloudinary.com/c2bvnlic/image/upload/v1788823869/creator-creations/j3fnxbyxas5wl262uo5q.png", liveUrl: "https://narsh-place-preview-0grm-6jdjgilad-tunmise1805-7513s-projects.vercel.app/" },
  { title: "Mocktail Packaging", subtitle: "Premium packaging identity", tag: "Packaging", img: "https://res.cloudinary.com/c2bvnlic/image/upload/v1788600146/creator-creations/s9gdqhiacm7smtcowfjc.png", liveUrl: "" },
  { title: "School Spectrum", subtitle: "Academic Websites", tag: "Website Design", img: "https://res.cloudinary.com/c2bvnlic/image/upload/v1788580287/creator-creations/gvyokhucouiavadxl1eb.png", liveUrl: "" },
  { title: "Editorial Gold", subtitle: "Fashion editorial layouts", tag: "Editorial", img: project4, liveUrl: "" },
];

// Ken Burns zoom directions per slide
const kenBurnsVariants = [
  { scale: [1, 1.15], x: ["0%", "3%"], y: ["0%", "2%"] },
  { scale: [1.1, 1], x: ["2%", "0%"], y: ["-1%", "1%"] },
  { scale: [1, 1.2], x: ["-2%", "2%"], y: ["1%", "-1%"] },
  { scale: [1.15, 1], x: ["3%", "-1%"], y: ["0%", "2%"] },
  { scale: [1, 1.12], x: ["0%", "-3%"], y: ["-2%", "0%"] },
  { scale: [1.1, 1.02], x: ["-1%", "1%"], y: ["2%", "-2%"] },
];

// Clip-path reveal transitions
const clipReveal = {
  enter: (dir: number) => ({
    clipPath: dir > 0
      ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)"
      : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
  }),
  center: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  },
  exit: (dir: number) => ({
    clipPath: dir > 0
      ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
      : "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
  }),
};

// Split text into characters for stagger animation
const SplitText = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => (
  <span className={className}>
    {text.split("").map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 80, rotateX: 90 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{
          duration: 0.6,
          delay: delay + i * 0.03,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="inline-block"
        style={{ transformOrigin: "bottom" }}
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ))}
  </span>
);

const FullscreenSlider = () => {
  const { data: apiSlides } = useFeaturedSlides();
  const navigate = useNavigate();

  const slides = useMemo(() => {
    if (!apiSlides || apiSlides.length === 0) return defaultSlides;
    return [...apiSlides]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((s, i) => ({
        title: s.title,
        subtitle: s.subtitle,
        tag: s.tag,
        img: resolveImageUrl(s.image) || localFallbackImages[i % localFallbackImages.length],
        liveUrl: s.liveUrl || "",
      }));
  }, [apiSlides]);

  const [[current, direction], setCurrent] = useState([0, 0]);
  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, [0, 1], ["0%", "100%"]);

  // Keep the active slide in range if the slide count changes after a live update.
  useEffect(() => {
    if (current > slides.length - 1) {
      setCurrent([0, 0]);
      progress.set(0);
    }
  }, [slides.length, current, progress]);

  const activeSlide = slides[Math.min(current, slides.length - 1)];

  const handleViewProject = () => {
    if (activeSlide.liveUrl) {
      window.open(activeSlide.liveUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(`/category/${slugify(activeSlide.tag)}`);
    }
  };

  const paginate = useCallback(
    (dir: number) => {
      setCurrent(([prev]) => [(prev + dir + slides.length) % slides.length, dir]);
      progress.set(0);
    },
    [progress, slides.length]
  );

  // Auto-play with progress tracking
  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: 6,
      ease: "linear",
      onComplete: () => paginate(1),
    });
    return () => controls.stop();
  }, [current, paginate, progress]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [paginate]);

  const kb = kenBurnsVariants[current % kenBurnsVariants.length];

  return (
    <section className="relative h-[85vh] md:h-screen overflow-hidden bg-background">
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360, y: [0, -20, 0] }}
          transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, y: { duration: 4, repeat: Infinity } }}
          className="absolute top-[15%] right-[10%] w-16 h-16 border border-primary/20 rounded-sm"
          style={{ transform: "rotate(45deg)" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[25%] left-[8%] w-24 h-24 border border-accent/15 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-[40%] right-[25%] w-3 h-3 bg-primary rounded-full"
        />
      </div>

      {/* Background image with Ken Burns */}
      <AnimatePresence custom={direction} initial={false} mode="sync">
        <motion.div
          key={current}
          custom={direction}
          variants={clipReveal}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0"
        >
          <motion.img
            src={activeSlide.img}
            alt={activeSlide.title}
            className="w-full h-full object-cover"
            animate={{
              scale: kb.scale,
              x: kb.x,
              y: kb.y,
            }}
            transition={{ duration: 6, ease: "linear" }}
          />
          {/* Cinematic overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </motion.div>
      </AnimatePresence>

      {/* Vertical line accent */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute left-6 md:left-12 top-[20%] bottom-[20%] w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent z-10 origin-top"
      />

      {/* Content overlay - left aligned, editorial style */}
      <div className="absolute inset-0 z-20 flex items-center pb-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-6 md:px-16 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl"
            >
              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-12 h-px bg-primary" />
                <span className="text-xs tracking-[0.4em] uppercase text-primary font-body font-medium">
                  {activeSlide.tag}
                </span>
              </motion.div>

              {/* Title with split text reveal */}
              <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground leading-[0.9] mb-4"
                style={{ perspective: "600px" }}>
                <SplitText text={activeSlide.title} delay={0.2} />
              </h2>

              {/* Subtitle with slide-up */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-muted-foreground text-lg md:text-xl font-body mt-4 max-w-md"
              >
                {activeSlide.subtitle}
              </motion.p>

              {/* CTA button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                onClick={handleViewProject}
                className="mt-8 flex items-center gap-3 group"
              >
                <span className="w-14 h-14 rounded-full border-2 border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <Play className="w-5 h-5 ml-0.5 text-primary group-hover:text-primary-foreground transition-colors" />
                </span>
                <span className="text-sm tracking-[0.2em] uppercase text-foreground font-body font-medium group-hover:text-primary transition-colors">
                  {activeSlide.liveUrl ? "Visit Live Site" : "View Project"}
                </span>
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide counter - vertical on right */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent([i, i > current ? 1 : -1])}
            className="relative group"
          >
            <span className={`block w-0.5 transition-all duration-500 ${
              i === current ? "h-10 bg-primary" : "h-4 bg-muted-foreground/30 group-hover:bg-muted-foreground/60"
            }`} />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-body tracking-wider transition-all duration-300 ${
              i === current ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-60 text-muted-foreground"
            }`}>
              {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom controls bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Progress bar */}
        <div className="h-[2px] bg-muted/20">
          <motion.div
            style={{ width: progressWidth }}
            className="h-full bg-gradient-primary"
          />
        </div>

        <div className="flex items-center justify-between px-6 md:px-16 py-5 bg-background/40 backdrop-blur-md border-t border-border/20">
          {/* Slide number */}
          <div className="font-display text-sm text-muted-foreground">
            <span className="text-2xl font-bold text-foreground">{String(current + 1).padStart(2, "0")}</span>
            <span className="mx-2">/</span>
            <span>{String(slides.length).padStart(2, "0")}</span>
          </div>

          {/* Nav arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => paginate(-1)}
              className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:shadow-[0_0_20px_hsl(45_100%_55%/0.2)] transition-all duration-500 group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:shadow-[0_0_20px_hsl(45_100%_55%/0.2)] transition-all duration-500 group"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FullscreenSlider;
