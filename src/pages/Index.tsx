import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ThreePillars } from "@/components/home/ThreePillars";
import { AmbassadorSection } from "@/components/home/AmbassadorSection";
import { ConsultancySection } from "@/components/home/ConsultancySection";
import { SignupCTA } from "@/components/home/SignupCTA";
import { SuccessStories } from "@/components/home/SuccessStories";
import { PartnersSection } from "@/components/home/PartnersSection";
const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ThreePillars />
      <PartnersSection />
      <SuccessStories />
      <AmbassadorSection />
      <ConsultancySection />
      <SignupCTA />
    </Layout>
  );
};

export default Index;
