import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Crown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Career {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  salary?: string | null;
  growth?: string | null;
  demand?: string | null;
  skills?: string[] | null;
  experience_level?: string | null;
}

interface CareerCardProps {
  career: Career;
  onSkillClick?: (skill: string) => void;
}

const experienceLevels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  entry: { 
    label: "Entry Level", 
    icon: Briefcase,
    color: "bg-green-500/10 text-green-600 border-green-500/30" 
  },
  mid: { 
    label: "Mid Level", 
    icon: TrendingUp,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/30" 
  },
  senior: { 
    label: "Senior Level", 
    icon: Crown,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/30" 
  },
};

export const CareerCard = ({ career }: CareerCardProps) => {
  const expInfo = career.experience_level ? experienceLevels[career.experience_level] : experienceLevels.entry;
  const Icon = expInfo?.icon || Briefcase;

  // Use slug for SEO-friendly URL, fallback to ID
  const careerUrl = `/careers/${career.slug || career.id}`;

  return (
    <Link to={careerUrl} className="group block h-full">
      <Card className="h-full p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg cursor-pointer">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Role Icon */}
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
            expInfo?.color.split(" ")[0] || "bg-primary/10",
            "group-hover:bg-primary/20"
          )}>
            <Icon className={cn("w-7 h-7", expInfo?.color.split(" ")[1] || "text-primary")} />
          </div>

          {/* Experience Level Badge */}
          {expInfo && (
            <Badge variant="outline" className={cn("text-xs font-medium", expInfo.color)}>
              {expInfo.label}
            </Badge>
          )}

          {/* Role Title */}
          <h3 className="font-display text-lg font-bold group-hover:text-primary transition-colors">
            {career.title}
          </h3>
        </div>
      </Card>
    </Link>
  );
};

export default CareerCard;
