import { ReactNode, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Briefcase, 
  Map, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Trophy, 
  Calendar, 
  Users, 
  LogOut,
  Settings,
  Home,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const sidebarLinks = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Careers", path: "/admin/careers", icon: Briefcase },
  { name: "Roadmaps", path: "/admin/roadmaps", icon: Map },
  { name: "Resources", path: "/admin/resources", icon: BookOpen },
  { name: "Internships", path: "/admin/internships", icon: GraduationCap },
  { name: "Programs", path: "/admin/programs", icon: Sparkles },
  { name: "Registrations", path: "/admin/registrations", icon: ClipboardList },
  { name: "Blogs", path: "/admin/blogs", icon: FileText },
  { name: "Success Stories", path: "/admin/success-stories", icon: Trophy },
  { name: "Events", path: "/admin/events", icon: Calendar },
  { name: "Applications", path: "/admin/applications", icon: Users },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Career Craft Cafe" 
              className="h-10 w-auto dark:brightness-0 dark:invert"
            />
          </Link>
          <p className="text-xs text-muted-foreground mt-2">Admin Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/">
              <Home className="w-5 h-5 mr-3" />
              Back to Site
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-card border-b border-border px-8 py-6">
          <h1 className="text-2xl font-bold">{title}</h1>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
