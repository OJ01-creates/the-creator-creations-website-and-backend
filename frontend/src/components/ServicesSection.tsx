import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Palette, Layers, PenTool, Monitor, Camera, Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useServices } from "@/lib/useSiteData";

const defaultServices = [
  { id: 1, icon: Palette, title: "Brand Identity", desc: "Complete visual identity systems that define and differentiate." },
  { id: 2, icon: Layers, title: "Print Design", desc: "Posters, packaging, and editorial layouts with tactile appeal." },
  { id: 3, icon: PenTool, title: "Illustration", desc: "Custom artwork and visual narratives for any medium." },
  { id: 4, icon: Monitor, title: "Digital Design", desc: "Web and app interfaces that balance beauty with usability." },
  { id: 5, icon: Camera, title: "Art Direction", desc: "Creative vision and direction for campaigns and shoots." },
  { id: 6, icon: Sparkles, title: "Motion Design", desc: "Animated graphics that bring static designs to life." },
];

// Maps the icon name stored in the admin dashboard (a Lucide icon name) to its component.
const ICONS: Record<string, LucideIcon> = { Palette, Layers, PenTool, Monitor, Camera, Sparkles };

const ServicesSection = () => {
  const { data: apiServices } = useServices();

  const services = useMemo(() => {
    if (!apiServices || apiServices.length === 0) return defaultServices;
    return [...apiServices]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((s) => ({
        id: s.id,
        title: s.title,
        desc: s.description,
        icon: ICONS[s.icon] || Sparkles,
      }));
  }, [apiServices]);

  return (
    <section id="services" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-body">What We Do</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold mt-3 text-foreground">
            Our Services
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-500 hover:glow-primary"
            >
              <service.icon className="w-8 h-8 text-primary mb-5 group-hover:scale-110 transition-transform" />
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
