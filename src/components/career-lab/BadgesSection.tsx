import { Linkedin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  requirement_type?: string | null;
  requirement_value?: number | null;
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

interface BadgesSectionProps {
  allBadges: Badge[];
  earnedBadges: UserBadge[];
  onShareLinkedIn: (badge: UserBadge) => void;
}

export const BadgesSection = ({
  allBadges,
  earnedBadges,
  onShareLinkedIn,
}: BadgesSectionProps) => {
  const isEarned = (badgeId: string) => {
    return earnedBadges.some(eb => eb.badge_id === badgeId);
  };

  const getEarnedBadge = (badgeId: string) => {
    return earnedBadges.find(eb => eb.badge_id === badgeId);
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl md:text-2xl font-bold">
          Badges & Achievements
        </h2>
        <div className="text-sm text-muted-foreground">
          {earnedBadges.length} / {allBadges.length} earned
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {allBadges.map((badge) => {
          const earned = isEarned(badge.id);
          const userBadge = getEarnedBadge(badge.id);

          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "relative flex flex-col items-center p-4 rounded-2xl border transition-all cursor-pointer",
                    earned
                      ? "bg-primary/10 border-primary/30 hover:border-primary/50"
                      : "bg-muted/30 border-border opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "text-4xl mb-2 transition-transform",
                      earned && "animate-bounce-slow"
                    )}
                  >
                    {earned ? badge.icon : <Lock className="w-8 h-8" />}
                  </div>
                  <span className="text-xs font-medium text-center line-clamp-2">
                    {badge.name}
                  </span>
                  
                  {earned && userBadge && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0077B5] hover:bg-[#0077B5]/80 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareLinkedIn(userBadge);
                      }}
                    >
                      <Linkedin className="w-3.5 h-3.5 text-white" />
                    </Button>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                  {!earned && (
                    <p className="text-xs text-primary mt-1">
                      {badge.requirement_type === "streak_days" && 
                        `Reach ${badge.requirement_value} day streak`}
                      {badge.requirement_type === "assignments_completed" && 
                        `Complete ${badge.requirement_value} assignments`}
                      {badge.requirement_type === "roadmap_progress" && 
                        `Reach ${badge.requirement_value}% roadmap progress`}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
