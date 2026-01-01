import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, DollarSign, ArrowRight, Briefcase, ChevronDown, BarChart3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TorchLoader } from "@/components/ui/TorchLoader";
import { TorchElements3D } from "@/components/ui/TorchElements3D";
import heroBg from "@/assets/hero-bg.jpg";
import * as LucideIcons from "lucide-react";

interface Domain {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

interface Category {
  id: string;
  domain_id: string;
  name: string;
  description: string | null;
}

interface Career {
  id: string;
  title: string;
  category: string;
  domain_id: string | null;
  category_id: string | null;
  description: string | null;
  salary: string | null;
  growth: string | null;
  demand: string | null;
  skills: string[] | null;
  is_active: boolean;
}

const Careers = () => {
  const [search, setSearch] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [domainsRes, categoriesRes, careersRes] = await Promise.all([
        supabase.from("career_domains").select("*").eq("is_active", true).order("display_order"),
        supabase.from("career_categories").select("*").eq("is_active", true).order("display_order"),
        supabase.from("careers").select("*").eq("is_active", true).order("display_order"),
      ]);

      if (domainsRes.error) throw domainsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (careersRes.error) throw careersRes.error;

      setDomains(domainsRes.data || []);
      setCategories(categoriesRes.data || []);
      setCareers(careersRes.data || []);

      // Set first domain as active by default
      if (domainsRes.data && domainsRes.data.length > 0) {
        setActiveDomain(domainsRes.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return <Briefcase className="w-5 h-5" />;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />;
  };

  // Filter careers based on search
  const filteredCareers = careers.filter((career) =>
    career.title.toLowerCase().includes(search.toLowerCase())
  );

  // Get categories for active domain
  const activeDomainCategories = categories.filter(
    (cat) => cat.domain_id === activeDomain
  );

  // Get careers for a specific category
  const getCareersForCategory = (categoryId: string) => {
    return filteredCareers.filter((career) => career.category_id === categoryId);
  };

  // Get demand badge variant
  const getDemandVariant = (demand: string | null) => {
    if (!demand) return "secondary";
    switch (demand.toLowerCase()) {
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Layout>
      {/* Hero with Image */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
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
                  placeholder="Search careers by role name..."
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
          onClick={() => window.scrollTo({ top: window.innerHeight - 200, behavior: "smooth" })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          aria-label="Scroll to content"
        >
          <span className="text-sm font-medium">Discover More</span>
          <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:border-primary transition-colors">
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </button>
      </section>

      {/* Domain Tabs & Career Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <TorchLoader size="lg" text="Loading careers..." />
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
              <p className="text-muted-foreground">We're crafting career paths for you. Check back soon!</p>
            </div>
          ) : (
            <Tabs value={activeDomain || ""} onValueChange={setActiveDomain} className="w-full">
              {/* Domain Tabs Navigation */}
              <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-transparent p-0 mb-8">
                {domains.map((domain) => (
                  <TabsTrigger
                    key={domain.id}
                    value={domain.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-3 rounded-full border border-border data-[state=active]:border-primary transition-all"
                  >
                    <span className="mr-2">{getIconComponent(domain.icon)}</span>
                    {domain.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Domain Content */}
              {domains.map((domain) => (
                <TabsContent key={domain.id} value={domain.id} className="mt-0">
                  {/* Domain Description */}
                  {domain.description && (
                    <p className="text-muted-foreground mb-8 max-w-2xl">
                      {domain.description}
                    </p>
                  )}

                  {/* Categories within Domain */}
                  {activeDomainCategories.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-2xl">
                      <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                      <p className="text-muted-foreground">
                        We're crafting career paths in {domain.name}. Check back soon!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {activeDomainCategories.map((category) => {
                        const categoryCareers = getCareersForCategory(category.id);

                        return (
                          <div key={category.id} className="space-y-6">
                            {/* Category Header */}
                            <div className="flex items-center gap-3">
                              <h2 className="text-2xl font-bold">{category.name}</h2>
                              <Badge variant="secondary" className="text-xs">
                                {categoryCareers.length} roles
                              </Badge>
                            </div>
                            {category.description && (
                              <p className="text-muted-foreground -mt-4">
                                {category.description}
                              </p>
                            )}

                            {/* Career Cards */}
                            {categoryCareers.length === 0 ? (
                              <Card className="bg-muted/20 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                  <Sparkles className="w-8 h-8 text-muted-foreground mb-3" />
                                  <p className="text-muted-foreground text-center">
                                    Coming soon – we're crafting this career path.
                                  </p>
                                </CardContent>
                              </Card>
                            ) : (
                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {categoryCareers.map((career) => (
                                  <Link
                                    key={career.id}
                                    to={`/careers/${career.id}`}
                                    className="group"
                                  >
                                    <Card className="h-full transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg">
                                      <CardContent className="p-6">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                          <Briefcase className="w-6 h-6 text-primary" />
                                        </div>

                                        <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                                          {career.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                          {career.description || "Explore this exciting career path"}
                                        </p>

                                        {/* Skills Preview */}
                                        {career.skills && career.skills.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mb-4">
                                            {career.skills.slice(0, 3).map((skill, i) => (
                                              <Badge key={i} variant="outline" className="text-xs">
                                                {skill}
                                              </Badge>
                                            ))}
                                            {career.skills.length > 3 && (
                                              <Badge variant="outline" className="text-xs">
                                                +{career.skills.length - 3}
                                              </Badge>
                                            )}
                                          </div>
                                        )}

                                        <div className="space-y-2 text-sm">
                                          {career.salary && (
                                            <div className="flex items-center gap-2">
                                              <DollarSign className="w-4 h-4 text-primary" />
                                              <span className="text-foreground/80">{career.salary}</span>
                                            </div>
                                          )}
                                          {career.growth && (
                                            <div className="flex items-center gap-2">
                                              <TrendingUp className="w-4 h-4 text-green-500" />
                                              <span className="text-foreground/80">{career.growth}</span>
                                            </div>
                                          )}
                                          {career.demand && (
                                            <div className="flex items-center gap-2">
                                              <BarChart3 className="w-4 h-4 text-orange-500" />
                                              <Badge variant={getDemandVariant(career.demand)} className="text-xs">
                                                {career.demand} Demand
                                              </Badge>
                                            </div>
                                          )}
                                        </div>

                                        <div className="mt-6 flex items-center gap-2 text-primary font-medium text-sm">
                                          <span>View Roadmap</span>
                                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Search Results Message */}
          {!isLoading && search && filteredCareers.length === 0 && (
            <div className="text-center py-16 mt-8">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                No careers found matching "{search}"
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearch("")}
              >
                Clear search
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Careers;
