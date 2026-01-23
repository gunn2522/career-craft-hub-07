import { useState, useEffect } from "react";
import { InstitutionLayout } from "@/components/institution/InstitutionLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, FileText, Video, Link as LinkIcon, Edit, Trash2, ExternalLink } from "lucide-react";

interface InstitutionResource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  is_approved: boolean;
}

const InstitutionResources = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<InstitutionResource[]>([]);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<InstitutionResource | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "document",
    url: "",
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: institution } = await supabase
        .from("institutions")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (institution) {
        setInstitutionId(institution.id);
        const { data: resourcesData } = await supabase
          .from("institution_resources")
          .select("*")
          .eq("institution_id", institution.id)
          .order("created_at", { ascending: false });
        setResources(resourcesData || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) {
      toast({ title: "Error", description: "Please create your institution profile first.", variant: "destructive" });
      return;
    }

    try {
      if (editingResource) {
        await supabase
          .from("institution_resources")
          .update({ ...formData, is_approved: false })
          .eq("id", editingResource.id);
        toast({ title: "Success", description: "Resource updated (pending approval)" });
      } else {
        await supabase
          .from("institution_resources")
          .insert({ ...formData, institution_id: institutionId, is_approved: false });
        toast({ title: "Success", description: "Resource created (pending approval)" });
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save resource", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    await supabase.from("institution_resources").delete().eq("id", id);
    toast({ title: "Success", description: "Resource deleted" });
    fetchData();
  };

  const handleEdit = (resource: InstitutionResource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || "",
      type: resource.type,
      url: resource.url || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", type: "document", url: "" });
    setEditingResource(null);
    setIsDialogOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-5 h-5" />;
      case "link": return <LinkIcon className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <InstitutionLayout title="Resources">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout title="Resources">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Share educational resources with your community</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}><Plus className="w-4 h-4 mr-2" />Add Resource</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingResource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Resource Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Resource Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Resource URL"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1">{editingResource ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {resources.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No resources yet. Add your first resource!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(resource.type)}
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </div>
                  <Badge variant={resource.is_approved ? "default" : "secondary"}>
                    {resource.is_approved ? "Approved" : "Pending"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {resource.description || "No description"}
                  </p>
                  <div className="flex gap-2">
                    {resource.url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" />View
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(resource)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(resource.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </InstitutionLayout>
  );
};

export default InstitutionResources;
