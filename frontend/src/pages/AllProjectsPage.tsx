import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Lightbox from "@/components/Lightbox";
import { useProjects } from "@/lib/useSiteData";
import { resolveImageUrl, type Project } from "@/lib/api";
import { slugify } from "@/lib/slug";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";
import project5 from "@/assets/project-5.jpg";
import project6 from "@/assets/project-6.jpg";

const localFallbackImages = [project1, project2, project3, project4, project5, project6];

const AllProjectsPage = () => {
  const { data: apiProjects, isLoading } = useProjects();

  const categories = useMemo(() => {
    const all = [...(apiProjects || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    const groups = new Map<string, Project[]>();
    all.forEach((p) => {
      const list = groups.get(p.category) || [];
      list.push(p);
      groups.set(p.category, list);
    });
    return Array.from(groups.entries()).map(([category, projects]) => ({ category, projects }));
  }, [apiProjects]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-40 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>

            <span className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-primary" />
              <span className="text-xs tracking-[0.4em] uppercase text-primary font-body">Full Portfolio</span>
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold text-foreground leading-[0.95]">
              All <span className="text-gradient-primary">Projects</span>
            </h1>
            <p className="text-muted-foreground font-body mt-4">
              {isLoading ? "Loading…" : `${apiProjects?.length || 0} projects across ${categories.length} categories`}
            </p>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-8">
                {categories.map(({ category }) => (
                  <a
                    key={category}
                    href={`#${slugify(category)}`}
                    className="px-4 py-2 rounded-full border border-border text-sm font-body text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {category}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {!isLoading && categories.length === 0 && (
        <div className="pb-32 text-center text-muted-foreground font-body">No projects yet.</div>
      )}

      {categories.map(({ category, projects }, sectionIndex) => (
        <section key={category} id={slugify(category)} className="pb-20 md:pb-24 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{category}</h2>
              <Link
                to={`/category/${slugify(category)}`}
                className="inline-flex items-center gap-1.5 text-sm font-body text-primary hover:gap-2.5 transition-all"
              >
                View category <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, i) => {
                const img = resolveImageUrl(project.image) || localFallbackImages[i % localFallbackImages.length];
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                    className="group rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 bg-card transition-colors duration-500"
                  >
                    <div className="aspect-[4/5] overflow-hidden relative">
                      <img
                        src={img}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />

                      {/* Full preview control — mirrors the homepage ProjectSlider */}
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={() => {
                            if (project.videoUrl) {
                              setLightboxProject(project);
                            } else if (project.liveUrl) {
                              window.open(project.liveUrl, "_blank", "noopener,noreferrer");
                            } else {
                              setLightboxProject(project);
                            }
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          aria-label={project.liveUrl ? `Visit live site for ${project.title}` : `View full image of ${project.title}`}
                          title={project.liveUrl ? "Visit live site" : "View full design"}
                          className="w-16 h-16 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <ArrowUpRight className="w-6 h-6 text-primary-foreground" />
                        </button>
                      </div>

                      {/* Keep the preview reachable on touch devices without hover */}
                      <button
                        type="button"
                        onClick={() => {
                          if (project.videoUrl) {
                            setLightboxProject(project);
                          } else if (project.liveUrl) {
                            window.open(project.liveUrl, "_blank", "noopener,noreferrer");
                          } else {
                            setLightboxProject(project);
                          }
                        }}
                        aria-label={project.liveUrl ? `Visit live site for ${project.title}` : `View full image of ${project.title}`}
                        className="md:hidden absolute bottom-4 left-4 w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg"
                      >
                        <ArrowUpRight className="w-5 h-5 text-primary-foreground" />
                      </button>

                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm border border-border/30">
                        <span className="text-xs font-body text-muted-foreground">{project.year}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="text-xs tracking-[0.3em] uppercase font-body text-primary">
                        {project.category}
                      </span>
                      <h3 className="font-display text-xl font-bold text-foreground mt-2 group-hover:text-primary transition-colors duration-500">
                        {project.title}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {sectionIndex < categories.length - 1 && (
            <div className="max-w-7xl mx-auto px-6 md:px-16 mt-20 md:mt-24">
              <div className="h-px bg-border" />
            </div>
          )}
        </section>
      ))}

      <Footer />

      <Lightbox
        image={lightboxProject ? resolveImageUrl(lightboxProject.image) || localFallbackImages[0] : null}
        title={lightboxProject?.title}
        category={lightboxProject?.category}
        videoUrl={lightboxProject ? resolveImageUrl(lightboxProject.videoUrl) : undefined}
        audioUrl={lightboxProject ? resolveImageUrl(lightboxProject.audioUrl) : undefined}
        onClose={() => setLightboxProject(null)}
      />
    </div>
  );
};

export default AllProjectsPage;
