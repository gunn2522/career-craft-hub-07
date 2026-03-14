import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface RoadmapStep {
  order: number;
  title: string;
  completed: boolean;
}

export interface StepProgress {
  step_index: number;
  status: "locked" | "in_progress" | "completed";
  completion_percentage: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  category: string | null;
  step_index: number | null;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  instructions: string | null;
  step_index: number;
}

export const useRoadmapProgress = (roadmapId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<{
    id: string;
    title: string;
    description: string | null;
    steps: RoadmapStep[];
    duration: string | null;
    difficulty: string | null;
  } | null>(null);
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isUnlockAnimating, setIsUnlockAnimating] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!roadmapId) return;

    setIsLoading(true);
    try {
      // Fetch roadmap details
      const { data: roadmapData, error: roadmapError } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("id", roadmapId)
        .single();

      if (roadmapError) throw roadmapError;

      const parsedRoadmap = {
        ...roadmapData,
        steps: Array.isArray(roadmapData.steps)
          ? (roadmapData.steps as unknown as RoadmapStep[])
          : [],
      };
      setRoadmap(parsedRoadmap);

      // Fetch resources for this roadmap
      const { data: resourcesData } = await supabase
        .from("resources")
        .select("*")
        .eq("roadmap_id", roadmapId);
      setResources(resourcesData || []);

      // Fetch assignments for this roadmap
      const { data: assignmentsData } = await supabase
        .from("daily_assignments")
        .select("*")
        .eq("roadmap_id", roadmapId)
        .eq("is_active", true)
        .order("step_index");
      setAssignments(assignmentsData || []);

      // Fetch user progress if authenticated
      if (user) {
        const { data: progressData } = await supabase
          .from("user_roadmap_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("roadmap_id", roadmapId);

        if (progressData && progressData.length > 0) {
          setStepProgress(
            progressData.map((p) => ({
              step_index: p.step_index,
              status: p.status as "locked" | "in_progress" | "completed",
              completion_percentage: p.completion_percentage || 0,
              started_at: p.started_at,
              completed_at: p.completed_at,
            }))
          );
        } else {
          // Initialize progress for first step
          setStepProgress([
            {
              step_index: 0,
              status: "in_progress",
              completion_percentage: 0,
              started_at: new Date().toISOString(),
              completed_at: null,
            },
          ]);
        }

        // Fetch submissions
        const { data: submissionsData } = await supabase
          .from("assignment_submissions")
          .select("*")
          .eq("user_id", user.id);
        setSubmissions(submissionsData || []);
      }
    } catch (error) {
      console.error("Error fetching roadmap data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [roadmapId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStepStatus = (stepIndex: number): "locked" | "in_progress" | "completed" => {
    const progress = stepProgress.find((p) => p.step_index === stepIndex);
    if (progress) return progress.status;

    // First step is always unlocked
    if (stepIndex === 0) return "in_progress";

    // Check if previous step is completed
    const prevProgress = stepProgress.find((p) => p.step_index === stepIndex - 1);
    if (prevProgress?.status === "completed") return "in_progress";

    return "locked";
  };

  const getStepProgress = (stepIndex: number): number => {
    const progress = stepProgress.find((p) => p.step_index === stepIndex);
    return progress?.completion_percentage || 0;
  };

  const getStepResources = (stepIndex: number): Resource[] => {
    return resources.filter(
      (r) =>
        r.step_index === stepIndex ||
        r.category === `step_${stepIndex}` ||
        r.category === roadmap?.steps[stepIndex]?.title
    );
  };

  const getStepAssignments = (stepIndex: number): Assignment[] => {
    return assignments.filter((a) => a.step_index === stepIndex);
  };

  const isAssignmentCompleted = (assignmentId: string): boolean => {
    return submissions.some(
      (s) => s.assignment_id === assignmentId && (s.status === "approved" || s.status === "pending")
    );
  };

  const calculateOverallProgress = (): number => {
    if (!roadmap || roadmap.steps.length === 0) return 0;
    const completedSteps = stepProgress.filter((p) => p.status === "completed").length;
    return Math.round((completedSteps / roadmap.steps.length) * 100);
  };

  const completeStep = async (stepIndex: number) => {
    if (!user || !roadmapId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to track your progress",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if progress record exists
      const existing = stepProgress.find((p) => p.step_index === stepIndex);

      if (existing) {
        await supabase
          .from("user_roadmap_progress")
          .update({
            status: "completed",
            completion_percentage: 100,
            completed_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("roadmap_id", roadmapId)
          .eq("step_index", stepIndex);
      } else {
        await supabase.from("user_roadmap_progress").insert({
          user_id: user.id,
          roadmap_id: roadmapId,
          step_index: stepIndex,
          status: "completed",
          completion_percentage: 100,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });
      }

      // Unlock next step
      const nextStepIndex = stepIndex + 1;
      if (roadmap && nextStepIndex < roadmap.steps.length) {
        const nextExists = stepProgress.find((p) => p.step_index === nextStepIndex);
        if (!nextExists) {
          await supabase.from("user_roadmap_progress").insert({
            user_id: user.id,
            roadmap_id: roadmapId,
            step_index: nextStepIndex,
            status: "in_progress",
            completion_percentage: 0,
            started_at: new Date().toISOString(),
          });
        }

        // Trigger unlock animation
        setIsUnlockAnimating(nextStepIndex);
        setTimeout(() => setIsUnlockAnimating(null), 1500);
      }

      toast({
        title: "🎉 Milestone Completed!",
        description:
          nextStepIndex < (roadmap?.steps.length || 0)
            ? "Next milestone unlocked! Keep going!"
            : "Congratulations! You've completed the roadmap!",
      });

      await fetchData();
    } catch (error) {
      console.error("Error completing step:", error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateStepProgress = async (stepIndex: number, percentage: number) => {
    if (!user || !roadmapId) return;

    try {
      const existing = stepProgress.find((p) => p.step_index === stepIndex);

      if (existing) {
        await supabase
          .from("user_roadmap_progress")
          .update({
            completion_percentage: percentage,
          })
          .eq("user_id", user.id)
          .eq("roadmap_id", roadmapId)
          .eq("step_index", stepIndex);
      } else {
        await supabase.from("user_roadmap_progress").insert({
          user_id: user.id,
          roadmap_id: roadmapId,
          step_index: stepIndex,
          status: "in_progress",
          completion_percentage: percentage,
          started_at: new Date().toISOString(),
        });
      }

      await fetchData();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  return {
    isLoading,
    roadmap,
    stepProgress,
    resources,
    assignments,
    submissions,
    selectedStep,
    setSelectedStep,
    isUnlockAnimating,
    getStepStatus,
    getStepProgress,
    getStepResources,
    getStepAssignments,
    isAssignmentCompleted,
    calculateOverallProgress,
    completeStep,
    updateStepProgress,
    refreshData: fetchData,
  };
};
