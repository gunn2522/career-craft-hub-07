import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, ChevronDown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TorchLoader } from "@/components/ui/TorchLoader";
import { TorchElements3D } from "@/components/ui/TorchElements3D";
import { ExperienceLevelSelector, ExperienceLevel } from "@/components/careers/ExperienceLevelSelector";
import { CareerFilters } from "@/components/careers/CareerFilters";
import { CareerCard } from "@/components/careers/CareerCard";
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
  slug: string | null;
  category: string;
  domain_id: string | null;
  category_id: string | null;
  description: string | null;
  salary: string | null;
  growth: string | null;
  demand: string | null;
  skills: string[] | null;
  is_active: boolean;
  experience_level: ExperienceLevel | null;
  search_keywords: string[] | null;
}

const Careers = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Experience level state
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [showExperienceSelector, setShowExperienceSelector] = useState(false);
  const [hasShownInitialSelector, setHasShownInitialSelector] = useState(false);
  
  // Skill filters
  const [activeSkillFilters, setActiveSkillFilters] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
    loadUserPreference();
  }, [user]);

  // Show experience selector on initial load if no preference
  useEffect(() => {
    if (!isLoading && !hasShownInitialSelector && !experienceLevel) {
      setShowExperienceSelector(true);
      setHasShownInitialSelector(true);
    }
  }, [isLoading, hasShownInitialSelector, experienceLevel]);

  const loadUserPreference = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("preferred_experience_level")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data?.preferred_experience_level) {
        setExperienceLevel(data.preferred_experience_level as ExperienceLevel);
        setHasShownInitialSelector(true);
      }
    } catch (error) {
      console.error("Error loading user preference:", error);
    }
  };

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

  // Advanced filtering logic
  const filteredCareers = useMemo(() => {
    return careers.filter((career) => {
      // Experience level filter
      if (experienceLevel && career.experience_level && career.experience_level !== experienceLevel) {
        return false;
      }

      // Search filter (title, skills, keywords)
      if (search) {
        const searchLower = search.toLowerCase();
        const titleMatch = career.title.toLowerCase().includes(searchLower);
        const skillsMatch = career.skills?.some((skill) => 
          skill.toLowerCase().includes(searchLower)
        );
        const keywordsMatch = career.search_keywords?.some((keyword) => 
          keyword.toLowerCase().includes(searchLower)
        );
        const descMatch = career.description?.toLowerCase().includes(searchLower);

        if (!titleMatch && !skillsMatch && !keywordsMatch && !descMatch) {
          return false;
        }
      }

      // Skill filters
      if (activeSkillFilters.length > 0) {
        const hasAllSkills = activeSkillFilters.every((filter) =>
          career.skills?.some((skill) => 
            skill.toLowerCase().includes(filter.toLowerCase())
          )
        );
        if (!hasAllSkills) return false;
      }

      return true;
    });
  }, [careers, search, experienceLevel, activeSkillFilters]);

  // Get categories for active domain
  const activeDomainCategories = categories.filter(
    (cat) => cat.domain_id === activeDomain
  );

  // Get careers for a specific category
  const getCareersForCategory = (categoryId: string) => {
    return filteredCareers.filter((career) => career.category_id === categoryId);
  };

  // Handle skill click from career card
  const handleSkillClick = (skill: string) => {
    if (!activeSkillFilters.includes(skill)) {
      setActiveSkillFilters([...activeSkillFilters, skill]);
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    setSearch("");
    setExperienceLevel(null);
    setActiveSkillFilters([]);
  };

  return (
    <Layout>
      {/* Experience Level Selector Modal */}
      <ExperienceLevelSelector
        isOpen={showExperienceSelector}
        onClose={() => setShowExperienceSelector(false)}
        onSelect={setExperienceLevel}
        currentLevel={experienceLevel}
      />

      {/* Hero with Image */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
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
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm mb-6 animate-fade-in">
              <Briefcase className="w-4 h-4" />
              {filteredCareers.length} Career Paths
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Discover Your <span className="gradient-text">Career Path</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Find roles that match your experience, explore skill requirements, and plan your career growth journey
            </p>

            {/* Search & Filters */}
            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <CareerFilters
                search={search}
                onSearchChange={setSearch}
                experienceLevel={experienceLevel}
                onExperienceClick={() => setShowExperienceSelector(true)}
                activeSkillFilters={activeSkillFilters}
                onRemoveSkillFilter={(skill) => 
                  setActiveSkillFilters(activeSkillFilters.filter((s) => s !== skill))
                }
                onClearAll={handleClearAll}
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight - 200, behavior: "smooth" })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          aria-label="Scroll to content"
        >
          <span className="text-sm font-medium">Explore Careers</span>
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

                        // Skip empty categories when filtering
                        if (categoryCareers.length === 0 && (search || experienceLevel || activeSkillFilters.length > 0)) {
                          return null;
                        }

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
                                  <CareerCard
                                    key={career.id}
                                    career={career}
                                    onSkillClick={handleSkillClick}
                                  />
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

          {/* No Results Message */}
          {!isLoading && filteredCareers.length === 0 && careers.length > 0 && (
            <div className="text-center py-16 mt-8">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No matching careers found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button variant="outline" onClick={handleClearAll}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Careers;
