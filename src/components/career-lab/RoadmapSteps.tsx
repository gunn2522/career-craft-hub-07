import { CheckCircle, Lock, Play, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoadmapStep {
  order: number;
  title: string;
  completed: boolean;
}

interface ProgressData {
  step_index: number;
  status: string;
  completion_percentage: number;
}

interface RoadmapStepsProps {
  steps: RoadmapStep[];
  progressData: ProgressData[];
}

export const RoadmapSteps = ({ steps, progressData }: RoadmapStepsProps) => {
  const getStepStatus = (index: number) => {
    const progress = progressData.find(p => p.step_index === index);
    if (progress) return progress.status;
    
    // First step is always unlocked, rest are locked
    if (index === 0) return "in_progress";
    
    // Check if previous step is completed
    const prevProgress = progressData.find(p => p.step_index === index - 1);
    if (prevProgress?.status === "completed") return "in_progress";
    
    return "locked";
  };

  const getStepProgress = (index: number) => {
    const progress = progressData.find(p => p.step_index === index);
    return progress?.completion_percentage || 0;
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8">
      <h2 className="font-display text-xl md:text-2xl font-bold mb-6">
        Career Roadmap
      </h2>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const progress = getStepProgress(index);
          const isLocked = status === "locked";
          const isCompleted = status === "completed";
          const isInProgress = status === "in_progress";

          return (
            <div
              key={index}
              className={cn(
                "relative flex items-center gap-4 p-4 rounded-2xl border transition-all",
                isLocked && "opacity-60 bg-muted/30 border-border",
                isCompleted && "bg-green-500/10 border-green-500/30",
                isInProgress && "bg-primary/10 border-primary/30"
              )}
            >
              {/* Step Number/Icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
                  isLocked && "bg-muted text-muted-foreground",
                  isCompleted && "bg-green-500 text-white",
                  isInProgress && "bg-primary text-primary-foreground"
                )}
              >
                {isLocked && <Lock className="w-5 h-5" />}
                {isCompleted && <CheckCircle className="w-6 h-6" />}
                {isInProgress && <Play className="w-5 h-5" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                
                {!isLocked && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden max-w-[200px]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isCompleted ? "bg-green-500" : "bg-primary"
                        )}
                        style={{ width: `${isCompleted ? 100 : progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {isCompleted ? "100%" : `${progress}%`}
                    </span>
                  </div>
                )}

                {isLocked && (
                  <p className="text-sm text-muted-foreground">
                    Complete previous step to unlock
                  </p>
                )}
              </div>

              {/* Arrow */}
              {!isLocked && (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-10 top-full w-0.5 h-4 -translate-x-1/2",
                    isCompleted ? "bg-green-500" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
