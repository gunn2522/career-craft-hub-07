import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, DollarSign, TrendingUp, BarChart3, ArrowRight, Crown, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Career {
  id: string;
  title: string;
  description: string | null;
  salary: string | null;
  growth: string | null;
  demand: string | null;
  skills: string[] | null;
  experience_level?: string | null;
}

interface CareerCardProps {
  career: Career;
  onSkillClick?: (skill: string) => void;
}

const experienceBadges: Record<string, { label: string; color: string }> = {
  entry: { label: "Entry Level", color: "bg-green-500/10 text-green-600 border-green-500/30" },
  mid: { label: "Mid Level", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  senior: { label: "Senior Level", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
};

const getDemandVariant = (demand: string | null) => {
  if (!demand) return "secondary";
  switch (demand.toLowerCase()) {
    case "high":
      return "default";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "secondary";
  }
};

export const CareerCard = ({ career, onSkillClick }: CareerCardProps) => {
  const expInfo = career.experience_level ? experienceBadges[career.experience_level] : null;

  return (
    <Link to={`/careers/${career.id}`} className="group block h-full">
      <Card className="h-full transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            {expInfo && (
              <Badge variant="outline" className={cn("text-xs", expInfo.color)}>
                {expInfo.label}
              </Badge>
            )}
          </div>

          <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
            {career.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {career.description || "Explore this exciting career path"}
          </p>

          {/* Skills Preview */}
          {career.skills && career.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {career.skills.slice(0, 3).map((skill, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-primary/10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSkillClick?.(skill);
                  }}
                >
                  {skill}
                </Badge>
              ))}
              {career.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{career.skills.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="space-y-2 text-sm">
            {career.salary && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-foreground/80">{career.salary}</span>
              </div>
            )}
            {career.growth && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-foreground/80">{career.growth}</span>
              </div>
            )}
            {career.demand && (
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-500" />
                <Badge variant={getDemandVariant(career.demand)} className="text-xs">
                  {career.demand} Demand
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2 text-primary font-medium text-sm">
            <span>View Roadmap</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CareerCard;
