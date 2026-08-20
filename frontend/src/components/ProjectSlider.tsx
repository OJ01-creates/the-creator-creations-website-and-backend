import { useState, useRef, useEffect, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";
import project5 from "@/assets/project-5.jpg";
import project6 from "@/assets/project-6.jpg";
import { useProjects } from "@/lib/useSiteData";
import { resolveImageUrl } from "@/lib/api";

const localFallbackImages = [project1, project2, project3, project4, project5, project6];

const defaultProjects = [
  { id: 1, img: project1, title: "Chromatic Vision", category: "Brand Identity", year: "2025", color: "hsl(45, 100%, 55%)" },
  { id: 2, img: project2, title: "Aurum Luxe", category: "Packaging Design", year: "2025", color: "hsl(30, 100%, 50%)" },
  { id: 3, img: project3, title: "Neon Pulse", category: "Poster Design", year: "2024", color: "hsl(330, 80%, 60%)" },
  { id: 4, img: project4, title: "Editorial Gold", category: "Magazine Layout", year: "2024", color: "hsl(45, 100%, 55%)" },
  { id: 5, img: project5, title: "Prisma Forms", category: "Art Direction", year: "2024", color: "hsl(280, 70%, 50%)" },
  { id: 6, img: project6, title: "Fluid Spectrum", category: "Album Art", year: "2023", color: "hsl(330, 80%, 60%)" },
];

const CARD_WIDTH = 420;
const CARD_GAP = 24;

const ProjectSlider = () => {
  const { data: apiProjects } = useProjects();

  const projects = useMemo(() => {
    if (!apiProjects || apiProjects.length === 0) return defaultProjects;
    return [...apiProjects]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((p, i) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        year: p.year,
        color: p.color || "hsl(45, 100%, 55%)",
        img: resolveImageUrl(p.image) || localFallbackImages[i % localFallbackImages.length],
      }));
  }, [apiProjects]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 30 });

  // The true scrollable distance, measured from the actual rendered track/viewport
  // widths — using a fixed per-card step (as before) overshoots past the last card
  // and leaves a large blank gap once you reach the end. This keeps the end flush.
  const [maxDrag, setMaxDrag] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current || !containerRef.current) return;
      const trackWidth = trackRef.current.scrollWidth;
      const viewportWidth = containerRef.current.clientWidth;
      setMaxDrag(Math.min(0, viewportWidth - trackWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [projects]);

  const clampX = (value: number) => Math.max(maxDrag, Math.min(0, value));

  // Keep the active index in range if the project count changes after a live update.
  useEffect(() => {
    if (activeIndex > projects.length - 1) {
      setActiveIndex(0);
      x.set(0);
    }
  }, [projects.length, activeIndex, x]);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = CARD_WIDTH / 4;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    let newIndex = activeIndex;
    if (offset < -threshold || velocity < -500) {
      newIndex = Math.min(activeIndex + 1, projects.length - 1);
    } else if (offset > threshold || velocity > 500) {
      newIndex = Math.max(activeIndex - 1, 0);
    }

    setActiveIndex(newIndex);
    x.set(clampX(-newIndex * (CARD_WIDTH + CARD_GAP)));
    setIsDragging(false);
  };

  const goTo = (i: number) => {
    setActiveIndex(i);
    x.set(clampX(-i * (CARD_WIDTH + CARD_GAP)));
  };

  return (
    <section id="work" className="py-24 md:py-40 overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 mb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-primary" />
              <span className="text-xs tracking-[0.4em] uppercase text-primary font-body">Portfolio</span>
            </span>
            <h2 className="font-display text-5xl md:text-7xl font-extrabold text-foreground leading-[0.95]">
              Selected<br />
              <span className="text-gradient-primary">Works</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => goTo(Math.max(0, activeIndex - 1))}
              className="w-14 h-14 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all duration-500 group"
            >
              <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => goTo(Math.min(projects.length - 1, activeIndex + 1))}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:shadow-[0_0_30px_hsl(45_100%_55%/0.3)] transition-all duration-500 group"
            >
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Slider */}
      <div ref={containerRef} className="relative cursor-grab active:cursor-grabbing">
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={{ left: maxDrag, right: 0 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ x: springX, gap: `${CARD_GAP}px` }}
          className="flex pl-6 md:pl-[calc(50vw-700px+64px)] pr-6 md:pr-16"
        >
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              isActive={i === activeIndex}
              isDragging={isDragging}
            />
          ))}

          {/* Closing card — gives the slider an intentional end instead of trailing blank space */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: projects.length * 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0 w-[300px] md:w-[340px]"
          >
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="h-full flex flex-col items-center justify-center text-center gap-5 rounded-2xl border border-dashed border-border hover:border-primary/50 bg-card/40 hover:bg-card transition-all duration-500 p-8"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 45 }}
                transition={{ duration: 0.4 }}
                className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center"
              >
                <ArrowUpRight className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Got a project in mind?</h3>
                <p className="text-muted-foreground text-sm font-body mt-2">
                  Let's create something extraordinary together.
                </p>
              </div>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Progress indicators */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 mt-16 flex items-center gap-4">
        <div className="flex-1 h-px bg-border relative">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-primary"
            animate={{ width: `${((activeIndex + 1) / projects.length) * 100}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <span className="text-xs font-body text-muted-foreground tracking-wider">
          {String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
};

type ProjectCardData = { id: number; img: string; title: string; category: string; year: string; color: string };

const ProjectCard = ({
  project,
  index,
  isActive,
  isDragging,
}: {
  project: ProjectCardData;
  index: number;
  isActive: boolean;
  isDragging: boolean;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-200, 200], [10, -10]);
  const rotateY = useTransform(mouseX, [-200, 200], [-10, 10]);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || isDragging) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 1000,
      }}
      className={`flex-shrink-0 group transition-all duration-700 ${
        isActive ? "w-[380px] md:w-[420px]" : "w-[340px] md:w-[380px]"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors duration-500">
        {/* Image with clip-path reveal on hover */}
        <div className="aspect-[4/5] overflow-hidden relative">
          <motion.img
            src={project.img}
            alt={project.title}
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.08 : 1,
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

          {/* Hover overlay with blur */}
          <motion.div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={isHovered ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center"
            >
              <ArrowUpRight className="w-6 h-6 text-primary-foreground" />
            </motion.div>
          </motion.div>

          {/* Year badge */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm border border-border/30">
            <span className="text-xs font-body text-muted-foreground">{project.year}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 relative">
          {/* Colored accent line */}
          <motion.div
            className="absolute top-0 left-6 right-6 h-px"
            style={{ background: project.color }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />

          <span className="text-xs tracking-[0.3em] uppercase font-body text-primary">
            {project.category}
          </span>
          <h3 className="font-display text-2xl font-bold text-foreground mt-2 group-hover:text-primary transition-colors duration-500">
            {project.title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectSlider;
