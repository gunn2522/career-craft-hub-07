import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, TrendingUp, Clock, DollarSign, ArrowRight, Briefcase, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TorchLoader } from "@/components/ui/TorchLoader";
import { TorchElements3D } from "@/components/ui/TorchElements3D";
import heroBg from "@/assets/hero-bg.jpg";

const categories = [
  "All", "Technology", "Business", "Creative", "Healthcare", "Engineering", "Education", "Finance"
];

interface Career {
  id: string;
  title: string;
  category: string;
  description: string | null;
  salary: string | null;
  growth: string | null;
  demand: string | null;
  skills: string[] | null;
}

const Careers = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const { data, error } = await supabase
        .from("careers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCareers(data || []);
    } catch (error) {
      console.error("Error fetching careers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || career.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      {/* Hero with Image */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Career exploration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        </div>

        {/* Torch 3D Elements */}
        <TorchElements3D count={12} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm mb-6 animate-fade-in">
                <Briefcase className="w-4 h-4" />
                {careers.length}+ Career Paths
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Explore <span className="gradient-text">Career Paths</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Discover your perfect career with detailed insights, salary data, and growth projections
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search careers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 h-14 rounded-xl bg-card/80 backdrop-blur-sm border-border/50 text-lg"
                />
              </div>
            </div>

            <div className="hidden lg:block" />
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight - 100, behavior: "smooth" })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          aria-label="Scroll to content"
        >
          <span className="text-sm font-medium">Discover More</span>
          <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:border-primary transition-colors">
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </button>
      </section>

      {/* Categories & Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Category Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Career Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <TorchLoader size="lg" text="Loading careers..." />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCareers.map((career) => (
                <Link
                  key={career.id}
                  to={`/careers/${career.id}`}
                  className="group"
                >
                  <div className="glass-card rounded-2xl p-6 h-full transition-all duration-300 hover:scale-105 hover:border-primary/50">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    
                    <span className="text-xs font-medium text-primary">{career.category}</span>
                    <h3 className="font-display text-xl font-bold mt-2 mb-3 group-hover:text-primary transition-colors">
                      {career.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {career.description || "Explore this exciting career path"}
                    </p>

                    <div className="space-y-2 text-sm">
                      {career.salary && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="text-foreground/80">{career.salary}</span>
                        </div>
                      )}
                      {career.growth && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="text-foreground/80">Growth: {career.growth}</span>
                        </div>
                      )}
                      {career.demand && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-foreground/80">Demand: {career.demand}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-primary font-medium">
                      <span>Start Roadmap</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && filteredCareers.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No careers found matching your criteria</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Careers;