import { useState } from "react";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plus, Briefcase, MapPin, Clock, Users,
  Trash2, Edit2, Eye, AlertCircle, DollarSign
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string | null;
  job_type: string;
  experience_level: string;
  location: string | null;
  is_remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  application_url: string | null;
  application_deadline: string | null;
  requirements: string[] | null;
  responsibilities: string[] | null;
  skills_required: string[] | null;
  domain_id: string | null;
  category_id: string | null;
  target_years: string[] | null;
  target_qualifications: string[] | null;
  target_streams: string[] | null;
  is_active: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
}

interface Domain {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  domain_id: string;
}

const yearOptions = [
  { value: "first_year", label: "1st Year" },
  { value: "second_year", label: "2nd Year" },
  { value: "third_year", label: "3rd Year" },
  { value: "fourth_year", label: "4th Year" },
  { value: "final_year", label: "Final Year" }
];

const qualificationOptions = [
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "diploma", label: "Diploma" }
];

const streamOptions = [
  { value: "engineering", label: "Engineering" },
  { value: "science", label: "Science" },
  { value: "commerce", label: "Commerce" },
  { value: "arts", label: "Arts" },
  { value: "management", label: "Management" }
];

const PartnerJobsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("full_time");
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [targetYears, setTargetYears] = useState<string[]>([]);
  const [targetQualifications, setTargetQualifications] = useState<string[]>([]);
  const [targetStreams, setTargetStreams] = useState<string[]>([]);

  // Fetch partner profile
  const { data: partnerProfile } = useQuery({
    queryKey: ["partner-profile", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("partner_profiles")
        .select("id, verification_status")
        .eq("user_id", user?.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user
  });

  // Fetch domains
  const { data: domains } = useQuery({
    queryKey: ["career-domains"],
    queryFn: async () => {
      const { data } = await supabase
        .from("career_domains")
        .select("id, name")
        .eq("is_active", true)
        .order("display_order");
      return data as Domain[];
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["career-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("career_categories")
        .select("id, name, domain_id")
        .eq("is_active", true)
        .order("display_order");
      return data as Category[];
    }
  });

  // Fetch jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["partner-jobs", partnerProfile?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("partner_jobs")
        .select("*")
        .eq("partner_id", partnerProfile?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Job[];
    },
    enabled: !!partnerProfile?.id
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setJobType("full_time");
    setExperienceLevel("entry");
    setLocation("");
    setIsRemote(false);
    setSalaryMin("");
    setSalaryMax("");
    setApplicationUrl("");
    setApplicationDeadline("");
    setRequirements("");
    setResponsibilities("");
    setSkillsRequired("");
    setSelectedDomain("");
    setSelectedCategory("");
    setTargetYears([]);
    setTargetQualifications([]);
    setTargetStreams([]);
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDescription(job.description || "");
    setJobType(job.job_type);
    setExperienceLevel(job.experience_level);
    setLocation(job.location || "");
    setIsRemote(job.is_remote);
    setSalaryMin(job.salary_min?.toString() || "");
    setSalaryMax(job.salary_max?.toString() || "");
    setApplicationUrl(job.application_url || "");
    setApplicationDeadline(job.application_deadline?.split("T")[0] || "");
    setRequirements(job.requirements?.join("\n") || "");
    setResponsibilities(job.responsibilities?.join("\n") || "");
    setSkillsRequired(job.skills_required?.join(", ") || "");
    setSelectedDomain(job.domain_id || "");
    setSelectedCategory(job.category_id || "");
    setTargetYears(job.target_years || []);
    setTargetQualifications(job.target_qualifications || []);
    setTargetStreams(job.target_streams || []);
  };

  const createJobMutation = useMutation({
    mutationFn: async () => {
      if (!title) throw new Error("Title is required");
      if (targetYears.length === 0 && targetQualifications.length === 0 && targetStreams.length === 0) {
        throw new Error("At least one audience target is required");
      }

      const { error } = await (supabase as any).from("partner_jobs").insert({
        partner_id: partnerProfile?.id,
        title,
        description: description || null,
        job_type: jobType,
        experience_level: experienceLevel,
        location: location || null,
        is_remote: isRemote,
        salary_min: salaryMin ? parseInt(salaryMin) : null,
        salary_max: salaryMax ? parseInt(salaryMax) : null,
        application_url: applicationUrl || null,
        application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
        requirements: requirements ? requirements.split("\n").filter(Boolean) : null,
        responsibilities: responsibilities ? responsibilities.split("\n").filter(Boolean) : null,
        skills_required: skillsRequired ? skillsRequired.split(",").map(s => s.trim()).filter(Boolean) : null,
        domain_id: selectedDomain || null,
        category_id: selectedCategory || null,
        target_years: targetYears,
        target_qualifications: targetQualifications,
        target_streams: targetStreams,
        is_active: true
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job posted successfully!");
      queryClient.invalidateQueries({ queryKey: ["partner-jobs"] });
      resetForm();
      setCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create job");
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: async () => {
      if (!editingJob) return;

      const { error } = await (supabase as any)
        .from("partner_jobs")
        .update({
          title,
          description: description || null,
          job_type: jobType,
          experience_level: experienceLevel,
          location: location || null,
          is_remote: isRemote,
          salary_min: salaryMin ? parseInt(salaryMin) : null,
          salary_max: salaryMax ? parseInt(salaryMax) : null,
          application_url: applicationUrl || null,
          application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
          requirements: requirements ? requirements.split("\n").filter(Boolean) : null,
          responsibilities: responsibilities ? responsibilities.split("\n").filter(Boolean) : null,
          skills_required: skillsRequired ? skillsRequired.split(",").map(s => s.trim()).filter(Boolean) : null,
          domain_id: selectedDomain || null,
          category_id: selectedCategory || null,
          target_years: targetYears,
          target_qualifications: targetQualifications,
          target_streams: targetStreams,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingJob.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job updated!");
      queryClient.invalidateQueries({ queryKey: ["partner-jobs"] });
      resetForm();
      setEditingJob(null);
    },
    onError: () => {
      toast.error("Failed to update job");
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await (supabase as any)
        .from("partner_jobs")
        .delete()
        .eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job deleted");
      queryClient.invalidateQueries({ queryKey: ["partner-jobs"] });
    },
    onError: () => {
      toast.error("Failed to delete job");
    }
  });

  const toggleJobMutation = useMutation({
    mutationFn: async ({ jobId, isActive }: { jobId: string; isActive: boolean }) => {
      const { error } = await (supabase as any)
        .from("partner_jobs")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-jobs"] });
    }
  });

  const filteredCategories = categories?.filter(c => c.domain_id === selectedDomain) || [];
  const isVerified = partnerProfile?.verification_status === "verified";

  if (!isVerified) {
    return (
      <PartnerLayout title="Job Postings">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Verification Required</h3>
            <p className="text-muted-foreground mb-4">
              You need to complete verification to post jobs
            </p>
            <Button asChild>
              <a href="/partner-dashboard/profile">Complete Profile</a>
            </Button>
          </CardContent>
        </Card>
      </PartnerLayout>
    );
  }

  const JobForm = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="space-y-2">
        <Label>Job Title *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Software Engineer" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Job Type</Label>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Experience Level</Label>
          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior Level</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Job description..." rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
        </div>
        <div className="flex items-center gap-2 pt-8">
          <Checkbox checked={isRemote} onCheckedChange={(checked) => setIsRemote(!!checked)} />
          <label className="text-sm">Remote work available</label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Salary Min (INR)</Label>
          <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="300000" />
        </div>
        <div className="space-y-2">
          <Label>Salary Max (INR)</Label>
          <Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="600000" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Application URL</Label>
          <Input value={applicationUrl} onChange={(e) => setApplicationUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label>Application Deadline</Label>
          <Input type="date" value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Domain</Label>
          <Select value={selectedDomain} onValueChange={(v) => { setSelectedDomain(v); setSelectedCategory(""); }}>
            <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
            <SelectContent>
              {domains?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!selectedDomain}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {filteredCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Skills Required (comma-separated)</Label>
        <Input value={skillsRequired} onChange={(e) => setSkillsRequired(e.target.value)} placeholder="React, Node.js, TypeScript" />
      </div>

      <div className="space-y-2">
        <Label>Requirements (one per line)</Label>
        <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Bachelor's degree in CS&#10;2+ years experience" rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Responsibilities (one per line)</Label>
        <Textarea value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} placeholder="Develop features&#10;Code reviews" rows={3} />
      </div>

      {/* Audience Targeting */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Audience Targeting *</CardTitle>
          <p className="text-sm text-muted-foreground">Select target audience for this job</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Target Years</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {yearOptions.map(opt => (
                <Badge
                  key={opt.value}
                  variant={targetYears.includes(opt.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setTargetYears(prev => 
                      prev.includes(opt.value) 
                        ? prev.filter(y => y !== opt.value)
                        : [...prev, opt.value]
                    );
                  }}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm">Target Qualifications</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {qualificationOptions.map(opt => (
                <Badge
                  key={opt.value}
                  variant={targetQualifications.includes(opt.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setTargetQualifications(prev => 
                      prev.includes(opt.value) 
                        ? prev.filter(q => q !== opt.value)
                        : [...prev, opt.value]
                    );
                  }}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm">Target Streams</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {streamOptions.map(opt => (
                <Badge
                  key={opt.value}
                  variant={targetStreams.includes(opt.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setTargetStreams(prev => 
                      prev.includes(opt.value) 
                        ? prev.filter(s => s !== opt.value)
                        : [...prev, opt.value]
                    );
                  }}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <PartnerLayout title="Job Postings">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Job Postings</h1>
            <p className="text-muted-foreground">Manage job opportunities for students</p>
          </div>
          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Post Job</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Job Posting</DialogTitle>
              </DialogHeader>
              <JobForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => { resetForm(); setCreateDialog(false); }}>Cancel</Button>
                <Button onClick={() => createJobMutation.mutate()} disabled={createJobMutation.isPending}>
                  {createJobMutation.isPending ? "Posting..." : "Post Job"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : jobs?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-4">Create your first job posting to attract students</p>
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />Post Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobs?.map((job) => (
              <Card key={job.id} className={!job.is_active ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline">{job.job_type.replace('_', ' ')}</Badge>
                        <Badge variant="secondary">{job.experience_level}</Badge>
                        {job.is_remote && <Badge>Remote</Badge>}
                        {!job.is_active && <Badge variant="destructive">Inactive</Badge>}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                      {job.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{job.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />{job.location}
                          </span>
                        )}
                        {(job.salary_min || job.salary_max) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary_min && job.salary_max 
                              ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`
                              : job.salary_min 
                                ? `₹${job.salary_min.toLocaleString()}+`
                                : `Up to ₹${job.salary_max?.toLocaleString()}`
                            }
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />{job.views_count} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />{job.applications_count} applications
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={job.is_active}
                        onCheckedChange={(checked) => toggleJobMutation.mutate({ jobId: job.id, isActive: checked })}
                      />
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(job)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Delete this job?")) {
                            deleteJobMutation.mutate(job.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingJob} onOpenChange={() => { setEditingJob(null); resetForm(); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Job Posting</DialogTitle>
            </DialogHeader>
            <JobForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditingJob(null); resetForm(); }}>Cancel</Button>
              <Button onClick={() => updateJobMutation.mutate()} disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PartnerLayout>
  );
};

export default PartnerJobsPage;