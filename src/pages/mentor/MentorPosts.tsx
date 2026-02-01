import { useState } from "react";
import { MentorLayout } from "@/components/mentor/MentorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plus, FileText, Link as LinkIcon, Eye, Heart, Trash2, Edit2,
  ExternalLink, AlertCircle
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string | null;
  post_type: string;
  external_url: string | null;
  category_id: string;
  is_published: boolean;
  likes_count: number;
  views_count: number;
  created_at: string;
  category?: { name: string };
}

interface Category {
  id: string;
  name: string;
}

interface MentorProfile {
  id: string;
  verification_status: string | null;
  verified_domain_id: string | null;
}

const MentorPosts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<string>("article");
  const [externalUrl, setExternalUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { data: mentorProfile } = useQuery({
    queryKey: ["mentor-profile-posts", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("mentor_profiles") as any)
        .select("id, verified_domain_id, verification_status")
        .eq("user_id", user?.id || "")
        .maybeSingle();
      if (error) throw error;
      return data as MentorProfile | null;
    },
    enabled: !!user
  });

  const { data: categories } = useQuery({
    queryKey: ["mentor-categories", mentorProfile?.id],
    queryFn: async () => {
      const { data: verifiedCats } = await (supabase as any)
        .from("mentor_verified_categories")
        .select("category_id")
        .eq("mentor_id", mentorProfile?.id || "");
      
      if (!verifiedCats || verifiedCats.length === 0) return [];

      const categoryIds = verifiedCats.map((c: any) => c.category_id);
      const { data: categoriesData } = await supabase
        .from("career_categories")
        .select("id, name")
        .in("id", categoryIds);

      return categoriesData as Category[];
    },
    enabled: !!mentorProfile?.id
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ["mentor-posts", mentorProfile?.id],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("mentor_posts") as any)
        .select("*")
        .eq("mentor_id", mentorProfile?.id || "")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const categoryIds = [...new Set(data.map((p: any) => p.category_id))];
      const { data: categoriesData } = categoryIds.length > 0 
        ? await supabase.from("career_categories").select("id, name").in("id", categoryIds as string[])
        : { data: [] };

      return data.map((post: any) => ({
        ...post,
        category: categoriesData?.find((c: any) => c.id === post.category_id)
      })) as Post[];
    },
    enabled: !!mentorProfile?.id
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!categoryId) throw new Error("Category is required");

      const { error } = await (supabase.from("mentor_posts") as any).insert({
        mentor_id: mentorProfile?.id,
        title,
        content: content || null,
        post_type: postType,
        external_url: externalUrl || null,
        category_id: categoryId,
        is_published: true
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post created successfully!");
      queryClient.invalidateQueries({ queryKey: ["mentor-posts"] });
      resetForm();
      setCreateDialog(false);
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create post");
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: async () => {
      if (!editingPost) return;

      const { error } = await (supabase
        .from("mentor_posts") as any)
        .update({
          title,
          content: content || null,
          post_type: postType,
          external_url: externalUrl || null,
          category_id: categoryId,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingPost.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post updated!");
      queryClient.invalidateQueries({ queryKey: ["mentor-posts"] });
      resetForm();
      setEditingPost(null);
    },
    onError: (error) => {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await (supabase
        .from("mentor_posts") as any)
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["mentor-posts"] });
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPostType("article");
    setExternalUrl("");
    setCategoryId("");
  };

  const openEditDialog = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content || "");
    setPostType(post.post_type);
    setExternalUrl(post.external_url || "");
    setCategoryId(post.category_id);
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "article": return <FileText className="h-4 w-4" />;
      case "external_link": return <LinkIcon className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const isVerified = mentorProfile?.verification_status === "verified";

  if (!isVerified) {
    return (
      <MentorLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Verification Required</h3>
            <p className="text-muted-foreground mb-4">
              You need to complete verification to create posts
            </p>
            <Button asChild>
              <a href="/mentor/verification">Complete Verification</a>
            </Button>
          </CardContent>
        </Card>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Posts</h1>
            <p className="text-muted-foreground">
              Share articles, resources, and tips with students in your categories
            </p>
          </div>
          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Category <span className="text-destructive">*</span></Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only students mapped to this category will see this post
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Post Type</Label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="external_link">External Link</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                      <SelectItem value="tip">Quick Tip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title <span className="text-destructive">*</span></Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post content..."
                    rows={5}
                  />
                </div>
                {(postType === "external_link" || postType === "resource") && (
                  <div className="space-y-2">
                    <Label>External URL</Label>
                    <Input
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createPostMutation.mutate()}
                  disabled={!title || !categoryId || createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? "Creating..." : "Create Post"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : posts?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first post to share with students
              </p>
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {posts?.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getPostTypeIcon(post.post_type)}
                        <Badge variant="outline">{post.category?.name}</Badge>
                        <Badge variant="secondary" className="capitalize">
                          {post.post_type.replace("_", " ")}
                        </Badge>
                      </div>
                      <h3 className="font-medium mb-1">{post.title}</h3>
                      {post.content && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.content}
                        </p>
                      )}
                      {post.external_url && (
                        <a 
                          href={post.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          {post.external_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes_count}
                        </span>
                        <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(post)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Delete this post?")) {
                            deletePostMutation.mutate(post.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!editingPost} onOpenChange={() => { setEditingPost(null); resetForm(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Post Type</Label>
                <Select value={postType} onValueChange={setPostType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="external_link">External Link</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="tip">Quick Tip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content..."
                  rows={5}
                />
              </div>
              {(postType === "external_link" || postType === "resource") && (
                <div className="space-y-2">
                  <Label>External URL</Label>
                  <Input
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditingPost(null); resetForm(); }}>
                Cancel
              </Button>
              <Button
                onClick={() => updatePostMutation.mutate()}
                disabled={!title || !categoryId || updatePostMutation.isPending}
              >
                {updatePostMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MentorLayout>
  );
};

export default MentorPosts;
