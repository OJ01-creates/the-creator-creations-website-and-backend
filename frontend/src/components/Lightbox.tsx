import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface LightboxProps {
  image: string | null;
  title?: string;
  category?: string;
  onClose: () => void;
}

const Lightbox = ({ image, title, category, onClose }: LightboxProps) => {
  useEffect(() => {
    if (!image) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [image, onClose]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-md p-6 md:p-12 cursor-zoom-out"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-6 right-6 w-11 h-11 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full flex flex-col items-center cursor-default"
          >
            <img
              src={image}
              alt={title || ""}
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain border border-border/50"
            />
            {(title || category) && (
              <div className="mt-5 text-center">
                {category && (
                  <span className="text-xs tracking-[0.3em] uppercase font-body text-primary">{category}</span>
                )}
                {title && <h3 className="font-display text-2xl font-bold text-foreground mt-1">{title}</h3>}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Lightbox;
