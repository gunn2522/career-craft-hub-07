import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UserCareerProfile {
  id: string;
  user_id: string;
  selected_roadmap_id: string | null;
  aspiration: string | null;
  target_job_role: string | null;
}

interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

interface RoadmapStep {
  order: number;
  title: string;
  completed: boolean;
}

interface Roadmap {
  id: string;
  title: string;
  description: string | null;
  steps: RoadmapStep[];
  duration: string | null;
  difficulty: string | null;
}

interface DailyAssignment {
  id: string;
  title: string;
  description: string | null;
  skill_focus: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  instructions: string | null;
  step_index: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  shared_on_linkedin: boolean;
  badges: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    category: string | null;
  };
}

interface UserRoadmapProgress {
  step_index: number;
  status: string;
  completion_percentage: number;
}

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
}

export const useCareerLab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [careerProfile, setCareerProfile] = useState<UserCareerProfile | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [availableRoadmaps, setAvailableRoadmaps] = useState<Roadmap[]>([]);
  const [dailyAssignments, setDailyAssignments] = useState<DailyAssignment[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState<UserRoadmapProgress[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        fetchProfile(),
        fetchCareerProfile(),
        fetchStreak(),
        fetchAvailableRoadmaps(),
        fetchUserBadges(),
        fetchAllBadges(),
      ]);
    } catch (error) {
      console.error("Error fetching career lab data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", user!.id)
      .maybeSingle();
    
    setProfile(data);
  };

  const fetchCareerProfile = async () => {
    const { data, error } = await supabase
      .from("user_career_profiles")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    
    if (data) {
      setCareerProfile(data);
      if (data.selected_roadmap_id) {
        await fetchSelectedRoadmap(data.selected_roadmap_id);
        await fetchRoadmapProgress(data.selected_roadmap_id);
        await fetchDailyAssignments(data.selected_roadmap_id);
        await fetchSubmissions();
      }
    }
  };

  const fetchStreak = async () => {
    const { data } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    
    if (data) {
      setStreak(data);
    }
  };

  const fetchAvailableRoadmaps = async () => {
    const { data } = await supabase
      .from("roadmaps")
      .select("*")
      .order("title");
    
    if (data) {
      const parsedRoadmaps = data.map(r => ({
        ...r,
        steps: Array.isArray(r.steps) 
          ? (r.steps as unknown as RoadmapStep[]) 
          : []
      }));
      setAvailableRoadmaps(parsedRoadmaps as Roadmap[]);
    }
  };

  const fetchSelectedRoadmap = async (roadmapId: string) => {
    const { data } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("id", roadmapId)
      .maybeSingle();
    
    if (data) {
      setSelectedRoadmap({
        ...data,
        steps: Array.isArray(data.steps) 
          ? (data.steps as unknown as RoadmapStep[]) 
          : []
      } as Roadmap);
    }
  };

  const fetchDailyAssignments = async (roadmapId: string) => {
    const { data } = await supabase
      .from("daily_assignments")
      .select("*")
      .eq("roadmap_id", roadmapId)
      .eq("is_active", true)
      .order("step_index");
    
    if (data) {
      setDailyAssignments(data);
    }
  };

  const fetchUserBadges = async () => {
    const { data } = await supabase
      .from("user_badges")
      .select(`
        *,
        badges (*)
      `)
      .eq("user_id", user!.id);
    
    if (data) {
      setUserBadges(data as UserBadge[]);
    }
  };

  const fetchAllBadges = async () => {
    const { data } = await supabase
      .from("badges")
      .select("*");
    
    if (data) {
      setAllBadges(data);
    }
  };

  const fetchRoadmapProgress = async (roadmapId: string) => {
    const { data } = await supabase
      .from("user_roadmap_progress")
      .select("*")
      .eq("user_id", user!.id)
      .eq("roadmap_id", roadmapId);
    
    if (data) {
      setRoadmapProgress(data);
    }
  };

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("user_id", user!.id);
    
    if (data) {
      setSubmissions(data);
    }
  };

  const selectRoadmap = async (roadmapId: string, jobRole: string) => {
    if (!user) return;

    try {
      // Check if career profile exists
      if (careerProfile) {
        const { error } = await supabase
          .from("user_career_profiles")
          .update({
            selected_roadmap_id: roadmapId,
            target_job_role: jobRole,
            aspiration: `Aspiring ${jobRole}`,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_career_profiles")
          .insert({
            user_id: user.id,
            selected_roadmap_id: roadmapId,
            target_job_role: jobRole,
            aspiration: `Aspiring ${jobRole}`,
          });

        if (error) throw error;
      }

      // Initialize streak if doesn't exist
      if (!streak) {
        await supabase.from("user_streaks").insert({
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
        });
      }

      toast({
        title: "Roadmap Selected!",
        description: `You're now on the path to becoming a ${jobRole}!`,
      });

      await fetchAllData();
    } catch (error) {
      console.error("Error selecting roadmap:", error);
      toast({
        title: "Error",
        description: "Failed to select roadmap. Please try again.",
        variant: "destructive",
      });
    }
  };

  const submitAssignment = async (
    assignmentId: string,
    submissionType: string,
    submissionUrl: string,
    fileName?: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("assignment_submissions")
        .upsert({
          user_id: user.id,
          assignment_id: assignmentId,
          submission_type: submissionType,
          submission_url: submissionUrl,
          file_name: fileName,
          status: "pending",
        });

      if (error) throw error;

      // Update streak
      await updateStreak();

      toast({
        title: "Assignment Submitted!",
        description: "Your work has been submitted for review.",
      });

      await fetchSubmissions();
      await checkAndAwardBadges();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    if (streak) {
      const lastActivity = streak.last_activity_date;
      let newStreak = streak.current_streak;

      if (lastActivity !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastActivity === yesterdayStr) {
          newStreak += 1;
        } else if (lastActivity !== today) {
          newStreak = 1;
        }

        await supabase
          .from("user_streaks")
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streak.longest_streak),
            last_activity_date: today,
          })
          .eq("user_id", user.id);

        await fetchStreak();
      }
    }
  };

  const checkAndAwardBadges = async () => {
    if (!user) return;

    const completedAssignments = submissions.filter(s => s.status === "approved").length + 1;
    const currentStreakDays = streak?.current_streak || 0;

    for (const badge of allBadges) {
      const alreadyEarned = userBadges.some(ub => ub.badge_id === badge.id);
      if (alreadyEarned) continue;

      let shouldAward = false;

      if (badge.requirement_type === "assignments_completed") {
        shouldAward = completedAssignments >= badge.requirement_value;
      } else if (badge.requirement_type === "streak_days") {
        shouldAward = currentStreakDays >= badge.requirement_value;
      }

      if (shouldAward) {
        await supabase.from("user_badges").insert({
          user_id: user.id,
          badge_id: badge.id,
        });

        toast({
          title: "🎉 Badge Earned!",
          description: `You've earned the "${badge.name}" badge!`,
        });
      }
    }

    await fetchUserBadges();
  };

  const calculateOverallProgress = () => {
    if (!selectedRoadmap || selectedRoadmap.steps.length === 0) return 0;
    
    const completedSteps = roadmapProgress.filter(p => p.status === "completed").length;
    return Math.round((completedSteps / selectedRoadmap.steps.length) * 100);
  };

  const shareOnLinkedIn = (badge: UserBadge) => {
    const text = encodeURIComponent(
      `🎉 I just earned the "${badge.badges.name}" badge on Career Craft Cafe! ${careerProfile?.target_job_role ? `I'm on my way to becoming a ${careerProfile.target_job_role}.` : ""} #CareerCraftCafe #CareerGrowth #Learning`
    );
    const url = encodeURIComponent("https://careercraftcafe.com");
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`,
      "_blank"
    );

    // Mark as shared
    supabase
      .from("user_badges")
      .update({ shared_on_linkedin: true })
      .eq("id", badge.id);
  };

  return {
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
    refreshData: fetchAllData,
  };
};
