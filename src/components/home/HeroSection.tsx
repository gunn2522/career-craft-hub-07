import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, ChevronDown } from "lucide-react";
import { FloatingShapes3D } from "@/components/ui/FloatingShapes3D";
import { TorchElements3D } from "@/components/ui/TorchElements3D";
import { LiveStats } from "@/components/home/LiveStats";
import { useHomepageSection, useRoleBasedSection } from "@/hooks/useHomepageContent";
import { useVisitorRole } from "@/hooks/useVisitorRole";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  const heroSection = useHomepageSection('hero');
  const roleBasedHero = useRoleBasedSection('hero');
  const { visitorRole } = useVisitorRole();

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: "smooth" });
  };

  // Use role-based content if available, fallback to default
  const displayTitle = roleBasedHero.is_role_specific && roleBasedHero.title 
    ? roleBasedHero.title 
    : heroSection?.title || 'Craft Your Career. Build Your Future.';
  
  const displaySubtitle = roleBasedHero.is_role_specific && roleBasedHero.subtitle 
    ? roleBasedHero.subtitle 
    : heroSection?.subtitle || 'Discover your perfect career path, master in-demand skills, and connect with opportunities that transform your potential into success.';

  // Dynamic CTA based on visitor role - use role-based content if available
  const getPrimaryCTA = () => {
    if (roleBasedHero.is_role_specific && roleBasedHero.cta_text && roleBasedHero.cta_link) {
      return { text: roleBasedHero.cta_text, link: roleBasedHero.cta_link };
    }
    switch (visitorRole) {
      case 'school_student':
        return { text: 'Explore After 12th', link: '/school-careers' };
      case 'mentor':
        return { text: 'Become a Mentor', link: '/signup' };
      case 'partner':
        return { text: 'Partner With Us', link: '/partner' };
      case 'institution':
        return { text: 'Join as Institution', link: '/partner' };
      default:
        return { text: 'Explore Careers', link: '/careers' };
    }
  };

  const primaryCTA = getPrimaryCTA();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Career professionals collaborating"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </div>

      {/* 3D Floating Elements */}
      <FloatingShapes3D count={10} />
      
      {/* Torch-themed 3D Elements */}
      <TorchElements3D count={15} />

      <div className="w-full px-4 md:px-8 lg:px-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Your Career Journey Starts Here
            </div>

            {/* Main Headline - Dynamic from database with role-based personalization */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              {displayTitle.includes('.') ? (
                displayTitle.split('.').map((part, i) => (
                  <span key={i}>
                    {i === 0 ? part + '.' : null}
                    {i === 1 && part.trim() ? (
                      <>
                        <br />
                        <span className="gradient-text">{part.trim()}</span>
                      </>
                    ) : null}
                  </span>
                ))
              ) : (
                <span className="gradient-text">{displayTitle}</span>
              )}
            </h1>

            {/* Subheadline - Dynamic from database with role-based personalization */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {displaySubtitle}
            </p>

            {/* CTA Buttons - Dynamic based on role */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to={primaryCTA.link} className="group">
                  <Compass className="w-5 h-5" />
                  {primaryCTA.text}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="gradient" size="xl" asChild>
                <Link to="/craft">
                  Get Career Guidance
                </Link>
              </Button>
            </div>

            {/* Live Stats - Dynamic from database */}
            <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <LiveStats />
            </div>
          </div>

          {/* Right Side - Empty space for the background image to show */}
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
        aria-label="Scroll to content"
      >
        <span className="text-sm font-medium">Discover More</span>
        <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:border-primary transition-colors">
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      </button>
    </section>
  );
};
