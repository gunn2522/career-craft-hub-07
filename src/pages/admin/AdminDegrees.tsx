import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, GraduationCap, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  domain_id: string;
}

interface Roadmap {
  id: string;
  title: string;
}

interface Degree {
  id: string;
  name: string;
  description: string | null;
  duration: string | null;
  category_id: string | null;
  entrance_exams: string[];
  eligibility_rules: Record<string, unknown>;
  required_subjects: string[];
  mapped_roadmap_id: string | null;
  is_active: boolean;
  display_order: number;
  category_name?: string;
  roadmap_title?: string;
}

const AdminDegrees = () => {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDegree, setEditingDegree] = useState<Degree | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Degree | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    category_id: "",
    entrance_exams: "",
    required_subjects: "",
    mapped_roadmap_id: "",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [degreesRes, categoriesRes, roadmapsRes] = await Promise.all([
        supabase.from("degrees").select("*").order("display_order"),
        supabase.from("career_categories").select("id, name, domain_id").eq("is_active", true),
        supabase.from("roadmaps").select("id, title").order("title"),
      ]);

      if (degreesRes.error) throw degreesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (roadmapsRes.error) throw roadmapsRes.error;

      setCategories(categoriesRes.data || []);
      setRoadmaps(roadmapsRes.data || []);

      // Map degrees with category names and roadmap titles
      const degreesWithNames = (degreesRes.data || []).map((degree: any) => {
        const category = categoriesRes.data?.find(c => c.id === degree.category_id);
        const roadmap = roadmapsRes.data?.find(r => r.id === degree.mapped_roadmap_id);
        return {
          ...degree,
          category_name: category?.name || "Unlinked",
          roadmap_title: roadmap?.title || "Not mapped",
        };
      });

      setDegrees(degreesWithNames);
    } catch (error: any) {
      toast.error("Failed to fetch data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Degree name is required");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        duration: formData.duration.trim() || null,
        category_id: formData.category_id || null,
        entrance_exams: formData.entrance_exams.split(",").map(s => s.trim()).filter(Boolean),
        required_subjects: formData.required_subjects.split(",").map(s => s.trim()).filter(Boolean),
        mapped_roadmap_id: formData.mapped_roadmap_id || null,
        is_active: formData.is_active,
        display_order: formData.display_order,
      };

      if (editingDegree) {
        const { error } = await supabase
          .from("degrees")
          .update(payload)
          .eq("id", editingDegree.id);
        if (error) throw error;
        toast.success("Degree updated successfully");
      } else {
        const { error } = await supabase.from("degrees").insert([payload]);
        if (error) throw error;
        toast.success("Degree created successfully");
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error("Failed to save degree: " + error.message);
    }
  };

  const handleEdit = (degree: Degree) => {
    setEditingDegree(degree);
    setFormData({
      name: degree.name,
      description: degree.description || "",
      duration: degree.duration || "",
      category_id: degree.category_id || "",
      entrance_exams: degree.entrance_exams?.join(", ") || "",
      required_subjects: degree.required_subjects?.join(", ") || "",
      mapped_roadmap_id: degree.mapped_roadmap_id || "",
      is_active: degree.is_active,
      display_order: degree.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const { error } = await supabase
        .from("degrees")
        .delete()
        .eq("id", deleteConfirm.id);
      if (error) throw error;
      toast.success("Degree deleted successfully");
      setDeleteConfirm(null);
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete degree: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: "",
      category_id: "",
      entrance_exams: "",
      required_subjects: "",
      mapped_roadmap_id: "",
      is_active: true,
      display_order: degrees.length,
    });
    setEditingDegree(null);
    setIsDialogOpen(false);
  };

  return (
    <AdminLayout title="Manage Degrees (School Student Flow)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-muted-foreground">
            Manage degrees for the School Student career exploration flow (Stream → Category → Degree → Job Role)
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Degree
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingDegree ? "Edit Degree" : "Add New Degree"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Degree Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., B.Tech Computer Science"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this degree"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 4 years"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category (Stream → Category)</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mapped College Roadmap</Label>
                  <Select
                    value={formData.mapped_roadmap_id}
                    onValueChange={(value) => setFormData({ ...formData, mapped_roadmap_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Link to roadmap" />
                    </SelectTrigger>
                    <SelectContent>
                      {roadmaps.map((rm) => (
                        <SelectItem key={rm.id} value={rm.id}>
                          {rm.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entrance_exams">Entrance Exams (comma-separated)</Label>
                  <Input
                    id="entrance_exams"
                    value={formData.entrance_exams}
                    onChange={(e) => setFormData({ ...formData, entrance_exams: e.target.value })}
                    placeholder="e.g., JEE Main, JEE Advanced, BITSAT"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="required_subjects">Required Subjects (comma-separated)</Label>
                  <Input
                    id="required_subjects"
                    value={formData.required_subjects}
                    onChange={(e) => setFormData({ ...formData, required_subjects: e.target.value })}
                    placeholder="e.g., Physics, Chemistry, Mathematics"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingDegree ? "Update Degree" : "Create Degree"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : degrees.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No degrees found</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Degree
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {degrees.map((degree) => (
              <Card key={degree.id} className={!degree.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{degree.name}</CardTitle>
                        {degree.duration && (
                          <span className="text-xs text-muted-foreground">{degree.duration}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(degree)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(degree)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {degree.description || "No description"}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary">{degree.category_name}</Badge>
                    </div>
                    {degree.mapped_roadmap_id && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <LinkIcon className="w-3 h-3" />
                        <span>Linked: {degree.roadmap_title}</span>
                      </div>
                    )}
                    {degree.entrance_exams?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {degree.entrance_exams.slice(0, 3).map((exam) => (
                          <Badge key={exam} variant="outline" className="text-xs">
                            {exam}
                          </Badge>
                        ))}
                        {degree.entrance_exams.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{degree.entrance_exams.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Degree?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete "{deleteConfirm?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminDegrees;