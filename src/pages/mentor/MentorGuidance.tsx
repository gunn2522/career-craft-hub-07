import { useState } from "react";
import { MentorLayout } from "@/components/mentor/MentorLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Edit, Trash2, Calendar, Eye, EyeOff, Heart, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface DailyGuidance {
  id: string;
  title: string;
  content: string | null;
  guidance_type: string;
  target_audience: string;
  scheduled_date: string | null;
  is_published: boolean;
  likes_count: number;
  created_at: string;
}

const MentorGuidance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuidance, setEditingGuidance] = useState<DailyGuidance | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    guidance_type: "tip",
    target_audience: "all",
    scheduled_date: "",
    is_published: true,
  });

  // Fetch mentor profile
  const { data: mentorProfile } = useQuery({
    queryKey: ["mentor-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select("id")
        .eq("user_id", user?.id || "")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch guidance
  const { data: guidance, isLoading } = useQuery({
    queryKey: ["mentor-guidance", mentorProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_daily_guidance")
        .select("*")
        .eq("mentor_id", mentorProfile?.id || "")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DailyGuidance[];
    },
    enabled: !!mentorProfile?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("mentor_daily_guidance").insert({
        mentor_id: mentorProfile?.id,
        title: data.title,
        content: data.content || null,
        guidance_type: data.guidance_type,
        target_audience: data.target_audience,
        scheduled_date: data.scheduled_date || null,
        is_published: data.is_published,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-guidance"] });
      toast.success("Guidance created successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to create guidance"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { error } = await supabase
        .from("mentor_daily_guidance")
        .update({
          title: data.title,
          content: data.content || null,
          guidance_type: data.guidance_type,
          target_audience: data.target_audience,
          scheduled_date: data.scheduled_date || null,
          is_published: data.is_published,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-guidance"] });
      toast.success("Guidance updated successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to update guidance"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mentor_daily_guidance").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-guidance"] });
      toast.success("Guidance deleted successfully");
    },
    onError: () => toast.error("Failed to delete guidance"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      guidance_type: "tip",
      target_audience: "all",
      scheduled_date: "",
      is_published: true,
    });
    setEditingGuidance(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: DailyGuidance) => {
    setEditingGuidance(item);
    setFormData({
      title: item.title,
      content: item.content || "",
      guidance_type: item.guidance_type,
      target_audience: item.target_audience,
      scheduled_date: item.scheduled_date || "",
      is_published: item.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuidance) {
      updateMutation.mutate({ ...formData, id: editingGuidance.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task":
        return "📋";
      case "tip":
        return "💡";
      case "challenge":
        return "🎯";
      case "resource":
        return "📚";
      default:
        return "📝";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "task":
        return <Badge variant="default">Task</Badge>;
      case "tip":
        return <Badge className="bg-yellow-500">Tip</Badge>;
      case "challenge":
        return <Badge className="bg-purple-500">Challenge</Badge>;
      case "resource":
        return <Badge className="bg-blue-500">Resource</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Daily Guidance</h1>
            <p className="text-muted-foreground">Share tips, tasks, and challenges with your subscribers</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingGuidance(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Guidance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingGuidance ? "Edit Guidance" : "Create New Guidance"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter a catchy title"
                    required
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your guidance content..."
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={formData.guidance_type}
                      onValueChange={(value) => setFormData({ ...formData, guidance_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tip">💡 Tip</SelectItem>
                        <SelectItem value="task">📋 Task</SelectItem>
                        <SelectItem value="challenge">🎯 Challenge</SelectItem>
                        <SelectItem value="resource">📚 Resource</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Audience</Label>
                    <Select
                      value={formData.target_audience}
                      onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="subscribers_only">Subscribers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Schedule Date (optional)</Label>
                  <Input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label>Publish immediately</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingGuidance ? "Update" : "Create"} Guidance
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
              <Lightbulb className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{guidance?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
              <Eye className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{guidance?.filter(g => g.is_published).length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
              <Calendar className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{guidance?.filter(g => g.scheduled_date).length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Likes</CardTitle>
              <Heart className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {guidance?.reduce((sum, g) => sum + g.likes_count, 0) || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Guidance Cards */}
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Loading guidance...</p>
        ) : guidance?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No guidance posts yet. Share your first tip!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guidance?.map((item) => (
              <Card key={item.id} className={!item.is_published ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeIcon(item.guidance_type)}</span>
                      {getTypeBadge(item.guidance_type)}
                    </div>
                    <div className="flex items-center gap-1">
                      {item.is_published ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      {item.target_audience === "subscribers_only" && (
                        <Badge variant="outline" className="text-xs">Subscribers</Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  {item.content && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {item.content}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {item.likes_count}
                    </span>
                    <span>
                      {item.scheduled_date
                        ? `Scheduled: ${format(new Date(item.scheduled_date), "MMM d")}`
                        : format(new Date(item.created_at), "MMM d, yyyy")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(item)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MentorLayout>
  );
};

export default MentorGuidance;
