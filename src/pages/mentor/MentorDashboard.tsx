import { MentorLayout } from "@/components/mentor/MentorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, MessageCircle, FileText, Lightbulb, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const MentorDashboard = () => {
  const { user } = useAuth();

  // First fetch mentor profile to check if it exists
  const { data: mentorProfile } = useQuery({
    queryKey: ["mentor-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select("id, total_subscribers, total_earnings")
        .eq("user_id", user?.id || "")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["mentor-stats", user?.id, mentorProfile?.id],
    queryFn: async () => {
      const [blogs, events, rooms, subscribers, guidance] = await Promise.all([
        supabase.from("blogs").select("id", { count: "exact" }).eq("author_id", user?.id || ""),
        mentorProfile?.id 
          ? supabase.from("mentor_events").select("id", { count: "exact" }).eq("mentor_id", mentorProfile.id)
          : Promise.resolve({ count: 0 }),
        mentorProfile?.id 
          ? supabase.from("mentor_rooms").select("id", { count: "exact" }).eq("mentor_id", mentorProfile.id)
          : Promise.resolve({ count: 0 }),
        mentorProfile?.id 
          ? supabase.from("mentor_subscriptions").select("id", { count: "exact" }).eq("mentor_id", mentorProfile.id).eq("status", "active")
          : Promise.resolve({ count: 0 }),
        mentorProfile?.id 
          ? supabase.from("mentor_daily_guidance").select("id", { count: "exact" }).eq("mentor_id", mentorProfile.id)
          : Promise.resolve({ count: 0 }),
      ]);

      return {
        blogs: blogs.count || 0,
        events: (events as any).count || 0,
        rooms: (rooms as any).count || 0,
        subscribers: (subscribers as any).count || 0,
        guidance: (guidance as any).count || 0,
      };
    },
    enabled: !!user,
  });

  const statCards = [
    { title: "Subscribers", value: stats?.subscribers || 0, icon: Users, color: "text-primary" },
    { title: "Events", value: stats?.events || 0, icon: Calendar, color: "text-primary" },
    { title: "Rooms", value: stats?.rooms || 0, icon: MessageCircle, color: "text-primary" },
    { title: "Guidance Posts", value: stats?.guidance || 0, icon: Lightbulb, color: "text-primary" },
    { title: "Blogs", value: stats?.blogs || 0, icon: FileText, color: "text-primary" },
  ];

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mentor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Manage your content and engage with students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                to="/mentor/guidance"
                className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Create Daily Guidance</p>
                    <p className="text-sm text-muted-foreground">
                      Share tips, tasks, and challenges with subscribers
                    </p>
                  </div>
                </div>
              </Link>
              <Link
                to="/mentor/events"
                className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Create Event</p>
                    <p className="text-sm text-muted-foreground">
                      Host webinars, workshops, and AMA sessions
                    </p>
                  </div>
                </div>
              </Link>
              <Link
                to="/mentor/rooms"
                className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Create Room</p>
                    <p className="text-sm text-muted-foreground">
                      Build communities and discussion spaces
                    </p>
                  </div>
                </div>
              </Link>
              <Link
                to="/mentor/blogs"
                className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Write a Blog</p>
                    <p className="text-sm text-muted-foreground">
                      Share your knowledge and insights
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mentor Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Daily Guidance</p>
                  <p className="text-sm text-muted-foreground">
                    Share tips, challenges, and resources with your audience
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Events & Monetization</p>
                  <p className="text-sm text-muted-foreground">
                    Host paid webinars and earn from your expertise
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Subscriber Community</p>
                  <p className="text-sm text-muted-foreground">
                    Build your subscriber base and engage with students
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MentorLayout>
  );
};

export default MentorDashboard;