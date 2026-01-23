import { useState, useEffect } from "react";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
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
import { Plus, Briefcase, MapPin, Clock, Edit, Trash2 } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  job_type: string | null;
  experience_level: string | null;
  salary_range: string | null;
  is_active: boolean;
  created_at: string;
}

const PartnerJobs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    job_type: "full-time",
    experience_level: "entry",
    salary_range: "",
    apply_url: "",
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: partner } = await supabase
        .from("partner_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (partner) {
        setPartnerId(partner.id);
        // Jobs table may not exist yet - this is a placeholder
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId) {
      toast({ title: "Error", description: "Please create your company profile first.", variant: "destructive" });
      return;
    }

    try {
      // Jobs functionality coming soon
      toast({ title: "Coming Soon", description: "Job posting feature will be available soon" });
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save job posting", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    toast({ title: "Coming Soon", description: "Delete feature will be available soon" });
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description || "",
      location: job.location || "",
      job_type: job.job_type || "full-time",
      experience_level: job.experience_level || "entry",
      salary_range: job.salary_range || "",
      apply_url: "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", location: "", job_type: "full-time", experience_level: "entry", salary_range: "", apply_url: "" });
    setEditingJob(null);
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <PartnerLayout title="Job Postings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout title="Job Postings">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Post job openings and internships</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}><Plus className="w-4 h-4 mr-2" />Post Job</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingJob ? "Edit Job" : "Post New Job"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Job Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                <Textarea placeholder="Job Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                <Input placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Select value={formData.job_type} onValueChange={(v) => setFormData({ ...formData, job_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Job Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={formData.experience_level} onValueChange={(v) => setFormData({ ...formData, experience_level: v })}>
                    <SelectTrigger><SelectValue placeholder="Experience" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Salary Range (e.g., ₹5-8 LPA)" value={formData.salary_range} onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })} />
                <Input placeholder="Apply URL (optional)" value={formData.apply_url} onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })} />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1">{editingJob ? "Update" : "Post"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No job postings yet. Post your first job!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <Badge variant={job.is_active ? "default" : "secondary"}>
                      {job.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description || "No description"}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                    {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                    {job.job_type && <Badge variant="outline" className="capitalize">{job.job_type}</Badge>}
                    {job.experience_level && <Badge variant="outline" className="capitalize">{job.experience_level}</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(job)}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(job.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PartnerLayout>
  );
};

export default PartnerJobs;
