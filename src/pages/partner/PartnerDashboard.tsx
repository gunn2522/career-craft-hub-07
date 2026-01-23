import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building2, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Eye, 
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

interface PartnerProfile {
  id: string;
  company_name: string | null;
  company_description: string | null;
  company_website: string | null;
  logo_url: string | null;
  industry: string | null;
  is_approved: boolean;
  approval_status: string;
  is_visible: boolean;
  jobs_posted: number;
  students_engaged: number;
  profile_views: number;
}

interface Stats {
  jobs: number;
  events: number;
  studentsEngaged: number;
  views: number;
}

const PartnerDashboard = () => {
  const { user } = useAuth();
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [stats, setStats] = useState<Stats>({ jobs: 0, events: 0, studentsEngaged: 0, views: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPartnerData();
    }
  }, [user]);

  const fetchPartnerData = async () => {
    try {
      // Fetch partner profile
      const { data: partnerData } = await supabase
        .from("partner_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (partnerData) {
        setPartner(partnerData);

        // Fetch events count
        const { count: eventsCount } = await supabase
          .from("partner_events")
          .select("id", { count: 'exact' })
          .eq("partner_id", partnerData.id);

        setStats({
          jobs: partnerData.jobs_posted || 0,
          events: eventsCount || 0,
          studentsEngaged: partnerData.students_engaged || 0,
          views: partnerData.profile_views || 0
        });
      }
    } catch (error) {
      console.error("Error fetching partner:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileCompletion = () => {
    if (!partner) return 0;
    let score = 0;
    if (partner.company_name) score += 20;
    if (partner.company_description) score += 20;
    if (partner.logo_url) score += 20;
    if (partner.industry) score += 15;
    if (partner.company_website) score += 15;
    if (stats.jobs > 0) score += 10;
    return Math.min(score, 100);
  };

  const getStatusBadge = () => {
    if (!partner) return null;
    switch (partner.approval_status) {
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
      <PartnerLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PartnerLayout>
    );
  }

  if (!partner) {
    return (
      <PartnerLayout title="Dashboard">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Create Your Company Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Set up your company's presence on Career Craft Cafe and connect with talented students.
            </p>
            <Button asChild size="lg">
              <Link to="/partner-dashboard/profile">
                Create Profile <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </PartnerLayout>
    );
  }

  const completion = getProfileCompletion();

  return (
    <PartnerLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              Welcome, {partner.company_name || "Partner"}!
              {getStatusBadge()}
            </h2>
            <p className="text-muted-foreground mt-1">
              Manage your company's presence and engage with students
            </p>
          </div>
          <Button asChild>
            <Link to="/partner-dashboard/preview">
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
                Complete your profile to get approved and your logo displayed on homepage.
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
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.jobs}</p>
                  <p className="text-sm text-muted-foreground">Jobs Posted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Calendar className="w-6 h-6 text-blue-500" />
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
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.studentsEngaged}</p>
                  <p className="text-sm text-muted-foreground">Students Engaged</p>
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
              <Briefcase className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Post a Job</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create job and internship opportunities for students
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/partner-dashboard/jobs">Post Job</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <Calendar className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Host an Event</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create hiring drives, tech talks, and webinars
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/partner-dashboard/events">Create Event</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="font-semibold mb-2">View Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Track engagement and brand visibility metrics
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/partner-dashboard/analytics">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PartnerDashboard;
