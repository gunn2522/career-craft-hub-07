import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search, CheckCircle, XCircle, Building2,
  Globe, Linkedin, ExternalLink, Eye, RefreshCw, Ban
} from "lucide-react";

interface PartnerWithProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_description: string | null;
  logo_url: string | null;
  company_website: string | null;
  industry: string | null;
  verification_status: string;
  approval_status: string | null;
  is_visible: boolean;
  profile_completion: number;
  created_at: string;
  social_links: any;
  email: string | null;
  slug: string | null;
}

const AdminPartnerVerification = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithProfile | null>(null);
  const [actionDialog, setActionDialog] = useState<"verify" | "reject" | "suspend" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: partners, isLoading } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("partner_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PartnerWithProfile[];
    }
  });

  const verifyPartnerMutation = useMutation({
    mutationFn: async (partnerId: string) => {
      const { error } = await (supabase as any)
        .from("partner_profiles")
        .update({
          verification_status: "verified",
          is_approved: true,
          verified_at: new Date().toISOString()
        })
        .eq("id", partnerId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Partner verified successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      setActionDialog(null);
      setSelectedPartner(null);
    },
    onError: () => {
      toast.error("Failed to verify partner");
    }
  });

  const rejectPartnerMutation = useMutation({
    mutationFn: async ({ partnerId, reason }: { partnerId: string; reason: string }) => {
      const { error } = await (supabase as any)
        .from("partner_profiles")
        .update({
          verification_status: "unverified",
          is_approved: false,
          approval_status: "rejected"
        })
        .eq("id", partnerId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Partner rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      setActionDialog(null);
      setSelectedPartner(null);
      setRejectionReason("");
    }
  });

  const suspendPartnerMutation = useMutation({
    mutationFn: async (partnerId: string) => {
      const { error } = await (supabase as any)
        .from("partner_profiles")
        .update({
          verification_status: "suspended",
          is_visible: false
        })
        .eq("id", partnerId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Partner suspended");
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      setActionDialog(null);
      setSelectedPartner(null);
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="gap-1"><CheckCircle className="h-3 w-3" />Verified</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "suspended":
        return <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" />Suspended</Badge>;
      default:
        return <Badge variant="outline">Unverified</Badge>;
    }
  };

  const pendingPartners = partners?.filter(p => p.verification_status === "pending" || p.approval_status === "pending");
  const verifiedPartners = partners?.filter(p => p.verification_status === "verified");
  const suspendedPartners = partners?.filter(p => p.verification_status === "suspended");

  const filteredPartners = partners?.filter(p =>
    p.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Partner Verification">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Partner Companies</h1>
          <p className="text-muted-foreground">Verify and manage partner company accounts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{partners?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Total Partners</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{pendingPartners?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Pending Verification</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{verifiedPartners?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{suspendedPartners?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Suspended</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Partners</TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pendingPartners && pendingPartners.length > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingPartners.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-partners"] })}>
              <RefreshCw className="h-4 w-4 mr-2" />Refresh
            </Button>
          </div>

          <TabsContent value="all">
            <PartnerTable 
              partners={filteredPartners || []} 
              isLoading={isLoading}
              getStatusBadge={getStatusBadge}
              onView={setSelectedPartner}
              onVerify={(p) => { setSelectedPartner(p); setActionDialog("verify"); }}
              onSuspend={(p) => { setSelectedPartner(p); setActionDialog("suspend"); }}
            />
          </TabsContent>

          <TabsContent value="pending">
            <PartnerTable 
              partners={pendingPartners || []} 
              isLoading={isLoading}
              getStatusBadge={getStatusBadge}
              onView={setSelectedPartner}
              onVerify={(p) => { setSelectedPartner(p); setActionDialog("verify"); }}
              onSuspend={(p) => { setSelectedPartner(p); setActionDialog("suspend"); }}
            />
          </TabsContent>

          <TabsContent value="verified">
            <PartnerTable 
              partners={verifiedPartners || []} 
              isLoading={isLoading}
              getStatusBadge={getStatusBadge}
              onView={setSelectedPartner}
              onVerify={(p) => { setSelectedPartner(p); setActionDialog("verify"); }}
              onSuspend={(p) => { setSelectedPartner(p); setActionDialog("suspend"); }}
            />
          </TabsContent>

          <TabsContent value="suspended">
            <PartnerTable 
              partners={suspendedPartners || []} 
              isLoading={isLoading}
              getStatusBadge={getStatusBadge}
              onView={setSelectedPartner}
              onVerify={(p) => { setSelectedPartner(p); setActionDialog("verify"); }}
              onSuspend={(p) => { setSelectedPartner(p); setActionDialog("suspend"); }}
            />
          </TabsContent>
        </Tabs>

        {/* Verify Dialog */}
        <Dialog open={actionDialog === "verify"} onOpenChange={() => setActionDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Partner</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to verify <strong>{selectedPartner?.company_name}</strong>?</p>
            <p className="text-sm text-muted-foreground">
              This will make their profile visible on the platform and allow them to post jobs and events.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
              <Button onClick={() => selectedPartner && verifyPartnerMutation.mutate(selectedPartner.id)}>
                Verify Partner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend Dialog */}
        <Dialog open={actionDialog === "suspend"} onOpenChange={() => setActionDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Partner</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to suspend <strong>{selectedPartner?.company_name}</strong>?</p>
            <p className="text-sm text-muted-foreground">
              This will hide their profile and prevent them from posting any content.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => selectedPartner && suspendPartnerMutation.mutate(selectedPartner.id)}>
                Suspend Partner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={!!selectedPartner && !actionDialog} onOpenChange={() => setSelectedPartner(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Partner Details</DialogTitle>
            </DialogHeader>
            {selectedPartner && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedPartner.logo_url || ""} />
                    <AvatarFallback><Building2 className="h-8 w-8" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedPartner.company_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPartner.industry}</p>
                    {getStatusBadge(selectedPartner.verification_status)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p>{selectedPartner.email || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Website</p>
                    {selectedPartner.company_website ? (
                      <a href={selectedPartner.company_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        {selectedPartner.company_website} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : "Not provided"}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Profile Completion</p>
                    <p>{selectedPartner.profile_completion}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Joined</p>
                    <p>{format(new Date(selectedPartner.created_at), "MMM d, yyyy")}</p>
                  </div>
                </div>
                {selectedPartner.company_description && (
                  <div>
                    <p className="text-muted-foreground text-sm">About</p>
                    <p className="text-sm">{selectedPartner.company_description}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPartner(null)}>Close</Button>
              {selectedPartner?.verification_status !== "verified" && (
                <Button onClick={() => setActionDialog("verify")}>Verify</Button>
              )}
              {selectedPartner?.verification_status !== "suspended" && (
                <Button variant="destructive" onClick={() => setActionDialog("suspend")}>Suspend</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

const PartnerTable = ({
  partners,
  isLoading,
  getStatusBadge,
  onView,
  onVerify,
  onSuspend
}: {
  partners: PartnerWithProfile[];
  isLoading: boolean;
  getStatusBadge: (status: string) => JSX.Element;
  onView: (p: PartnerWithProfile) => void;
  onVerify: (p: PartnerWithProfile) => void;
  onSuspend: (p: PartnerWithProfile) => void;
}) => (
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Completion</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
          </TableRow>
        ) : partners.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">No partners found</TableCell>
          </TableRow>
        ) : (
          partners.map((partner) => (
            <TableRow key={partner.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={partner.logo_url || ""} />
                    <AvatarFallback><Building2 className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{partner.company_name || "Unnamed"}</p>
                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(partner.verification_status)}</TableCell>
              <TableCell>{partner.industry || "-"}</TableCell>
              <TableCell>{partner.profile_completion}%</TableCell>
              <TableCell>{format(new Date(partner.created_at), "MMM d, yyyy")}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onView(partner)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {partner.verification_status !== "verified" && (
                    <Button variant="ghost" size="icon" onClick={() => onVerify(partner)}>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  {partner.verification_status !== "suspended" && (
                    <Button variant="ghost" size="icon" onClick={() => onSuspend(partner)}>
                      <Ban className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </Card>
);

export default AdminPartnerVerification;