import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, CheckCircle, XCircle, Clock, Calendar, 
  Linkedin, ExternalLink, User, Briefcase, Eye,
  AlertCircle, RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface MentorWithProfile {
  id: string;
  user_id: string;
  verification_status: string;
  email_verified: boolean;
  linkedin_url: string | null;
  verified_domain_id: string | null;
  interview_notes: string | null;
  created_at: string;
  is_verified: boolean;
  profile: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  domain: {
    name: string;
  } | null;
}

interface Interview {
  id: string;
  mentor_id: string;
  domain_id: string;
  status: string;
  scheduled_at: string | null;
  ai_evaluation_score: number | null;
  ai_evaluation_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  mentor_name?: string;
  mentor_email?: string;
  mentor_avatar?: string;
  domain_name?: string;
}

const AdminMentorManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<MentorWithProfile | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [interviewDialog, setInterviewDialog] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [interviewResult, setInterviewResult] = useState<"passed" | "failed" | "">("");

  // Fetch all mentor profiles
  const { data: mentors, isLoading: mentorsLoading } = useQuery({
    queryKey: ["admin-mentors"],
    queryFn: async () => {
      // Use any to bypass strict type checking for new columns
      const { data, error } = await (supabase
        .from("mentor_profiles") as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const userIds = data.map((m: any) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url")
        .in("user_id", userIds);

      const domainIds = data.filter((m: any) => m.verified_domain_id).map((m: any) => m.verified_domain_id);
      const { data: domains } = domainIds.length > 0 
        ? await supabase.from("career_domains").select("id, name").in("id", domainIds)
        : { data: [] };

      return data.map((mentor: any) => ({
        ...mentor,
        profile: profiles?.find(p => p.user_id === mentor.user_id) || null,
        domain: domains?.find((d: any) => d.id === mentor.verified_domain_id) || null
      })) as MentorWithProfile[];
    }
  });

  // Fetch interviews
  const { data: interviews, isLoading: interviewsLoading } = useQuery({
    queryKey: ["admin-mentor-interviews"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("mentor_interviews") as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const mentorIds = data.map((i: any) => i.mentor_id);
      const { data: mentorProfiles } = await (supabase
        .from("mentor_profiles") as any)
        .select("id, user_id")
        .in("id", mentorIds);

      const userIds = mentorProfiles?.map((m: any) => m.user_id) || [];
      const { data: profiles } = userIds.length > 0 
        ? await supabase.from("profiles").select("user_id, full_name, email, avatar_url").in("user_id", userIds)
        : { data: [] };

      const domainIds = data.filter((i: any) => i.domain_id).map((i: any) => i.domain_id);
      const { data: domains } = domainIds.length > 0 
        ? await supabase.from("career_domains").select("id, name").in("id", domainIds)
        : { data: [] };

      return data.map((interview: any) => {
        const mentorProfile = mentorProfiles?.find((m: any) => m.id === interview.mentor_id);
        const profile = profiles?.find((p: any) => p.user_id === mentorProfile?.user_id);
        return {
          ...interview,
          mentor_name: profile?.full_name || "Unknown",
          mentor_email: profile?.email,
          mentor_avatar: profile?.avatar_url,
          domain_name: domains?.find((d: any) => d.id === interview.domain_id)?.name || "Unknown"
        };
      }) as Interview[];
    }
  });

  // Schedule interview mutation
  const scheduleInterviewMutation = useMutation({
    mutationFn: async ({ interviewId, scheduledAt }: { interviewId: string; scheduledAt: string }) => {
      const { error } = await (supabase
        .from("mentor_interviews") as any)
        .update({
          status: "scheduled",
          scheduled_at: scheduledAt,
          updated_at: new Date().toISOString()
        })
        .eq("id", interviewId);

      if (error) throw error;

      const interview = interviews?.find(i => i.id === interviewId);
      if (interview) {
        await (supabase
          .from("mentor_profiles") as any)
          .update({ verification_status: "interview_scheduled" })
          .eq("id", interview.mentor_id);
      }
    },
    onSuccess: () => {
      toast.success("Interview scheduled successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-mentor-interviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
      setInterviewDialog(false);
    },
    onError: (error) => {
      console.error("Error scheduling interview:", error);
      toast.error("Failed to schedule interview");
    }
  });

  // Complete interview mutation
  const completeInterviewMutation = useMutation({
    mutationFn: async ({ 
      interviewId, 
      result, 
      notes 
    }: { 
      interviewId: string; 
      result: "passed" | "failed"; 
      notes: string 
    }) => {
      const interview = interviews?.find(i => i.id === interviewId);
      if (!interview) throw new Error("Interview not found");

      const { error } = await (supabase
        .from("mentor_interviews") as any)
        .update({
          status: result,
          result: result,
          admin_notes: notes,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", interviewId);

      if (error) throw error;

      await (supabase
        .from("mentor_profiles") as any)
        .update({ 
          verification_status: result === "passed" ? "verified" : "interview_failed",
          is_verified: result === "passed",
          verified_at: result === "passed" ? new Date().toISOString() : null,
          interview_result: result,
          interview_notes: notes
        })
        .eq("id", interview.mentor_id);
    },
    onSuccess: () => {
      toast.success("Interview result recorded");
      queryClient.invalidateQueries({ queryKey: ["admin-mentor-interviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
      setInterviewDialog(false);
      setSelectedInterview(null);
    },
    onError: (error) => {
      console.error("Error completing interview:", error);
      toast.error("Failed to record interview result");
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      unverified: { variant: "outline", label: "Unverified" },
      pending_email: { variant: "outline", label: "Email Pending" },
      pending_profile: { variant: "outline", label: "Profile Pending" },
      pending_domain: { variant: "outline", label: "Domain Pending" },
      pending_interview: { variant: "secondary", label: "Awaiting Interview" },
      interview_scheduled: { variant: "default", label: "Interview Scheduled" },
      interview_failed: { variant: "destructive", label: "Interview Failed" },
      verified: { variant: "default", label: "Verified" }
    };

    const config = statusConfig[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredMentors = mentors?.filter(m => 
    m.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingInterviews = interviews?.filter(i => i.status === "pending" || i.status === "scheduled");

  return (
    <AdminLayout title="Mentor Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mentor Management</h1>
          <p className="text-muted-foreground">
            Manage mentor verification, interviews, and domain approvals
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Mentors</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Interviews
              {pendingInterviews && pendingInterviews.length > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingInterviews.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="domain-requests">Domain Change Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search mentors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-mentors"] })}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentorsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredMentors?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No mentors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMentors?.map((mentor) => (
                      <TableRow key={mentor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={mentor.profile?.avatar_url || ""} />
                              <AvatarFallback>
                                {mentor.profile?.full_name?.charAt(0) || "M"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{mentor.profile?.full_name || "Unknown"}</p>
                              <p className="text-sm text-muted-foreground">{mentor.profile?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(mentor.verification_status || "unverified")}</TableCell>
                        <TableCell>{mentor.domain?.name || "-"}</TableCell>
                        <TableCell>
                          {mentor.linkedin_url ? (
                            <a 
                              href={mentor.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <Linkedin className="h-4 w-4" />
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : "-"}
                        </TableCell>
                        <TableCell>{format(new Date(mentor.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedMentor(mentor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Interview Queue</CardTitle>
                <CardDescription>
                  Mentors awaiting interview scheduling or completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interviewsLoading ? (
                  <p className="text-center py-8">Loading...</p>
                ) : pendingInterviews?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending interviews</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingInterviews?.map((interview) => (
                      <Card key={interview.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={interview.mentor_avatar || ""} />
                              <AvatarFallback>
                                {interview.mentor_name?.charAt(0) || "M"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{interview.mentor_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Domain: {interview.domain_name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {interview.status === "pending" ? (
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <Calendar className="h-3 w-3" />
                                {interview.scheduled_at 
                                  ? format(new Date(interview.scheduled_at), "MMM d, h:mm a")
                                  : "Scheduled"}
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedInterview(interview);
                                setInterviewDialog(true);
                              }}
                            >
                              {interview.status === "pending" ? "Schedule" : "Complete"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="domain-requests">
            <Card>
              <CardHeader>
                <CardTitle>Domain Change Requests</CardTitle>
                <CardDescription>
                  Mentors requesting to add new domains or categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending domain change requests</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={interviewDialog} onOpenChange={setInterviewDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedInterview?.status === "pending" 
                  ? "Schedule Interview" 
                  : "Complete Interview"}
              </DialogTitle>
              <DialogDescription>
                {selectedInterview?.mentor_name} - {selectedInterview?.domain_name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedInterview?.status === "pending" ? (
                <div className="space-y-2">
                  <Label>Interview Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Interview Result</Label>
                    <Select value={interviewResult} onValueChange={(v) => setInterviewResult(v as "passed" | "failed")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passed">Passed - Verify Mentor</SelectItem>
                        <SelectItem value="failed">Failed - Needs Improvement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Notes</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Notes about the interview..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setInterviewDialog(false)}>
                Cancel
              </Button>
              {selectedInterview?.status === "pending" ? (
                <Button
                  onClick={() => {
                    if (selectedInterview && scheduleDate) {
                      scheduleInterviewMutation.mutate({
                        interviewId: selectedInterview.id,
                        scheduledAt: new Date(scheduleDate).toISOString()
                      });
                    }
                  }}
                  disabled={!scheduleDate || scheduleInterviewMutation.isPending}
                >
                  Schedule Interview
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (selectedInterview && interviewResult) {
                      completeInterviewMutation.mutate({
                        interviewId: selectedInterview.id,
                        result: interviewResult,
                        notes: adminNotes
                      });
                    }
                  }}
                  disabled={!interviewResult || completeInterviewMutation.isPending}
                >
                  Save Result
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Mentor Details</DialogTitle>
            </DialogHeader>
            {selectedMentor && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedMentor.profile?.avatar_url || ""} />
                    <AvatarFallback className="text-xl">
                      {selectedMentor.profile?.full_name?.charAt(0) || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedMentor.profile?.full_name}</h3>
                    <p className="text-muted-foreground">{selectedMentor.profile?.email}</p>
                    {getStatusBadge(selectedMentor.verification_status || "unverified")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email Verified</p>
                    <p className="font-medium flex items-center gap-1">
                      {selectedMentor.email_verified ? (
                        <><CheckCircle className="h-4 w-4 text-green-600" /> Yes</>
                      ) : (
                        <><XCircle className="h-4 w-4 text-red-600" /> No</>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Domain</p>
                    <p className="font-medium">{selectedMentor.domain?.name || "Not selected"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">LinkedIn</p>
                    {selectedMentor.linkedin_url ? (
                      <a 
                        href={selectedMentor.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {selectedMentor.linkedin_url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="font-medium">Not provided</p>
                    )}
                  </div>
                </div>

                {selectedMentor.interview_notes && (
                  <div>
                    <p className="text-muted-foreground text-sm">Interview Notes</p>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedMentor.interview_notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMentorManagement;
