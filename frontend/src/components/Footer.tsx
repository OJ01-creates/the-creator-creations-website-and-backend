import logo from "@/assets/logo.png";
import { useSettings } from "@/lib/useSiteData";
import { resolveImageUrl } from "@/lib/api";

const Footer = () => {
  const { data: settings } = useSettings();
  const siteName = settings?.siteName || "THE CREATOR CREATIONS";
  const logoSrc = resolveImageUrl(settings?.logoImage) || logo;

  return (
    <footer className="py-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="flex items-center gap-2 font-display text-lg font-bold text-gradient-primary">
          <img src={logoSrc} alt={siteName} className="h-7 w-7 object-contain" />
          {siteName}
        </span>
        <p className="text-muted-foreground text-sm font-body">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
        <div className="flex gap-6">
          {["Dribbble", "Behance", "Instagram"].map((s) => (
            <a key={s} href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-body">
              {s}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
