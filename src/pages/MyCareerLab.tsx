import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerLab } from "@/hooks/useCareerLab";
import { TorchLoader } from "@/components/ui/TorchLoader";
import { ProfileHeader } from "@/components/career-lab/ProfileHeader";
import { ProgressBar } from "@/components/career-lab/ProgressBar";
import { RoadmapSteps } from "@/components/career-lab/RoadmapSteps";
import { DailyTask } from "@/components/career-lab/DailyTask";
import { BadgesSection } from "@/components/career-lab/BadgesSection";
import { ProgressInsights } from "@/components/career-lab/ProgressInsights";
import { RoadmapSelector } from "@/components/career-lab/RoadmapSelector";
import { EnhancedProfileEditor } from "@/components/career-lab/EnhancedProfileEditor";
import { NetworkingPanel } from "@/components/career-lab/NetworkingPanel";
import { ChatPanel } from "@/components/career-lab/ChatPanel";
import { ProjectsSection } from "@/components/career-lab/ProjectsSection";
import { 
  Beaker, 
  LayoutDashboard, 
  User, 
  Users, 
  MessageCircle, 
  Folder, 
  Target,
  Trophy,
  ClipboardList,
  Bot,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview & Progress" },
  { id: "daily-tasks", label: "Daily Tasks", icon: ClipboardList, description: "Today's Assignments" },
  { id: "roadmap", label: "Roadmap", icon: Target, description: "Career Path" },
  { id: "network", label: "My Network", icon: Users, description: "Connect with People" },
  { id: "chat", label: "Messages", icon: MessageCircle, description: "Chat & Networking" },
  { id: "projects", label: "Projects", icon: Folder, description: "Portfolio" },
  { id: "badges", label: "Achievements", icon: Trophy, description: "Badges & Rewards" },
  { id: "profile", label: "Profile", icon: User, description: "Settings & Info" },
];

const MyCareerLab = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const {
    isLoading,
    profile,
    careerProfile,
    streak,
    selectedRoadmap,
    availableRoadmaps,
    dailyAssignments,
    userBadges,
    allBadges,
    roadmapProgress,
    submissions,
    selectRoadmap,
    submitAssignment,
    calculateOverallProgress,
    shareOnLinkedIn,
  } = useCareerLab();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { returnTo: "/my-career-lab" } });
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <TorchLoader size="lg" text="Loading your Career Lab..." />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const currentAssignment = dailyAssignments[0] || null;
  const isAssignmentSubmitted = currentAssignment 
    ? submissions.some(s => s.assignment_id === currentAssignment.id)
    : false;
  const completedAssignmentsCount = submissions.filter(s => s.status === "approved").length;
  const overallProgress = calculateOverallProgress();

  if (!careerProfile?.selected_roadmap_id || !selectedRoadmap) {
    return (
      <Layout>
        <section className="min-h-screen pt-32 pb-16 px-4">
          <RoadmapSelector
            roadmaps={availableRoadmaps}
            isLoading={isLoading}
            onSelect={selectRoadmap}
          />
        </section>
      </Layout>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <ProgressBar roadmapTitle={selectedRoadmap.title} progress={overallProgress} />
            <div className="grid lg:grid-cols-2 gap-8">
              <DailyTask
                assignment={currentAssignment}
                isSubmitted={isAssignmentSubmitted}
                onSubmit={submitAssignment}
              />
              <ProgressInsights
                currentStreak={streak?.current_streak || 0}
                longestStreak={streak?.longest_streak || 0}
                completedAssignments={completedAssignmentsCount}
                overallProgress={overallProgress}
              />
            </div>
          </div>
        );
      case "daily-tasks":
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" />
              Daily Tasks & Assignments
            </h2>
            <DailyTask
              assignment={currentAssignment}
              isSubmitted={isAssignmentSubmitted}
              onSubmit={submitAssignment}
            />
            <ProgressInsights
              currentStreak={streak?.current_streak || 0}
              longestStreak={streak?.longest_streak || 0}
              completedAssignments={completedAssignmentsCount}
              overallProgress={overallProgress}
            />
          </div>
        );
      case "roadmap":
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Your Career Roadmap
            </h2>
            <ProgressBar roadmapTitle={selectedRoadmap.title} progress={overallProgress} />
            <RoadmapSteps steps={selectedRoadmap.steps} progressData={roadmapProgress} />
          </div>
        );
      case "network":
        return <NetworkingPanel />;
      case "chat":
        return <ChatPanel />;
      case "projects":
        return <ProjectsSection />;
      case "badges":
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Achievements & Badges
            </h2>
            <BadgesSection allBadges={allBadges} earnedBadges={userBadges} onShareLinkedIn={shareOnLinkedIn} />
          </div>
        );
      case "profile":
        return <EnhancedProfileEditor />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen pt-20">
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside 
            className={cn(
              "fixed left-0 top-20 h-[calc(100vh-5rem)] bg-card/50 backdrop-blur-sm border-r border-border/50 transition-all duration-300 z-40",
              isSidebarCollapsed ? "w-16" : "w-64"
            )}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Beaker className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-display font-bold">Career Lab</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="h-8 w-8"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Navigation Items */}
            <nav className="p-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left group",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                    )}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary-foreground")} />
                    {!isSidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium text-sm truncate", isActive && "text-primary-foreground")}>
                          {item.label}
                        </p>
                        <p className={cn(
                          "text-xs truncate",
                          isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {item.description}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Streak Counter at Bottom */}
            {!isSidebarCollapsed && (
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{streak?.current_streak || 0}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main 
            className={cn(
              "flex-1 transition-all duration-300",
              isSidebarCollapsed ? "ml-16" : "ml-64"
            )}
          >
            {/* Profile Header */}
            <div className="px-6 py-6 bg-gradient-to-b from-primary/5 to-transparent">
              <ProfileHeader
                name={profile?.full_name}
                avatarUrl={profile?.avatar_url}
                aspiration={careerProfile?.aspiration}
                targetRole={careerProfile?.target_job_role}
                currentStreak={streak?.current_streak || 0}
              />
            </div>

            {/* Page Content */}
            <div className="px-6 py-8">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default MyCareerLab;