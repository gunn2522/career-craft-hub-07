import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  Briefcase, 
  Map, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Trophy, 
  Calendar, 
  Users 
} from "lucide-react";

interface DashboardStats {
  careers: number;
  roadmaps: number;
  resources: number;
  internships: number;
  blogs: number;
  successStories: number;
  events: number;
  applications: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    careers: 0,
    roadmaps: 0,
    resources: 0,
    internships: 0,
    blogs: 0,
    successStories: 0,
    events: 0,
    applications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: careers },
        { count: roadmaps },
        { count: resources },
        { count: internships },
        { count: blogs },
        { count: successStories },
        { count: events },
        { count: applications },
      ] = await Promise.all([
        supabase.from("careers").select("*", { count: "exact", head: true }),
        supabase.from("roadmaps").select("*", { count: "exact", head: true }),
        supabase.from("resources").select("*", { count: "exact", head: true }),
        supabase.from("internships").select("*", { count: "exact", head: true }),
        supabase.from("blogs").select("*", { count: "exact", head: true }),
        supabase.from("success_stories").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("ambassador_applications").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        careers: careers || 0,
        roadmaps: roadmaps || 0,
        resources: resources || 0,
        internships: internships || 0,
        blogs: blogs || 0,
        successStories: successStories || 0,
        events: events || 0,
        applications: applications || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: "Careers", value: stats.careers, icon: Briefcase, color: "text-blue-500" },
    { title: "Roadmaps", value: stats.roadmaps, icon: Map, color: "text-green-500" },
    { title: "Resources", value: stats.resources, icon: BookOpen, color: "text-purple-500" },
    { title: "Internships", value: stats.internships, icon: GraduationCap, color: "text-orange-500" },
    { title: "Blogs", value: stats.blogs, icon: FileText, color: "text-pink-500" },
    { title: "Success Stories", value: stats.successStories, icon: Trophy, color: "text-yellow-500" },
    { title: "Events", value: stats.events, icon: Calendar, color: "text-cyan-500" },
    { title: "Applications", value: stats.applications, icon: Users, color: "text-red-500" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? (
                    <div className="h-9 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              Welcome to the Admin Dashboard. Use the sidebar to manage:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Careers</strong> - Add and manage career paths</li>
              <li><strong className="text-foreground">Roadmaps</strong> - Create learning roadmaps for careers</li>
              <li><strong className="text-foreground">Resources</strong> - Add study materials and links</li>
              <li><strong className="text-foreground">Internships</strong> - Post internship opportunities</li>
              <li><strong className="text-foreground">Blogs</strong> - Write and publish articles</li>
              <li><strong className="text-foreground">Success Stories</strong> - Share student achievements</li>
              <li><strong className="text-foreground">Events</strong> - Create hackathons and workshops</li>
              <li><strong className="text-foreground">Applications</strong> - Review ambassador applications</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              To get started with managing content:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Start by adding <strong className="text-foreground">Careers</strong> to define career paths</li>
              <li>Create <strong className="text-foreground">Roadmaps</strong> linked to careers</li>
              <li>Add <strong className="text-foreground">Resources</strong> to each roadmap</li>
              <li>Post <strong className="text-foreground">Internships</strong> for students</li>
              <li>Write engaging <strong className="text-foreground">Blogs</strong> and stories</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
