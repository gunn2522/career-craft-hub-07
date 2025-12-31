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
import { Beaker, LayoutDashboard, User, Users, MessageCircle, Folder } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MyCareerLab = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
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

  return (
    <Layout>
      <section className="pt-28 pb-8 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Beaker className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">My Career Lab</h1>
          </div>
          <ProfileHeader
            name={profile?.full_name}
            avatarUrl={profile?.avatar_url}
            aspiration={careerProfile?.aspiration}
            targetRole={careerProfile?.target_job_role}
            currentStreak={streak?.current_streak || 0}
          />
        </div>
      </section>

      <section className="py-8 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Network</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <span className="hidden sm:inline">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-8">
              <ProgressBar roadmapTitle={selectedRoadmap.title} progress={overallProgress} />
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-8">
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
                <RoadmapSteps steps={selectedRoadmap.steps} progressData={roadmapProgress} />
              </div>
              <BadgesSection allBadges={allBadges} earnedBadges={userBadges} onShareLinkedIn={shareOnLinkedIn} />
            </TabsContent>

            <TabsContent value="network">
              <NetworkingPanel />
            </TabsContent>

            <TabsContent value="chat">
              <ChatPanel />
            </TabsContent>

            <TabsContent value="projects">
              <ProjectsSection />
            </TabsContent>

            <TabsContent value="profile">
              <EnhancedProfileEditor />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default MyCareerLab;
