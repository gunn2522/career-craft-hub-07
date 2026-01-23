import { useState, useEffect } from "react";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Eye, Calendar, TrendingUp } from "lucide-react";

interface EngagementStats {
  profileViews: number;
  eventRegistrations: number;
  jobApplications: number;
  studentsEngaged: number;
}

const PartnerEngagement = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EngagementStats>({
    profileViews: 0,
    eventRegistrations: 0,
    jobApplications: 0,
    studentsEngaged: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data: partner } = await supabase
        .from("partner_profiles")
        .select("id, profile_views, students_engaged")
        .eq("user_id", user?.id)
        .single();

      if (partner) {
        // Get event registrations count
        const { count: eventCount } = await supabase
          .from("partner_events")
          .select("current_registrations", { count: "exact" })
          .eq("partner_id", partner.id);

        setStats({
          profileViews: partner.profile_views || 0,
          eventRegistrations: eventCount || 0,
          jobApplications: 0, // Would need job applications table
          studentsEngaged: partner.students_engaged || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: "Profile Views", value: stats.profileViews, icon: Eye, description: "Total views on your company profile" },
    { title: "Event Registrations", value: stats.eventRegistrations, icon: Calendar, description: "Students registered for your events" },
    { title: "Job Applications", value: stats.jobApplications, icon: TrendingUp, description: "Applications received" },
    { title: "Students Engaged", value: stats.studentsEngaged, icon: Users, description: "Total students you've connected with" },
  ];

  if (isLoading) {
    return (
      <PartnerLayout title="Student Engagement">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout title="Student Engagement">
      <div className="space-y-6">
        <p className="text-muted-foreground">Track your engagement with students on the platform</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Tips</CardTitle>
            <CardDescription>Ways to increase student engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">1</div>
                <div>
                  <p className="font-medium">Complete Your Profile</p>
                  <p className="text-sm text-muted-foreground">A complete profile attracts more students</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">2</div>
                <div>
                  <p className="font-medium">Host Regular Events</p>
                  <p className="text-sm text-muted-foreground">Webinars and workshops increase visibility</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">3</div>
                <div>
                  <p className="font-medium">Post Job Opportunities</p>
                  <p className="text-sm text-muted-foreground">Students actively look for internships and jobs</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </PartnerLayout>
  );
};

export default PartnerEngagement;
