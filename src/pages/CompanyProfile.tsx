import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Calendar,
  Linkedin,
  Twitter,
  Instagram,
  ExternalLink,
  Briefcase,
  GraduationCap,
  CalendarDays,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";

interface CompanyData {
  id: string;
  slug: string;
  company_name: string;
  company_description: string;
  tagline: string;
  logo_url: string;
  cover_image_url: string;
  company_website: string;
  industry: string;
  founded_year: number;
  company_size: string;
  headquarters: string;
  locations: string[];
  hiring_focus: string[];
  hiring_roles: string[];
  social_links: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  verification_status: string;
  profile_views: number;
  internship_opportunities: string;
  project_opportunities: string;
  events_initiatives: string;
}

interface Job {
  id: string;
  title: string;
  job_type: string;
  location: string;
  is_remote: boolean;
  application_deadline: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  location: string;
  is_virtual: boolean;
}

interface InterviewProcess {
  id: string;
  role_title: string;
  total_rounds: number;
  difficulty_level: string;
  stages: any[];
  preparation_tips: string[];
}

const CompanyProfile = () => {
  const { slug } = useParams();

  const { data: company, isLoading } = useQuery({
    queryKey: ["public-company", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("partner_profiles")
        .select("*")
        .eq("slug", slug)
        .eq("verification_status", "verified")
        .eq("is_visible", true)
        .eq("is_approved", true)
        .maybeSingle();
      
      if (error) throw error;
      return data as CompanyData;
    },
    enabled: !!slug
  });

  const { data: jobs } = useQuery({
    queryKey: ["company-jobs", company?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partner_jobs")
        .select("id, title, job_type, location, is_remote, application_deadline, created_at")
        .eq("partner_id", company?.id)
        .eq("is_active", true)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(10);
      return data as Job[];
    },
    enabled: !!company?.id
  });

  const { data: events } = useQuery({
    queryKey: ["company-events", company?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partner_events")
        .select("id, title, event_type, event_date, location, is_virtual")
        .eq("partner_id", company?.id)
        .eq("is_active", true)
        .eq("is_approved", true)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(10);
      return data as Event[];
    },
    enabled: !!company?.id
  });

  const { data: interviewProcesses } = useQuery({
    queryKey: ["company-interviews", company?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partner_interview_processes")
        .select("id, role_title, total_rounds, difficulty_level, stages, preparation_tips")
        .eq("partner_id", company?.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      return data as InterviewProcess[];
    },
    enabled: !!company?.id
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This company profile doesn't exist or is not publicly available.
          </p>
          <Button asChild>
            <Link to="/partners">Browse Companies</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Cover Image */}
        <div 
          className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/10 relative"
          style={company.cover_image_url ? { 
            backgroundImage: `url(${company.cover_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : undefined}
        />

        {/* Company Header */}
        <div className="container -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              <AvatarImage src={company.logo_url} alt={company.company_name} />
              <AvatarFallback className="text-4xl">
                <Building2 className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{company.company_name}</h1>
                {company.verification_status === "verified" && (
                  <Badge className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              {company.tagline && (
                <p className="text-lg text-muted-foreground mb-3">{company.tagline}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {company.industry && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {company.industry}
                  </span>
                )}
                {company.headquarters && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {company.headquarters}
                  </span>
                )}
                {company.company_size && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {company.company_size} employees
                  </span>
                )}
                {company.founded_year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Founded {company.founded_year}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {company.company_website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={company.company_website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {company.social_links?.linkedin && (
                <Button variant="outline" size="icon" asChild>
                  <a href={company.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {company.social_links?.twitter && (
                <Button variant="outline" size="icon" asChild>
                  <a href={company.social_links.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {company.social_links?.instagram && (
                <Button variant="outline" size="icon" asChild>
                  <a href={company.social_links.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="about" className="mb-12">
            <TabsList className="mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="jobs">
                Jobs {jobs && jobs.length > 0 && <Badge variant="secondary" className="ml-2">{jobs.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="events">
                Events {events && events.length > 0 && <Badge variant="secondary" className="ml-2">{events.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="interview">Interview Process</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {company.company_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{company.company_description}</p>
                </CardContent>
              </Card>

              {company.hiring_focus && company.hiring_focus.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hiring Focus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {company.hiring_focus.map((focus, i) => (
                        <Badge key={i} variant="secondary">{focus}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {company.locations && company.locations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Office Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {company.locations.map((location, i) => (
                        <Badge key={i} variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {company.internship_opportunities && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Internship Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{company.internship_opportunities}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4">
              {!jobs || jobs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Open Positions</h3>
                    <p className="text-muted-foreground">
                      There are no job openings at the moment. Check back later!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <Badge variant="outline">{job.job_type.replace('_', ' ')}</Badge>
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.location}
                              </span>
                            )}
                            {job.is_remote && <Badge variant="secondary">Remote</Badge>}
                          </div>
                        </div>
                        <div className="text-right">
                          {job.application_deadline && (
                            <p className="text-sm text-muted-foreground">
                              Deadline: {format(new Date(job.application_deadline), "MMM d, yyyy")}
                            </p>
                          )}
                          <Button size="sm" className="mt-2">Apply Now</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              {!events || events.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Upcoming Events</h3>
                    <p className="text-muted-foreground">
                      There are no scheduled events at the moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <Badge variant="outline">{event.event_type}</Badge>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {format(new Date(event.event_date), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                            {event.is_virtual && <Badge variant="secondary">Virtual</Badge>}
                          </div>
                        </div>
                        <Button size="sm">Register</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="interview" className="space-y-4">
              {!interviewProcesses || interviewProcesses.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Interview Information</h3>
                    <p className="text-muted-foreground">
                      Interview process details are not available yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                interviewProcesses.map((process) => (
                  <Card key={process.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{process.role_title}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline">{process.total_rounds} Rounds</Badge>
                          <Badge variant="secondary">{process.difficulty_level}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {process.stages && process.stages.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Interview Stages</h4>
                          <div className="space-y-2">
                            {process.stages.map((stage: any, i: number) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                  {i + 1}
                                </div>
                                <div>
                                  <p className="font-medium">{stage.stage_name}</p>
                                  {stage.description && (
                                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {process.preparation_tips && process.preparation_tips.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Preparation Tips</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {process.preparation_tips.map((tip, i) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default CompanyProfile;