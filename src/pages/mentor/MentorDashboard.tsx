import { MentorLayout } from "@/components/mentor/MentorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, BookOpen, Briefcase, FileText, Library } from "lucide-react";

const MentorDashboard = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["mentor-stats", user?.id],
    queryFn: async () => {
      const [dailyTasks, programs, internships, blogs, resources] = await Promise.all([
        supabase.from("daily_assignments").select("id", { count: "exact" }),
        supabase.from("programs").select("id", { count: "exact" }).eq("created_by", user?.id || ""),
        supabase.from("internships").select("id", { count: "exact" }),
        supabase.from("blogs").select("id", { count: "exact" }).eq("author_id", user?.id || ""),
        supabase.from("resources").select("id", { count: "exact" }),
      ]);

      return {
        dailyTasks: dailyTasks.count || 0,
        programs: programs.count || 0,
        internships: internships.count || 0,
        blogs: blogs.count || 0,
        resources: resources.count || 0,
      };
    },
    enabled: !!user,
  });

  const statCards = [
    { title: "Daily Tasks", value: stats?.dailyTasks || 0, icon: ClipboardList, color: "text-blue-500" },
    { title: "My Programs", value: stats?.programs || 0, icon: BookOpen, color: "text-green-500" },
    { title: "Internships", value: stats?.internships || 0, icon: Briefcase, color: "text-purple-500" },
    { title: "Blogs", value: stats?.blogs || 0, icon: FileText, color: "text-orange-500" },
    { title: "Resources", value: stats?.resources || 0, icon: Library, color: "text-pink-500" },
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
              <a
                href="/mentor/daily-tasks"
                className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Create Daily Task</p>
                    <p className="text-sm text-muted-foreground">
                      Add new assignments for students
                    </p>
                  </div>
                </div>
              </a>
              <a
                href="/mentor/programs"
                className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Create Program</p>
                    <p className="text-sm text-muted-foreground">
                      Host your own sessions and programs
                    </p>
                  </div>
                </div>
              </a>
              <a
                href="/mentor/blogs"
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
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mentor Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Daily Tasks</p>
                  <p className="text-sm text-muted-foreground">
                    Create and manage daily assignments for roadmaps
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Programs</p>
                  <p className="text-sm text-muted-foreground">
                    Create your own programs and host sessions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Hiring & Internships</p>
                  <p className="text-sm text-muted-foreground">
                    Post job openings and internship opportunities
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