import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye,
  Clock,
  Building2,
  Briefcase,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface InstitutionEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  mode: string | null;
  max_attendees: number | null;
  is_approved: boolean | null;
  is_active: boolean | null;
  institution_id: string;
  created_at: string;
  institution?: {
    name: string;
  };
}

interface PartnerEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  mode: string | null;
  max_attendees: number | null;
  is_approved: boolean | null;
  is_active: boolean | null;
  partner_id: string;
  created_at: string;
  partner?: {
    company_name: string;
  };
}

const AdminEventsApproval = () => {
  const [activeTab, setActiveTab] = useState("institution");
  const [search, setSearch] = useState("");
  const [viewEvent, setViewEvent] = useState<InstitutionEvent | PartnerEvent | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [eventToReject, setEventToReject] = useState<{ id: string; type: "institution" | "partner" } | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch institution events
  const { data: institutionEvents = [], isLoading: loadingInstitution } = useQuery({
    queryKey: ["institution-events-approval"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("institution_events")
        .select(`
          *,
          institution:institutions(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InstitutionEvent[];
    },
  });

  // Fetch partner events
  const { data: partnerEvents = [], isLoading: loadingPartner } = useQuery({
    queryKey: ["partner-events-approval"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("partner_events")
        .select(`
          *,
          partner:partner_profiles(company_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PartnerEvent[];
    },
  });

  // Approve institution event
  const approveInstitutionMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await (supabase as any)
        .from("institution_events")
        .update({ is_approved: true })
        .eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution-events-approval"] });
      toast.success("Event approved successfully");
    },
    onError: () => toast.error("Failed to approve event"),
  });

  // Reject institution event
  const rejectInstitutionMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await (supabase as any)
        .from("institution_events")
        .update({ is_approved: false, is_active: false })
        .eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution-events-approval"] });
      toast.success("Event rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
    },
    onError: () => toast.error("Failed to reject event"),
  });

  // Approve partner event
  const approvePartnerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await (supabase as any)
        .from("partner_events")
        .update({ is_approved: true })
        .eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-events-approval"] });
      toast.success("Event approved successfully");
    },
    onError: () => toast.error("Failed to approve event"),
  });

  // Reject partner event
  const rejectPartnerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await (supabase as any)
        .from("partner_events")
        .update({ is_approved: false, is_active: false })
        .eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-events-approval"] });
      toast.success("Event rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
    },
    onError: () => toast.error("Failed to reject event"),
  });

  const handleReject = () => {
    if (!eventToReject) return;
    
    if (eventToReject.type === "institution") {
      rejectInstitutionMutation.mutate(eventToReject.id);
    } else {
      rejectPartnerMutation.mutate(eventToReject.id);
    }
  };

  const getStatusBadge = (event: InstitutionEvent | PartnerEvent, type: "institution" | "partner") => {
    if (type === "institution") {
      const instEvent = event as InstitutionEvent;
      if (instEvent.is_approved === true) {
        return <Badge className="bg-primary text-primary-foreground">Approved</Badge>;
      } else if (instEvent.is_approved === false) {
        return <Badge variant="destructive">Rejected</Badge>;
      }
      return <Badge variant="secondary">Pending</Badge>;
    } else {
      const partEvent = event as PartnerEvent;
      if (partEvent.is_approved === true) {
        return <Badge className="bg-primary text-primary-foreground">Approved</Badge>;
      } else if (partEvent.is_approved === false) {
        return <Badge variant="destructive">Rejected</Badge>;
      }
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const filterEvents = <T extends InstitutionEvent | PartnerEvent>(events: T[]) => {
    if (!search) return events;
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const renderEventTable = (
    events: (InstitutionEvent | PartnerEvent)[],
    type: "institution" | "partner"
  ) => {
    const filtered = filterEvents(events);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>{type === "institution" ? "Institution" : "Partner"}</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No events found
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {event.description || "No description"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {type === "institution"
                    ? (event as InstitutionEvent).institution?.name
                    : (event as PartnerEvent).partner?.company_name || "Unknown"}
                </TableCell>
                <TableCell>
                  {event.event_date
                    ? format(new Date(event.event_date), "MMM d, yyyy")
                    : "TBD"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{event.mode || "Online"}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(event, type)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewEvent(event)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {((type === "institution" && (event as InstitutionEvent).is_approved === null) ||
                      (type === "partner" && (event as PartnerEvent).is_approved === null)) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() =>
                            type === "institution"
                              ? approveInstitutionMutation.mutate(event.id)
                              : approvePartnerMutation.mutate(event.id)
                          }
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setEventToReject({ id: event.id, type });
                            setRejectDialogOpen(true);
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  // Count pending events
  const pendingInstitution = institutionEvents.filter((e) => e.is_approved === null).length;
  const pendingPartner = partnerEvents.filter((e) => e.is_approved === null).length;

  return (
    <AdminLayout title="Events Approval">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Institution Events
              </CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingInstitution}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Partner Events
              </CardTitle>
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPartner}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Events
              </CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {institutionEvents.length + partnerEvents.length}
              </div>
              <p className="text-xs text-muted-foreground">From all sources</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="institution" className="gap-2">
              <Building2 className="w-4 h-4" />
              Institution Events
              {pendingInstitution > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingInstitution}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="partner" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Partner Events
              {pendingPartner > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingPartner}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="institution" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loadingInstitution ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : (
                  renderEventTable(institutionEvents, "institution")
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partner" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loadingPartner ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : (
                  renderEventTable(partnerEvents, "partner")
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Event Dialog */}
      <Dialog open={!!viewEvent} onOpenChange={() => setViewEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewEvent?.title}</DialogTitle>
          </DialogHeader>
          {viewEvent && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{viewEvent.description || "No description provided"}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    {viewEvent.event_date
                      ? format(new Date(viewEvent.event_date), "MMM d, yyyy")
                      : "TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{viewEvent.location || "Online"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{viewEvent.max_attendees || "Unlimited"} attendees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{viewEvent.mode || "Online"}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this event (optional).
            </p>
            <Textarea
              placeholder="Rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminEventsApproval;
