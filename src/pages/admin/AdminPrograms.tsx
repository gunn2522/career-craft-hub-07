import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, X, Clock, CheckCircle2, Sparkles, Image, IndianRupee } from "lucide-react";

interface Program {
  id: string;
  name: string;
  description: string | null;
  banner_url: string | null;
  duration: string | null;
  features: string[];
  outcomes: string[];
  is_active: boolean | null;
  is_highlighted: boolean | null;
  is_free: boolean | null;
  price: number | null;
  currency: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const AdminPrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    banner_url: "",
    duration: "",
    features: "",
    outcomes: "",
    is_active: true,
    is_highlighted: false,
    is_free: true,
    price: "",
    currency: "INR",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch programs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("program-banners")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("program-banners")
        .getPublicUrl(filePath);

      setFormData({ ...formData, banner_url: urlData.publicUrl });

      toast({
        title: "Success",
        description: "Banner uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast({
        title: "Error",
        description: "Failed to upload banner",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const programData = {
      name: formData.name,
      description: formData.description || null,
      banner_url: formData.banner_url || null,
      duration: formData.duration || null,
      features: formData.features ? formData.features.split("\n").filter(f => f.trim()) : [],
      outcomes: formData.outcomes ? formData.outcomes.split("\n").filter(o => o.trim()) : [],
      is_active: formData.is_active,
      is_highlighted: formData.is_highlighted,
      is_free: formData.is_free,
      price: formData.is_free ? 0 : parseFloat(formData.price) || 0,
      currency: formData.currency,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    try {
      if (editingProgram) {
        const { error } = await supabase
          .from("programs")
          .update(programData)
          .eq("id", editingProgram.id);

        if (error) throw error;
        toast({ title: "Success", description: "Program updated successfully" });
      } else {
        const { error } = await supabase
          .from("programs")
          .insert([programData]);

        if (error) throw error;
        toast({ title: "Success", description: "Program created successfully" });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchPrograms();
    } catch (error) {
      console.error("Error saving program:", error);
      toast({
        title: "Error",
        description: "Failed to save program",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      description: program.description || "",
      banner_url: program.banner_url || "",
      duration: program.duration || "",
      features: program.features?.join("\n") || "",
      outcomes: program.outcomes?.join("\n") || "",
      is_active: program.is_active ?? true,
      is_highlighted: program.is_highlighted ?? false,
      is_free: program.is_free ?? true,
      price: program.price?.toString() || "",
      currency: program.currency || "INR",
      start_date: program.start_date ? program.start_date.split("T")[0] : "",
      end_date: program.end_date ? program.end_date.split("T")[0] : "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return;

    try {
      const { error } = await supabase.from("programs").delete().eq("id", id);
      if (error) throw error;
      
      toast({ title: "Success", description: "Program deleted successfully" });
      fetchPrograms();
    } catch (error) {
      console.error("Error deleting program:", error);
      toast({
        title: "Error",
        description: "Failed to delete program",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      banner_url: "",
      duration: "",
      features: "",
      outcomes: "",
      is_active: true,
      is_highlighted: false,
      is_free: true,
      price: "",
      currency: "INR",
      start_date: "",
      end_date: "",
    });
    setEditingProgram(null);
  };

  const formatPrice = (program: Program) => {
    if (program.is_free) return "Free";
    const currency = program.currency === "INR" ? "₹" : "$";
    return `${currency}${program.price?.toLocaleString() || 0}`;
  };

  return (
    <AdminLayout title="Manage Programs">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Create and manage your programs with banners, features, and outcomes.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProgram ? "Edit Program" : "Add New Program"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Banner Upload */}
              <div className="space-y-2">
                <Label>Program Banner</Label>
                {formData.banner_url ? (
                  <div className="relative">
                    <img
                      src={formData.banner_url}
                      alt="Banner preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({ ...formData, banner_url: "" })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <Label
                      htmlFor="banner-upload"
                      className="cursor-pointer text-primary hover:underline"
                    >
                      {isUploading ? "Uploading..." : "Click to upload banner"}
                    </Label>
                    <Input
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerUpload}
                      disabled={isUploading}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Recommended: 1200x600px
                    </p>
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Program Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Placement Bootcamp 2025"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the program..."
                  rows={3}
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 3 Months, 6 Weeks"
                />
              </div>

              {/* Pricing Section */}
              <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
                <Label className="text-base font-semibold">Pricing</Label>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_free"
                      checked={formData.is_free}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                    />
                    <Label htmlFor="is_free">This program is free</Label>
                  </div>
                </div>

                {!formData.is_free && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="e.g., 2999"
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Industry mentorship&#10;Real projects&#10;Job guarantee"
                  rows={4}
                />
              </div>

              {/* Outcomes */}
              <div className="space-y-2">
                <Label htmlFor="outcomes">Outcomes (one per line)</Label>
                <Textarea
                  id="outcomes"
                  value={formData.outcomes}
                  onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
                  placeholder="Job-ready skills&#10;Industry connections&#10;Portfolio projects"
                  rows={4}
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_highlighted"
                    checked={formData.is_highlighted}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_highlighted: checked })}
                  />
                  <Label htmlFor="is_highlighted">Highlighted</Label>
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingProgram ? "Update Program" : "Create Program"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : programs.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No programs yet</h3>
          <p className="text-muted-foreground mb-4">Create your first program to get started.</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Program
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card key={program.id} className="overflow-hidden">
              {program.banner_url ? (
                <div className="relative h-40">
                  <img
                    src={program.banner_url}
                    alt={program.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {program.is_highlighted && (
                      <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        Highlighted
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      program.is_free 
                        ? "bg-green-500 text-white" 
                        : "bg-amber-500 text-white"
                    }`}>
                      {formatPrice(program)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                  <Sparkles className="w-12 h-12 text-primary/50" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {program.is_highlighted && (
                      <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        Highlighted
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      program.is_free 
                        ? "bg-green-500 text-white" 
                        : "bg-amber-500 text-white"
                    }`}>
                      {formatPrice(program)}
                    </span>
                  </div>
                </div>
              )}

              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{program.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      program.is_active
                        ? "bg-green-500/20 text-green-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {program.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {program.duration && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    <span>{program.duration}</span>
                  </div>
                )}

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {program.description || "No description"}
                </p>

                {program.features && program.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {program.features.slice(0, 2).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                      >
                        {feature}
                      </span>
                    ))}
                    {program.features.length > 2 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                        +{program.features.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(program)}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(program.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPrograms;