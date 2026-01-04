import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerLab } from "@/hooks/useCareerLab";
import { TorchLoader } from "@/components/ui/TorchLoader";
import { ProfileCompletion } from "@/components/career-lab/ProfileCompletion";
import { StudentDashboard } from "@/components/career-lab/StudentDashboard";
import { MentorDashboardView } from "@/components/career-lab/MentorDashboardView";
import { PartnerDashboardView } from "@/components/career-lab/PartnerDashboardView";
import { supabase } from "@/integrations/supabase/client";

const MyCareerLab = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, userRole } = useAuth();
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  
  const careerLabData = useCareerLab();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { returnTo: "/my-career-lab" } });
    }
  }, [user, authLoading, navigate]);

  // Check if profile is completed
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from("profiles")
          .select("profile_completed, full_name, career_goals, skills")
          .eq("user_id", user.id)
          .maybeSingle();
        
        // Check if profile has minimum required fields
        const isComplete = data?.profile_completed || 
          (data?.full_name && data?.career_goals && data?.skills && data.skills.length > 0);
        
        setProfileCompleted(!!isComplete);
      } catch (error) {
        console.error("Error checking profile:", error);
        setProfileCompleted(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    if (user && !authLoading) {
      checkProfile();
    }
  }, [user, authLoading]);

  // Loading state
  if (authLoading || isCheckingProfile || careerLabData.isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <TorchLoader size="lg" text="Loading your Career Lab..." />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  // Show profile completion if not complete (for students mainly)
  if (profileCompleted === false && userRole !== "admin") {
    return (
      <Layout>
        <ProfileCompletion 
          onComplete={() => {
            setProfileCompleted(true);
            careerLabData.refreshData?.();
          }} 
        />
      </Layout>
    );
  }

  // Role-based dashboard rendering
  const renderDashboard = () => {
    switch (userRole) {
      case "mentor":
        return <MentorDashboardView />;
      case "partner":
        return <PartnerDashboardView />;
      case "admin":
      case "user":
      default:
        // Students and admins get the student dashboard
        return (
          <StudentDashboard
            profile={careerLabData.profile}
            careerProfile={careerLabData.careerProfile}
            streak={careerLabData.streak}
            selectedRoadmap={careerLabData.selectedRoadmap}
            availableRoadmaps={careerLabData.availableRoadmaps}
            dailyAssignments={careerLabData.dailyAssignments}
            userBadges={careerLabData.userBadges}
            allBadges={careerLabData.allBadges}
            roadmapProgress={careerLabData.roadmapProgress}
            submissions={careerLabData.submissions}
            selectRoadmap={careerLabData.selectRoadmap}
            submitAssignment={careerLabData.submitAssignment}
            calculateOverallProgress={careerLabData.calculateOverallProgress}
            shareOnLinkedIn={careerLabData.shareOnLinkedIn}
            isLoading={careerLabData.isLoading}
          />
        );
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

export default MyCareerLab;
