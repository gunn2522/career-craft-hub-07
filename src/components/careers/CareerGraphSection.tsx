import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  TrendingUp, 
  ArrowDown,
  ArrowRight,
  Sparkles,
  Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface CareerNode {
  id: string;
  title: string;
  slug: string | null;
  experience_level: string | null;
  progression_type: string;
}

interface CareerGraphSectionProps {
  careerId: string;
  currentTitle: string;
  currentLevel: string | null;
}

const experienceLevelOrder: Record<string, number> = {
  entry: 1,
  mid: 2,
  senior: 3,
};

export const CareerGraphSection = ({ 
  careerId, 
  currentTitle, 
  currentLevel 
}: CareerGraphSectionProps) => {
  const { user } = useAuth();
  const [verticalGrowth, setVerticalGrowth] = useState<CareerNode[]>([]);
  const [lateralMoves, setLateralMoves] = useState<CareerNode[]>([]);
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgressions();
    loadUserLevel();
  }, [careerId, user]);

  const loadUserLevel = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("preferred_experience_level")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data?.preferred_experience_level) {
      setUserLevel(data.preferred_experience_level);
    }
  };

  const fetchProgressions = async () => {
    try {
      const { data, error } = await supabase
        .from("career_progressions")
        .select("id, to_career_id, progression_type")
        .eq("from_career_id", careerId)
        .order("display_order");

      if (error) throw error;

      if (data && data.length > 0) {
        const careerIds = data.map((p) => p.to_career_id);
        const { data: careersData } = await supabase
          .from("careers")
          .select("id, title, slug, experience_level, is_active")
          .in("id", careerIds)
          .eq("is_active", true);

        const careersMap = new Map((careersData || []).map((c) => [c.id, c]));

        const enrichedData: CareerNode[] = data
          .filter((p) => careersMap.has(p.to_career_id))
          .map((p) => ({
            ...careersMap.get(p.to_career_id)!,
            progression_type: p.progression_type,
          }));

        // Separate vertical (senior, leadership) from lateral
        const vertical = enrichedData.filter((c) => 
          ["senior", "leadership"].includes(c.progression_type)
        );
        const lateral = enrichedData.filter((c) => 
          ["lateral", "specialist"].includes(c.progression_type)
        );

        setVerticalGrowth(vertical);
        setLateralMoves(lateral);
      }
    } catch (error) {
      console.error("Error fetching graph:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAccessible = (targetLevel: string | null): boolean => {
    if (!userLevel || !targetLevel) return true;
    return experienceLevelOrder[targetLevel] <= experienceLevelOrder[userLevel] + 1;
  };

  const getLevelBadgeColor = (level: string | null) => {
    switch (level) {
      case "entry": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "mid": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "senior": return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (verticalGrowth.length === 0 && lateralMoves.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Career Growth Map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          {/* Current Role - Center */}
          <div className="relative">
            <div className="px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-center shadow-lg">
              <Briefcase className="w-5 h-5 inline-block mr-2" />
              {currentTitle}
              {currentLevel && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {currentLevel === "entry" ? "Entry" : currentLevel === "mid" ? "Mid" : "Senior"}
                </Badge>
              )}
            </div>
          </div>

          {/* Connectors */}
          <div className="flex items-center gap-8 my-4">
            {verticalGrowth.length > 0 && (
              <div className="flex flex-col items-center">
                <ArrowDown className="w-6 h-6 text-amber-500" />
                <span className="text-xs text-muted-foreground mt-1">Growth</span>
              </div>
            )}
            {lateralMoves.length > 0 && (
              <div className="flex flex-col items-center">
                <ArrowRight className="w-6 h-6 text-blue-500" />
                <span className="text-xs text-muted-foreground mt-1">Switch</span>
              </div>
            )}
          </div>

          {/* Progression Nodes */}
          <div className="w-full grid md:grid-cols-2 gap-6">
            {/* Vertical Growth */}
            {verticalGrowth.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-amber-600">
                  <TrendingUp className="w-4 h-4" />
                  This Role Can Lead To
                </h4>
                <div className="space-y-2">
                  {verticalGrowth.map((career) => {
                    const accessible = isAccessible(career.experience_level);
                    return (
                      <Link
                        key={career.id}
                        to={`/careers/${career.slug || career.id}`}
                        className={cn(
                          "block p-3 rounded-lg border transition-all",
                          accessible 
                            ? "bg-card hover:border-primary/50 hover:shadow-md cursor-pointer" 
                            : "bg-muted/50 opacity-60"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {!accessible && <Lock className="w-4 h-4 text-muted-foreground" />}
                            <span className={cn("font-medium", !accessible && "text-muted-foreground")}>
                              {career.title}
                            </span>
                          </div>
                          <Badge variant="outline" className={cn("text-xs", getLevelBadgeColor(career.experience_level))}>
                            {career.experience_level === "entry" ? "Entry" : 
                             career.experience_level === "mid" ? "Mid" : "Senior"}
                          </Badge>
                        </div>
                        {!accessible && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Requires higher experience level
                          </p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lateral Moves */}
            {lateralMoves.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-blue-600">
                  <ArrowRight className="w-4 h-4" />
                  You Can Switch Into
                </h4>
                <div className="space-y-2">
                  {lateralMoves.map((career) => {
                    const accessible = isAccessible(career.experience_level);
                    return (
                      <Link
                        key={career.id}
                        to={`/careers/${career.slug || career.id}`}
                        className={cn(
                          "block p-3 rounded-lg border transition-all",
                          accessible 
                            ? "bg-card hover:border-primary/50 hover:shadow-md cursor-pointer" 
                            : "bg-muted/50 opacity-60"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {!accessible && <Lock className="w-4 h-4 text-muted-foreground" />}
                            <span className={cn("font-medium", !accessible && "text-muted-foreground")}>
                              {career.title}
                            </span>
                          </div>
                          <Badge variant="outline" className={cn("text-xs", getLevelBadgeColor(career.experience_level))}>
                            {career.experience_level === "entry" ? "Entry" : 
                             career.experience_level === "mid" ? "Mid" : "Senior"}
                          </Badge>
                        </div>
                        {!accessible && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Requires higher experience level
                          </p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerGraphSection;
