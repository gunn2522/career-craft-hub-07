import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { 
  GraduationCap, 
  ArrowRight, 
  BookOpen, 
  Target, 
  ChevronRight,
  Briefcase,
  Clock,
  FileText
} from "lucide-react";
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

interface Degree {
  id: string;
  name: string;
  description: string | null;
  duration: string | null;
  category_id: string | null;
  entrance_exams: string[];
  required_subjects: string[];
  mapped_roadmap_id: string | null;
}

interface Career {
  id: string;
  title: string;
  description: string | null;
  salary: string | null;
  growth: string | null;
  category_id: string | null;
  slug: string | null;
}

const SchoolCareers = () => {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<string | null>(null);

  // Fetch domains (streams)
  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ['school-domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('career_domains')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as Domain[];
    },
  });

  // Fetch categories for selected domain
  const { data: categories } = useQuery({
    queryKey: ['school-categories', selectedDomain],
    queryFn: async () => {
      if (!selectedDomain) return [];
      const { data, error } = await supabase
        .from('career_categories')
        .select('*')
        .eq('domain_id', selectedDomain)
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!selectedDomain,
  });

  // Fetch degrees for selected category
  const { data: degrees } = useQuery({
    queryKey: ['school-degrees', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from('degrees')
        .select('*')
        .eq('category_id', selectedCategory)
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as Degree[];
    },
    enabled: !!selectedCategory,
  });

  // Fetch careers for selected category
  const { data: careers } = useQuery({
    queryKey: ['school-careers', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('category_id', selectedCategory)
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as Career[];
    },
    enabled: !!selectedCategory,
  });

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return Target;
    return (LucideIcons as any)[iconName] || Target;
  };

  const getBreadcrumbs = () => {
    const crumbs = [{ label: "Streams", onClick: () => { setSelectedDomain(null); setSelectedCategory(null); setSelectedDegree(null); } }];
    
    if (selectedDomain) {
      const domain = domains?.find(d => d.id === selectedDomain);
      crumbs.push({ label: domain?.name || "", onClick: () => { setSelectedCategory(null); setSelectedDegree(null); } });
    }
    
    if (selectedCategory) {
      const category = categories?.find(c => c.id === selectedCategory);
      crumbs.push({ label: category?.name || "", onClick: () => setSelectedDegree(null) });
    }
    
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="w-full px-4 md:px-8 lg:px-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm mb-4">
              <GraduationCap className="w-4 h-4" />
              After 12th Career Guide
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Discover Your <span className="gradient-text">Career Path</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore streams, find the right degree, and discover career opportunities that match your interests
            </p>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <button
                  onClick={crumb.onClick}
                  className={`text-sm font-medium ${
                    index === breadcrumbs.length - 1
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {crumb.label}
                </button>
              </div>
            ))}
          </div>

          {/* Step 1: Select Stream (Domain) */}
          {!selectedDomain && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                Choose Your Stream
              </h2>
              {domainsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-40" />
                  ))}
                </div>
              ) : domains?.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Target className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No streams available yet. Check back soon!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {domains?.map((domain) => {
                    const Icon = getIconComponent(domain.icon);
                    return (
                      <Card
                        key={domain.id}
                        className="cursor-pointer transition-all duration-300 hover:scale-105 hover:border-primary/50 group"
                        onClick={() => setSelectedDomain(domain.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <Icon className="w-8 h-8" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">{domain.name}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground line-clamp-2 mb-4">
                            {domain.description || "Explore career opportunities in this stream"}
                          </p>
                          <div className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                            <span>Explore Categories</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Category */}
          {selectedDomain && !selectedCategory && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                Choose Your Field
              </h2>
              {categories?.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No categories available in this stream yet.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setSelectedDomain(null)}>
                      Go Back
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories?.map((category) => (
                    <Card
                      key={category.id}
                      className="cursor-pointer transition-all duration-300 hover:scale-105 hover:border-primary/50 group"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {category.description || "Explore degrees and careers in this field"}
                        </p>
                        <div className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                          <span>View Degrees & Careers</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Show Degrees & Careers */}
          {selectedCategory && (
            <div className="space-y-8">
              {/* Degrees Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                  Required Degrees & Eligibility
                </h2>
                {degrees?.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <GraduationCap className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No degrees listed for this category yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {degrees?.map((degree) => (
                      <Card key={degree.id} className="border-l-4 border-l-primary">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{degree.name}</CardTitle>
                              {degree.duration && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  {degree.duration}
                                </div>
                              )}
                            </div>
                            {degree.mapped_roadmap_id && (
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/roadmap/${degree.mapped_roadmap_id}`}>
                                  View Roadmap
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {degree.description && (
                            <p className="text-sm text-muted-foreground">{degree.description}</p>
                          )}
                          
                          {degree.required_subjects?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                Required Subjects
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {degree.required_subjects.map((subject) => (
                                  <Badge key={subject} variant="secondary">{subject}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {degree.entrance_exams?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                Entrance Exams
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {degree.entrance_exams.map((exam) => (
                                  <Badge key={exam} variant="outline">{exam}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Careers Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">4</span>
                  Career Opportunities
                </h2>
                {careers?.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Briefcase className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No careers listed for this category yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {careers?.map((career) => (
                      <Link key={career.id} to={`/careers/${career.slug || career.id}`}>
                        <Card className="h-full transition-all duration-300 hover:scale-105 hover:border-primary/50 group cursor-pointer">
                          <CardHeader>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {career.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {career.description || "Explore this career path"}
                            </p>
                            <div className="flex items-center justify-between">
                              {career.salary && (
                                <Badge variant="secondary">{career.salary}</Badge>
                              )}
                              {career.growth && (
                                <Badge variant="outline" className="text-green-600">{career.growth}</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Call to Action */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-8 text-center">
                  <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Ready to Start Your College Journey?</h3>
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    Your path continues with our detailed college roadmaps. Sign up to track your progress and access personalized guidance.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                      <Link to="/signup?type=school">Create Free Account</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/craft">Explore Roadmaps</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SchoolCareers;