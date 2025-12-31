import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface ProgressBarProps {
  roadmapTitle: string;
  progress: number;
}

export const ProgressBar = ({ roadmapTitle, progress }: ProgressBarProps) => {
  return (
    <div className="glass-card rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold mb-1">
            {roadmapTitle}
          </h2>
          <p className="text-muted-foreground text-sm">Your Career Roadmap Progress</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-bold text-primary">{progress}%</span>
        </div>
      </div>

      <div className="relative">
        <Progress value={progress} className="h-4 rounded-full" />
        <div 
          className="absolute top-0 left-0 h-4 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-3 text-sm text-muted-foreground">
        <span>Getting Started</span>
        <span>Mastery</span>
      </div>
    </div>
  );
};
