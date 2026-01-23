import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Loader2, Image, Star, GripVertical, Calendar } from "lucide-react";

interface EventGalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  event_date: string | null;
  is_featured: boolean;
  is_visible: boolean;
  display_order: number;
  created_at: string;
}

const AdminEventGallery = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EventGalleryItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    event_date: "",
    is_featured: false,
    is_visible: true,
    display_order: 0,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ["admin-event-gallery"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("event_gallery")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as EventGalleryItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<EventGalleryItem, "id" | "created_at">) => {
      const { error } = await (supabase as any)
        .from("event_gallery")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-event-gallery"] });
      toast({ title: "Event photo added successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to add event photo", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<EventGalleryItem>) => {
      const { error } = await (supabase as any)
        .from("event_gallery")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-event-gallery"] });
      toast({ title: "Event photo updated successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update event photo", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("event_gallery")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-event-gallery"] });
      toast({ title: "Event photo deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete event photo", variant: "destructive" });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("event-gallery")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("event-gallery")
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: urlData.publicUrl });
      toast({ title: "Image uploaded successfully" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      event_date: "",
      is_featured: false,
      is_visible: true,
      display_order: 0,
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: EventGalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      image_url: item.image_url,
      event_date: item.event_date || "",
      is_featured: item.is_featured,
      is_visible: item.is_visible,
      display_order: item.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) {
      toast({ title: "Title and image are required", variant: "destructive" });
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleFeatured = (item: EventGalleryItem) => {
    updateMutation.mutate({ id: item.id, is_featured: !item.is_featured });
  };

  const toggleVisibility = (item: EventGalleryItem) => {
    updateMutation.mutate({ id: item.id, is_visible: !item.is_visible });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Event Gallery">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Event Gallery">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          Manage event photos displayed on the homepage gallery section
        </p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Photo" : "Add New Photo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title or caption"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the event"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Event Date</Label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Image *</Label>
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                )}
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
                </div>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Or paste image URL directly"
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_visible}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                  />
                  <Label>Visible</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingItem ? "Update" : "Add Photo"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {galleryItems && galleryItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {galleryItems.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${!item.is_visible ? 'opacity-50' : ''}`}>
              <div className="relative">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                {item.is_featured && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => deleteMutation.mutate(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-1 truncate">{item.title}</h3>
                {item.description && (
                  <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs">
                  {item.event_date && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.event_date).toLocaleDateString()}
                    </span>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFeatured(item)}
                      className={`p-1 rounded ${item.is_featured ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                      title="Toggle featured"
                    >
                      <Star className={`w-4 h-4 ${item.is_featured ? 'fill-current' : ''}`} />
                    </button>
                    <Switch
                      checked={item.is_visible}
                      onCheckedChange={() => toggleVisibility(item)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Image className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Photos Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first event photo to showcase on the homepage
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Photo
            </Button>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default AdminEventGallery;
