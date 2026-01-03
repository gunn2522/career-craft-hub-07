import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  BookOpen,
  Clock,
  Target,
  Zap,
  CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TorchLoader } from "@/components/ui/TorchLoader";
import { FutureRolesSection } from "@/components/careers/FutureRolesSection";
import { cn } from "@/lib/utils";

interface Career {
  id: string;
  title: string;
  description: string | null;
  salary: string | null;
  growth: string | null;
  demand: string | null;
  skills: string[] | null;
  experience_level: string | null;
  skills_required: string[] | null;
  transition_time: string | null;
  category_id: string | null;
  domain_id: string | null;
  responsibilities: string[] | null;
}

interface Roadmap {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  duration: string | null;
}

const experienceLabels: Record<string, { label: string; color: string }> = {
  entry: { label: "Entry Level (0-2 years)", color: "bg-green-500/10 text-green-600 border-green-500/30" },
  mid: { label: "Mid Level (2-5 years)", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  senior: { label: "Senior Level (5+ years)", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
};

const CareerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [career, setCareer] = useState<Career | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCareerDetails();
    }
  }, [id]);

  const fetchCareerDetails = async () => {
    try {
      // Fetch career details
      const { data: careerData, error: careerError } = await supabase
        .from("careers")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (careerError) throw careerError;
      setCareer(careerData);

      // Fetch related roadmaps
      if (careerData) {
        const { data: roadmapData, error: roadmapError } = await supabase
          .from("roadmaps")
          .select("id, title, description, difficulty, duration")
          .eq("career_id", id);

        if (!roadmapError && roadmapData) {
          setRoadmaps(roadmapData);
        }
      }
    } catch (error) {
      console.error("Error fetching career:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <TorchLoader size="lg" text="Loading career details..." />
        </div>
      </Layout>
    );
  }

  if (!career) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <Briefcase className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Career Not Found</h1>
          <p className="text-muted-foreground">This career path doesn't exist or has been removed.</p>
          <Link to="/careers">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Careers
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const expInfo = career.experience_level ? experienceLabels[career.experience_level] : null;

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Link 
            to="/careers" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Careers
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold">
                    {career.title}
                  </h1>
                  {expInfo && (
                    <Badge variant="outline" className={cn("mt-1", expInfo.color)}>
                      {expInfo.label}
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-lg text-muted-foreground max-w-2xl">
                {career.description || "Explore this exciting career path and learn what it takes to succeed."}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              {career.salary && (
                <Card className="min-w-[140px]">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Salary Range</p>
                    <p className="font-semibold">{career.salary}</p>
                  </CardContent>
                </Card>
              )}
              {career.growth && (
                <Card className="min-w-[140px]">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                    <p className="font-semibold">{career.growth}</p>
                  </CardContent>
                </Card>
              )}
              {career.demand && (
                <Card className="min-w-[140px]">
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Market Demand</p>
                    <p className="font-semibold">{career.demand}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Skills & Requirements */}
            <div className="lg:col-span-2 space-y-8">
              {/* Skills Required */}
              {career.skills && career.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Required Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {career.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1.5">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* What You'll Do */}
              {career.responsibilities && career.responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      What You'll Do
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {career.responsibilities.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Future Roles Section */}
              <FutureRolesSection careerId={career.id} currentTitle={career.title} />
            </div>

            {/* Right Column - Roadmaps & CTA */}
            <div className="space-y-6">
              {/* Learning Roadmaps */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Learning Roadmaps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {roadmaps.length > 0 ? (
                    <>
                      {roadmaps.map((roadmap) => (
                        <Link key={roadmap.id} to={`/craft/${roadmap.id}`}>
                          <Card className="hover:border-primary/50 transition-all cursor-pointer">
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-1">{roadmap.title}</h4>
                              {roadmap.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {roadmap.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {roadmap.difficulty && (
                                  <Badge variant="outline" className="text-xs">
                                    {roadmap.difficulty}
                                  </Badge>
                                )}
                                {roadmap.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {roadmap.duration}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                      <Link to={`/craft/${roadmaps[0].id}`} className="block">
                        <Button className="w-full">
                          View Roadmap
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>Roadmap coming soon!</p>
                      <p className="text-sm">We're crafting the perfect learning path for this role.</p>
                    </div>
                  )}

                  <Link to="/craft" className="block">
                    <Button variant="outline" className="w-full mt-2">
                      Explore All Roadmaps
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ready to Start?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/signup" className="block">
                    <Button variant="outline" className="w-full">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link to="/programs" className="block">
                    <Button variant="ghost" className="w-full">
                      View Programs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CareerDetail;
