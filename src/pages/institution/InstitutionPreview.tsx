import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building2, 
  MapPin, 
  Globe, 
  Calendar, 
  BookOpen, 
  Users,
  ArrowLeft,
  CheckCircle2,
  Edit2
} from "lucide-react";

interface Institution {
  id: string;
  name: string;
  type: string;
  description: string | null;
  logo_url: string | null;
  location: string | null;
  website_url: string | null;
  vision: string | null;
  focus_areas: string[] | null;
  is_approved: boolean;
}

interface InstitutionEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  event_date: string | null;
  mode: string | null;
  is_approved: boolean;
}

interface InstitutionResource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  is_approved: boolean;
}

const InstitutionPreview = () => {
  const { user } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [events, setEvents] = useState<InstitutionEvent[]>([]);
  const [resources, setResources] = useState<InstitutionResource[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: instData } = await supabase
        .from("institutions")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (instData) {
        setInstitution(instData);

        // Fetch approved events
        const { data: eventsData } = await supabase
          .from("institution_events")
          .select("*")
          .eq("institution_id", instData.id)
          .eq("is_approved", true)
          .eq("is_active", true)
          .order("event_date", { ascending: true });

        if (eventsData) setEvents(eventsData);

        // Fetch approved resources
        const { data: resourcesData } = await supabase
          .from("institution_resources")
          .select("*")
          .eq("institution_id", instData.id)
          .eq("is_approved", true);

        if (resourcesData) setResources(resourcesData);

        // Get member count
        const { count } = await supabase
          .from("institution_members")
          .select("id", { count: 'exact' })
          .eq("institution_id", instData.id);

        setMemberCount(count || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!institution) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md text-center p-8">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Profile Found</h2>
            <p className="text-muted-foreground mb-6">
              Create your institution profile first to see the preview.
            </p>
            <Button asChild>
              <Link to="/institution/profile">Create Profile</Link>
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Preview Banner */}
          <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Preview Mode</Badge>
              <span className="text-sm text-muted-foreground">
                This is how your public profile will appear to visitors
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/institution">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/institution/profile">
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </Link>
              </Button>
            </div>
          </div>

          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {institution.logo_url ? (
                    <img 
                      src={institution.logo_url} 
                      alt={institution.name} 
                      className="w-32 h-32 object-contain rounded-lg border"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{institution.name}</h1>
                    {institution.is_approved && (
                      <Badge className="bg-green-500/10 text-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="mb-4">{institution.type}</Badge>
                  
                  {institution.description && (
                    <p className="text-muted-foreground mb-4">{institution.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {institution.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {institution.location}
                      </span>
                    )}
                    {institution.website_url && (
                      <a 
                        href={institution.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="w-4 h-4" /> Website
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {memberCount} members
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
              <TabsTrigger value="resources">Resources ({resources.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {institution.vision && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Our Vision</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{institution.vision}</p>
                    </CardContent>
                  </Card>
                )}
                {institution.focus_areas && institution.focus_areas.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Focus Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {institution.focus_areas.map((area, idx) => (
                          <Badge key={idx} variant="secondary">{area}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="events">
              {events.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No upcoming events</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {events.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <Calendar className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{event.event_type}</Badge>
                              <Badge variant="outline">{event.mode}</Badge>
                              {event.event_date && (
                                <span className="text-sm text-muted-foreground">
                                  {new Date(event.event_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="resources">
              {resources.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No resources shared yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {resources.map((resource) => (
                    <Card key={resource.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-blue-500/10">
                            <BookOpen className="w-6 h-6 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{resource.title}</h3>
                            {resource.description && (
                              <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                            )}
                            <Badge variant="outline" className="mt-2">{resource.type}</Badge>
                          </div>
                          {resource.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                View
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
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default InstitutionPreview;
