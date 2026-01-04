import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProfileHeader } from "./ProfileHeader";
import { ProgressBar } from "./ProgressBar";
import { DailyTask } from "./DailyTask";
import { BadgesSection } from "./BadgesSection";
import { ProgressInsights } from "./ProgressInsights";
import { RoadmapSteps } from "./RoadmapSteps";
import { NetworkingPanel } from "./NetworkingPanel";
import { ChatPanel } from "./ChatPanel";
import { ProjectsSection } from "./ProjectsSection";
import { EnhancedProfileEditor } from "./EnhancedProfileEditor";
import { AICareerAssistant } from "./AICareerAssistant";
import { CareerLabNavbar } from "./CareerLabNavbar";
import { RoadmapSelector } from "./RoadmapSelector";
import { 
  Beaker, 
  Target,
  Trophy,
  ClipboardList,
  Map,
  Users,
  MessageCircle,
  Folder,
  User,
  Sparkles,
} from "lucide-react";

interface StudentDashboardProps {
  profile: any;
  careerProfile: any;
  streak: any;
  selectedRoadmap: any;
  availableRoadmaps: any[];
  dailyAssignments: any[];
  userBadges: any[];
  allBadges: any[];
  roadmapProgress: any[];
  submissions: any[];
  selectRoadmap: (roadmapId: string, jobRole: string) => Promise<void>;
  submitAssignment: (assignmentId: string, type: string, url: string, fileName?: string) => Promise<void>;
  calculateOverallProgress: () => number;
  shareOnLinkedIn: (badge: any) => void;
  isLoading: boolean;
}

export const StudentDashboard = ({
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
  isLoading,
}: StudentDashboardProps) => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const currentAssignment = dailyAssignments[0] || null;
  const isAssignmentSubmitted = currentAssignment 
    ? submissions.some(s => s.assignment_id === currentAssignment.id)
    : false;
  const completedAssignmentsCount = submissions.filter(s => s.status === "approved").length;
  const overallProgress = calculateOverallProgress();

  // If no roadmap selected, show selector
  if (!careerProfile?.selected_roadmap_id || !selectedRoadmap) {
    return (
      <section className="min-h-screen pt-32 pb-16 px-4">
        <RoadmapSelector
          roadmaps={availableRoadmaps}
          isLoading={isLoading}
          onSelect={selectRoadmap}
        />
      </section>
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
      case "ai-assistant":
        return <AICareerAssistant targetRole={careerProfile?.target_job_role} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-8">
      {/* Career Lab Header */}
      <div className="px-4 md:px-8 lg:px-16 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Beaker className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">My Career Lab</h1>
            <Badge variant="secondary">Student</Badge>
          </div>
          <ProfileHeader
            name={profile?.full_name}
            avatarUrl={profile?.avatar_url}
            aspiration={careerProfile?.aspiration}
            targetRole={careerProfile?.target_job_role}
            currentStreak={streak?.current_streak || 0}
          />
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="px-4 md:px-8 lg:px-16 mb-8">
        <div className="max-w-7xl mx-auto">
          <CareerLabNavbar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
