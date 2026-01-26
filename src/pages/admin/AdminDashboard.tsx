import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboardStats";
import { 
  Briefcase, 
  Map, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Trophy, 
  Calendar, 
  Users,
  UserCheck,
  RefreshCw
} from "lucide-react";

const AdminDashboard = () => {
  const { stats, isLoading, refetch } = useAdminDashboardStats();

  const statCards = [
    { title: "Registered Users", value: stats.registeredUsers, icon: Users, color: "text-emerald-500" },
    { title: "Careers", value: stats.careers, icon: Briefcase, color: "text-blue-500" },
    { title: "Roadmaps", value: stats.roadmaps, icon: Map, color: "text-green-500" },
    { title: "Resources", value: stats.resources, icon: BookOpen, color: "text-purple-500" },
    { title: "Internships", value: stats.internships, icon: GraduationCap, color: "text-orange-500" },
    { title: "Blogs", value: stats.blogs, icon: FileText, color: "text-pink-500" },
    { title: "Success Stories", value: stats.successStories, icon: Trophy, color: "text-yellow-500" },
    { title: "Events", value: stats.events, icon: Calendar, color: "text-cyan-500" },
    { title: "Applications", value: stats.applications, icon: UserCheck, color: "text-red-500" },
  ];

  return (
    <AdminLayout 
      title="Dashboard"
      headerActions={
        <Button onClick={refetch} size="sm" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
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
