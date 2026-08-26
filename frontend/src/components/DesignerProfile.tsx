import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, animate } from "framer-motion";
import designerImg from "@/assets/designer-profile.jpg";
import project1 from "@/assets/project-1.jpg";
import project3 from "@/assets/project-3.jpg";
import project5 from "@/assets/project-5.jpg";
import { useSkills, useTools, useMilestones, useSettings } from "@/lib/useSiteData";
import { resolveImageUrl } from "@/lib/api";

const defaultSkills = [
  { id: 1, name: "Brand Identity", level: 95 },
  { id: 2, name: "Typography", level: 90 },
  { id: 3, name: "UI/UX Design", level: 88 },
  { id: 4, name: "Art Direction", level: 92 },
  { id: 5, name: "Motion Design", level: 85 },
  { id: 6, name: "Web Design", level: 87 },
  { id: 7, name: "Web Development", level: 80 },
  { id: 10, name: "Creative Direction", level: 93 },
];

const milestoneFallbackImages = [project1, project3, project5];

const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

const defaultDesignTools = [
  { name: "Figma", logo: `${DEVICON_BASE}/figma/figma-original.svg` },
  { name: "Photoshop", logo: `${DEVICON_BASE}/photoshop/photoshop-plain.svg` },
  { name: "Illustrator", logo: `${DEVICON_BASE}/illustrator/illustrator-plain.svg` },
  { name: "After Effects", logo: `${DEVICON_BASE}/aftereffects/aftereffects-plain.svg` },
  { name: "Blender", logo: `${DEVICON_BASE}/blender/blender-original.svg` },
  { name: "VS Code", logo: `${DEVICON_BASE}/vscode/vscode-original.svg` },
  { name: "Git", logo: `${DEVICON_BASE}/git/git-original.svg` },
];

const defaultCodeLanguages = [
  { name: "HTML5", logo: `${DEVICON_BASE}/html5/html5-original.svg` },
  { name: "CSS3", logo: `${DEVICON_BASE}/css3/css3-original.svg` },
  { name: "JavaScript", logo: `${DEVICON_BASE}/javascript/javascript-original.svg` },
  { name: "TypeScript", logo: `${DEVICON_BASE}/typescript/typescript-original.svg` },
  { name: "React", logo: `${DEVICON_BASE}/react/react-original.svg` },
  { name: "Node.js", logo: `${DEVICON_BASE}/nodejs/nodejs-original.svg` },
  { name: "Python", logo: `${DEVICON_BASE}/python/python-original.svg` },
];

const defaultMilestones = [
  {
    id: 1,
    year: "2013",
    title: "The Beginning",
    desc: "Started as a junior designer at a boutique agency in Brooklyn, learning the craft of visual storytelling.",
    img: project1,
  },
  {
    id: 2,
    year: "2017",
    title: "Going Independent",
    desc: "Launched The Creator Creations with a vision to create bold, uncompromising design that challenges conventions.",
    img: project3,
  },
  {
    id: 3,
    year: "2021",
    title: "Global Recognition",
    desc: "Won multiple international design awards. Featured in Communication Arts, Behance, and AIGA.",
    img: project5,
  },
];

const DesignerProfile = () => {
  const { data: apiSkills } = useSkills();
  const { data: apiTools } = useTools();
  const { data: apiMilestones } = useMilestones();
  const { data: settings } = useSettings();

  const skills = useMemo(() => {
    if (!apiSkills || apiSkills.length === 0) return defaultSkills;
    return [...apiSkills].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [apiSkills]);

  const designTools = useMemo(() => {
    const tools = (apiTools || []).filter((t) => t.type === "tool").sort((a, b) => (a.order || 0) - (b.order || 0));
    if (tools.length === 0) return defaultDesignTools;
    return tools.map((t) => ({ name: t.name, logo: t.logoUrl }));
  }, [apiTools]);

  const codeLanguages = useMemo(() => {
    const langs = (apiTools || []).filter((t) => t.type === "language").sort((a, b) => (a.order || 0) - (b.order || 0));
    if (langs.length === 0) return defaultCodeLanguages;
    return langs.map((t) => ({ name: t.name, logo: t.logoUrl }));
  }, [apiTools]);

  const milestones = useMemo(() => {
    if (!apiMilestones || apiMilestones.length === 0) return defaultMilestones;
    return [...apiMilestones]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((m, i) => ({
        id: m.id,
        year: m.year,
        title: m.title,
        desc: m.description,
        img: resolveImageUrl(m.image) || milestoneFallbackImages[i % milestoneFallbackImages.length],
      }));
  }, [apiMilestones]);

  const designerName = settings?.designerName || "Alex Martinez";
  const designerTitle = settings?.designerTitle || "Creative Director & Founder";
  const designerPhoto = resolveImageUrl(settings?.designerImage) || designerImg;
  const bio1 =
    settings?.designerBio1 ||
    "I'm Alex — a multidisciplinary designer and creative director with over 12 years of experience turning abstract ideas into powerful visual narratives, spanning brand identity, web design and development, photography, and videography.";
  const bio2 =
    settings?.designerBio2 ||
    "From branding Fortune 500 companies to crafting indie album art, I approach every project with the same hunger: to create something that demands attention and refuses to be forgotten.";
  const years = settings?.yearsExperience ?? 12;

  const [[activeSlide, dir], setActiveSlide] = useState([0, 0]);
  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, [0, 1], ["0%", "100%"]);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const imgRotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), { stiffness: 150, damping: 20 });
  const imgRotateY = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), { stiffness: 150, damping: 20 });

  const paginate = useCallback((d: number) => {
    setActiveSlide(([prev]) => [(prev + d + milestones.length) % milestones.length, d]);
    progress.set(0);
  }, [progress, milestones.length]);

  // Keep the active slide in range if the milestone count changes after a live update.
  useEffect(() => {
    if (activeSlide > milestones.length - 1) {
      setActiveSlide([0, 0]);
      progress.set(0);
    }
  }, [milestones.length, activeSlide, progress]);

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: 5,
      ease: "linear",
      onComplete: () => paginate(1),
    });
    return () => controls.stop();
  }, [activeSlide, paginate, progress]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const currentMilestone = milestones[Math.min(activeSlide, milestones.length - 1)];

  return (
    <section className="py-24 md:py-40 overflow-hidden relative">
      {/* Background subtle grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-primary" />
            <span className="text-xs tracking-[0.4em] uppercase text-primary font-body">The Designer</span>
          </span>
          <h2 className="font-display text-4xl md:text-7xl font-extrabold text-foreground leading-[0.95]">
            Meet the <span className="text-gradient-primary">creative mind</span>
          </h2>
        </motion.div>

        {/* Profile layout */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left — Profile image with 3D tilt & parallax layers */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative"
            style={{ perspective: 1000 }}
          >
            {/* Floating shapes behind */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-8 -left-8 w-32 h-32 border border-primary/15 rounded-xl"
            />
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/10 rounded-full blur-lg"
            />

            {/* Main image with 3D effect */}
            <motion.div
              style={{ rotateX: imgRotateX, rotateY: imgRotateY }}
              className="relative rounded-2xl overflow-hidden border border-border/30 group"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <motion.img
                  src={designerPhoto}
                  alt="Designer portrait"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.7 }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>

              {/* Overlay info card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-background/60 backdrop-blur-xl border border-border/30"
              >
                <h3 className="font-display text-2xl font-bold text-foreground">{designerName}</h3>
                <p className="text-primary text-sm font-body tracking-wider">{designerTitle}</p>
              </motion.div>
            </motion.div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              className="absolute -top-4 -right-4 md:right-8 w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg"
            >
              <div className="text-center">
                <span className="font-display text-lg font-extrabold text-primary-foreground leading-none block">{years}</span>
                <span className="text-[9px] text-primary-foreground/80 font-body uppercase tracking-wider">Years</span>
              </div>
            </motion.div>

            {/* Tools & Languages — fills the space below the portrait */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-10"
            >
              <h4 className="font-display text-sm tracking-[0.3em] uppercase text-primary mb-5">Tools I Use</h4>
              <div className="flex flex-wrap gap-3 mb-10">
                {designTools.map((tool, i) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 + i * 0.05, duration: 0.4 }}
                    whileHover={{ y: -4 }}
                    title={tool.name}
                    className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors duration-300"
                  >
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className="w-5 h-5 object-contain shrink-0"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-xs font-body text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                      {tool.name}
                    </span>
                  </motion.div>
                ))}
              </div>

              <h4 className="font-display text-sm tracking-[0.3em] uppercase text-primary mb-5">Languages I Code With</h4>
              <div className="flex flex-wrap gap-3">
                {codeLanguages.map((lang, i) => (
                  <motion.div
                    key={lang.name}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9 + i * 0.05, duration: 0.4 }}
                    whileHover={{ y: -4 }}
                    title={lang.name}
                    className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors duration-300"
                  >
                    <img
                      src={lang.logo}
                      alt={lang.name}
                      className="w-5 h-5 object-contain shrink-0"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-xs font-body text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                      {lang.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Bio + Skills + Journey slider */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Bio */}
            <p className="text-muted-foreground text-lg font-body leading-relaxed mb-4">
              {bio1}
            </p>
            <p className="text-muted-foreground font-body leading-relaxed mb-10">
              {bio2}
            </p>

            {/* Skills with animated bars */}
            <div className="mb-12">
              <h4 className="font-display text-sm tracking-[0.3em] uppercase text-primary mb-6">Core Skills</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {skills.map((skill, i) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-body text-foreground">{skill.name}</span>
                      <span className="text-xs font-body text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-primary"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Journey slider — Slider Revolution style */}
            <div>
              <h4 className="font-display text-sm tracking-[0.3em] uppercase text-primary mb-6">The Journey</h4>

              <div className="relative rounded-2xl overflow-hidden border border-border/30 bg-card">
                {/* Background image with Ken Burns */}
                <AnimatePresence mode="sync" initial={false}>
                  <motion.div
                    key={currentMilestone.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    <motion.img
                      src={currentMilestone.img}
                      alt=""
                      className="w-full h-full object-cover"
                      animate={{ scale: [1, 1.1] }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                    <div className="absolute inset-0 bg-background/75 backdrop-blur-[2px]" />
                  </motion.div>
                </AnimatePresence>

                {/* Content */}
                <div className="relative z-10 p-6 md:p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentMilestone.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="font-display text-4xl md:text-5xl font-extrabold text-gradient-primary">
                        {currentMilestone.year}
                      </span>
                      <h5 className="font-display text-xl font-bold text-foreground mt-2">
                        {currentMilestone.title}
                      </h5>
                      <p className="text-muted-foreground text-sm font-body mt-2 leading-relaxed max-w-md">
                        {currentMilestone.desc}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Dots + Progress */}
                  <div className="flex items-center gap-3 mt-6">
                    {milestones.map((m, i) => (
                      <button
                        key={m.id}
                        onClick={() => setActiveSlide([i, i > activeSlide ? 1 : -1])}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i === activeSlide ? "w-10 bg-primary" : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        }`}
                      />
                    ))}
                    <div className="flex-1" />
                    <span className="text-xs font-body text-muted-foreground">
                      {String(activeSlide + 1).padStart(2, "0")} / {String(milestones.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Bottom progress bar */}
                <div className="h-[2px] bg-muted/20">
                  <motion.div style={{ width: progressWidth }} className="h-full bg-gradient-primary" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DesignerProfile;
