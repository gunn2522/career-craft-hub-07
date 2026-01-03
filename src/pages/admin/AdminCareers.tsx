import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Briefcase, TrendingUp, DollarSign, BarChart3, GitBranch } from "lucide-react";
import { CareerProgressionManager } from "@/components/admin/CareerProgressionManager";

interface Domain {
  id: string;
  name: string;
}

interface Category {
  id: string;
  domain_id: string;
  name: string;
}

interface Career {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  category: string;
  domain_id: string | null;
  category_id: string | null;
  growth: string | null;
  salary: string | null;
  demand: string | null;
  skills: string[] | null;
  is_active: boolean;
  display_order: number;
  experience_level: "entry" | "mid" | "senior" | null;
  responsibilities?: string[] | null;
  domain_name?: string;
  category_name?: string;
  roadmap_count?: number;
  progression_count?: number;
}

const AdminCareers = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Career | null>(null);
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [progressionCareer, setProgressionCareer] = useState<Career | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain_id: "",
    category_id: "",
    category: "",
    growth: "",
    salary: "",
    demand: "",
    skills: "",
    responsibilities: "",
    experience_level: "entry" as "entry" | "mid" | "senior",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.domain_id) {
      setFilteredCategories(
        categories.filter((c) => c.domain_id === formData.domain_id)
      );
    } else {
      setFilteredCategories([]);
    }
  }, [formData.domain_id, categories]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: domainsData } = await supabase
        .from("career_domains")
        .select("id, name")
        .eq("is_active", true)
        .order("display_order");
      setDomains(domainsData || []);

      const { data: categoriesData } = await supabase
        .from("career_categories")
        .select("id, domain_id, name")
        .eq("is_active", true)
        .order("display_order");
      setCategories(categoriesData || []);

      const { data: careersData, error } = await supabase
        .from("careers")
        .select("*, career_domains(name), career_categories(name)")
        .order("display_order", { ascending: true });

      if (error) throw error;

      const careersWithCounts = await Promise.all(
        (careersData || []).map(async (career: any) => {
          const [roadmapRes, progressionRes] = await Promise.all([
            supabase
              .from("roadmaps")
              .select("*", { count: "exact", head: true })
              .eq("career_id", career.id),
            supabase
              .from("career_progressions")
              .select("*", { count: "exact", head: true })
              .eq("from_career_id", career.id),
          ]);

          return {
            ...career,
            domain_name: career.career_domains?.name || null,
            category_name: career.career_categories?.name || null,
            roadmap_count: roadmapRes.count || 0,
            progression_count: progressionRes.count || 0,
          };
        })
      );

      setCareers(careersWithCounts);
    } catch (error: any) {
      toast.error("Failed to fetch data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.domain_id || !formData.category_id) {
      toast.error("Please select a domain and category");
      return;
    }

    const selectedCategory = categories.find((c) => c.id === formData.category_id);

    try {
      const careerData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        domain_id: formData.domain_id,
        category_id: formData.category_id,
        category: selectedCategory?.name || formData.category || "Other",
        growth: formData.growth.trim() || null,
        salary: formData.salary.trim() || null,
        demand: formData.demand || null,
        skills: formData.skills
          ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        responsibilities: formData.responsibilities
          ? formData.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean)
          : null,
        experience_level: formData.experience_level,
        is_active: formData.is_active,
        display_order: formData.display_order,
      };

      if (editingCareer) {
        const { error } = await supabase
          .from("careers")
          .update(careerData)
          .eq("id", editingCareer.id);
        if (error) throw error;
        toast.success("Career updated successfully");
      } else {
        const { error } = await supabase.from("careers").insert([careerData]);
        if (error) throw error;
        toast.success("Career created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error("Failed to save career: " + error.message);
    }
  };

  const handleEdit = (career: Career) => {
    setEditingCareer(career);
    setFormData({
      title: career.title,
      description: career.description || "",
      domain_id: career.domain_id || "",
      category_id: career.category_id || "",
      category: career.category || "",
      growth: career.growth || "",
      salary: career.salary || "",
      demand: career.demand || "",
      skills: career.skills?.join(", ") || "",
      responsibilities: career.responsibilities?.join("\n") || "",
      experience_level: career.experience_level || "entry",
      is_active: career.is_active,
      display_order: career.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const { error } = await supabase
        .from("careers")
        .delete()
        .eq("id", deleteConfirm.id);
      if (error) throw error;
      toast.success("Career deleted successfully");
      setDeleteConfirm(null);
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete career: " + error.message);
    }
  };

  const resetForm = () => {
    setEditingCareer(null);
    setFormData({
      title: "",
      description: "",
      domain_id: "",
      category_id: "",
      category: "",
      growth: "",
      salary: "",
      demand: "",
      skills: "",
      responsibilities: "",
      experience_level: "entry",
      is_active: true,
      display_order: careers.length,
    });
  };

  let filteredCareers = careers;
  if (filterDomain !== "all") {
    filteredCareers = filteredCareers.filter((c) => c.domain_id === filterDomain);
  }
  if (filterCategory !== "all") {
    filteredCareers = filteredCareers.filter((c) => c.category_id === filterCategory);
  }

  const filterCategoriesOptions =
    filterDomain === "all"
      ? categories
      : categories.filter((c) => c.domain_id === filterDomain);

  const groupedCareers = filteredCareers.reduce((acc, career) => {
    const domainKey = career.domain_name || "Uncategorized";
    const categoryKey = career.category_name || "Uncategorized";

    if (!acc[domainKey]) {
      acc[domainKey] = {};
    }
    if (!acc[domainKey][categoryKey]) {
      acc[domainKey][categoryKey] = [];
    }
    acc[domainKey][categoryKey].push(career);
    return acc;
  }, {} as Record<string, Record<string, Career[]>>);

  return (
    <AdminLayout title="Manage Career Roles (Level 3)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-muted-foreground">
            Career roles belong to Categories and link to Roadmaps
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filterDomain}
              onValueChange={(value) => {
                setFilterDomain(value);
                setFilterCategory("all");
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {domains.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filterCategoriesOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Career Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCareer ? "Edit Career Role" : "Add New Career Role"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Domain *</Label>
                      <Select
                        value={formData.domain_id}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            domain_id: value,
                            category_id: "",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category_id: value })
                        }
                        disabled={!formData.domain_id}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              formData.domain_id
                                ? "Select category"
                                : "Select domain first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCategories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Role Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g., Frontend Developer"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Describe this career role..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Salary Range</Label>
                      <Input
                        value={formData.salary}
                        onChange={(e) =>
                          setFormData({ ...formData, salary: e.target.value })
                        }
                        placeholder="e.g., ₹6-25 LPA"
                      />
                    </div>
                    <div>
                      <Label>Growth %</Label>
                      <Input
                        value={formData.growth}
                        onChange={(e) =>
                          setFormData({ ...formData, growth: e.target.value })
                        }
                        placeholder="e.g., +25%"
                      />
                    </div>
                    <div>
                      <Label>Demand Level</Label>
                      <Select
                        value={formData.demand}
                        onValueChange={(value) =>
                          setFormData({ ...formData, demand: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select demand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Experience Level *</Label>
                      <Select
                        value={formData.experience_level}
                        onValueChange={(value: "entry" | "mid" | "senior") =>
                          setFormData({ ...formData, experience_level: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Display Order</Label>
                      <Input
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
                    <div className="col-span-2">
                      <Label>Skills (comma-separated)</Label>
                      <Input
                        value={formData.skills}
                        onChange={(e) =>
                          setFormData({ ...formData, skills: e.target.value })
                        }
                        placeholder="e.g., JavaScript, React, Node.js"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Responsibilities (one per line)</Label>
                      <Textarea
                        value={formData.responsibilities}
                        onChange={(e) =>
                          setFormData({ ...formData, responsibilities: e.target.value })
                        }
                        placeholder="Enter each responsibility on a new line..."
                        rows={4}
                      />
                    </div>
                    <div className="col-span-2 flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_active: checked })
                        }
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCareer ? "Update" : "Create"} Career Role
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-48" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredCareers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No career roles found</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Career Role
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedCareers).map(([domainName, categoryGroups]) => (
              <div key={domainName} className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Badge variant="default">{domainName}</Badge>
                </h2>
                {Object.entries(categoryGroups).map(([categoryName, careersList]) => (
                  <div key={categoryName} className="space-y-4 ml-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Badge variant="secondary">{categoryName}</Badge>
                      <span className="text-sm text-muted-foreground font-normal">
                        ({careersList.length} roles)
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {careersList.map((career) => (
                        <Card
                          key={career.id}
                          className={`${!career.is_active ? "opacity-60" : ""}`}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{career.title}</CardTitle>
                                {career.slug && (
                                  <span className="text-xs text-muted-foreground">
                                    /{career.slug}
                                  </span>
                                )}
                                {!career.is_active && (
                                  <span className="text-xs text-muted-foreground block">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setProgressionCareer(career)}
                                  title="Manage Progressions"
                                >
                                  <GitBranch className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEdit(career)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setDeleteConfirm(career)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {career.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {career.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="outline" className={
                                career.experience_level === "entry" 
                                  ? "bg-green-500/10 text-green-600 border-green-500/30"
                                  : career.experience_level === "mid"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                              }>
                                {career.experience_level === "entry" ? "Entry" : 
                                 career.experience_level === "mid" ? "Mid" : "Senior"}
                              </Badge>
                              {career.salary && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded">
                                  <DollarSign className="w-3 h-3" />
                                  {career.salary}
                                </span>
                              )}
                              {career.growth && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded">
                                  <TrendingUp className="w-3 h-3" />
                                  {career.growth}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>{career.roadmap_count} roadmap(s)</span>
                              <span>•</span>
                              <span>{career.progression_count} progression(s)</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progression Manager Dialog */}
      <Dialog open={!!progressionCareer} onOpenChange={() => setProgressionCareer(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Career Progressions: {progressionCareer?.title}
            </DialogTitle>
          </DialogHeader>
          {progressionCareer && (
            <CareerProgressionManager
              careerId={progressionCareer.id}
              careerTitle={progressionCareer.title}
              careerLevel={progressionCareer.experience_level || "entry"}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Career Role?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm && deleteConfirm.roadmap_count! > 0 ? (
                <>
                  <span className="text-destructive font-medium">Warning:</span> This
                  career has {deleteConfirm.roadmap_count} roadmap(s) linked. They will
                  have their career reference removed.
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

export default AdminCareers;
