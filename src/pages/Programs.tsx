import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { TorchElements3D } from "@/components/ui/TorchElements3D";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Target, 
  ChevronDown,
  Sparkles,
  Users,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Program {
  id: string;
  name: string;
  description: string | null;
  banner_url: string | null;
  duration: string | null;
  features: string[];
  outcomes: string[];
  is_highlighted: boolean | null;
  start_date: string | null;
  end_date: string | null;
}

const Programs = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: "smooth" });
  };

  const highlightedPrograms = programs.filter(p => p.is_highlighted);
  const regularPrograms = programs.filter(p => !p.is_highlighted);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        <TorchElements3D count={12} />
        
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[120px] animate-float" />
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-card mb-6 animate-fade-in border border-primary/20 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">Our Programs</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <span className="block text-foreground">Transform Your</span>
              <span className="block gradient-text mt-2">Career Journey</span>
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-8 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: "0.2s" }}>
              Explore our comprehensive programs designed to bridge the gap between 
              <span className="text-primary font-semibold"> academia</span> and 
              <span className="text-primary font-semibold"> industry</span>, 
              preparing you for success in the real world.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="lg" asChild className="shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-shadow">
                <Link to="/auth">Enroll Now</Link>
              </Button>
              <Button variant="gradient" size="lg" asChild>
                <Link to="/partner">Partner With Us</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              {[
                { icon: Users, value: "5000+", label: "Students Trained" },
                { icon: Trophy, value: "50+", label: "Programs Offered" },
                { icon: Target, value: "85%", label: "Success Rate" },
              ].map((stat, index) => (
                <div key={index} className="glass-card p-4 rounded-xl">
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group z-20"
          aria-label="Scroll to content"
        >
          <span className="text-sm font-medium">Explore Programs</span>
          <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </div>
        </button>
      </section>

      {/* Highlighted Programs */}
      {highlightedPrograms.length > 0 && (
        <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative bg-card/30">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Featured Programs</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Program <span className="gradient-text">Highlights</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our most impactful programs that have transformed thousands of careers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {highlightedPrograms.map((program) => (
                <div
                  key={program.id}
                  className="glass-card rounded-2xl overflow-hidden group hover:glow-primary transition-all duration-500 hover:scale-[1.02]"
                >
                  {program.banner_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={program.banner_url}
                        alt={program.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                          Featured
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-primary/50" />
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{program.name}</h3>
                    {program.duration && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Clock className="w-4 h-4" />
                        <span>{program.duration}</span>
                      </div>
                    )}
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {program.description}
                    </p>

                    {program.features && program.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {program.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    <Button variant="gradient" size="sm" className="w-full" asChild>
                      <Link to="/auth">Enroll Now</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Programs */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">All Programs</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Our <span className="gradient-text">Offerings</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect program to accelerate your career growth.
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-6">
                  <Skeleton className="h-40 w-full mb-4 rounded-xl" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                Exciting new programs are being developed. Stay tuned!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {regularPrograms.map((program) => (
                <div
                  key={program.id}
                  className="glass-card rounded-2xl overflow-hidden group hover:glow-primary transition-all duration-500"
                >
                  <div className="flex flex-col md:flex-row">
                    {program.banner_url ? (
                      <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                        <img
                          src={program.banner_url}
                          alt={program.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="md:w-1/3 h-48 md:h-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Target className="w-12 h-12 text-primary/50" />
                      </div>
                    )}

                    <div className="flex-1 p-6">
                      <h3 className="text-xl font-bold mb-2">{program.name}</h3>
                      
                      <div className="flex flex-wrap gap-3 mb-3">
                        {program.duration && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{program.duration}</span>
                          </div>
                        )}
                        {program.start_date && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Starts {new Date(program.start_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {program.description}
                      </p>

                      {program.outcomes && program.outcomes.length > 0 && (
                        <div className="space-y-1 mb-4">
                          {program.outcomes.slice(0, 2).map((outcome, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-muted-foreground">{outcome}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10" asChild>
                        <Link to="/auth">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative bg-card/30">
        <div className="max-w-4xl mx-auto w-full text-center">
          <div className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your{" "}
                <span className="gradient-text">Career?</span>
              </h2>
              
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join our programs and get the skills, guidance, and opportunities 
                you need to succeed in today's competitive job market.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="gradient" size="lg" asChild>
                  <Link to="/auth">Get Started Today</Link>
                </Button>
                <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10" asChild>
                  <Link to="/ambassador">Become a Crafter</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Programs;
