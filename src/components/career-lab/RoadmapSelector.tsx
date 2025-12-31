import { useState } from "react";
import { ArrowRight, Clock, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TorchLoader } from "@/components/ui/TorchLoader";

interface Roadmap {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  difficulty: string | null;
}

interface RoadmapSelectorProps {
  roadmaps: Roadmap[];
  isLoading: boolean;
  onSelect: (roadmapId: string, title: string) => void;
}

export const RoadmapSelector = ({
  roadmaps,
  isLoading,
  onSelect,
}: RoadmapSelectorProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <TorchLoader size="lg" text="Loading roadmaps..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm mb-6">
          <Target className="w-4 h-4" />
          Choose Your Path
        </div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          What's Your <span className="gradient-text">Dream Career?</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select a career roadmap to begin your personalized learning journey. 
          Track progress, earn badges, and build skills step by step.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {roadmaps.map((roadmap) => (
          <div
            key={roadmap.id}
            className={`glass-card rounded-2xl p-6 cursor-pointer transition-all hover:border-primary/50 ${
              selectedId === roadmap.id ? "border-primary ring-2 ring-primary/20" : ""
            }`}
            onClick={() => setSelectedId(roadmap.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              {roadmap.difficulty && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-secondary">
                  {roadmap.difficulty}
                </span>
              )}
            </div>

            <h3 className="font-display text-xl font-bold mb-2">{roadmap.title}</h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {roadmap.description || "Master the skills needed for this career path"}
            </p>

            {roadmap.duration && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {roadmap.duration}
              </div>
            )}
          </div>
        ))}
      </div>

      {roadmaps.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No roadmaps available yet. Check back soon!</p>
        </div>
      )}

      {selectedId && (
        <div className="mt-8 text-center">
          <Button
            variant="gradient"
            size="xl"
            onClick={() => {
              const roadmap = roadmaps.find(r => r.id === selectedId);
              if (roadmap) {
                onSelect(selectedId, roadmap.title);
              }
            }}
          >
            Start My Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
