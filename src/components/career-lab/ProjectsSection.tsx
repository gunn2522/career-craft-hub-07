import { useState, useEffect, useCallback } from "react";
import { Folder, Plus, ExternalLink, Github, Star, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string | null;
  project_url: string | null;
  github_url: string | null;
  skills_used: string[];
  is_featured: boolean;
  completed_at: string | null;
}

export const ProjectsSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_url: "",
    github_url: "",
    skills_used: [] as string[],
    is_featured: false,
  });

  const fetchProjects = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setProjects(data);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  const saveProject = async () => {
    if (!user || !formData.title) return;

    try {
      if (editingProject) {
        const { error } = await supabase
          .from("user_projects")
          .update(formData)
          .eq("id", editingProject.id);

        if (error) throw error;
        toast({ title: "Project Updated!" });
      } else {
        const { error } = await supabase.from("user_projects").insert({
          user_id: user.id,
          ...formData,
        });

        if (error) throw error;
        toast({ title: "Project Added!" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: "Failed to save project.",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("user_projects").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Project Deleted" });
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("user_projects")
        .update({ is_featured: !currentValue })
        .eq("id", id);
      if (error) throw error;
      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      project_url: "",
      github_url: "",
      skills_used: [],
      is_featured: false,
    });
    setEditingProject(null);
    setSkillInput("");
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || "",
      project_url: project.project_url || "",
      github_url: project.github_url || "",
      skills_used: project.skills_used || [],
      is_featured: project.is_featured,
    });
    setIsDialogOpen(true);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills_used.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills_used: [...prev.skills_used, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills_used: prev.skills_used.filter((s) => s !== skill),
    }));
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-primary" />
          My Projects
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit" : "Add"} Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Project name"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="What does this project do?"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Live URL</Label>
                  <Input
                    placeholder="https://..."
                    value={formData.project_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, project_url: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>GitHub URL</Label>
                  <Input
                    placeholder="https://github.com/..."
                    value={formData.github_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, github_url: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Skills Used</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="secondary">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills_used.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={saveProject} disabled={!formData.title} className="w-full">
                {editingProject ? "Update" : "Add"} Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-xl bg-secondary/30 border border-border/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{project.title}</h4>
                      {project.is_featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {project.description}
                      </p>
                    )}
                    {project.skills_used?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.skills_used.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {project.project_url && (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Live
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Github className="w-3 h-3" />
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleFeatured(project.id, project.is_featured)}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          project.is_featured ? "text-yellow-500 fill-yellow-500" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(project)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteProject(project.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No projects yet. Add your first project!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
