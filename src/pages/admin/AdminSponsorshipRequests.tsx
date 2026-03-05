import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Check, X, Eye, DollarSign } from "lucide-react";
import { format } from "date-fns";

const AdminSponsorshipRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchAll = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("ambassador_sponsorship_requests")
      .select("*")
      .order("created_at", { ascending: false });

    setRequests(data || []);

    if (data && data.length > 0) {
      const ids = [...new Set(data.map((r: any) => r.ambassador_id))];
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
      const map: Record<string, string> = {};
      (profs || []).forEach((p: any) => { map[p.user_id] = p.full_name || "Unknown"; });
      setProfiles(map);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id: string, status: string) => {
    if (!user) return;
    setUpdating(true);
    const { error } = await supabase
      .from("ambassador_sponsorship_requests")
      .update({
        status,
        admin_notes: adminNotes.trim() || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Request ${status}`, description: `Sponsorship request has been ${status}.` });
      setSelectedRequest(null);
      setAdminNotes("");
      fetchAll();
    }
    setUpdating(false);
  };

  const statusColor = (status: string) => {
    if (status === "approved") return "default";
    if (status === "rejected") return "destructive";
    return "secondary";
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <AdminLayout
      title="Sponsorship Requests"
      headerActions={
        <Button onClick={fetchAll} size="sm" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Requests", value: requests.length, icon: DollarSign, color: "text-primary" },
          { label: "Pending", value: pendingCount, icon: DollarSign, color: "text-yellow-500" },
          { label: "Approved", value: requests.filter(r => r.status === "approved").length, icon: Check, color: "text-green-500" },
          { label: "Rejected", value: requests.filter(r => r.status === "rejected").length, icon: X, color: "text-destructive" },
        ].map(s => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{isLoading ? "..." : s.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ambassador</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Sponsorship</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : requests.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No sponsorship requests</TableCell></TableRow>
              ) : requests.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{profiles[r.ambassador_id] || "Unknown"}</TableCell>
                  <TableCell>{r.event_name}</TableCell>
                  <TableCell><Badge variant="outline">{r.event_type}</Badge></TableCell>
                  <TableCell>{r.event_date ? format(new Date(r.event_date), "MMM dd, yyyy") : "TBD"}</TableCell>
                  <TableCell>{r.expected_participants}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(r.sponsorship_types || []).slice(0, 2).map((t: string) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                      {(r.sponsorship_types || []).length > 2 && (
                        <Badge variant="outline" className="text-xs">+{r.sponsorship_types.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={statusColor(r.status)}>{r.status}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedRequest(r); setAdminNotes(r.admin_notes || ""); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sponsorship Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Ambassador:</span><p className="font-medium">{profiles[selectedRequest.ambassador_id] || "Unknown"}</p></div>
                <div><span className="text-muted-foreground">Event:</span><p className="font-medium">{selectedRequest.event_name}</p></div>
                <div><span className="text-muted-foreground">Type:</span><p className="font-medium">{selectedRequest.event_type}</p></div>
                <div><span className="text-muted-foreground">Participants:</span><p className="font-medium">{selectedRequest.expected_participants}</p></div>
                <div><span className="text-muted-foreground">Date:</span><p className="font-medium">{selectedRequest.event_date ? format(new Date(selectedRequest.event_date), "MMM dd, yyyy") : "TBD"}</p></div>
                <div><span className="text-muted-foreground">Location:</span><p className="font-medium">{selectedRequest.event_location || "Not specified"}</p></div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Sponsorship Types:</p>
                <div className="flex flex-wrap gap-1">
                  {(selectedRequest.sponsorship_types || []).map((t: string) => (
                    <Badge key={t} variant="outline">{t}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Deliverables Offered:</p>
                <div className="flex flex-wrap gap-1">
                  {(selectedRequest.deliverables || []).map((d: string) => (
                    <Badge key={d} variant="secondary">{d}</Badge>
                  ))}
                </div>
              </div>

              {selectedRequest.additional_notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Additional Notes:</p>
                  <p className="text-sm">{selectedRequest.additional_notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Admin Notes:</p>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  rows={3}
                  maxLength={1000}
                />
              </div>

              {selectedRequest.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => updateStatus(selectedRequest.id, "approved")}
                    disabled={updating}
                  >
                    <Check className="w-4 h-4 mr-2" /> Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => updateStatus(selectedRequest.id, "rejected")}
                    disabled={updating}
                  >
                    <X className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              )}

              {selectedRequest.status !== "pending" && (
                <div className="text-sm text-muted-foreground">
                  Status: <Badge variant={statusColor(selectedRequest.status)}>{selectedRequest.status}</Badge>
                  {selectedRequest.reviewed_at && (
                    <span className="ml-2">on {format(new Date(selectedRequest.reviewed_at), "MMM dd, yyyy")}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminSponsorshipRequests;
