import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Eye,
  Search
} from "lucide-react";
import { format } from "date-fns";

interface MentorWithProfile {
  id: string;
  user_id: string;
  verification_status: string;
  verified_at: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  bio: string | null;
  expertise: string[] | null;
  specialization: string | null;
  years_of_experience: number | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    institution: string | null;
  };
}

const AdminMentorVerification = () => {
  const [mentors, setMentors] = useState<MentorWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<MentorWithProfile | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const { data: mentorProfiles, error } = await supabase
        .from("mentor_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for these mentors
      const userIds = mentorProfiles?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, institution")
        .in("user_id", userIds);

      // Combine mentor profiles with user profiles
      const mentorsWithProfiles = mentorProfiles?.map(mentor => ({
        ...mentor,
        profile: profiles?.find(p => p.user_id === mentor.user_id),
      })) || [];

      setMentors(mentorsWithProfiles);
    } catch (error: any) {
      toast.error("Failed to fetch mentors: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (mentorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("mentor_profiles")
        .update({
          verification_status: "verified",
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
        })
        .eq("id", mentorId);

      if (error) throw error;

      toast.success("Mentor verified successfully");
      fetchMentors();
      setIsViewDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to verify mentor: " + error.message);
    }
  };

  const handleReject = async () => {
    if (!selectedMentor) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("mentor_profiles")
        .update({
          verification_status: "rejected",
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
          rejection_reason: rejectionReason || "Application did not meet requirements",
        })
        .eq("id", selectedMentor.id);

      if (error) throw error;

      toast.success("Mentor application rejected");
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      fetchMentors();
    } catch (error: any) {
      toast.error("Failed to reject mentor: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesTab = selectedTab === "all" || mentor.verification_status === selectedTab;
    const matchesSearch = !searchQuery || 
      mentor.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    pending: mentors.filter(m => m.verification_status === "pending").length,
    verified: mentors.filter(m => m.verification_status === "verified").length,
    rejected: mentors.filter(m => m.verification_status === "rejected").length,
  };

  return (
    <AdminLayout title="Mentor Verification">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{counts.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{counts.verified}</p>
                <p className="text-sm text-muted-foreground">Verified Mentors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <UserX className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{counts.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList>
                  <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
                  <TabsTrigger value="verified">Verified ({counts.verified})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
                  <TabsTrigger value="all">All ({mentors.length})</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search mentors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mentors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mentor Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : filteredMentors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No mentor applications found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Expertise</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMentors.map((mentor) => (
                    <TableRow key={mentor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
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
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertise?.slice(0, 2).map((exp) => (
                            <Badge key={exp} variant="outline" className="text-xs">{exp}</Badge>
                          ))}
                          {(mentor.expertise?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">+{(mentor.expertise?.length || 0) - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {mentor.years_of_experience ? `${mentor.years_of_experience} years` : "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(mentor.verification_status || "pending")}</TableCell>
                      <TableCell>
                        {format(new Date(mentor.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMentor(mentor);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {mentor.verification_status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleVerify(mentor.id)}
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedMentor(mentor);
                                  setIsRejectDialogOpen(true);
                                }}
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Mentor Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Mentor Profile</DialogTitle>
            </DialogHeader>
            {selectedMentor && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                      {selectedMentor.profile?.full_name?.charAt(0) || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold">{selectedMentor.profile?.full_name || "Unknown"}</h3>
                    <p className="text-muted-foreground">{selectedMentor.profile?.email}</p>
                    {getStatusBadge(selectedMentor.verification_status || "pending")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Specialization</p>
                    <p className="font-medium">{selectedMentor.specialization || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{selectedMentor.years_of_experience ? `${selectedMentor.years_of_experience} years` : "N/A"}</p>
                  </div>
                </div>

                {selectedMentor.bio && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p className="text-sm">{selectedMentor.bio}</p>
                  </div>
                )}

                {selectedMentor.expertise?.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.expertise.map((exp) => (
                        <Badge key={exp} variant="secondary">{exp}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  {selectedMentor.linkedin_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedMentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {selectedMentor.portfolio_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedMentor.portfolio_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                </div>

                {selectedMentor.verification_status === "pending" && (
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsRejectDialogOpen(true);
                      }}
                    >
                      Reject
                    </Button>
                    <Button onClick={() => handleVerify(selectedMentor.id)}>
                      Verify Mentor
                    </Button>
                  </DialogFooter>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Mentor Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this application.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMentorVerification;