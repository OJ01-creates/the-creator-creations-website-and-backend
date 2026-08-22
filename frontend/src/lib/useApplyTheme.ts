import { useEffect } from "react";
import { useSettings } from "@/lib/useSiteData";

/** Converts a #rrggbb hex color to the "H S% L%" string format our CSS vars use. */
function hexToHslString(hex: string): string | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;

  const r = parseInt(match[1].slice(0, 2), 16) / 255;
  const g = parseInt(match[1].slice(2, 4), 16) / 255;
  const b = parseInt(match[1].slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Returns a darkened variant of a hex color (for auto-generated gradients). */
function darken(hex: string, amount: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  const num = parseInt(match[1], 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const loadedFonts = new Set<string>();

function ensureGoogleFontLoaded(family: string) {
  if (!family || loadedFonts.has(family)) return;
  loadedFonts.add(family);
  const id = `google-font-${family.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

/**
 * Applies theme settings (primary/accent colors, heading/body fonts) from the
 * backend to CSS custom properties on <html>, so the whole site re-themes
 * live without a rebuild. Falls back to doing nothing if settings haven't
 * loaded yet — the site's built-in default theme (set in index.css) always
 * applies until this runs.
 */
export function useApplyTheme() {
  const { data: settings } = useSettings();

  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;

    if (settings.primaryColor) {
      const hsl = hexToHslString(settings.primaryColor);
      if (hsl) {
        root.style.setProperty("--primary", hsl);
        root.style.setProperty("--ring", hsl);
        root.style.setProperty("--sidebar-primary", hsl);
        root.style.setProperty("--sidebar-ring", hsl);
        const secondary = darken(settings.primaryColor, 25);
        root.style.setProperty(
          "--gradient-primary",
          `linear-gradient(135deg, ${settings.primaryColor}, ${secondary})`
        );
        root.style.setProperty("--shadow-glow", `0 0 40px ${settings.primaryColor}26`);
      }
    }

    if (settings.accentColor) {
      const hsl = hexToHslString(settings.accentColor);
      if (hsl) {
        root.style.setProperty("--accent", hsl);
        const secondary = darken(settings.accentColor, 25);
        root.style.setProperty(
          "--gradient-accent",
          `linear-gradient(135deg, ${settings.accentColor}, ${secondary})`
        );
        root.style.setProperty("--shadow-accent", `0 0 60px ${settings.accentColor}1a`);
      }
    }

    if (settings.headingFont) {
      ensureGoogleFontLoaded(settings.headingFont);
      root.style.setProperty("--font-display", `'${settings.headingFont}', sans-serif`);
    }

    if (settings.bodyFont) {
      ensureGoogleFontLoaded(settings.bodyFont);
      root.style.setProperty("--font-body", `'${settings.bodyFont}', sans-serif`);
    }
  }, [settings]);
}
