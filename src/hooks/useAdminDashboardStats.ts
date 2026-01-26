import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  careers: number;
  roadmaps: number;
  resources: number;
  internships: number;
  blogs: number;
  successStories: number;
  events: number;
  applications: number;
  registeredUsers: number;
}

export const useAdminDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    careers: 0,
    roadmaps: 0,
    resources: 0,
    internships: 0,
    blogs: 0,
    successStories: 0,
    events: 0,
    applications: 0,
    registeredUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        { count: careers },
        { count: roadmaps },
        { count: resources },
        { count: internships },
        { count: blogs },
        { count: successStories },
        { count: events },
        { count: applications },
        { count: registeredUsers },
      ] = await Promise.all([
        supabase.from("careers").select("*", { count: "exact", head: true }),
        supabase.from("roadmaps").select("*", { count: "exact", head: true }),
        supabase.from("resources").select("*", { count: "exact", head: true }),
        supabase.from("internships").select("*", { count: "exact", head: true }),
        supabase.from("blogs").select("*", { count: "exact", head: true }),
        supabase.from("success_stories").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("ambassador_applications").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        careers: careers || 0,
        roadmaps: roadmaps || 0,
        resources: resources || 0,
        internships: internships || 0,
        blogs: blogs || 0,
        successStories: successStories || 0,
        events: events || 0,
        applications: applications || 0,
        registeredUsers: registeredUsers || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
};
