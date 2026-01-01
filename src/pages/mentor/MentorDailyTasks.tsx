import { useState } from "react";
import { MentorLayout } from "@/components/mentor/MentorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DailyAssignment {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  skill_focus: string | null;
  step_index: number;
  roadmap_id: string;
  is_active: boolean | null;
}

interface Roadmap {
  id: string;
  title: string;
}

const MentorDailyTasks = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyAssignment | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    difficulty: "medium",
    estimated_time: "30-60 mins",
    skill_focus: "",
    step_index: 0,
    roadmap_id: "",
    is_active: true,
  });

  const { data: roadmaps } = useQuery({
    queryKey: ["roadmaps"],
    queryFn: async () => {
      const { data, error } = await supabase.from("roadmaps").select("id, title").order("title");
      if (error) throw error;
      return data as Roadmap[];
    },
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["mentor-daily-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_assignments")
        .select("*, roadmaps(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("daily_assignments").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-daily-tasks"] });
      toast({ title: "Success", description: "Daily task created successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof formData) => {
      const { error } = await supabase.from("daily_assignments").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-daily-tasks"] });
      toast({ title: "Success", description: "Daily task updated successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("daily_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-daily-tasks"] });
      toast({ title: "Success", description: "Daily task deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructions: "",
      difficulty: "medium",
      estimated_time: "30-60 mins",
      skill_focus: "",
      step_index: 0,
      roadmap_id: "",
      is_active: true,
    });
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (task: DailyAssignment) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      instructions: task.instructions || "",
      difficulty: task.difficulty || "medium",
      estimated_time: task.estimated_time || "30-60 mins",
      skill_focus: task.skill_focus || "",
      step_index: task.step_index,
      roadmap_id: task.roadmap_id,
      is_active: task.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roadmap_id) {
      toast({ title: "Error", description: "Please select a roadmap", variant: "destructive" });
      return;
    }
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Daily Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage daily assignments for career roadmaps</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Roadmap</Label>
                    <Select
                      value={formData.roadmap_id}
                      onValueChange={(value) => setFormData({ ...formData, roadmap_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select roadmap" />
                      </SelectTrigger>
                      <SelectContent>
                        {roadmaps?.map((roadmap) => (
                          <SelectItem key={roadmap.id} value={roadmap.id}>
                            {roadmap.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <Textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                    >
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
                      value={formData.estimated_time}
                      onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Step Index</Label>
                    <Input
                      type="number"
                      value={formData.step_index}
                      onChange={(e) => setFormData({ ...formData, step_index: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Skill Focus</Label>
                  <Input
                    value={formData.skill_focus}
                    onChange={(e) => setFormData({ ...formData, skill_focus: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit">{editingTask ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Daily Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : tasks?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No daily tasks yet. Create your first task!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Roadmap</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Step</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks?.map((task: any) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{task.roadmaps?.title || "N/A"}</TableCell>
                      <TableCell className="capitalize">{task.difficulty}</TableCell>
                      <TableCell>{task.step_index}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(task.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MentorLayout>
  );
};

export default MentorDailyTasks;