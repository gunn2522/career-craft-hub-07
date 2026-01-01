import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";

interface Domain {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
  category_count?: number;
  career_count?: number;
}

const iconOptions = [
  "Monitor", "Briefcase", "Palette", "Heart", "Wrench", "GraduationCap", 
  "DollarSign", "Code", "Database", "Globe", "Laptop", "Rocket", "Star",
  "Target", "TrendingUp", "Users", "Zap", "Building", "Camera", "Music"
];

const AdminDomains = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Domain | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    description: "",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      const { data: domainsData, error } = await supabase
        .from("career_domains")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;

      // Get counts for each domain
      const domainsWithCounts = await Promise.all(
        (domainsData || []).map(async (domain) => {
          const { count: categoryCount } = await supabase
            .from("career_categories")
            .select("*", { count: "exact", head: true })
            .eq("domain_id", domain.id);

          const { count: careerCount } = await supabase
            .from("careers")
            .select("*", { count: "exact", head: true })
            .eq("domain_id", domain.id);

          return {
            ...domain,
            category_count: categoryCount || 0,
            career_count: careerCount || 0,
          };
        })
      );

      setDomains(domainsWithCounts);
    } catch (error: any) {
      toast.error("Failed to fetch domains: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Domain name is required");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        icon: formData.icon || null,
        description: formData.description.trim() || null,
        is_active: formData.is_active,
        display_order: formData.display_order,
      };

      if (editingDomain) {
        const { error } = await supabase
          .from("career_domains")
          .update(payload)
          .eq("id", editingDomain.id);
        if (error) throw error;
        toast.success("Domain updated successfully");
      } else {
        const { error } = await supabase
          .from("career_domains")
          .insert([payload]);
        if (error) throw error;
        toast.success("Domain created successfully");
      }

      resetForm();
      fetchDomains();
    } catch (error: any) {
      toast.error("Failed to save domain: " + error.message);
    }
  };

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setFormData({
      name: domain.name,
      icon: domain.icon || "",
      description: domain.description || "",
      is_active: domain.is_active,
      display_order: domain.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const { error } = await supabase
        .from("career_domains")
        .delete()
        .eq("id", deleteConfirm.id);
      if (error) throw error;
      toast.success("Domain deleted successfully");
      setDeleteConfirm(null);
      fetchDomains();
    } catch (error: any) {
      toast.error("Failed to delete domain: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      icon: "",
      description: "",
      is_active: true,
      display_order: domains.length,
    });
    setEditingDomain(null);
    setIsDialogOpen(false);
  };

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
  };

  return (
    <AdminLayout title="Manage Domains (Level 1)">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Domains are the top-level categories for organizing careers (e.g., Technology, Business, Creative)
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingDomain ? "Edit Domain" : "Create New Domain"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Domain Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Technology"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) =>
                      setFormData({ ...formData, icon: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            {getIconComponent(icon)}
                            <span>{icon}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of this domain"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value) || 0,
                      })
                    }
                    min={0}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingDomain ? "Update Domain" : "Create Domain"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : domains.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No domains found</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Domain
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain) => (
              <Card
                key={domain.id}
                className={`relative ${!domain.is_active ? "opacity-60" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {getIconComponent(domain.icon) || (
                          <GripVertical className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{domain.name}</CardTitle>
                        {!domain.is_active && (
                          <span className="text-xs text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(domain)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(domain)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {domain.description || "No description"}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">
                      <strong>{domain.category_count}</strong> Categories
                    </span>
                    <span className="text-muted-foreground">
                      <strong>{domain.career_count}</strong> Careers
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Domain?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm &&
              (deleteConfirm.category_count! > 0 ||
                deleteConfirm.career_count! > 0) ? (
                <>
                  <span className="text-destructive font-medium">Warning:</span>{" "}
                  This domain has {deleteConfirm.category_count} categories and{" "}
                  {deleteConfirm.career_count} careers. Deleting it will remove
                  all associated categories. Careers will have their domain
                  reference removed.
                </>
              ) : (
                "This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminDomains;
