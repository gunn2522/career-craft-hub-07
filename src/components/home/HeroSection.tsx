import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-destructive/20 rounded-full blur-3xl" />
      
      {/* Floating Elements */}
      <div className="absolute top-32 right-1/4 w-4 h-4 bg-primary rounded-full animate-float opacity-60" />
      <div className="absolute top-1/2 left-20 w-3 h-3 bg-primary rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-32 right-1/3 w-2 h-2 bg-destructive rounded-full animate-float opacity-50" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Flame Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-2xl gradient-primary glow-gradient animate-pulse-slow">
            <Sparkles className="w-10 h-10 text-secondary" />
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Craft Your Career.{" "}
            <span className="gradient-text">Build Your Future.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover your perfect career path, master in-demand skills, and connect with opportunities that transform your potential into success.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Students Guided" },
              { value: "500+", label: "Career Paths" },
              { value: "200+", label: "Partner Companies" },
              { value: "95%", label: "Success Rate" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};