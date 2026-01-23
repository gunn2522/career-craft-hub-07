import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  ClipboardList, 
  BookOpen, 
  Briefcase, 
  FileText, 
  Library,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logo from "@/assets/logo.png";

interface MentorLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { name: "Dashboard", path: "/mentor", icon: LayoutDashboard },
  { name: "Daily Guidance", path: "/mentor/guidance", icon: ClipboardList },
  { name: "My Events", path: "/mentor/events", icon: BookOpen },
  { name: "My Rooms", path: "/mentor/rooms", icon: Library },
  { name: "Subscribers", path: "/mentor/subscribers", icon: Briefcase },
  { name: "Blogs", path: "/mentor/blogs", icon: FileText },
  { name: "Resources", path: "/mentor/resources", icon: Library },
];

export const MentorLayout = ({ children }: MentorLayoutProps) => {
  const { user, isMentor, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || (!isMentor && !isAdmin))) {
      navigate("/auth");
    }
  }, [user, isMentor, isAdmin, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (!isMentor && !isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Career Craft Cafe" className="h-10 w-auto" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border hidden lg:block">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Career Craft Cafe" className="h-12 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground mt-2">Mentor Dashboard</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 mt-16 lg:mt-0">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">{children}</div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};