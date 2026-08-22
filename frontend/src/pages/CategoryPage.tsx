import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProjects } from "@/lib/useSiteData";
import { resolveImageUrl } from "@/lib/api";
import { slugify } from "@/lib/slug";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";
import project5 from "@/assets/project-5.jpg";
import project6 from "@/assets/project-6.jpg";

const localFallbackImages = [project1, project2, project3, project4, project5, project6];

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { data: apiProjects, isLoading } = useProjects();

  const { categoryName, projects } = useMemo(() => {
    const all = apiProjects || [];
    const matches = all
      .filter((p) => slugify(p.category) === categorySlug)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    return {
      categoryName: matches[0]?.category || categorySlug?.replace(/-/g, " ") || "Category",
      projects: matches,
    };
  }, [apiProjects, categorySlug]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-40 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all work
            </Link>

            <span className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-primary" />
              <span className="text-xs tracking-[0.4em] uppercase text-primary font-body">Category</span>
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold text-foreground leading-[0.95] capitalize">
              {categoryName}
            </h1>
            <p className="text-muted-foreground font-body mt-4">
              {isLoading
                ? "Loading…"
                : `${projects.length} project${projects.length === 1 ? "" : "s"} in this category`}
            </p>
          </motion.div>

          {!isLoading && projects.length === 0 && (
            <div className="mt-16 text-center text-muted-foreground font-body">
              No projects found in this category yet.
            </div>
          )}

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => {
              const img = resolveImageUrl(project.image) || localFallbackImages[i % localFallbackImages.length];
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="group rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 bg-card transition-colors duration-500"
                >
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img
                      src={img}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
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
      </section>

      <Footer />
    </div>
  );
};

export default CategoryPage;
