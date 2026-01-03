import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, TrendingUp, Crown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ExperienceLevel = "entry" | "mid" | "senior";

interface ExperienceLevelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (level: ExperienceLevel) => void;
  currentLevel?: ExperienceLevel | null;
}

const experienceLevels = [
  {
    value: "entry" as ExperienceLevel,
    label: "Entry Level",
    description: "0–2 years of experience",
    icon: Briefcase,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500",
  },
  {
    value: "mid" as ExperienceLevel,
    label: "Mid Level",
    description: "2–5 years of experience",
    icon: TrendingUp,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500",
  },
  {
    value: "senior" as ExperienceLevel,
    label: "Senior Level",
    description: "5+ years of experience",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500",
  },
];

export const ExperienceLevelSelector = ({
  isOpen,
  onClose,
  onSelect,
  currentLevel,
}: ExperienceLevelSelectorProps) => {
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | null>(currentLevel || null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (currentLevel) {
      setSelectedLevel(currentLevel);
    }
  }, [currentLevel]);

  const handleConfirm = async () => {
    if (!selectedLevel) return;

    setIsSaving(true);
    try {
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({ preferred_experience_level: selectedLevel })
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("Experience level saved to your profile!");
      }
      onSelect(selectedLevel);
      onClose();
    } catch (error) {
      console.error("Error saving experience level:", error);
      toast.error("Failed to save preference");
      // Still allow local selection
      onSelect(selectedLevel);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            What's your experience level?
          </DialogTitle>
          <DialogDescription>
            Select your current career stage to see the most relevant job roles and opportunities for you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {experienceLevels.map((level) => {
            const Icon = level.icon;
            const isSelected = selectedLevel === level.value;

            return (
              <Card
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                  isSelected
                    ? `${level.borderColor} border-2 ${level.bgColor}`
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl", level.bgColor)}>
                    <Icon className={cn("w-6 h-6", level.color)} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{level.label}</h3>
                    <p className="text-muted-foreground text-sm">{level.description}</p>
                  </div>
                  {isSelected && (
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", level.bgColor)}>
                      <Check className={cn("w-4 h-4", level.color)} />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedLevel || isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? "Saving..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExperienceLevelSelector;
