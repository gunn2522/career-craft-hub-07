import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Clock, BookOpen, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface CareerProgression {
  id: string;
  to_career_id: string;
  progression_type: string;
  skill_gap: string[] | null;
  recommended_roadmap_id: string | null;
  transition_time: string | null;
  description: string | null;
  to_career?: {
    id: string;
    title: string;
    salary: string | null;
    growth: string | null;
  };
  roadmap?: {
    id: string;
    title: string;
  } | null;
}

interface FutureRolesSectionProps {
  careerId: string;
  currentTitle: string;
}

const progressionTypeLabels: Record<string, { label: string; color: string }> = {
  senior: { label: "Senior Role", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  lateral: { label: "Lateral Move", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  leadership: { label: "Leadership", color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
  specialist: { label: "Specialist", color: "bg-green-500/10 text-green-600 border-green-500/30" },
};

export const FutureRolesSection = ({ careerId, currentTitle }: FutureRolesSectionProps) => {
  const [progressions, setProgressions] = useState<CareerProgression[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchProgressions();
  }, [careerId]);

  const fetchProgressions = async () => {
    try {
      const { data, error } = await supabase
        .from("career_progressions")
        .select(`
          id,
          to_career_id,
          progression_type,
          skill_gap,
          recommended_roadmap_id,
          transition_time,
          description
        `)
        .eq("from_career_id", careerId)
        .order("display_order");

      if (error) throw error;

      // Fetch career details for each progression
      if (data && data.length > 0) {
        const careerIds = data.map((p) => p.to_career_id);
        const roadmapIds = data.filter((p) => p.recommended_roadmap_id).map((p) => p.recommended_roadmap_id);

        const [careersRes, roadmapsRes] = await Promise.all([
          supabase.from("careers").select("id, title, salary, growth").in("id", careerIds),
          roadmapIds.length > 0
            ? supabase.from("roadmaps").select("id, title").in("id", roadmapIds)
            : Promise.resolve({ data: [] }),
        ]);

        const careersMap = new Map((careersRes.data || []).map((c) => [c.id, c]));
        const roadmapsMap = new Map((roadmapsRes.data || []).map((r) => [r.id, r]));

        const enrichedData = data.map((p) => ({
          ...p,
          to_career: careersMap.get(p.to_career_id),
          roadmap: p.recommended_roadmap_id ? roadmapsMap.get(p.recommended_roadmap_id) : null,
        }));

        setProgressions(enrichedData);
      }
    } catch (error) {
      console.error("Error fetching career progressions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8 p-6 bg-muted/30 rounded-xl animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (progressions.length === 0) {
    return null; // Don't show section if no progressions
  }

  const visibleProgressions = isExpanded ? progressions : progressions.slice(0, 3);

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 via-background to-primary/5 rounded-xl border border-primary/10">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-display text-xl font-bold">
          Future Roles You Can Switch Into
        </h3>
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Based on your current role as <span className="font-medium text-foreground">{currentTitle}</span>, here are career paths you can explore:
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleProgressions.map((progression) => {
          const typeInfo = progressionTypeLabels[progression.progression_type] || progressionTypeLabels.senior;

          return (
            <Card key={progression.id} className="hover:border-primary/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className={cn("text-xs", typeInfo.color)}>
                    {typeInfo.label}
                  </Badge>
                  {progression.transition_time && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {progression.transition_time}
                    </div>
                  )}
                </div>

                <h4 className="font-semibold text-lg mb-2">
                  {progression.to_career?.title || "Future Role"}
                </h4>

                {progression.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {progression.description}
                  </p>
                )}

                {/* Skill Gap */}
                {progression.skill_gap && progression.skill_gap.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1.5">Skills to develop:</p>
                    <div className="flex flex-wrap gap-1">
                      {progression.skill_gap.slice(0, 4).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {progression.skill_gap.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{progression.skill_gap.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  {progression.to_career?.salary && (
                    <span>{progression.to_career.salary}</span>
                  )}
                  {progression.to_career?.growth && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      {progression.to_career.growth}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/careers/${progression.to_career_id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      View Role
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                  {progression.roadmap && (
                    <Link to={`/craft/${progression.roadmap.id}`}>
                      <Button size="sm" className="gap-1">
                        <BookOpen className="w-3 h-3" />
                        Roadmap
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {progressions.length > 3 && (
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full gap-2"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show {progressions.length - 3} More Roles <ChevronDown className="w-4 h-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default FutureRolesSection;
