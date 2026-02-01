import { useState } from "react";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Plus, GripVertical, Edit2, Trash2, AlertCircle,
  Lightbulb, HelpCircle, ListOrdered
} from "lucide-react";

interface InterviewStage {
  id: string;
  stage_order: number;
  stage_name: string;
  description: string | null;
  tips: string[] | null;
  common_questions: string[] | null;
  duration: string | null;
  created_at: string;
}

const PartnerInterviewProcessPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [editingStage, setEditingStage] = useState<InterviewStage | null>(null);

  // Form state
  const [stageName, setStageName] = useState("");
  const [description, setDescription] = useState("");
  const [tips, setTips] = useState("");
  const [commonQuestions, setCommonQuestions] = useState("");
  const [duration, setDuration] = useState("");

  // Fetch partner profile
  const { data: partnerProfile } = useQuery({
    queryKey: ["partner-profile", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partner_profiles")
        .select("id, verification_status, company_name")
        .eq("user_id", user?.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user
  });

  // Fetch interview stages
  const { data: stages, isLoading } = useQuery({
    queryKey: ["partner-interview-stages", partnerProfile?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("partner_interview_processes")
        .select("*")
        .eq("partner_id", partnerProfile?.id)
        .order("stage_order", { ascending: true });
      if (error) throw error;
      return data as InterviewStage[];
    },
    enabled: !!partnerProfile?.id
  });

  const resetForm = () => {
    setStageName("");
    setDescription("");
    setTips("");
    setCommonQuestions("");
    setDuration("");
  };

  const openEditDialog = (stage: InterviewStage) => {
    setEditingStage(stage);
    setStageName(stage.stage_name);
    setDescription(stage.description || "");
    setTips(stage.tips?.join("\n") || "");
    setCommonQuestions(stage.common_questions?.join("\n") || "");
    setDuration(stage.duration || "");
  };

  const getNextOrder = () => {
    if (!stages || stages.length === 0) return 1;
    return Math.max(...stages.map(s => s.stage_order)) + 1;
  };

  const createStageMutation = useMutation({
    mutationFn: async () => {
      if (!stageName) throw new Error("Stage name is required");

      const { error } = await (supabase as any).from("partner_interview_processes").insert({
        partner_id: partnerProfile?.id,
        stage_order: getNextOrder(),
        stage_name: stageName,
        description: description || null,
        tips: tips ? tips.split("\n").filter(Boolean) : null,
        common_questions: commonQuestions ? commonQuestions.split("\n").filter(Boolean) : null,
        duration: duration || null
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Interview stage added");
      queryClient.invalidateQueries({ queryKey: ["partner-interview-stages"] });
      resetForm();
      setCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create stage");
    }
  });

  const updateStageMutation = useMutation({
    mutationFn: async () => {
      if (!editingStage) return;

      const { error } = await (supabase as any)
        .from("partner_interview_processes")
        .update({
          stage_name: stageName,
          description: description || null,
          tips: tips ? tips.split("\n").filter(Boolean) : null,
          common_questions: commonQuestions ? commonQuestions.split("\n").filter(Boolean) : null,
          duration: duration || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingStage.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Stage updated");
      queryClient.invalidateQueries({ queryKey: ["partner-interview-stages"] });
      resetForm();
      setEditingStage(null);
    },
    onError: () => {
      toast.error("Failed to update stage");
    }
  });

  const deleteStageMutation = useMutation({
    mutationFn: async (stageId: string) => {
      const { error } = await (supabase as any)
        .from("partner_interview_processes")
        .delete()
        .eq("id", stageId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Stage deleted");
      queryClient.invalidateQueries({ queryKey: ["partner-interview-stages"] });
    },
    onError: () => {
      toast.error("Failed to delete stage");
    }
  });

  const reorderStageMutation = useMutation({
    mutationFn: async ({ stageId, newOrder }: { stageId: string; newOrder: number }) => {
      const { error } = await (supabase as any)
        .from("partner_interview_processes")
        .update({ stage_order: newOrder, updated_at: new Date().toISOString() })
        .eq("id", stageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-interview-stages"] });
    }
  });

  const moveStage = (stage: InterviewStage, direction: "up" | "down") => {
    if (!stages) return;
    const currentIndex = stages.findIndex(s => s.id === stage.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (swapIndex < 0 || swapIndex >= stages.length) return;
    
    const swapStage = stages[swapIndex];
    reorderStageMutation.mutate({ stageId: stage.id, newOrder: swapStage.stage_order });
    reorderStageMutation.mutate({ stageId: swapStage.id, newOrder: stage.stage_order });
  };

  const isVerified = partnerProfile?.verification_status === "verified";

  if (!isVerified) {
    return (
      <PartnerLayout title="Interview Process">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Verification Required</h3>
            <p className="text-muted-foreground mb-4">
              Complete verification to manage interview process
            </p>
            <Button asChild>
              <a href="/partner-dashboard/profile">Complete Profile</a>
            </Button>
          </CardContent>
        </Card>
      </PartnerLayout>
    );
  }

  const StageForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Stage Name *</Label>
        <Input 
          value={stageName} 
          onChange={(e) => setStageName(e.target.value)} 
          placeholder="e.g., Technical Interview" 
        />
      </div>

      <div className="space-y-2">
        <Label>Duration</Label>
        <Input 
          value={duration} 
          onChange={(e) => setDuration(e.target.value)} 
          placeholder="e.g., 45-60 minutes" 
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Describe what happens in this stage..." 
          rows={3} 
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Tips for Candidates (one per line)
        </Label>
        <Textarea 
          value={tips} 
          onChange={(e) => setTips(e.target.value)} 
          placeholder="Practice coding on a whiteboard&#10;Be ready to explain your thought process&#10;Ask clarifying questions" 
          rows={4} 
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Common Questions (one per line)
        </Label>
        <Textarea 
          value={commonQuestions} 
          onChange={(e) => setCommonQuestions(e.target.value)} 
          placeholder="What's your greatest strength?&#10;Describe a challenging project&#10;Where do you see yourself in 5 years?" 
          rows={4} 
        />
      </div>
    </div>
  );

  return (
    <PartnerLayout title="Interview Process">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Interview Process</h2>
            <p className="text-muted-foreground">
              Define your hiring stages and help candidates prepare
            </p>
          </div>
          <Button onClick={() => setCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Stage
          </Button>
        </div>

        {/* Info Banner */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <p className="text-sm">
              <strong>Tip:</strong> A well-documented interview process helps candidates prepare 
              better and improves the quality of applications you receive.
            </p>
          </CardContent>
        </Card>

        {/* Stages List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : stages?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ListOrdered className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Interview Stages</h3>
              <p className="text-muted-foreground mb-4">
                Add your interview stages to help candidates understand your hiring process
              </p>
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Stage
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {stages?.map((stage, index) => (
              <Card key={stage.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === 0}
                        onClick={() => moveStage(stage, "up")}
                      >
                        ↑
                      </Button>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {stage.stage_order}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === stages.length - 1}
                        onClick={() => moveStage(stage, "down")}
                      >
                        ↓
                      </Button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-lg">{stage.stage_name}</h3>
                        {stage.duration && (
                          <Badge variant="outline">{stage.duration}</Badge>
                        )}
                      </div>

                      {stage.description && (
                        <p className="text-muted-foreground mb-4">{stage.description}</p>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        {stage.tips && stage.tips.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              Tips for Candidates
                            </h4>
                            <ul className="space-y-1">
                              {stage.tips.map((tip, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {stage.common_questions && stage.common_questions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                              <HelpCircle className="h-4 w-4 text-blue-500" />
                              Common Questions
                            </h4>
                            <ul className="space-y-1">
                              {stage.common_questions.map((q, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                                  {q}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(stage)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this stage?")) {
                            deleteStageMutation.mutate(stage.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Interview Stage</DialogTitle>
            </DialogHeader>
            <StageForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setCreateDialog(false); }}>
                Cancel
              </Button>
              <Button
                onClick={() => createStageMutation.mutate()}
                disabled={createStageMutation.isPending}
              >
                Add Stage
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingStage} onOpenChange={(open) => !open && setEditingStage(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Interview Stage</DialogTitle>
            </DialogHeader>
            <StageForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setEditingStage(null); }}>
                Cancel
              </Button>
              <Button
                onClick={() => updateStageMutation.mutate()}
                disabled={updateStageMutation.isPending}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PartnerLayout>
  );
};

export default PartnerInterviewProcessPage;
