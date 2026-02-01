import { useState } from "react";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plus, FileText, Eye, Edit2, Trash2, AlertCircle,
  Calendar, Users, Send
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string | null;
  post_type: string;
  target_years: string[] | null;
  target_qualifications: string[] | null;
  target_streams: string[] | null;
  is_published: boolean;
  views_count: number;
  created_at: string;
  published_at: string | null;
}

const yearOptions = [
  { value: "first_year", label: "1st Year" },
  { value: "second_year", label: "2nd Year" },
  { value: "third_year", label: "3rd Year" },
  { value: "fourth_year", label: "4th Year" },
  { value: "final_year", label: "Final Year" }
];

const qualificationOptions = [
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "diploma", label: "Diploma" }
];

const streamOptions = [
  { value: "engineering", label: "Engineering" },
  { value: "science", label: "Science" },
  { value: "commerce", label: "Commerce" },
  { value: "arts", label: "Arts" },
  { value: "management", label: "Management" }
];

const postTypeOptions = [
  { value: "announcement", label: "Announcement" },
  { value: "update", label: "Company Update" },
  { value: "insight", label: "Industry Insight" },
  { value: "opportunity", label: "Opportunity" },
  { value: "tips", label: "Career Tips" }
];

const PartnerPostsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("announcement");
  const [targetYears, setTargetYears] = useState<string[]>([]);
  const [targetQualifications, setTargetQualifications] = useState<string[]>([]);
  const [targetStreams, setTargetStreams] = useState<string[]>([]);

  // Fetch partner profile
  const { data: partnerProfile } = useQuery({
    queryKey: ["partner-profile", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partner_profiles")
        .select("id, verification_status")
        .eq("user_id", user?.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user
  });

  // Fetch posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["partner-posts", partnerProfile?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("partner_posts")
        .select("*")
        .eq("partner_id", partnerProfile?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
    enabled: !!partnerProfile?.id
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPostType("announcement");
    setTargetYears([]);
    setTargetQualifications([]);
    setTargetStreams([]);
  };

  const openEditDialog = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content || "");
    setPostType(post.post_type);
    setTargetYears(post.target_years || []);
    setTargetQualifications(post.target_qualifications || []);
    setTargetStreams(post.target_streams || []);
  };

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!title) throw new Error("Title is required");
      if (!content) throw new Error("Content is required");

      const { error } = await (supabase as any).from("partner_posts").insert({
        partner_id: partnerProfile?.id,
        title,
        content,
        post_type: postType,
        target_years: targetYears.length > 0 ? targetYears : null,
        target_qualifications: targetQualifications.length > 0 ? targetQualifications : null,
        target_streams: targetStreams.length > 0 ? targetStreams : null,
        is_published: false
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post created as draft");
      queryClient.invalidateQueries({ queryKey: ["partner-posts"] });
      resetForm();
      setCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create post");
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: async () => {
      if (!editingPost) return;

      const { error } = await (supabase as any)
        .from("partner_posts")
        .update({
          title,
          content,
          post_type: postType,
          target_years: targetYears.length > 0 ? targetYears : null,
          target_qualifications: targetQualifications.length > 0 ? targetQualifications : null,
          target_streams: targetStreams.length > 0 ? targetStreams : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingPost.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post updated");
      queryClient.invalidateQueries({ queryKey: ["partner-posts"] });
      resetForm();
      setEditingPost(null);
    },
    onError: () => {
      toast.error("Failed to update post");
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await (supabase as any)
        .from("partner_posts")
        .delete()
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["partner-posts"] });
    },
    onError: () => {
      toast.error("Failed to delete post");
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ postId, publish }: { postId: string; publish: boolean }) => {
      const { error } = await (supabase as any)
        .from("partner_posts")
        .update({
          is_published: publish,
          published_at: publish ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: (_, { publish }) => {
      toast.success(publish ? "Post published!" : "Post unpublished");
      queryClient.invalidateQueries({ queryKey: ["partner-posts"] });
    }
  });

  const isVerified = partnerProfile?.verification_status === "verified";

  if (!isVerified) {
    return (
      <PartnerLayout title="Posts & Content">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Verification Required</h3>
            <p className="text-muted-foreground mb-4">
              Complete verification to create and publish posts
            </p>
            <Button asChild>
              <a href="/partner-dashboard/profile">Complete Profile</a>
            </Button>
          </CardContent>
        </Card>
      </PartnerLayout>
    );
  }

  const PostForm = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Post title..." 
        />
      </div>

      <div className="space-y-2">
        <Label>Post Type</Label>
        <Select value={postType} onValueChange={setPostType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {postTypeOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Content *</Label>
        <Textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          placeholder="Write your post content..." 
          rows={6} 
        />
      </div>

      {/* Audience Targeting */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Audience Targeting</CardTitle>
          <CardDescription>Optional: Target specific student segments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Target Years</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {yearOptions.map(opt => (
                <Badge
                  key={opt.value}
                  variant={targetYears.includes(opt.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setTargetYears(prev =>
                      prev.includes(opt.value)
                        ? prev.filter(v => v !== opt.value)
                        : [...prev, opt.value]
                    );
                  }}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm">Target Qualifications</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {qualificationOptions.map(opt => (
                <Badge
                  key={opt.value}
                  variant={targetQualifications.includes(opt.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setTargetQualifications(prev =>
                      prev.includes(opt.value)
                        ? prev.filter(v => v !== opt.value)
                        : [...prev, opt.value]
                    );
                  }}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm">Target Streams</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {streamOptions.map(opt => (
                <Badge
                  key={opt.value}
                  variant={targetStreams.includes(opt.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setTargetStreams(prev =>
                      prev.includes(opt.value)
                        ? prev.filter(v => v !== opt.value)
                        : [...prev, opt.value]
                    );
                  }}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <PartnerLayout title="Posts & Content">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your Posts</h2>
            <p className="text-muted-foreground">Create and manage content for students</p>
          </div>
          <Button onClick={() => setCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : posts?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first post to engage with students
              </p>
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {posts?.map(post => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-lg">{post.title}</h3>
                        <Badge variant={post.is_published ? "default" : "secondary"}>
                          {post.is_published ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="outline">{post.post_type}</Badge>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(post.created_at), "MMM dd, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views_count} views
                        </span>
                        {(post.target_years?.length || post.target_qualifications?.length || post.target_streams?.length) && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Targeted
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={post.is_published}
                        onCheckedChange={(checked) =>
                          togglePublishMutation.mutate({ postId: post.id, publish: checked })
                        }
                      />
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this post?")) {
                            deletePostMutation.mutate(post.id);
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <PostForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setCreateDialog(false); }}>
                Cancel
              </Button>
              <Button
                onClick={() => createPostMutation.mutate()}
                disabled={createPostMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
            </DialogHeader>
            <PostForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setEditingPost(null); }}>
                Cancel
              </Button>
              <Button
                onClick={() => updatePostMutation.mutate()}
                disabled={updatePostMutation.isPending}
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

export default PartnerPostsPage;
