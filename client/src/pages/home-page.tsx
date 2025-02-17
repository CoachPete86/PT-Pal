import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import ServicesSection from "@/components/services-section";
import AboutSection from "@/components/about-section";
import Footer from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <div id="services">
          <ServicesSection />
        </div>
        <div id="about">
          <AboutSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}