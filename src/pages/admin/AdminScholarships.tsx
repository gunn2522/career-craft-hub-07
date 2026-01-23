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
import { Plus, Edit, Trash2, Award, ExternalLink, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Domain {
  id: string;
  name: string;
}

interface Scholarship {
  id: string;
  name: string;
  provider: string | null;
  description: string | null;
  eligibility_criteria: string | null;
  amount: string | null;
  application_deadline: string | null;
  application_link: string | null;
  stream_id: string | null;
  category_id: string | null;
  is_government: boolean;
  is_active: boolean;
  display_order: number;
  stream_name?: string;
}

const AdminScholarships = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    description: "",
    eligibility_criteria: "",
    amount: "",
    application_deadline: "",
    application_link: "",
    stream_id: "",
    is_government: false,
    is_active: true
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [scholarshipsRes, domainsRes] = await Promise.all([
        supabase.from("scholarships").select("*").order("display_order"),
        supabase.from("career_domains").select("id, name").eq("is_active", true)
      ]);

      if (scholarshipsRes.data && domainsRes.data) {
        const enriched = scholarshipsRes.data.map(s => ({
          ...s,
          stream_name: domainsRes.data.find(d => d.id === s.stream_id)?.name
        }));
        setScholarships(enriched);
      }
      if (domainsRes.data) setDomains(domainsRes.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredScholarships = filterType === "all" 
    ? scholarships 
    : filterType === "government" 
      ? scholarships.filter(s => s.is_government)
      : scholarships.filter(s => !s.is_government);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        ...formData,
        stream_id: formData.stream_id || null
      };

      if (editingScholarship) {
        const { error } = await supabase.from("scholarships").update(payload).eq("id", editingScholarship.id);
        if (error) throw error;
        toast({ title: "Success", description: "Scholarship updated" });
      } else {
        const { error } = await supabase.from("scholarships").insert([{ ...payload, display_order: scholarships.length }]);
        if (error) throw error;
        toast({ title: "Success", description: "Scholarship created" });
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
      await supabase.from("scholarships").delete().eq("id", deleteId);
      toast({ title: "Scholarship deleted" });
      setDeleteId(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (scholarship: Scholarship) => {
    setEditingScholarship(scholarship);
    setFormData({
      name: scholarship.name,
      provider: scholarship.provider || "",
      description: scholarship.description || "",
      eligibility_criteria: scholarship.eligibility_criteria || "",
      amount: scholarship.amount || "",
      application_deadline: scholarship.application_deadline || "",
      application_link: scholarship.application_link || "",
      stream_id: scholarship.stream_id || "",
      is_government: scholarship.is_government,
      is_active: scholarship.is_active
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingScholarship(null);
    setFormData({
      name: "",
      provider: "",
      description: "",
      eligibility_criteria: "",
      amount: "",
      application_deadline: "",
      application_link: "",
      stream_id: "",
      is_government: false,
      is_active: true
    });
    setDialogOpen(false);
  };

  return (
    <AdminLayout title="Scholarships">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <p className="text-muted-foreground">Manage government and private scholarships for students</p>
        <div className="flex gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scholarships</SelectItem>
              <SelectItem value="government">Government Only</SelectItem>
              <SelectItem value="private">Private Only</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}><Plus className="w-4 h-4 mr-2" /> Add Scholarship</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingScholarship ? "Edit Scholarship" : "Add Scholarship"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="National Means-cum-Merit Scholarship" />
                </div>
                <div>
                  <Label>Provider</Label>
                  <Input value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} placeholder="Ministry of Education" />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="₹12,000/year" />
                </div>
                <div>
                  <Label>Stream</Label>
                  <Select value={formData.stream_id} onValueChange={(v) => setFormData({ ...formData, stream_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select stream (optional)" /></SelectTrigger>
                    <SelectContent>
                      {domains.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Application Deadline</Label>
                  <Input value={formData.application_deadline} onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })} placeholder="December 2025" />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" />
                </div>
                <div className="col-span-2">
                  <Label>Eligibility Criteria</Label>
                  <Textarea value={formData.eligibility_criteria} onChange={(e) => setFormData({ ...formData, eligibility_criteria: e.target.value })} placeholder="Who can apply" />
                </div>
                <div className="col-span-2">
                  <Label>Application Link</Label>
                  <Input value={formData.application_link} onChange={(e) => setFormData({ ...formData, application_link: e.target.value })} placeholder="https://scholarships.gov.in" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_government} onCheckedChange={(c) => setFormData({ ...formData, is_government: c })} />
                    <Label>Government Scholarship</Label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit}>{editingScholarship ? "Update" : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : filteredScholarships.length === 0 ? (
        <Card className="p-12 text-center">
          <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Scholarships Added</h3>
          <p className="text-muted-foreground mb-4">Add scholarships to help students find financial support</p>
          <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Scholarship</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship) => (
            <Card key={scholarship.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                      {scholarship.application_link && (
                        <a href={scholarship.application_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                    </div>
                    {scholarship.provider && <p className="text-sm text-muted-foreground">{scholarship.provider}</p>}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant={scholarship.is_government ? "default" : "outline"}>
                      {scholarship.is_government ? "Government" : "Private"}
                    </Badge>
                    {!scholarship.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{scholarship.description || "No description"}</p>
                {scholarship.amount && (
                  <div className="flex items-center gap-1 text-sm font-medium text-primary mb-3">
                    <IndianRupee className="w-4 h-4" />
                    {scholarship.amount}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {scholarship.stream_name && <Badge variant="outline">{scholarship.stream_name}</Badge>}
                </div>
                {scholarship.application_deadline && (
                  <p className="text-xs text-muted-foreground mb-4">Deadline: {scholarship.application_deadline}</p>
                )}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(scholarship)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(scholarship.id)}>
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
            <AlertDialogTitle>Delete Scholarship?</AlertDialogTitle>
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

export default AdminScholarships;
