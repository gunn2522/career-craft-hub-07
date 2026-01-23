import { useState, useEffect } from "react";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Eye, Calendar, Briefcase, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface AnalyticsData {
  profileViews: number;
  eventsHosted: number;
  jobsPosted: number;
  studentsEngaged: number;
}

const PartnerAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    profileViews: 0,
    eventsHosted: 0,
    jobsPosted: 0,
    studentsEngaged: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const { data: partner } = await supabase
        .from("partner_profiles")
        .select("id, profile_views, jobs_posted, students_engaged")
        .eq("user_id", user?.id)
        .single();

      if (partner) {
        const { count: eventsCount } = await supabase
          .from("partner_events")
          .select("*", { count: "exact", head: true })
          .eq("partner_id", partner.id);

        setAnalytics({
          profileViews: partner.profile_views || 0,
          eventsHosted: eventsCount || 0,
          jobsPosted: partner.jobs_posted || 0,
          studentsEngaged: partner.students_engaged || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const metrics = [
    { 
      title: "Profile Views", 
      value: analytics.profileViews, 
      icon: Eye, 
      change: "+12%",
      trend: "up" 
    },
    { 
      title: "Events Hosted", 
      value: analytics.eventsHosted, 
      icon: Calendar, 
      change: "+5%",
      trend: "up" 
    },
    { 
      title: "Jobs Posted", 
      value: analytics.jobsPosted, 
      icon: Briefcase, 
      change: "0%",
      trend: "neutral" 
    },
    { 
      title: "Students Engaged", 
      value: analytics.studentsEngaged, 
      icon: Users, 
      change: "+23%",
      trend: "up" 
    },
  ];

  if (isLoading) {
    return (
      <PartnerLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout title="Analytics">
      <div className="space-y-6">
        <p className="text-muted-foreground">Track your performance and engagement metrics</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metric.value}</div>
                  <div className="flex items-center text-xs mt-1">
                    {metric.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                    ) : metric.trend === "down" ? (
                      <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                    ) : null}
                    <span className={metric.trend === "up" ? "text-green-500" : metric.trend === "down" ? "text-red-500" : "text-muted-foreground"}>
                      {metric.change}
                    </span>
                    <span className="text-muted-foreground ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Your engagement summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Profile Completion</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "85%" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Engagement Rate</span>
                  <span className="font-medium">72%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "72%" }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Insights</CardTitle>
              <CardDescription>Key takeaways</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Your profile views increased this month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-sm">Consider hosting more events to boost engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-sm">Post job openings to attract more students</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PartnerAnalytics;
