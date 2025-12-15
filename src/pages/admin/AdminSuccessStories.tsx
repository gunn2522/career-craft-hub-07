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
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, Building2 } from "lucide-react";

interface SuccessStory {
  id: string;
  name: string;
  title: string;
  story: string | null;
  image_url: string | null;
  company: string | null;
  testimonial: string | null;
  is_featured: boolean | null;
  is_published: boolean | null;
}

const AdminSuccessStories = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    story: "",
    image_url: "",
    company: "",
    testimonial: "",
    is_featured: false,
    is_published: false,
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to fetch stories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.title) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const storyData = {
        name: formData.name,
        title: formData.title,
        story: formData.story || null,
        image_url: formData.image_url || null,
        company: formData.company || null,
        testimonial: formData.testimonial || null,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
      };

      if (editingStory) {
        const { error } = await supabase
          .from("success_stories")
          .update(storyData)
          .eq("id", editingStory.id);

        if (error) throw error;
        toast.success("Story updated successfully");
      } else {
        const { error } = await supabase.from("success_stories").insert(storyData);

        if (error) throw error;
        toast.success("Story created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchStories();
    } catch (error) {
      console.error("Error saving story:", error);
      toast.error("Failed to save story");
    }
  };

  const handleEdit = (story: SuccessStory) => {
    setEditingStory(story);
    setFormData({
      name: story.name,
      title: story.title,
      story: story.story || "",
      image_url: story.image_url || "",
      company: story.company || "",
      testimonial: story.testimonial || "",
      is_featured: story.is_featured || false,
      is_published: story.is_published || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      const { error } = await supabase.from("success_stories").delete().eq("id", id);

      if (error) throw error;
      toast.success("Story deleted successfully");
      fetchStories();
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error("Failed to delete story");
    }
  };

  const resetForm = () => {
    setEditingStory(null);
    setFormData({
      name: "",
      title: "",
      story: "",
      image_url: "",
      company: "",
      testimonial: "",
      is_featured: false,
      is_published: false,
    });
  };

  return (
    <AdminLayout title="Manage Success Stories">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Share inspiring student success stories
        </p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStory ? "Edit Story" : "Add New Success Story"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Rahul Sharma"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Title/Role *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Google"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <Input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Testimonial (Quote)</label>
                  <Textarea
                    value={formData.testimonial}
                    onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                    placeholder="A short inspiring quote from the student..."
                    rows={2}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Full Story</label>
                  <Textarea
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    placeholder="Their journey, challenges, and how they succeeded..."
                    rows={5}
                  />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                    />
                    <label className="text-sm font-medium">Publish</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <label className="text-sm font-medium">Featured</label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient">
                  {editingStory ? "Update" : "Create"} Story
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
      ) : stories.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No success stories added yet</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add your first story
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <Card key={story.id} className={`glass-card ${!story.is_published ? "opacity-60" : ""}`}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{story.name}</CardTitle>
                    {story.is_featured && (
                      <Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{story.title}</p>
                  {story.company && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Building2 className="w-3 h-3" />
                      {story.company}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {story.is_published ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(story)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(story.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {story.testimonial && (
                  <p className="text-sm text-muted-foreground italic line-clamp-3">
                    "{story.testimonial}"
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

export default AdminSuccessStories;
