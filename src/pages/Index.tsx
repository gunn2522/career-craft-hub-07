import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { MainBlocks } from "@/components/home/MainBlocks";
import { AmbassadorSection } from "@/components/home/AmbassadorSection";
import { ConsultancySection } from "@/components/home/ConsultancySection";
import { SignupCTA } from "@/components/home/SignupCTA";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <MainBlocks />
      <AmbassadorSection />
      <ConsultancySection />
      <SignupCTA />
    </Layout>
  );
};

export default Index;