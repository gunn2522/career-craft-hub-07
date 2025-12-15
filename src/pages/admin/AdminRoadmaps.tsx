import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Roadmap {
  id: string;
  title: string;
  description: string | null;
  career_id: string | null;
  category: string | null;
  difficulty: string | null;
  duration: string | null;
  steps: any;
}

interface Career {
  id: string;
  title: string;
}

const difficulties = ["beginner", "intermediate", "advanced"];

const AdminRoadmaps = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    career_id: "",
    category: "",
    difficulty: "beginner",
    duration: "",
    steps: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roadmapsRes, careersRes] = await Promise.all([
        supabase.from("roadmaps").select("*").order("created_at", { ascending: false }),
        supabase.from("careers").select("id, title").order("title"),
      ]);

      if (roadmapsRes.error) throw roadmapsRes.error;
      if (careersRes.error) throw careersRes.error;

      setRoadmaps(roadmapsRes.data || []);
      setCareers(careersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Please enter a title");
      return;
    }

    try {
      let stepsJson = [];
      if (formData.steps) {
        try {
          stepsJson = JSON.parse(formData.steps);
        } catch {
          // Parse as simple list
          stepsJson = formData.steps.split("\n").filter(s => s.trim()).map((step, i) => ({
            order: i + 1,
            title: step.trim(),
            completed: false
          }));
        }
      }

      const roadmapData = {
        title: formData.title,
        description: formData.description || null,
        career_id: formData.career_id || null,
        category: formData.category || null,
        difficulty: formData.difficulty,
        duration: formData.duration || null,
        steps: stepsJson,
      };

      if (editingRoadmap) {
        const { error } = await supabase
          .from("roadmaps")
          .update(roadmapData)
          .eq("id", editingRoadmap.id);

        if (error) throw error;
        toast.success("Roadmap updated successfully");
      } else {
        const { error } = await supabase.from("roadmaps").insert(roadmapData);

        if (error) throw error;
        toast.success("Roadmap created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving roadmap:", error);
      toast.error("Failed to save roadmap");
    }
  };

  const handleEdit = (roadmap: Roadmap) => {
    setEditingRoadmap(roadmap);
    const stepsText = Array.isArray(roadmap.steps)
      ? roadmap.steps.map((s: any) => s.title || s).join("\n")
      : "";
    setFormData({
      title: roadmap.title,
      description: roadmap.description || "",
      career_id: roadmap.career_id || "",
      category: roadmap.category || "",
      difficulty: roadmap.difficulty || "beginner",
      duration: roadmap.duration || "",
      steps: stepsText,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this roadmap?")) return;

    try {
      const { error } = await supabase.from("roadmaps").delete().eq("id", id);

      if (error) throw error;
      toast.success("Roadmap deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting roadmap:", error);
      toast.error("Failed to delete roadmap");
    }
  };

  const resetForm = () => {
    setEditingRoadmap(null);
    setFormData({
      title: "",
      description: "",
      career_id: "",
      category: "",
      difficulty: "beginner",
      duration: "",
      steps: "",
    });
  };

  return (
    <AdminLayout title="Manage Roadmaps">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Create learning roadmaps for career paths
        </p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Roadmap
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRoadmap ? "Edit Roadmap" : "Add New Roadmap"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Full-Stack Developer Roadmap"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this roadmap..."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Related Career</label>
                  <Select
                    value={formData.career_id}
                    onValueChange={(value) => setFormData({ ...formData, career_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select career (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {careers.map((career) => (
                        <SelectItem key={career.id} value={career.id}>
                          {career.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Web Development"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((diff) => (
                        <SelectItem key={diff} value={diff}>
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 6 months"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Steps (one per line)
                  </label>
                  <Textarea
                    value={formData.steps}
                    onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                    placeholder="Learn HTML & CSS&#10;Master JavaScript&#10;Learn React&#10;Study Node.js&#10;Build Projects"
                    rows={6}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient">
                  {editingRoadmap ? "Update" : "Create"} Roadmap
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : roadmaps.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No roadmaps created yet</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first roadmap
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmaps.map((roadmap) => (
            <Card key={roadmap.id} className="glass-card">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    {roadmap.difficulty && (
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                        {roadmap.difficulty}
                      </span>
                    )}
                    {roadmap.duration && (
                      <span className="text-xs text-muted-foreground">
                        {roadmap.duration}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(roadmap)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(roadmap.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {roadmap.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {roadmap.description}
                  </p>
                )}
                {Array.isArray(roadmap.steps) && roadmap.steps.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {roadmap.steps.length} steps
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRoadmaps;
