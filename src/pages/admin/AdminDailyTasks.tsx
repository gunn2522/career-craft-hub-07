import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-react";

interface Roadmap {
  id: string;
  title: string;
}

interface DailyAssignment {
  id: string;
  roadmap_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  skill_focus: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  step_index: number;
  is_active: boolean;
  roadmap?: Roadmap;
}

const AdminDailyTasks = () => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<DailyAssignment[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<DailyAssignment | null>(null);

  const [formData, setFormData] = useState({
    roadmap_id: "",
    title: "",
    description: "",
    instructions: "",
    skill_focus: "",
    difficulty: "medium",
    estimated_time: "30-60 mins",
    step_index: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [assignmentsRes, roadmapsRes] = await Promise.all([
        supabase
          .from("daily_assignments")
          .select("*, roadmaps(id, title)")
          .order("roadmap_id")
          .order("step_index"),
        supabase.from("roadmaps").select("id, title").order("title"),
      ]);

      if (assignmentsRes.data) {
        const mapped = assignmentsRes.data.map((a: any) => ({
          ...a,
          roadmap: a.roadmaps,
        }));
        setAssignments(mapped);
      }
      if (roadmapsRes.data) {
        setRoadmaps(roadmapsRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      roadmap_id: "",
      title: "",
      description: "",
      instructions: "",
      skill_focus: "",
      difficulty: "medium",
      estimated_time: "30-60 mins",
      step_index: 0,
      is_active: true,
    });
    setEditingAssignment(null);
  };

  const handleEdit = (assignment: DailyAssignment) => {
    setEditingAssignment(assignment);
    setFormData({
      roadmap_id: assignment.roadmap_id,
      title: assignment.title,
      description: assignment.description || "",
      instructions: assignment.instructions || "",
      skill_focus: assignment.skill_focus || "",
      difficulty: assignment.difficulty || "medium",
      estimated_time: assignment.estimated_time || "30-60 mins",
      step_index: assignment.step_index,
      is_active: assignment.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.roadmap_id || !formData.title) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingAssignment) {
        const { error } = await supabase
          .from("daily_assignments")
          .update({
            roadmap_id: formData.roadmap_id,
            title: formData.title,
            description: formData.description || null,
            instructions: formData.instructions || null,
            skill_focus: formData.skill_focus || null,
            difficulty: formData.difficulty,
            estimated_time: formData.estimated_time,
            step_index: formData.step_index,
            is_active: formData.is_active,
          })
          .eq("id", editingAssignment.id);

        if (error) throw error;
        toast({ title: "Success", description: "Assignment updated successfully" });
      } else {
        const { error } = await supabase.from("daily_assignments").insert({
          roadmap_id: formData.roadmap_id,
          title: formData.title,
          description: formData.description || null,
          instructions: formData.instructions || null,
          skill_focus: formData.skill_focus || null,
          difficulty: formData.difficulty,
          estimated_time: formData.estimated_time,
          step_index: formData.step_index,
          is_active: formData.is_active,
        });

        if (error) throw error;
        toast({ title: "Success", description: "Assignment created successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error saving assignment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save assignment",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const { error } = await supabase.from("daily_assignments").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Assignment deleted successfully" });
      fetchData();
    } catch (error: any) {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "hard":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AdminLayout title="Daily Tasks Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Manage daily assignments for Career Lab roadmaps
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAssignment ? "Edit Assignment" : "Create New Assignment"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Roadmap *</label>
                    <Select
                      value={formData.roadmap_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, roadmap_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select roadmap" />
                      </SelectTrigger>
                      <SelectContent>
                        {roadmaps.map((roadmap) => (
                          <SelectItem key={roadmap.id} value={roadmap.id}>
                            {roadmap.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Step Index</label>
                    <Input
                      type="number"
                      value={formData.step_index}
                      onChange={(e) =>
                        setFormData({ ...formData, step_index: parseInt(e.target.value) || 0 })
                      }
                      min={0}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Build a responsive landing page"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the assignment"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Instructions</label>
                  <Textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Detailed instructions for completing the assignment"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Skill Focus</label>
                    <Input
                      value={formData.skill_focus}
                      onChange={(e) => setFormData({ ...formData, skill_focus: e.target.value })}
                      placeholder="e.g., HTML, CSS"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
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
                    <label className="text-sm font-medium">Estimated Time</label>
                    <Select
                      value={formData.estimated_time}
                      onValueChange={(value) => setFormData({ ...formData, estimated_time: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15-30 mins">15-30 mins</SelectItem>
                        <SelectItem value="30-60 mins">30-60 mins</SelectItem>
                        <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                        <SelectItem value="2-4 hours">2-4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="text-sm">Active (visible to users)</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmit} className="flex-1">
                    {editingAssignment ? "Update Assignment" : "Create Assignment"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{assignments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {assignments.filter((a) => a.is_active).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Roadmaps with Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Set(assignments.map((a) => a.roadmap_id)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              All Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No assignments yet. Create your first assignment to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roadmap</TableHead>
                    <TableHead>Step</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Skill Focus</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.roadmap?.title || "Unknown"}
                      </TableCell>
                      <TableCell>{assignment.step_index}</TableCell>
                      <TableCell>{assignment.title}</TableCell>
                      <TableCell>{assignment.skill_focus || "-"}</TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(assignment.difficulty)}>
                          {assignment.difficulty || "medium"}
                        </Badge>
                      </TableCell>
                      <TableCell>{assignment.estimated_time || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={assignment.is_active ? "default" : "secondary"}>
                          {assignment.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(assignment)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDelete(assignment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDailyTasks;
