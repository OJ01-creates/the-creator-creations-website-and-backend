import { useMemo } from "react";
import { motion } from "framer-motion";
import { useUpdates } from "@/lib/useSiteData";
import { resolveImageUrl } from "@/lib/api";

const UpdatesSection = () => {
  const { data: apiUpdates } = useUpdates();

  const updates = useMemo(() => {
    return [...(apiUpdates || [])].sort((a, b) => {
      // Newest first — falls back to `order` if dates are equal/invalid.
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (!Number.isNaN(dateDiff) && dateDiff !== 0) return dateDiff;
      return (b.order || 0) - (a.order || 0);
    });
  }, [apiUpdates]);

  if (updates.length === 0) return null;

  return (
    <section id="updates" className="py-24 md:py-32 bg-card">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-body">Latest</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold mt-3 text-foreground">
            Updates &amp; Announcements
          </h2>
        </motion.div>

        <div className="space-y-6">
          {updates.map((update, i) => {
            const img = resolveImageUrl(update.image);
            const formattedDate = (() => {
              const d = new Date(update.date);
              return Number.isNaN(d.getTime())
                ? update.date
                : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
            })();

            return (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col sm:flex-row gap-5 p-6 rounded-xl border border-border bg-background/50"
              >
                {img && (
                  <img
                    src={img}
                    alt=""
                    className="w-full sm:w-40 h-40 sm:h-auto object-cover rounded-lg flex-shrink-0"
                    loading="lazy"
                  />
                )}
                <div>
                  <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">
                    {formattedDate}
                  </span>
                  <h3 className="font-display text-xl font-bold text-foreground mt-1">{update.title}</h3>
                  <p className="text-muted-foreground font-body text-sm mt-2 leading-relaxed">{update.content}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UpdatesSection;
