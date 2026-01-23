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
import { Plus, Edit, Trash2, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Domain {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  domain_id: string;
}

interface Exam {
  id: string;
  name: string;
  short_name: string | null;
  description: string | null;
  eligibility_criteria: string | null;
  exam_pattern: string | null;
  official_website: string | null;
  stream_id: string | null;
  category_id: string | null;
  exam_date: string | null;
  registration_deadline: string | null;
  preparation_tips: string | null;
  is_active: boolean;
  display_order: number;
  icon: string | null;
  stream_name?: string;
  category_name?: string;
}

const AdminGovernmentExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
  const [filterStream, setFilterStream] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    description: "",
    eligibility_criteria: "",
    exam_pattern: "",
    official_website: "",
    stream_id: "",
    category_id: "",
    exam_date: "",
    registration_deadline: "",
    preparation_tips: "",
    is_active: true,
    icon: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [examsRes, domainsRes, categoriesRes] = await Promise.all([
        supabase.from("government_exams").select("*").order("display_order"),
        supabase.from("career_domains").select("id, name").eq("is_active", true),
        supabase.from("career_categories").select("id, name, domain_id").eq("is_active", true)
      ]);

      if (examsRes.data && domainsRes.data) {
        const enrichedExams = examsRes.data.map(exam => ({
          ...exam,
          stream_name: domainsRes.data.find(d => d.id === exam.stream_id)?.name,
          category_name: categoriesRes.data?.find(c => c.id === exam.category_id)?.name
        }));
        setExams(enrichedExams);
      }
      if (domainsRes.data) setDomains(domainsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExams = filterStream === "all" ? exams : exams.filter(e => e.stream_id === filterStream);
  const filteredCategories = formData.stream_id ? categories.filter(c => c.domain_id === formData.stream_id) : categories;

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        ...formData,
        stream_id: formData.stream_id || null,
        category_id: formData.category_id || null
      };

      if (editingExam) {
        const { error } = await supabase.from("government_exams").update(payload).eq("id", editingExam.id);
        if (error) throw error;
        toast({ title: "Success", description: "Exam updated successfully" });
      } else {
        const { error } = await supabase.from("government_exams").insert([{ ...payload, display_order: exams.length }]);
        if (error) throw error;
        toast({ title: "Success", description: "Exam created successfully" });
      }
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteExamId) return;
    try {
      const { error } = await supabase.from("government_exams").delete().eq("id", deleteExamId);
      if (error) throw error;
      toast({ title: "Success", description: "Exam deleted successfully" });
      setDeleteExamId(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      short_name: exam.short_name || "",
      description: exam.description || "",
      eligibility_criteria: exam.eligibility_criteria || "",
      exam_pattern: exam.exam_pattern || "",
      official_website: exam.official_website || "",
      stream_id: exam.stream_id || "",
      category_id: exam.category_id || "",
      exam_date: exam.exam_date || "",
      registration_deadline: exam.registration_deadline || "",
      preparation_tips: exam.preparation_tips || "",
      is_active: exam.is_active,
      icon: exam.icon || ""
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingExam(null);
    setFormData({
      name: "",
      short_name: "",
      description: "",
      eligibility_criteria: "",
      exam_pattern: "",
      official_website: "",
      stream_id: "",
      category_id: "",
      exam_date: "",
      registration_deadline: "",
      preparation_tips: "",
      is_active: true,
      icon: ""
    });
    setDialogOpen(false);
  };

  return (
    <AdminLayout title="Government Exams">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <p className="text-muted-foreground">Manage competitive and government exams like JEE, NEET, CLAT, etc.</p>
        <div className="flex gap-3">
          <Select value={filterStream} onValueChange={setFilterStream}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filter by stream" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Streams</SelectItem>
              {domains.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}><Plus className="w-4 h-4 mr-2" /> Add Exam</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingExam ? "Edit Exam" : "Add New Exam"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Joint Entrance Examination (Main)" />
                </div>
                <div>
                  <Label>Short Name</Label>
                  <Input value={formData.short_name} onChange={(e) => setFormData({ ...formData, short_name: e.target.value })} placeholder="JEE Main" />
                </div>
                <div>
                  <Label>Icon</Label>
                  <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="FileText" />
                </div>
                <div>
                  <Label>Stream</Label>
                  <Select value={formData.stream_id} onValueChange={(v) => setFormData({ ...formData, stream_id: v, category_id: "" })}>
                    <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                    <SelectContent>
                      {domains.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the exam" />
                </div>
                <div className="col-span-2">
                  <Label>Eligibility Criteria</Label>
                  <Textarea value={formData.eligibility_criteria} onChange={(e) => setFormData({ ...formData, eligibility_criteria: e.target.value })} placeholder="Who can appear for this exam" />
                </div>
                <div className="col-span-2">
                  <Label>Exam Pattern</Label>
                  <Textarea value={formData.exam_pattern} onChange={(e) => setFormData({ ...formData, exam_pattern: e.target.value })} placeholder="Pattern, duration, marking scheme" />
                </div>
                <div>
                  <Label>Exam Date</Label>
                  <Input value={formData.exam_date} onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })} placeholder="April-May 2025" />
                </div>
                <div>
                  <Label>Registration Deadline</Label>
                  <Input value={formData.registration_deadline} onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })} placeholder="March 2025" />
                </div>
                <div className="col-span-2">
                  <Label>Official Website</Label>
                  <Input value={formData.official_website} onChange={(e) => setFormData({ ...formData, official_website: e.target.value })} placeholder="https://jeemain.nta.nic.in" />
                </div>
                <div className="col-span-2">
                  <Label>Preparation Tips</Label>
                  <Textarea value={formData.preparation_tips} onChange={(e) => setFormData({ ...formData, preparation_tips: e.target.value })} placeholder="Tips for students preparing for this exam" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit}>{editingExam ? "Update" : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : filteredExams.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Exams Added</h3>
          <p className="text-muted-foreground mb-4">Add government and competitive exams to help students prepare</p>
          <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Exam</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{exam.short_name || exam.name}</CardTitle>
                      {exam.official_website && (
                        <a href={exam.official_website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                    </div>
                    {exam.short_name && <p className="text-sm text-muted-foreground">{exam.name}</p>}
                  </div>
                  <Badge variant={exam.is_active ? "default" : "secondary"}>
                    {exam.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{exam.description || "No description"}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {exam.stream_name && <Badge variant="outline">{exam.stream_name}</Badge>}
                  {exam.category_name && <Badge variant="outline">{exam.category_name}</Badge>}
                </div>
                {(exam.exam_date || exam.registration_deadline) && (
                  <div className="text-xs text-muted-foreground mb-4">
                    {exam.exam_date && <p>Exam: {exam.exam_date}</p>}
                    {exam.registration_deadline && <p>Registration: {exam.registration_deadline}</p>}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(exam)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteExamId(exam.id)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteExamId} onOpenChange={() => setDeleteExamId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this exam and its career mappings.</AlertDialogDescription>
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

export default AdminGovernmentExams;
