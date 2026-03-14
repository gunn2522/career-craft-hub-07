import {
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  CheckCircle,
  Play,
  Clock,
  Target,
  Award,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Resource, Assignment, RoadmapStep } from "@/hooks/useRoadmapProgress";

interface StepResourcesPanelProps {
  step: RoadmapStep;
  stepIndex: number;
  resources: Resource[];
  assignments: Assignment[];
  isAssignmentCompleted: (assignmentId: string) => boolean;
  onCompleteStep: () => void;
  stepProgress: number;
  status: "locked" | "in_progress" | "completed";
}

const getResourceIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "video":
      return Video;
    case "blog":
    case "article":
      return FileText;
    default:
      return BookOpen;
  }
};

const getYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

const isYouTubeUrl = (url: string | null): boolean => {
  if (!url) return false;
  return /(?:youtube\.com|youtu\.be)/.test(url);
};

export const StepResourcesPanel = ({
  step,
  stepIndex,
  resources,
  assignments,
  isAssignmentCompleted,
  onCompleteStep,
  stepProgress,
  status,
}: StepResourcesPanelProps) => {
  const allAssignmentsCompleted =
    assignments.length > 0 && assignments.every((a) => isAssignmentCompleted(a.id));

  return (
    <div className="glass-card rounded-3xl p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold">Step {stepIndex + 1}</h3>
          <p className="text-sm text-muted-foreground">{step.title}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">{stepProgress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </div>

      {/* Assignments/Tasks */}
      {assignments.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Tasks & Assignments
          </h4>
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const completed = isAssignmentCompleted(assignment.id);
              return (
                <div
                  key={assignment.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    completed
                      ? "bg-green-500/5 border-green-500/30"
                      : "bg-muted/30 border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        completed ? "bg-green-500/20" : "bg-primary/10"
                      )}
                    >
                      {completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Play className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm">{assignment.title}</h5>
                      {assignment.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {assignment.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {assignment.difficulty && (
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full",
                              assignment.difficulty === "easy"
                                ? "bg-green-500/10 text-green-500"
                                : assignment.difficulty === "medium"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-red-500/10 text-red-500"
                            )}
                          >
                            {assignment.difficulty}
                          </span>
                        )}
                        {assignment.estimated_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {assignment.estimated_time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Learning Resources
          </h4>
          <div className="space-y-3">
            {resources.map((resource) => {
              const Icon = getResourceIcon(resource.type);
              const ytId = resource.url ? getYouTubeId(resource.url) : null;

              return (
                <div key={resource.id} className="rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-all overflow-hidden">
                  {/* YouTube Thumbnail Preview */}
                  {ytId && (
                    <a
                      href={resource.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative group"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                        alt={resource.title}
                        className="w-full h-32 object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-600 text-white flex items-center gap-1">
                          <Youtube className="w-3 h-3" /> YouTube
                        </span>
                      </div>
                    </a>
                  )}

                  <a
                    href={resource.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 group"
                  >
                    {!ytId && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {resource.title}
                      </h5>
                      {resource.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {resource.description}
                        </p>
                      )}
                      {!ytId && (
                        <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {assignments.length === 0 && resources.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No resources available for this step yet.
          </p>
        </div>
      )}

      {/* Complete Step Button */}
      {status === "in_progress" && (
        <Button
          className="w-full"
          size="lg"
          onClick={onCompleteStep}
          disabled={assignments.length > 0 && !allAssignmentsCompleted}
        >
          {assignments.length > 0 && !allAssignmentsCompleted ? (
            <>Complete all tasks first</>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark as Complete
            </>
          )}
        </Button>
      )}

      {status === "completed" && (
        <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-500/10 text-green-500">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Milestone Completed!</span>
        </div>
      )}
    </div>
  );
};
