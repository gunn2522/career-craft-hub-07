import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: "smooth" });
  };

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

      {/* Floating Elements */}
      <div className="absolute top-32 right-1/4 w-4 h-4 bg-primary rounded-full animate-float opacity-60" />
      <div className="absolute top-1/2 left-20 w-3 h-3 bg-primary rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-32 right-1/3 w-2 h-2 bg-destructive rounded-full animate-float opacity-50" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Your Career Journey Starts Here
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Craft Your Career.{" "}
              <span className="gradient-text">Build Your Future.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Discover your perfect career path, master in-demand skills, and connect with opportunities that transform your potential into success.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/careers" className="group">
                  <Compass className="w-5 h-5" />
                  Explore Careers
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="gradient" size="xl" asChild>
                <Link to="/craft">
                  Get Career Guidance
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              {[
                { value: "10K+", label: "Students Guided" },
                { value: "500+", label: "Career Paths" },
                { value: "200+", label: "Partner Companies" },
                { value: "95%", label: "Success Rate" },
              ].map((stat, i) => (
                <div key={i} className="text-left">
                  <div className="font-display text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
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
