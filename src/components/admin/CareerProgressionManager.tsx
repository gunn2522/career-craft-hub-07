import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Plus, 
  X, 
  Search, 
  TrendingUp, 
  ArrowRight, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Career {
  id: string;
  title: string;
  experience_level: string | null;
  is_active: boolean;
}

interface Progression {
  id: string;
  to_career_id: string;
  progression_type: string;
  skill_gap: string[];
  transition_time: string;
}

interface CareerProgressionManagerProps {
  careerId: string;
  careerTitle: string;
  careerLevel: string;
}

const experienceLevelLabels: Record<string, string> = {
  entry: "Entry",
  mid: "Mid",
  senior: "Senior",
};

const progressionTypes = [
  { value: "senior", label: "Senior Role (Vertical Growth)", icon: TrendingUp },
  { value: "lateral", label: "Lateral Move (Switch)", icon: ArrowRight },
  { value: "leadership", label: "Leadership Path", icon: TrendingUp },
  { value: "specialist", label: "Specialist Track", icon: ArrowRight },
];

export const CareerProgressionManager = ({
  careerId,
  careerTitle,
  careerLevel,
}: CareerProgressionManagerProps) => {
  const [allCareers, setAllCareers] = useState<Career[]>([]);
  const [existingProgressions, setExistingProgressions] = useState<Progression[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCareers, setSelectedCareers] = useState<Set<string>>(new Set());
  const [progressionType, setProgressionType] = useState<string>("senior");
  const [skillGap, setSkillGap] = useState("");
  const [transitionTime, setTransitionTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [careerId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all active careers except current one
      const { data: careersData } = await supabase
        .from("careers")
        .select("id, title, experience_level, is_active")
        .eq("is_active", true)
        .neq("id", careerId)
        .order("title");

      setAllCareers(careersData || []);

      // Fetch existing progressions
      const { data: progressionsData } = await supabase
        .from("career_progressions")
        .select("id, to_career_id, progression_type, skill_gap, transition_time")
        .eq("from_career_id", careerId);

      if (progressionsData) {
        setExistingProgressions(progressionsData as Progression[]);
        setSelectedCareers(new Set(progressionsData.map((p) => p.to_career_id)));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCareer = (career: Career) => {
    const newSelected = new Set(selectedCareers);
    if (newSelected.has(career.id)) {
      newSelected.delete(career.id);
    } else {
      // Prevent self-linking
      if (career.id === careerId) {
        toast.error("Cannot link a career to itself");
        return;
      }
      // Check for circular reference
      newSelected.add(career.id);
    }
    setSelectedCareers(newSelected);
  };

  const handleSaveProgressions = async () => {
    setIsSaving(true);
    try {
      // Get current progressions for comparison
      const currentIds = new Set(existingProgressions.map((p) => p.to_career_id));
      const newIds = selectedCareers;

      // Find progressions to add
      const toAdd = [...newIds].filter((id) => !currentIds.has(id));
      
      // Find progressions to remove
      const toRemove = [...currentIds].filter((id) => !newIds.has(id));

      // Delete removed progressions
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("career_progressions")
          .delete()
          .eq("from_career_id", careerId)
          .in("to_career_id", toRemove);

        if (deleteError) throw deleteError;
      }

      // Add new progressions
      if (toAdd.length > 0) {
        const skillsArray = skillGap.split(",").map((s) => s.trim()).filter(Boolean);
        const newProgressions = toAdd.map((to_career_id, index) => ({
          from_career_id: careerId,
          to_career_id,
          progression_type: progressionType,
          skill_gap: skillsArray.length > 0 ? skillsArray : null,
          transition_time: transitionTime || null,
          display_order: existingProgressions.length + index,
        }));

        const { error: insertError } = await supabase
          .from("career_progressions")
          .insert(newProgressions);

        if (insertError) throw insertError;
      }

      toast.success("Career progressions updated successfully");
      fetchData(); // Refresh
    } catch (error: any) {
      toast.error("Failed to save progressions: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveProgression = async (toCareerID: string) => {
    try {
      const { error } = await supabase
        .from("career_progressions")
        .delete()
        .eq("from_career_id", careerId)
        .eq("to_career_id", toCareerID);

      if (error) throw error;

      const newSelected = new Set(selectedCareers);
      newSelected.delete(toCareerID);
      setSelectedCareers(newSelected);
      setExistingProgressions(existingProgressions.filter((p) => p.to_career_id !== toCareerID));
      toast.success("Progression removed");
    } catch (error: any) {
      toast.error("Failed to remove: " + error.message);
    }
  };

  // Filter careers based on search
  const filteredCareers = allCareers.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group existing progressions
  const verticalProgressions = existingProgressions.filter((p) => 
    ["senior", "leadership"].includes(p.progression_type)
  );
  const lateralProgressions = existingProgressions.filter((p) => 
    ["lateral", "specialist"].includes(p.progression_type)
  );

  const getCareerById = (id: string) => allCareers.find((c) => c.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Career Graph & Progression Mapping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Progressions */}
          {existingProgressions.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Current Progressions from {careerTitle}</h4>
              
              {verticalProgressions.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    This role can grow into:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {verticalProgressions.map((p) => {
                      const career = getCareerById(p.to_career_id);
                      return (
                        <Badge
                          key={p.id}
                          variant="secondary"
                          className="pl-3 pr-1 py-1.5 flex items-center gap-2"
                        >
                          <TrendingUp className="w-3 h-3 text-amber-500" />
                          {career?.title || "Unknown"}
                          <span className="text-xs opacity-60">
                            ({experienceLevelLabels[career?.experience_level || "entry"]})
                          </span>
                          <button
                            onClick={() => handleRemoveProgression(p.to_career_id)}
                            className="ml-1 p-0.5 hover:bg-destructive/20 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {lateralProgressions.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Users can switch to:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lateralProgressions.map((p) => {
                      const career = getCareerById(p.to_career_id);
                      return (
                        <Badge
                          key={p.id}
                          variant="outline"
                          className="pl-3 pr-1 py-1.5 flex items-center gap-2"
                        >
                          <ArrowRight className="w-3 h-3 text-blue-500" />
                          {career?.title || "Unknown"}
                          <span className="text-xs opacity-60">
                            ({experienceLevelLabels[career?.experience_level || "entry"]})
                          </span>
                          <button
                            onClick={() => handleRemoveProgression(p.to_career_id)}
                            className="ml-1 p-0.5 hover:bg-destructive/20 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add New Progressions */}
          <div className="border-t pt-6 space-y-4">
            <h4 className="font-medium">Add Career Progressions</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Progression Type</Label>
                <Select value={progressionType} onValueChange={setProgressionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {progressionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Transition Time (optional)</Label>
                <Input
                  value={transitionTime}
                  onChange={(e) => setTransitionTime(e.target.value)}
                  placeholder="e.g., 1-2 years"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Skill Gap (comma-separated, optional)</Label>
                <Input
                  value={skillGap}
                  onChange={(e) => setSkillGap(e.target.value)}
                  placeholder="e.g., Leadership, Strategy, Team Management"
                />
              </div>
            </div>

            {/* Career Search & Selection */}
            <div>
              <Label>Select Target Careers</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search careers..."
                  className="pl-9"
                />
              </div>
              <ScrollArea className="h-48 mt-2 border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredCareers.map((career) => {
                    const isSelected = selectedCareers.has(career.id);
                    const isExisting = existingProgressions.some(
                      (p) => p.to_career_id === career.id
                    );
                    return (
                      <div
                        key={career.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-muted"
                        )}
                        onClick={() => !isExisting && handleToggleCareer(career)}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isExisting}
                        />
                        <span className={cn("flex-1", isExisting && "opacity-50")}>
                          {career.title}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {experienceLevelLabels[career.experience_level || "entry"]}
                        </Badge>
                        {isExisting && (
                          <span className="text-xs text-muted-foreground">
                            (already added)
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {filteredCareers.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No careers found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Validation Warning */}
            {selectedCareers.size > existingProgressions.length && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-sm">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>
                  {selectedCareers.size - existingProgressions.length} new progression(s) will be added
                </span>
              </div>
            )}

            <Button 
              onClick={handleSaveProgressions} 
              disabled={isSaving || selectedCareers.size === existingProgressions.length}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Save Progressions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerProgressionManager;
