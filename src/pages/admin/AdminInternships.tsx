import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2, MapPin, Clock } from "lucide-react";

interface Internship {
  id: string;
  title: string;
  company: string;
  description: string | null;
  location: string | null;
  stipend: string | null;
  duration: string | null;
  requirements: string[] | null;
  apply_url: string | null;
  deadline: string | null;
  is_active: boolean | null;
}

const AdminInternships = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    stipend: "",
    duration: "",
    requirements: "",
    apply_url: "",
    deadline: "",
    is_active: true,
  });

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const { data, error } = await supabase
        .from("internships")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInternships(data || []);
    } catch (error) {
      console.error("Error fetching internships:", error);
      toast.error("Failed to fetch internships");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.company) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const internshipData = {
        title: formData.title,
        company: formData.company,
        description: formData.description || null,
        location: formData.location || null,
        stipend: formData.stipend || null,
        duration: formData.duration || null,
        requirements: formData.requirements
          ? formData.requirements.split(",").map((r) => r.trim())
          : null,
        apply_url: formData.apply_url || null,
        deadline: formData.deadline || null,
        is_active: formData.is_active,
      };

      if (editingInternship) {
        const { error } = await supabase
          .from("internships")
          .update(internshipData)
          .eq("id", editingInternship.id);

        if (error) throw error;
        toast.success("Internship updated successfully");
      } else {
        const { error } = await supabase.from("internships").insert(internshipData);

        if (error) throw error;
        toast.success("Internship created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchInternships();
    } catch (error) {
      console.error("Error saving internship:", error);
      toast.error("Failed to save internship");
    }
  };

  const handleEdit = (internship: Internship) => {
    setEditingInternship(internship);
    setFormData({
      title: internship.title,
      company: internship.company,
      description: internship.description || "",
      location: internship.location || "",
      stipend: internship.stipend || "",
      duration: internship.duration || "",
      requirements: internship.requirements?.join(", ") || "",
      apply_url: internship.apply_url || "",
      deadline: internship.deadline ? internship.deadline.split("T")[0] : "",
      is_active: internship.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this internship?")) return;

    try {
      const { error } = await supabase.from("internships").delete().eq("id", id);

      if (error) throw error;
      toast.success("Internship deleted successfully");
      fetchInternships();
    } catch (error) {
      console.error("Error deleting internship:", error);
      toast.error("Failed to delete internship");
    }
  };

  const resetForm = () => {
    setEditingInternship(null);
    setFormData({
      title: "",
      company: "",
      description: "",
      location: "",
      stipend: "",
      duration: "",
      requirements: "",
      apply_url: "",
      deadline: "",
      is_active: true,
    });
  };

  return (
    <AdminLayout title="Manage Internships">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Post internship opportunities for students
        </p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Internship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInternship ? "Edit Internship" : "Add New Internship"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Software Developer Intern"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company *</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Google"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the internship role..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Bangalore / Remote"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stipend</label>
                  <Input
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    placeholder="e.g., ₹25,000/month"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 3 months"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Deadline</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Requirements (comma-separated)
                  </label>
                  <Input
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="e.g., React, Node.js, Currently pursuing B.Tech"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Apply URL</label>
                  <Input
                    type="url"
                    value={formData.apply_url}
                    onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <label className="text-sm font-medium">Active Listing</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient">
                  {editingInternship ? "Update" : "Create"} Internship
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
      ) : internships.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No internships posted yet</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post your first internship
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internships.map((internship) => (
            <Card key={internship.id} className={`glass-card ${!internship.is_active ? "opacity-60" : ""}`}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{internship.title}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    {internship.company}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(internship)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(internship.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  {internship.location && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded">
                      <MapPin className="w-3 h-3" />
                      {internship.location}
                    </span>
                  )}
                  {internship.duration && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded">
                      <Clock className="w-3 h-3" />
                      {internship.duration}
                    </span>
                  )}
                </div>
                {internship.stipend && (
                  <p className="text-sm font-medium text-primary">{internship.stipend}</p>
                )}
                {!internship.is_active && (
                  <span className="text-xs text-destructive">Inactive</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminInternships;
