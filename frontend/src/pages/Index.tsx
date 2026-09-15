import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeSlider from "@/components/MarqueeSlider";
import ProjectSlider from "@/components/ProjectSlider";
import FullscreenSlider from "@/components/FullscreenSlider";
import DesignerProfile from "@/components/DesignerProfile";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import UpdatesSection from "@/components/UpdatesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Lock scroll while the loading screen is up.
  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loading-screen" onFinished={() => setIsLoading(false)} />}
      </AnimatePresence>

      <Navbar />
      <HeroSection />
      <MarqueeSlider />
      <ProjectSlider />
      <FullscreenSlider />
      <DesignerProfile />
      <AboutSection />
      <ServicesSection />
      <UpdatesSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
