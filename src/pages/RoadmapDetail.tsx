import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { TorchLoader } from "@/components/ui/TorchLoader";
import { GamifiedRoadmap } from "@/components/roadmap/GamifiedRoadmap";
import { StepResourcesPanel } from "@/components/roadmap/StepResourcesPanel";
import { Button } from "@/components/ui/button";
import { useRoadmapProgress } from "@/hooks/useRoadmapProgress";
import { ArrowLeft, BookOpen, Clock, Target, Users } from "lucide-react";

const RoadmapDetail = () => {
  const { id } = useParams<{ id: string }>();
  const {
    isLoading,
    roadmap,
    stepProgress,
    resources,
    assignments,
    selectedStep,
    setSelectedStep,
    isUnlockAnimating,
    getStepStatus,
    getStepProgress,
    getStepResources,
    getStepAssignments,
    isAssignmentCompleted,
    calculateOverallProgress,
    completeStep,
  } = useRoadmapProgress(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <TorchLoader size="lg" text="Loading your roadmap..." />
        </div>
      </Layout>
    );
  }

  if (!roadmap) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-bold mb-4">Roadmap Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The roadmap you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/craft">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Roadmaps
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const overallProgress = calculateOverallProgress();
  const selectedStepData = selectedStep !== null ? roadmap.steps[selectedStep] : null;

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/craft"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Roadmaps
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {roadmap.difficulty || "Beginner"}
                  </span>
                  {roadmap.duration && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {roadmap.duration}
                    </span>
                  )}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold gradient-text">
                  {roadmap.title}
                </h1>
                {roadmap.description && (
                  <p className="text-muted-foreground mt-2 max-w-2xl line-clamp-2">
                    {roadmap.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span>{roadmap.steps.length} Milestones</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>1.2K Learners</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Roadmap Column */}
            <div className="lg:col-span-2">
              <GamifiedRoadmap
                steps={roadmap.steps}
                stepProgress={stepProgress}
                overallProgress={overallProgress}
                selectedStep={selectedStep}
                isUnlockAnimating={isUnlockAnimating}
                onStepClick={setSelectedStep}
                getStepStatus={getStepStatus}
                getStepProgress={getStepProgress}
              />
            </div>

            {/* Resources Panel */}
            <div className="lg:col-span-1">
              {selectedStep !== null && selectedStepData ? (
                <StepResourcesPanel
                  step={selectedStepData}
                  stepIndex={selectedStep}
                  resources={getStepResources(selectedStep)}
                  assignments={getStepAssignments(selectedStep)}
                  isAssignmentCompleted={isAssignmentCompleted}
                  onCompleteStep={() => completeStep(selectedStep)}
                  stepProgress={getStepProgress(selectedStep)}
                  status={getStepStatus(selectedStep)}
                />
              ) : (
                <div className="glass-card rounded-3xl p-6 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Select a Milestone</h3>
                  <p className="text-muted-foreground text-sm">
                    Click on any unlocked milestone to view its resources and tasks
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RoadmapDetail;
