import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { InstitutionLayout } from "@/components/institution/InstitutionLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building2, 
  Calendar, 
  Users, 
  BookOpen, 
  Eye, 
  FileSignature,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

interface InstitutionProfile {
  id: string;
  name: string;
  type: string;
  description: string | null;
  logo_url: string | null;
  is_approved: boolean;
  approval_status: string;
  is_visible: boolean;
  member_count: number;
}

interface Stats {
  events: number;
  resources: number;
  members: number;
  views: number;
}

const InstitutionDashboard = () => {
  const { user } = useAuth();
  const [institution, setInstitution] = useState<InstitutionProfile | null>(null);
  const [stats, setStats] = useState<Stats>({ events: 0, resources: 0, members: 0, views: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInstitutionData();
    }
  }, [user]);

  const fetchInstitutionData = async () => {
    try {
      // Fetch institution profile
      const { data: instData } = await supabase
        .from("institutions")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (instData) {
        setInstitution(instData);

        // Fetch stats
        const [eventsRes, resourcesRes, membersRes] = await Promise.all([
          supabase.from("institution_events").select("id", { count: 'exact' }).eq("institution_id", instData.id),
          supabase.from("institution_resources").select("id", { count: 'exact' }).eq("institution_id", instData.id),
          supabase.from("institution_members").select("id", { count: 'exact' }).eq("institution_id", instData.id),
        ]);

        setStats({
          events: eventsRes.count || 0,
          resources: resourcesRes.count || 0,
          members: membersRes.count || 0,
          views: instData.member_count || 0
        });
      }
    } catch (error) {
      console.error("Error fetching institution:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileCompletion = () => {
    if (!institution) return 0;
    let score = 0;
    if (institution.name) score += 20;
    if (institution.description) score += 20;
    if (institution.logo_url) score += 20;
    if (institution.type) score += 20;
    if (stats.events > 0) score += 10;
    if (stats.resources > 0) score += 10;
    return score;
  };

  const getStatusBadge = () => {
    if (!institution) return null;
    switch (institution.approval_status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="w-3 h-3 mr-1" /> Pending Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive"><AlertCircle className="w-3 h-3 mr-1" /> Needs Revision</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  if (isLoading) {
    return (
      <InstitutionLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </InstitutionLayout>
    );
  }

  if (!institution) {
    return (
      <InstitutionLayout title="Dashboard">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Create Your Institution Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Set up your institution's presence on Career Craft Cafe and connect with students.
            </p>
            <Button asChild size="lg">
              <Link to="/institution/profile">
                Create Profile <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </InstitutionLayout>
    );
  }

  const completion = getProfileCompletion();

  return (
    <InstitutionLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              Welcome, {institution.name}!
              {getStatusBadge()}
            </h2>
            <p className="text-muted-foreground mt-1">
              Manage your institution's presence and engage with students
            </p>
          </div>
          <Button asChild>
            <Link to="/institution/preview">
              <Eye className="w-4 h-4 mr-2" /> Preview Public Page
            </Link>
          </Button>
        </div>

        {/* Profile Completion */}
        {completion < 100 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Profile Completion</span>
                <span className="text-sm text-muted-foreground">{completion}%</span>
              </div>
              <Progress value={completion} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Complete your profile to get approved and appear in search results.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.events}</p>
                  <p className="text-sm text-muted-foreground">Events Hosted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.resources}</p>
                  <p className="text-sm text-muted-foreground">Resources Shared</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.members}</p>
                  <p className="text-sm text-muted-foreground">Members Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Eye className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.views}</p>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <Calendar className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Host an Event</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create workshops, career fairs, and guest sessions
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/institution/events">Create Event</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <BookOpen className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Share Resources</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload study materials and career guides
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/institution/resources">Add Resource</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <FileSignature className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="font-semibold mb-2">MoU & Partnership</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download MoU and start partnership discussion
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/institution/mou">View MoU</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </InstitutionLayout>
  );
};

export default InstitutionDashboard;
