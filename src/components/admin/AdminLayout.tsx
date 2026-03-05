import { ReactNode, useEffect, useState } from "react";
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
  ClipboardList,
  Building2,
  LayoutList,
  Image,
  Brain,
  FileCheck,
  Award,
  Medal,
  ChevronDown,
  ChevronRight,
  Shield,
  Layers,
  School,
  Megaphone,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logo from "@/assets/logo.png";

interface SidebarLink {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface SidebarModule {
  name: string;
  icon: LucideIcon;
  links: SidebarLink[];
}

const sidebarModules: SidebarModule[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    links: [
      { name: "Overview", path: "/admin", icon: LayoutDashboard },
    ]
  },
  {
    name: "Site Settings",
    icon: Settings,
    links: [
      { name: "Homepage Content", path: "/admin/homepage-content", icon: LayoutList },
      { name: "Module Hero", path: "/admin/module-hero", icon: LayoutList },
      { name: "Site Config", path: "/admin/site-config", icon: Settings },
      { name: "Live Metrics", path: "/admin/metrics", icon: Settings },
      { name: "FAQs", path: "/admin/faqs", icon: FileText },
      { name: "Legal Pages", path: "/admin/legal-pages", icon: FileText },
      { name: "Access Control", path: "/admin/access-control", icon: Shield },
      { name: "Users", path: "/admin/users", icon: Users },
    ]
  },
  {
    name: "School Students",
    icon: School,
    links: [
      { name: "Psychometric Tests", path: "/admin/psychometric-tests", icon: Brain },
      { name: "Government Exams", path: "/admin/government-exams", icon: FileCheck },
      { name: "Scholarships", path: "/admin/scholarships", icon: Award },
      { name: "Olympiads", path: "/admin/olympiads", icon: Medal },
    ]
  },
  {
    name: "College Students",
    icon: GraduationCap,
    links: [
      { name: "Domains", path: "/admin/domains", icon: Layers },
      { name: "Categories", path: "/admin/categories", icon: Briefcase },
      { name: "Careers", path: "/admin/careers", icon: Briefcase },
      { name: "Degrees", path: "/admin/degrees", icon: GraduationCap },
      { name: "Roadmaps", path: "/admin/roadmaps", icon: Map },
      { name: "Daily Tasks", path: "/admin/daily-tasks", icon: ClipboardList },
      { name: "Resources", path: "/admin/resources", icon: BookOpen },
      { name: "Internships", path: "/admin/internships", icon: GraduationCap },
      { name: "Programs", path: "/admin/programs", icon: Sparkles },
      { name: "Registrations", path: "/admin/registrations", icon: Settings },
    ]
  },
  {
    name: "Mentors",
    icon: Users,
    links: [
      { name: "Mentor Verification", path: "/admin/mentor-verification", icon: Users },
    ]
  },
  {
    name: "Partner Companies",
    icon: Building2,
    links: [
      { name: "Partners", path: "/admin/partners", icon: Building2 },
    ]
  },
  {
    name: "Institutions",
    icon: School,
    links: [
      { name: "Institutions", path: "/admin/institutions", icon: Building2 },
      { name: "Organization Plans", path: "/admin/organization-plans", icon: ClipboardList },
    ]
  },
  {
    name: "Content & Media",
    icon: FileText,
    links: [
      { name: "Blogs", path: "/admin/blogs", icon: FileText },
      { name: "Success Stories", path: "/admin/success-stories", icon: Trophy },
    ]
  },
  {
    name: "Events",
    icon: Calendar,
    links: [
      { name: "Event Gallery", path: "/admin/event-gallery", icon: Image },
      { name: "Events", path: "/admin/events", icon: Calendar },
      { name: "Events Approval", path: "/admin/events-approval", icon: Calendar },
    ]
  },
  {
    name: "Ambassadors",
    icon: Megaphone,
    links: [
      { name: "Ambassador Applications", path: "/admin/applications", icon: Users },
      { name: "Ambassador Activity", path: "/admin/ambassador-activity", icon: Calendar },
      { name: "Sponsorship Requests", path: "/admin/sponsorship-requests", icon: Megaphone },
    ]
  },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  headerActions?: ReactNode;
}

export const AdminLayout = ({ children, title, headerActions }: AdminLayoutProps) => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track which modules are open - auto-open the module containing current path
  const [openModules, setOpenModules] = useState<string[]>(() => {
    const currentModule = sidebarModules.find(module => 
      module.links.some(link => link.path === location.pathname)
    );
    return currentModule ? [currentModule.name] : ["Dashboard"];
  });

  const toggleModule = (moduleName: string) => {
    setOpenModules(prev => 
      prev.includes(moduleName) 
        ? prev.filter(m => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Auto-expand module when navigating
  useEffect(() => {
    const currentModule = sidebarModules.find(module => 
      module.links.some(link => link.path === location.pathname)
    );
    if (currentModule && !openModules.includes(currentModule.name)) {
      setOpenModules(prev => [...prev, currentModule.name]);
    }
  }, [location.pathname]);

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

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarModules.map((module) => {
            const ModuleIcon = module.icon;
            const isOpen = openModules.includes(module.name);
            const hasActiveLink = module.links.some(link => location.pathname === link.path);
            
            return (
              <Collapsible key={module.name} open={isOpen} onOpenChange={() => toggleModule(module.name)}>
                <CollapsibleTrigger className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  hasActiveLink 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                  <div className="flex items-center gap-3">
                    <ModuleIcon className="w-4 h-4" />
                    <span>{module.name}</span>
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 mt-1 space-y-1">
                  {module.links.map((link) => {
                    const LinkIcon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
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
        <header className="bg-card border-b border-border px-8 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          {headerActions}
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
