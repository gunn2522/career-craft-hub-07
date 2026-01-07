import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Globe, 
  MapPin, 
  Users, 
  Calendar,
  BookOpen,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

const InstitutionProfile = () => {
  const { id } = useParams<{ id: string }>();

  const { data: institution, isLoading } = useQuery({
    queryKey: ["institution", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institutions")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: events } = useQuery({
    queryKey: ["institution-events", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institution_events")
        .select("*")
        .eq("institution_id", id)
        .eq("is_active", true)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: resources } = useQuery({
    queryKey: ["institution-resources", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institution_resources")
        .select("*")
        .eq("institution_id", id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: members } = useQuery({
    queryKey: ["institution-members", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institution_members")
        .select("*, profiles(full_name, avatar_url)")
        .eq("institution_id", id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'school': return <GraduationCap className="w-6 h-6" />;
      case 'college': return <Building2 className="w-6 h-6" />;
      case 'company': return <Briefcase className="w-6 h-6" />;
      default: return <Building2 className="w-6 h-6" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen py-12 px-4 md:px-8 lg:px-16">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!institution) {
    return (
      <Layout>
        <div className="min-h-screen py-12 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Institution Not Found</h2>
              <p className="text-muted-foreground">
                The institution you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="w-full px-4 md:px-8 lg:px-16">
          {/* Header Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  {institution.logo_url ? (
                    <img 
                      src={institution.logo_url} 
                      alt={institution.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  ) : (
                    getTypeIcon(institution.type)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">{institution.name}</h1>
                    {institution.is_verified && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="capitalize mb-4">
                    {institution.type}
                  </Badge>
                  {institution.description && (
                    <p className="text-muted-foreground mb-4">
                      {institution.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {institution.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {institution.location}
                      </div>
                    )}
                    {institution.website_url && (
                      <a 
                        href={institution.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {institution.member_count} Members
                    </div>
                  </div>
                </div>
                <Button>Join Institution</Button>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="events">
            <TabsList className="mb-6">
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Members
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              {events?.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No upcoming events</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events?.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {event.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {event.event_date && (
                            <Badge variant="outline">
                              {new Date(event.event_date).toLocaleDateString()}
                            </Badge>
                          )}
                          <Badge variant="secondary">{event.mode}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="resources">
              {resources?.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No resources available</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources?.map((resource) => (
                    <Card key={resource.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {resource.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary">{resource.type}</Badge>
                          {resource.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                View <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="members">
              {members?.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No members yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {members?.map((member: any) => (
                    <Card key={member.id}>
                      <CardContent className="pt-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                          {member.profiles?.avatar_url ? (
                            <img 
                              src={member.profiles.avatar_url} 
                              alt={member.profiles.full_name}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6" />
                          )}
                        </div>
                        <p className="font-medium">{member.profiles?.full_name || "Member"}</p>
                        <Badge variant="outline" className="mt-2 capitalize">
                          {member.role}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default InstitutionProfile;
