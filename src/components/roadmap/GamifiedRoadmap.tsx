import { useState } from "react";
import {
  CheckCircle,
  Lock,
  Play,
  ChevronRight,
  Sparkles,
  Trophy,
  Target,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { RoadmapStep, StepProgress, Resource, Assignment } from "@/hooks/useRoadmapProgress";

interface GamifiedRoadmapProps {
  steps: RoadmapStep[];
  stepProgress: StepProgress[];
  overallProgress: number;
  selectedStep: number | null;
  isUnlockAnimating: number | null;
  onStepClick: (stepIndex: number) => void;
  getStepStatus: (stepIndex: number) => "locked" | "in_progress" | "completed";
  getStepProgress: (stepIndex: number) => number;
}

export const GamifiedRoadmap = ({
  steps,
  stepProgress,
  overallProgress,
  selectedStep,
  isUnlockAnimating,
  onStepClick,
  getStepStatus,
  getStepProgress,
}: GamifiedRoadmapProps) => {
  return (
    <div className="relative">
      {/* Overall Progress Header */}
      <div className="glass-card rounded-3xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Your Progress</h2>
              <p className="text-sm text-muted-foreground">
                {stepProgress.filter((p) => p.status === "completed").length} of {steps.length}{" "}
                milestones completed
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold gradient-text">{overallProgress}%</span>
            <p className="text-sm text-muted-foreground">Complete</p>
          </div>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </div>

      {/* Vertical Roadmap */}
      <div className="relative pl-8 md:pl-12">
        {/* Vertical Progress Line */}
        <div className="absolute left-4 md:left-6 top-0 bottom-0 w-1 bg-border rounded-full">
          <div
            className="w-full bg-gradient-to-b from-primary to-primary/60 rounded-full transition-all duration-700"
            style={{ height: `${overallProgress}%` }}
          />
        </div>

        {/* Roadmap Nodes */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const progress = getStepProgress(index);
            const isLocked = status === "locked";
            const isCompleted = status === "completed";
            const isInProgress = status === "in_progress";
            const isSelected = selectedStep === index;
            const isAnimating = isUnlockAnimating === index;

            return (
              <div
                key={index}
                className={cn(
                  "relative transition-all duration-300",
                  isAnimating && "animate-scale-in"
                )}
              >
                {/* Node Circle */}
                <div
                  className={cn(
                    "absolute -left-4 md:-left-6 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 cursor-pointer",
                    isLocked && "bg-muted border-2 border-border",
                    isCompleted &&
                      "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30",
                    isInProgress &&
                      "bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 ring-4 ring-primary/20",
                    isAnimating && "animate-bounce"
                  )}
                  onClick={() => !isLocked && onStepClick(index)}
                >
                  {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                  {isCompleted && <CheckCircle className="w-5 h-5 text-white" />}
                  {isInProgress && <Play className="w-4 h-4 text-primary-foreground" />}
                </div>

                {/* Unlock Animation Sparkle */}
                {isAnimating && (
                  <div className="absolute -left-6 md:-left-8 -top-2 animate-ping">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                )}

                {/* Step Card */}
                <div
                  className={cn(
                    "glass-card rounded-2xl p-5 ml-6 cursor-pointer transition-all duration-300",
                    isLocked && "opacity-60 cursor-not-allowed",
                    isSelected && !isLocked && "ring-2 ring-primary border-primary",
                    !isLocked && "hover:border-primary/50 hover:shadow-lg"
                  )}
                  onClick={() => !isLocked && onStepClick(index)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                            isCompleted && "bg-green-500/10 text-green-500",
                            isInProgress && "bg-primary/10 text-primary",
                            isLocked && "bg-muted text-muted-foreground"
                          )}
                        >
                          {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Locked"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Step {step.order || index + 1}
                        </span>
                      </div>

                      <h3 className="font-semibold text-lg mb-2">{step.title}</h3>

                      {!isLocked && (
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden max-w-[200px]">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isCompleted
                                  ? "bg-gradient-to-r from-green-500 to-green-400"
                                  : "bg-gradient-to-r from-primary to-primary/70"
                              )}
                              style={{ width: `${isCompleted ? 100 : progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            {isCompleted ? "100%" : `${progress}%`}
                          </span>
                        </div>
                      )}

                      {isLocked && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Complete previous milestone to unlock
                        </p>
                      )}
                    </div>

                    {!isLocked && (
                      <ChevronRight
                        className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform",
                          isSelected && "rotate-90 text-primary"
                        )}
                      />
                    )}
                  </div>

                  {/* Completion Badge */}
                  {isCompleted && (
                    <div className="mt-4 flex items-center gap-2 text-green-500">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-medium">Milestone Achieved!</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Finish Line */}
          <div className="relative">
            <div
              className={cn(
                "absolute -left-4 md:-left-6 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center z-10",
                overallProgress === 100
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30"
                  : "bg-muted border-2 border-dashed border-border"
              )}
            >
              <Trophy
                className={cn(
                  "w-5 h-5",
                  overallProgress === 100 ? "text-white" : "text-muted-foreground"
                )}
              />
            </div>
            <div className="glass-card rounded-2xl p-5 ml-6">
              <h3 className="font-semibold text-lg gradient-text">
                {overallProgress === 100 ? "🎉 Journey Complete!" : "Finish Line"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {overallProgress === 100
                  ? "Congratulations on completing your learning journey!"
                  : "Complete all milestones to finish your journey"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
