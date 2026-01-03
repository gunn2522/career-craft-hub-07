import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Filter, Briefcase, TrendingUp, Crown } from "lucide-react";
import { ExperienceLevel } from "./ExperienceLevelSelector";
import { cn } from "@/lib/utils";

interface CareerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  experienceLevel: ExperienceLevel | null;
  onExperienceClick: () => void;
  activeSkillFilters: string[];
  onRemoveSkillFilter: (skill: string) => void;
  onClearAll: () => void;
}

const experienceLabels: Record<ExperienceLevel, { label: string; icon: React.ElementType; color: string }> = {
  entry: { label: "Entry Level", icon: Briefcase, color: "bg-green-500/10 text-green-500 border-green-500/30" },
  mid: { label: "Mid Level", icon: TrendingUp, color: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  senior: { label: "Senior Level", icon: Crown, color: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
};

export const CareerFilters = ({
  search,
  onSearchChange,
  experienceLevel,
  onExperienceClick,
  activeSkillFilters,
  onRemoveSkillFilter,
  onClearAll,
}: CareerFiltersProps) => {
  const hasFilters = search || experienceLevel || activeSkillFilters.length > 0;
  const expInfo = experienceLevel ? experienceLabels[experienceLevel] : null;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by job title, skills, or keywords (e.g., React, Data, Marketing)..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 h-14 rounded-xl bg-card/80 backdrop-blur-sm border-border/50 text-lg"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Experience Level Chip */}
        {experienceLevel && expInfo && (
          <Badge
            variant="outline"
            className={cn("px-3 py-1.5 text-sm cursor-pointer hover:opacity-80", expInfo.color)}
            onClick={onExperienceClick}
          >
            <expInfo.icon className="w-3.5 h-3.5 mr-1.5" />
            {expInfo.label}
            <X className="w-3 h-3 ml-1.5" />
          </Badge>
        )}

        {/* Skill Filters */}
        {activeSkillFilters.map((skill) => (
          <Badge
            key={skill}
            variant="secondary"
            className="px-3 py-1.5 text-sm cursor-pointer hover:opacity-80"
            onClick={() => onRemoveSkillFilter(skill)}
          >
            {skill}
            <X className="w-3 h-3 ml-1.5" />
          </Badge>
        ))}

        {/* Change Experience Level */}
        {!experienceLevel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExperienceClick}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Select Experience Level
          </Button>
        )}

        {/* Clear All */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default CareerFilters;
