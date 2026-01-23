import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ThreePillars } from "@/components/home/ThreePillars";
import { AmbassadorSection } from "@/components/home/AmbassadorSection";
import { ConsultancySection } from "@/components/home/ConsultancySection";
import { SignupCTA } from "@/components/home/SignupCTA";
import { SuccessStories } from "@/components/home/SuccessStories";
import { PartnersSection } from "@/components/home/PartnersSection";
import { InstitutionsLogosSection } from "@/components/home/InstitutionsLogosSection";
import { EventGallerySection } from "@/components/home/EventGallerySection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ThreePillars />
      <EventGallerySection />
      <PartnersSection />
      <InstitutionsLogosSection />
      <SuccessStories />
      <AmbassadorSection />
      <ConsultancySection />
      <SignupCTA />
    </Layout>
  );
};

export default Index;
