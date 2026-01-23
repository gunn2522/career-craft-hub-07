import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Trophy, ExternalLink, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Domain {
  id: string;
  name: string;
}

interface Olympiad {
  id: string;
  name: string;
  short_name: string | null;
  description: string | null;
  eligibility_criteria: string | null;
  subjects: string[] | null;
  official_website: string | null;
  stream_id: string | null;
  exam_date: string | null;
  registration_deadline: string | null;
  benefits: string | null;
  is_international: boolean;
  is_active: boolean;
  display_order: number;
  stream_name?: string;
}

const AdminOlympiads = () => {
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOlympiad, setEditingOlympiad] = useState<Olympiad | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    description: "",
    eligibility_criteria: "",
    subjects: "",
    official_website: "",
    stream_id: "",
    exam_date: "",
    registration_deadline: "",
    benefits: "",
    is_international: false,
    is_active: true
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [olympiadsRes, domainsRes] = await Promise.all([
        supabase.from("olympiads").select("*").order("display_order"),
        supabase.from("career_domains").select("id, name").eq("is_active", true)
      ]);

      if (olympiadsRes.data && domainsRes.data) {
        const enriched = olympiadsRes.data.map(o => ({
          ...o,
          stream_name: domainsRes.data.find(d => d.id === o.stream_id)?.name
        }));
        setOlympiads(enriched);
      }
      if (domainsRes.data) setDomains(domainsRes.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOlympiads = filterType === "all" 
    ? olympiads 
    : filterType === "international" 
      ? olympiads.filter(o => o.is_international)
      : olympiads.filter(o => !o.is_international);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        ...formData,
        stream_id: formData.stream_id || null,
        subjects: formData.subjects ? formData.subjects.split(",").map(s => s.trim()) : null
      };

      if (editingOlympiad) {
        const { error } = await supabase.from("olympiads").update(payload).eq("id", editingOlympiad.id);
        if (error) throw error;
        toast({ title: "Success", description: "Olympiad updated" });
      } else {
        const { error } = await supabase.from("olympiads").insert([{ ...payload, display_order: olympiads.length }]);
        if (error) throw error;
        toast({ title: "Success", description: "Olympiad created" });
      }
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await supabase.from("olympiads").delete().eq("id", deleteId);
      toast({ title: "Olympiad deleted" });
      setDeleteId(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (olympiad: Olympiad) => {
    setEditingOlympiad(olympiad);
    setFormData({
      name: olympiad.name,
      short_name: olympiad.short_name || "",
      description: olympiad.description || "",
      eligibility_criteria: olympiad.eligibility_criteria || "",
      subjects: olympiad.subjects?.join(", ") || "",
      official_website: olympiad.official_website || "",
      stream_id: olympiad.stream_id || "",
      exam_date: olympiad.exam_date || "",
      registration_deadline: olympiad.registration_deadline || "",
      benefits: olympiad.benefits || "",
      is_international: olympiad.is_international,
      is_active: olympiad.is_active
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingOlympiad(null);
    setFormData({
      name: "",
      short_name: "",
      description: "",
      eligibility_criteria: "",
      subjects: "",
      official_website: "",
      stream_id: "",
      exam_date: "",
      registration_deadline: "",
      benefits: "",
      is_international: false,
      is_active: true
    });
    setDialogOpen(false);
  };

  return (
    <AdminLayout title="Olympiads & Competitions">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <p className="text-muted-foreground">Manage olympiads, competitions, and talent search exams</p>
        <div className="flex gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Olympiads</SelectItem>
              <SelectItem value="international">International</SelectItem>
              <SelectItem value="national">National</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}><Plus className="w-4 h-4 mr-2" /> Add Olympiad</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingOlympiad ? "Edit Olympiad" : "Add Olympiad"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="International Mathematical Olympiad" />
                </div>
                <div>
                  <Label>Short Name</Label>
                  <Input value={formData.short_name} onChange={(e) => setFormData({ ...formData, short_name: e.target.value })} placeholder="IMO" />
                </div>
                <div>
                  <Label>Stream</Label>
                  <Select value={formData.stream_id} onValueChange={(v) => setFormData({ ...formData, stream_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                    <SelectContent>
                      {domains.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Subjects (comma-separated)</Label>
                  <Input value={formData.subjects} onChange={(e) => setFormData({ ...formData, subjects: e.target.value })} placeholder="Mathematics, Physics, Chemistry" />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" />
                </div>
                <div className="col-span-2">
                  <Label>Eligibility Criteria</Label>
                  <Textarea value={formData.eligibility_criteria} onChange={(e) => setFormData({ ...formData, eligibility_criteria: e.target.value })} placeholder="Who can participate" />
                </div>
                <div>
                  <Label>Exam Date</Label>
                  <Input value={formData.exam_date} onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })} placeholder="July 2025" />
                </div>
                <div>
                  <Label>Registration Deadline</Label>
                  <Input value={formData.registration_deadline} onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })} placeholder="March 2025" />
                </div>
                <div className="col-span-2">
                  <Label>Official Website</Label>
                  <Input value={formData.official_website} onChange={(e) => setFormData({ ...formData, official_website: e.target.value })} placeholder="https://imo-official.org" />
                </div>
                <div className="col-span-2">
                  <Label>Benefits</Label>
                  <Textarea value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} placeholder="Scholarships, recognition, college admissions boost" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_international} onCheckedChange={(c) => setFormData({ ...formData, is_international: c })} />
                    <Label>International</Label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit}>{editingOlympiad ? "Update" : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : filteredOlympiads.length === 0 ? (
        <Card className="p-12 text-center">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Olympiads Added</h3>
          <p className="text-muted-foreground mb-4">Add olympiads and competitions for students to participate</p>
          <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Olympiad</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOlympiads.map((olympiad) => (
            <Card key={olympiad.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{olympiad.short_name || olympiad.name}</CardTitle>
                      {olympiad.official_website && (
                        <a href={olympiad.official_website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                    </div>
                    {olympiad.short_name && <p className="text-sm text-muted-foreground">{olympiad.name}</p>}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {olympiad.is_international && (
                      <Badge variant="default" className="gap-1">
                        <Globe className="w-3 h-3" /> International
                      </Badge>
                    )}
                    {!olympiad.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{olympiad.description || "No description"}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {olympiad.stream_name && <Badge variant="outline">{olympiad.stream_name}</Badge>}
                  {olympiad.subjects?.slice(0, 2).map((s, i) => (
                    <Badge key={i} variant="secondary">{s}</Badge>
                  ))}
                  {(olympiad.subjects?.length || 0) > 2 && (
                    <Badge variant="secondary">+{(olympiad.subjects?.length || 0) - 2}</Badge>
                  )}
                </div>
                {olympiad.exam_date && (
                  <p className="text-xs text-muted-foreground mb-4">Exam: {olympiad.exam_date}</p>
                )}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(olympiad)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(olympiad.id)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Olympiad?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminOlympiads;
