import { useState, useEffect } from "react";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Globe, 
  MapPin, 
  CheckCircle2, 
  Calendar,
  Briefcase,
  Users,
  Edit,
  Eye
} from "lucide-react";

interface PartnerProfile {
  id: string;
  company_name: string | null;
  company_description: string | null;
  company_website: string | null;
  industry: string | null;
  logo_url: string | null;
  is_approved: boolean;
  is_visible: boolean;
  hiring_focus: string[] | null;
}

interface PartnerEvent {
  id: string;
  title: string;
  event_date: string | null;
  event_type: string | null;
}

const PartnerPreview = () => {
  const { user } = useAuth();
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [events, setEvents] = useState<PartnerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: partnerData } = await supabase
        .from("partner_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (partnerData) {
        setPartner(partnerData);
        
        const { data: eventsData } = await supabase
          .from("partner_events")
          .select("id, title, event_date, event_type")
          .eq("partner_id", partnerData.id)
          .eq("is_approved", true)
          .eq("is_active", true)
          .order("event_date", { ascending: true })
          .limit(5);
        
        setEvents(eventsData || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PartnerLayout title="Preview Page">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PartnerLayout>
    );
  }

  if (!partner) {
    return (
      <PartnerLayout title="Preview Page">
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Profile Found</h3>
            <p className="text-muted-foreground mb-4">Create your company profile to see the preview</p>
            <Button asChild>
              <Link to="/partner-dashboard/profile">Create Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout title="Preview Page">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-muted-foreground" />
            <p className="text-muted-foreground">This is how your profile appears to visitors</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/partner-dashboard/profile">
              <Edit className="w-4 h-4 mr-2" />Edit Profile
            </Link>
          </Button>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center">
                {partner.logo_url ? (
                  <img src={partner.logo_url} alt={partner.company_name || "Logo"} className="w-20 h-20 object-contain rounded-lg" />
                ) : (
                  <Building2 className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{partner.company_name || "Your Company"}</h1>
                  {partner.is_approved && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {partner.industry && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />{partner.industry}
                    </span>
                  )}
                  {partner.company_website && (
                    <a href={partner.company_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <Globe className="w-4 h-4" />Website
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant={partner.is_visible ? "default" : "secondary"}>
                    {partner.is_visible ? "Public" : "Hidden"}
                  </Badge>
                  <Badge variant={partner.is_approved ? "default" : "outline"}>
                    {partner.is_approved ? "Verified" : "Pending Verification"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="about">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {partner.company_description || "No description added yet."}
                </p>
                {partner.hiring_focus && partner.hiring_focus.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Hiring Focus</h4>
                    <div className="flex flex-wrap gap-2">
                      {partner.hiring_focus.map((focus, idx) => (
                        <Badge key={idx} variant="outline">{focus}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No upcoming events</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Calendar className="w-10 h-10 text-primary" />
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {event.event_date ? new Date(event.event_date).toLocaleDateString() : "TBD"}
                          </p>
                        </div>
                        {event.event_type && (
                          <Badge variant="secondary" className="ml-auto">{event.event_type}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <CardTitle>Career Opportunities</CardTitle>
                <CardDescription>Job openings and internships will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No opportunities posted yet
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PartnerLayout>
  );
};

export default PartnerPreview;
