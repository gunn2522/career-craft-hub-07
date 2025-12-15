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

interface Career {
  id: string;
  title: string;
  description: string | null;
  category: string;
  growth: string | null;
  salary: string | null;
  demand: string | null;
  skills: string[] | null;
}

const categories = [
  "Technology",
  "Business",
  "Healthcare",
  "Creative",
  "Engineering",
  "Science",
  "Education",
  "Finance",
  "Marketing",
  "Other",
];

const AdminCareers = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    growth: "",
    salary: "",
    demand: "",
    skills: "",
  });

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const { data, error } = await supabase
        .from("careers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCareers(data || []);
    } catch (error) {
      console.error("Error fetching careers:", error);
      toast.error("Failed to fetch careers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const careerData = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        growth: formData.growth || null,
        salary: formData.salary || null,
        demand: formData.demand || null,
        skills: formData.skills ? formData.skills.split(",").map((s) => s.trim()) : null,
      };

      if (editingCareer) {
        const { error } = await supabase
          .from("careers")
          .update(careerData)
          .eq("id", editingCareer.id);

        if (error) throw error;
        toast.success("Career updated successfully");
      } else {
        const { error } = await supabase.from("careers").insert(careerData);

        if (error) throw error;
        toast.success("Career created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCareers();
    } catch (error) {
      console.error("Error saving career:", error);
      toast.error("Failed to save career");
    }
  };

  const handleEdit = (career: Career) => {
    setEditingCareer(career);
    setFormData({
      title: career.title,
      description: career.description || "",
      category: career.category,
      growth: career.growth || "",
      salary: career.salary || "",
      demand: career.demand || "",
      skills: career.skills?.join(", ") || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this career?")) return;

    try {
      const { error } = await supabase.from("careers").delete().eq("id", id);

      if (error) throw error;
      toast.success("Career deleted successfully");
      fetchCareers();
    } catch (error) {
      console.error("Error deleting career:", error);
      toast.error("Failed to delete career");
    }
  };

  const resetForm = () => {
    setEditingCareer(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      growth: "",
      salary: "",
      demand: "",
      skills: "",
    });
  };

  return (
    <AdminLayout title="Manage Careers">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Add and manage career paths for students
        </p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Career
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCareer ? "Edit Career" : "Add New Career"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Software Developer"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this career path..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Growth</label>
                  <Input
                    value={formData.growth}
                    onChange={(e) => setFormData({ ...formData, growth: e.target.value })}
                    placeholder="e.g., +25%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Salary Range</label>
                  <Input
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g., ₹6-25 LPA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Demand</label>
                  <Select
                    value={formData.demand}
                    onValueChange={(value) => setFormData({ ...formData, demand: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select demand level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
                  <Input
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient">
                  {editingCareer ? "Update" : "Create"} Career
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
      ) : careers.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No careers added yet</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add your first career
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careers.map((career) => (
            <Card key={career.id} className="glass-card">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{career.title}</CardTitle>
                  <span className="text-xs text-primary font-medium">{career.category}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(career)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(career.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {career.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {career.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-xs">
                  {career.growth && (
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded">
                      {career.growth}
                    </span>
                  )}
                  {career.salary && (
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded">
                      {career.salary}
                    </span>
                  )}
                  {career.demand && (
                    <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded">
                      {career.demand} Demand
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCareers;
