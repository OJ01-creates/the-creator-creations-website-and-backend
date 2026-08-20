import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { useSettings } from "@/lib/useSiteData";
import { resolveImageUrl } from "@/lib/api";

const EASE = [0.16, 1, 0.3, 1] as const;

const LoadingScreen = ({ onFinished }: { onFinished: () => void }) => {
  const { data: settings } = useSettings();
  const siteName = settings?.siteName || "THE CREATOR CREATIONS";
  const logoSrc = resolveImageUrl(settings?.logoImage) || logo;
  const words = siteName.split(" ");

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 2200;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onFinished, 550);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const circumference = 2 * Math.PI * 54;

  return (
    <motion.div
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-background"
      exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.5 } }}
    >
      {/* Split curtain panels — slide apart on exit */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 bg-background z-20"
        exit={{ x: "-100%", transition: { duration: 0.9, ease: EASE } }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 bg-background z-20"
        exit={{ x: "100%", transition: { duration: 0.9, ease: EASE } }}
      />

      {/* Ambient background layer */}
      <div className="absolute inset-0 z-10 noise-overlay">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Floating gradient orbs */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[15%] w-72 h-72 rounded-full bg-primary/10 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[12%] w-80 h-80 rounded-full bg-accent/10 blur-[110px]"
        />
      </div>

      {/* Foreground content */}
      <motion.div
        className="relative z-30 flex flex-col items-center px-6"
        exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.4, ease: EASE } }}
      >
        {/* Logo with circular progress ring */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <svg width="128" height="128" viewBox="0 0 128 128" className="absolute inset-0 -rotate-90">
            <circle cx="64" cy="64" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <motion.circle
              cx="64"
              cy="64"
              r="54"
              fill="none"
              stroke="url(#loadingRingGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              transition={{ ease: "linear" }}
            />
            <defs>
              <linearGradient id="loadingRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(45, 100%, 55%)" />
                <stop offset="50%" stopColor="hsl(30, 100%, 50%)" />
                <stop offset="100%" stopColor="hsl(330, 80%, 60%)" />
              </linearGradient>
            </defs>
          </svg>

          <motion.img
            src={logoSrc}
            alt=""
            initial={{ scale: 0, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="w-16 h-16 object-contain relative z-10"
          />

          {/* Pulsing glow behind logo */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-2 rounded-full bg-gradient-primary blur-2xl -z-10"
          />
        </div>

        {/* Brand name — staggered word reveal */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-8 max-w-lg">
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.12, ease: EASE }}
              className="font-display text-xl md:text-3xl font-extrabold tracking-tight text-gradient-primary"
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* Progress bar + percentage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-56 md:w-72 flex flex-col items-center gap-3"
        >
          <div className="w-full h-[2px] bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-primary"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-body tracking-[0.3em] uppercase text-muted-foreground">
            <span>Loading</span>
            <span className="text-primary font-semibold tabular-nums">{progress}%</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;
