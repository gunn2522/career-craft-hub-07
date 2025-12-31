import { TrendingUp, Clock, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressInsightsProps {
  currentStreak: number;
  longestStreak: number;
  completedAssignments: number;
  overallProgress: number;
}

export const ProgressInsights = ({
  currentStreak,
  longestStreak,
  completedAssignments,
  overallProgress,
}: ProgressInsightsProps) => {
  const getStatus = () => {
    if (currentStreak >= 7) return { label: "On Fire! 🔥", color: "text-green-500", bg: "bg-green-500/10" };
    if (currentStreak >= 3) return { label: "On Track", color: "text-primary", bg: "bg-primary/10" };
    if (currentStreak >= 1) return { label: "Getting Started", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    return { label: "Needs Improvement", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const status = getStatus();

  const insights = [
    {
      icon: TrendingUp,
      label: "Current Streak",
      value: `${currentStreak} days`,
      subtext: `Best: ${longestStreak} days`,
    },
    {
      icon: Target,
      label: "Assignments",
      value: completedAssignments.toString(),
      subtext: "Completed",
    },
    {
      icon: Clock,
      label: "Progress",
      value: `${overallProgress}%`,
      subtext: "Roadmap completion",
    },
  ];

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl md:text-2xl font-bold">
          Progress Insights
        </h2>
        <div className={cn("px-4 py-2 rounded-full font-medium text-sm", status.bg, status.color)}>
          {status.label}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-4 rounded-2xl bg-muted/50 border border-border"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <insight.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{insight.label}</span>
            </div>
            <div className="font-display text-2xl font-bold">{insight.value}</div>
            <div className="text-sm text-muted-foreground">{insight.subtext}</div>
          </div>
        ))}
      </div>

      {currentStreak === 0 && (
        <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-500">Keep your streak going!</p>
            <p className="text-sm text-muted-foreground">
              Complete today's task to start building your streak and unlock streak badges.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
