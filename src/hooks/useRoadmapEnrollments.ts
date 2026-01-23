import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRoadmapEnrollments = (roadmapId?: string) => {
  return useQuery({
    queryKey: ["roadmap-enrollments", roadmapId],
    queryFn: async () => {
      if (!roadmapId) return { count: 0 };
      
      const { count, error } = await (supabase as any)
        .from("roadmap_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("roadmap_id", roadmapId);

      if (error) {
        console.error("Error fetching enrollments:", error);
        return { count: 0 };
      }

      return { count: count || 0 };
    },
    enabled: !!roadmapId,
  });
};

export const useEnrollInRoadmap = () => {
  const enrollInRoadmap = async (roadmapId: string, userId: string) => {
    // Check if already enrolled
    const { data: existing } = await (supabase as any)
      .from("roadmap_enrollments")
      .select("id")
      .eq("roadmap_id", roadmapId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return { alreadyEnrolled: true };
    }

    const { error } = await (supabase as any)
      .from("roadmap_enrollments")
      .insert({ roadmap_id: roadmapId, user_id: userId });

    if (error) throw error;
    return { alreadyEnrolled: false };
  };

  return { enrollInRoadmap };
};
