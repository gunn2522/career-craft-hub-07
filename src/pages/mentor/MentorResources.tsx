import { useState } from "react";
import { MentorLayout } from "@/components/mentor/MentorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Plus, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";

const resourceTypes = ["Video", "Article", "Course", "Book", "Tool", "Documentation", "Tutorial"];

const MentorResources = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoadmapSteps, setSelectedRoadmapSteps] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Video",
    url: "",
    roadmap_id: "",
    step_index: "",
  });

  // Fetch mentor's own submitted resources
  const { data: resources, isLoading } = useQuery({
    queryKey: ["mentor-resources", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("added_by", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch roadmaps for selection
  const { data: roadmaps } = useQuery({
    queryKey: ["roadmaps-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("id, title, steps")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("resources").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-resources"] });
      toast({ title: "Submitted!", description: "Your resource has been submitted for admin approval." });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleRoadmapChange = (roadmapId: string) => {
    setFormData({ ...formData, roadmap_id: roadmapId, step_index: "" });
    const roadmap = roadmaps?.find((r: any) => r.id === roadmapId);
    setSelectedRoadmapSteps(Array.isArray(roadmap?.steps) ? roadmap.steps : []);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", type: "Video", url: "", roadmap_id: "", step_index: "" });
    setSelectedRoadmapSteps([]);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url || !formData.roadmap_id || formData.step_index === "") {
      toast({ title: "Missing fields", description: "Please fill in all required fields including roadmap and milestone.", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      title: formData.title,
      description: formData.description || null,
      type: formData.type,
      url: formData.url,
      roadmap_id: formData.roadmap_id,
      step_index: parseInt(formData.step_index),
      added_by: user?.id,
      is_approved: false,
    });
  };

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    }
    return <Badge variant="outline" className="text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  const getRoadmapTitle = (roadmapId: string | null) => {
    if (!roadmapId) return "—";
    return roadmaps?.find((r: any) => r.id === roadmapId)?.title || "—";
  };

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Milestone Resources</h1>
            <p className="text-muted-foreground mt-1">
              Submit YouTube videos, articles, and resources for roadmap milestones. Admin approval required.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Resource for Approval</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., React Hooks Crash Course"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the resource..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>URL *</Label>
                    <Input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Roadmap *</Label>
                    <Select value={formData.roadmap_id} onValueChange={handleRoadmapChange}>
                      <SelectTrigger><SelectValue placeholder="Select roadmap" /></SelectTrigger>
                      <SelectContent>
                        {roadmaps?.map((r: any) => (
                          <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Milestone *</Label>
                    <Select
                      value={formData.step_index}
                      onValueChange={(value) => setFormData({ ...formData, step_index: value })}
                      disabled={selectedRoadmapSteps.length === 0}
                    >
                      <SelectTrigger><SelectValue placeholder="Select milestone" /></SelectTrigger>
                      <SelectContent>
                        {selectedRoadmapSteps.map((step: any, idx: number) => (
                          <SelectItem key={idx} value={String(idx)}>
                            Step {idx + 1}: {step.title || step}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Submitting..." : "Submit for Approval"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading your resources...</div>
        ) : !resources || resources.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">You haven't submitted any resources yet.</p>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Submit your first resource
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource: any) => (
              <Card key={resource.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    {getStatusBadge(resource.is_approved)}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="secondary" className="text-xs">{resource.type}</Badge>
                    <Badge variant="outline" className="text-xs">{getRoadmapTitle(resource.roadmap_id)}</Badge>
                    {resource.step_index !== null && (
                      <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                        Step {resource.step_index + 1}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {resource.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{resource.description}</p>
                  )}
                  {resource.url && (
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> View Resource
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MentorLayout>
  );
};

export default MentorResources;
