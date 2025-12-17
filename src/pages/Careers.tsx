import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, TrendingUp, Clock, DollarSign, ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

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
      {/* Hero */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              {careers.length}+ Career Paths
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Explore <span className="gradient-text">Career Paths</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-10">
              Discover your perfect career with detailed insights, salary data, and growth projections
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search careers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 h-14 rounded-xl bg-card border-border/50 text-lg"
              />
            </div>
          </div>
        </div>
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-6">
                  <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-3" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
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