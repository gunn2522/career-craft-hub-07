import { useState } from "react";
import { MentorLayout } from "@/components/mentor/MentorLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  Plus, ClipboardList, Users, GraduationCap, School,
  Trash2, Edit2, AlertCircle, Clock
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  difficulty: string;
  estimated_time: string | null;
  audience_type: string;
  category_id: string;
  is_active: boolean;
  created_at: string;
  category?: { name: string };
  submissions_count?: number;
}

interface Category {
  id: string;
  name: string;
}

interface MentorProfile {
  id: string;
  verification_status: string | null;
}

const MentorTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [audienceType, setAudienceType] = useState<string>("");
  const [categoryId, setCategoryId] = useState("");

  const { data: mentorProfile } = useQuery({
    queryKey: ["mentor-profile-tasks", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("mentor_profiles")
        .select("id, verified_domain_id, verification_status")
        .eq("user_id", user?.id || "")
        .maybeSingle();
      if (error) throw error;
      return data as MentorProfile | null;
    },
    enabled: !!user
  });

  const { data: categories } = useQuery({
    queryKey: ["mentor-categories-tasks", mentorProfile?.id],
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

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["mentor-tasks", mentorProfile?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("mentor_tasks")
        .select("*")
        .eq("mentor_id", mentorProfile?.id || "")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const categoryIds = [...new Set(data.map((t: any) => t.category_id))];
      const { data: categoriesData } = categoryIds.length > 0
        ? await supabase.from("career_categories").select("id, name").in("id", categoryIds as string[])
        : { data: [] };

      const taskIds = data.map((t: any) => t.id);
      const { data: submissions } = taskIds.length > 0
        ? await (supabase as any).from("mentor_task_submissions").select("task_id").in("task_id", taskIds)
        : { data: [] };

      const submissionCounts: Record<string, number> = {};
      submissions?.forEach((s: any) => {
        submissionCounts[s.task_id] = (submissionCounts[s.task_id] || 0) + 1;
      });

      return data.map((task: any) => ({
        ...task,
        category: categoriesData?.find((c: any) => c.id === task.category_id),
        submissions_count: submissionCounts[task.id] || 0
      })) as Task[];
    },
    enabled: !!mentorProfile?.id
  });

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      if (!categoryId) throw new Error("Category is required");
      if (!audienceType) throw new Error("Audience is required");

      const { error } = await (supabase as any).from("mentor_tasks").insert({
        mentor_id: mentorProfile?.id,
        title,
        description: description || null,
        instructions: instructions || null,
        difficulty,
        estimated_time: estimatedTime || null,
        audience_type: audienceType,
        category_id: categoryId,
        is_active: true
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task created successfully!");
      queryClient.invalidateQueries({ queryKey: ["mentor-tasks"] });
      resetForm();
      setCreateDialog(false);
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create task");
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async () => {
      if (!editingTask) return;

      const { error } = await (supabase as any)
        .from("mentor_tasks")
        .update({
          title,
          description: description || null,
          instructions: instructions || null,
          difficulty,
          estimated_time: estimatedTime || null,
          audience_type: audienceType,
          category_id: categoryId,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingTask.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task updated!");
      queryClient.invalidateQueries({ queryKey: ["mentor-tasks"] });
      resetForm();
      setEditingTask(null);
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await (supabase as any)
        .from("mentor_tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ["mentor-tasks"] });
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, isActive }: { taskId: string; isActive: boolean }) => {
      const { error } = await (supabase as any)
        .from("mentor_tasks")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-tasks"] });
    }
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setInstructions("");
    setDifficulty("medium");
    setEstimatedTime("");
    setAudienceType("");
    setCategoryId("");
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setInstructions(task.instructions || "");
    setDifficulty(task.difficulty);
    setEstimatedTime(task.estimated_time || "");
    setAudienceType(task.audience_type);
    setCategoryId(task.category_id);
  };

  const getAudienceIcon = (type: string) => {
    switch (type) {
      case "school_students": return <School className="h-4 w-4" />;
      case "college_students": return <GraduationCap className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getAudienceLabel = (type: string) => {
    switch (type) {
      case "school_students": return "School Students";
      case "college_students": return "College Students";
      default: return type;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "medium": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "hard": return "bg-red-500/10 text-red-600 dark:text-red-400";
      default: return "";
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
              You need to complete verification to create tasks
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
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground">
              Create tasks for students based on audience type
            </p>
          </div>
          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <Label>Audience <span className="text-destructive">*</span></Label>
                  <Select value={audienceType} onValueChange={setAudienceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school_students">
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4" />
                          School Students
                        </div>
                      </SelectItem>
                      <SelectItem value="college_students">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          College Students
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                </div>
                <div className="space-y-2">
                  <Label>Title <span className="text-destructive">*</span></Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief task description..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Detailed instructions..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Time</Label>
                    <Input
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder="e.g., 30 mins"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createTaskMutation.mutate()}
                  disabled={!title || !categoryId || !audienceType || createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : tasks?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first task to assign to students
              </p>
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks?.map((task) => (
              <Card key={task.id} className={!task.is_active ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getAudienceIcon(task.audience_type)}
                        <Badge variant="outline">{getAudienceLabel(task.audience_type)}</Badge>
                        <Badge variant="outline">{task.category?.name}</Badge>
                        <Badge className={getDifficultyColor(task.difficulty)}>
                          {task.difficulty}
                        </Badge>
                        {!task.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <h3 className="font-medium mb-1">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {task.estimated_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {task.estimated_time}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {task.submissions_count || 0} submissions
                        </span>
                        <span>{format(new Date(task.created_at), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTaskMutation.mutate({ 
                          taskId: task.id, 
                          isActive: !task.is_active 
                        })}
                      >
                        {task.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(task)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Delete this task?")) {
                            deleteTaskMutation.mutate(task.id);
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

        <Dialog open={!!editingTask} onOpenChange={() => { setEditingTask(null); resetForm(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={audienceType} onValueChange={setAudienceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school_students">School Students</SelectItem>
                    <SelectItem value="college_students">College Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Instructions</Label>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estimated Time</Label>
                  <Input
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditingTask(null); resetForm(); }}>
                Cancel
              </Button>
              <Button
                onClick={() => updateTaskMutation.mutate()}
                disabled={!title || !categoryId || !audienceType || updateTaskMutation.isPending}
              >
                {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MentorLayout>
  );
};

export default MentorTasks;
