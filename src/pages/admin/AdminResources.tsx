import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, Star, CheckCircle, XCircle, Clock } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  category: string | null;
  roadmap_id: string | null;
  is_premium: boolean | null;
  step_index: number | null;
  added_by: string | null;
  is_approved: boolean;
}

interface Roadmap {
  id: string;
  title: string;
  steps: any;
}

const resourceTypes = ["Video", "Article", "Course", "Book", "Tool", "Documentation", "Tutorial", "Other"];

const AdminResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedRoadmapSteps, setSelectedRoadmapSteps] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    url: "",
    category: "",
    roadmap_id: "",
    step_index: "",
    is_premium: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resourcesRes, roadmapsRes] = await Promise.all([
        supabase.from("resources").select("*").order("created_at", { ascending: false }),
        supabase.from("roadmaps").select("id, title, steps").order("title"),
      ]);

      if (resourcesRes.error) throw resourcesRes.error;
      if (roadmapsRes.error) throw roadmapsRes.error;

      const allResources = resourcesRes.data || [];
      setResources(allResources.filter((r: any) => r.is_approved));
      setPendingResources(allResources.filter((r: any) => !r.is_approved));
      setRoadmaps(roadmapsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoadmapChange = (roadmapId: string) => {
    setFormData({ ...formData, roadmap_id: roadmapId, step_index: "" });
    const roadmap = roadmaps.find((r) => r.id === roadmapId);
    setSelectedRoadmapSteps(Array.isArray(roadmap?.steps) ? roadmap.steps : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.type) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const resourceData: any = {
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        url: formData.url || null,
        category: formData.category || null,
        roadmap_id: formData.roadmap_id || null,
        step_index: formData.step_index !== "" ? parseInt(formData.step_index) : null,
        is_premium: formData.is_premium,
        is_approved: true,
      };

      if (editingResource) {
        const { error } = await supabase
          .from("resources")
          .update(resourceData)
          .eq("id", editingResource.id);
        if (error) throw error;
        toast.success("Resource updated successfully");
      } else {
        const { error } = await supabase.from("resources").insert(resourceData);
        if (error) throw error;
        toast.success("Resource created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving resource:", error);
      toast.error("Failed to save resource");
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    const roadmap = roadmaps.find((r) => r.id === resource.roadmap_id);
    setSelectedRoadmapSteps(Array.isArray(roadmap?.steps) ? roadmap.steps : []);
    setFormData({
      title: resource.title,
      description: resource.description || "",
      type: resource.type,
      url: resource.url || "",
      category: resource.category || "",
      roadmap_id: resource.roadmap_id || "",
      step_index: resource.step_index !== null ? String(resource.step_index) : "",
      is_premium: resource.is_premium || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
      toast.success("Resource deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("resources")
        .update({ is_approved: true })
        .eq("id", id);
      if (error) throw error;
      toast.success("Resource approved");
      fetchData();
    } catch (error) {
      toast.error("Failed to approve resource");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject and delete this resource submission?")) return;
    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
      toast.success("Resource rejected and removed");
      fetchData();
    } catch (error) {
      toast.error("Failed to reject resource");
    }
  };

  const resetForm = () => {
    setEditingResource(null);
    setSelectedRoadmapSteps([]);
    setFormData({
      title: "",
      description: "",
      type: "",
      url: "",
      category: "",
      roadmap_id: "",
      step_index: "",
      is_premium: false,
    });
  };

  const getRoadmapTitle = (roadmapId: string | null) => {
    if (!roadmapId) return null;
    return roadmaps.find((r) => r.id === roadmapId)?.title || null;
  };

  const getStepTitle = (resource: Resource) => {
    if (resource.step_index === null || !resource.roadmap_id) return null;
    const roadmap = roadmaps.find((r) => r.id === resource.roadmap_id);
    const steps = Array.isArray(roadmap?.steps) ? roadmap.steps : [];
    return steps[resource.step_index]?.title || `Step ${resource.step_index + 1}`;
  };

  const ResourceCard = ({ resource, showApproval = false }: { resource: Resource; showApproval?: boolean }) => (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-lg">{resource.title}</CardTitle>
            {resource.is_premium && <Star className="w-4 h-4 text-primary fill-primary" />}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge variant="secondary" className="text-xs">{resource.type}</Badge>
            {getRoadmapTitle(resource.roadmap_id) && (
              <Badge variant="outline" className="text-xs">{getRoadmapTitle(resource.roadmap_id)}</Badge>
            )}
            {getStepTitle(resource) && (
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                Milestone: {getStepTitle(resource)}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {showApproval ? (
            <>
              <Button size="icon" variant="ghost" className="text-green-500" onClick={() => handleApprove(resource.id)}>
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleReject(resource.id)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="icon" variant="ghost" onClick={() => handleEdit(resource)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(resource.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{resource.description}</p>
        )}
        {resource.url && (
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <ExternalLink className="w-3 h-3" />
            View Resource
          </a>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout title="Manage Resources">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Add learning resources per roadmap milestone. Mentor submissions require approval.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingResource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., React Crash Course - YouTube"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe this resource..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Type *</label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Frontend"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">URL *</label>
                    <Input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Roadmap</label>
                    <Select value={formData.roadmap_id} onValueChange={handleRoadmapChange}>
                      <SelectTrigger><SelectValue placeholder="Select roadmap" /></SelectTrigger>
                      <SelectContent>
                        {roadmaps.map((roadmap) => (
                          <SelectItem key={roadmap.id} value={roadmap.id}>{roadmap.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Milestone (Step)</label>
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
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.is_premium}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                    />
                    <label className="text-sm font-medium">Premium Resource</label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="gradient">{editingResource ? "Update" : "Create"} Resource</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="approved">
          <TabsList>
            <TabsTrigger value="approved">Approved ({resources.length})</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending Approval
              {pendingResources.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                  {pendingResources.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approved" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="glass-card animate-pulse">
                    <CardHeader><div className="h-6 bg-muted rounded w-3/4" /></CardHeader>
                    <CardContent><div className="h-4 bg-muted rounded w-1/2" /></CardContent>
                  </Card>
                ))}
              </div>
            ) : resources.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">No resources added yet</p>
                  <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add your first resource
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {pendingResources.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending resource submissions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} showApproval />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminResources;
