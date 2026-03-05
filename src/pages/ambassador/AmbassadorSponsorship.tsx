import { useState, useEffect } from "react";
import { AmbassadorLayout } from "@/components/ambassador/AmbassadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Plus, Send } from "lucide-react";
import { format } from "date-fns";

const EVENT_TYPES = ["Workshop", "Webinar", "Meetup", "Hackathon", "Seminar", "Panel Discussion", "Career Fair", "Other"];
const SPONSORSHIP_TYPES = ["Financial", "Merchandise", "Promotion", "Speaker", "Venue", "Food & Beverages", "Certificates"];
const DELIVERABLES = ["Brand promotion", "Logo placement", "Social media mentions", "Event visibility", "Community outreach", "Post-event report", "Attendee data sharing"];

const AmbassadorSponsorship = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    event_name: "",
    event_type: "",
    expected_participants: "",
    event_date: "",
    event_location: "",
    sponsorship_types: [] as string[],
    deliverables: [] as string[],
    additional_notes: "",
  });

  const fetchRequests = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("ambassador_sponsorship_requests")
      .select("*")
      .eq("ambassador_id", user.id)
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [user]);

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.event_name.trim() || !form.event_type) {
      toast({ title: "Required fields missing", description: "Please fill event name and type.", variant: "destructive" });
      return;
    }
    if (form.sponsorship_types.length === 0) {
      toast({ title: "Select sponsorship type", description: "Choose at least one sponsorship type.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("ambassador_sponsorship_requests").insert({
      ambassador_id: user.id,
      event_name: form.event_name.trim(),
      event_type: form.event_type,
      expected_participants: parseInt(form.expected_participants) || 0,
      event_date: form.event_date || null,
      event_location: form.event_location.trim() || null,
      sponsorship_types: form.sponsorship_types,
      deliverables: form.deliverables,
      additional_notes: form.additional_notes.trim() || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request submitted!", description: "Your sponsorship request has been sent for admin review." });
      setDialogOpen(false);
      setForm({ event_name: "", event_type: "", expected_participants: "", event_date: "", event_location: "", sponsorship_types: [], deliverables: [], additional_notes: "" });
      fetchRequests();
    }
    setSubmitting(false);
  };

  const statusColor = (status: string) => {
    if (status === "approved") return "default";
    if (status === "rejected") return "destructive";
    return "secondary";
  };

  return (
    <AmbassadorLayout title="Sponsorship Requests">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Sponsorship Requests</h2>
            <p className="text-sm text-muted-foreground">Request sponsorship support for your events</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Request</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Request Sponsorship</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Event Name *</Label>
                  <Input value={form.event_name} onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))} placeholder="e.g. Tech Career Workshop" maxLength={200} />
                </div>
                <div>
                  <Label>Event Type *</Label>
                  <Select value={form.event_type} onValueChange={v => setForm(f => ({ ...f, event_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Expected Participants</Label>
                    <Input type="number" value={form.expected_participants} onChange={e => setForm(f => ({ ...f, expected_participants: e.target.value }))} placeholder="50" min={0} />
                  </div>
                  <div>
                    <Label>Event Date</Label>
                    <Input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Event Location</Label>
                  <Input value={form.event_location} onChange={e => setForm(f => ({ ...f, event_location: e.target.value }))} placeholder="College campus, Online, etc." maxLength={200} />
                </div>
                <div>
                  <Label>Sponsorship Type *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {SPONSORSHIP_TYPES.map(t => (
                      <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={form.sponsorship_types.includes(t)} onCheckedChange={() => setForm(f => ({ ...f, sponsorship_types: toggleArray(f.sponsorship_types, t) }))} />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Deliverables You'll Provide</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {DELIVERABLES.map(d => (
                      <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={form.deliverables.includes(d)} onCheckedChange={() => setForm(f => ({ ...f, deliverables: toggleArray(f.deliverables, d) }))} />
                        {d}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Additional Notes</Label>
                  <Textarea value={form.additional_notes} onChange={e => setForm(f => ({ ...f, additional_notes: e.target.value }))} placeholder="Any extra details..." maxLength={1000} rows={3} />
                </div>
                <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                  <Send className="w-4 h-4 mr-2" /> {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Sponsorship</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : requests.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No sponsorship requests yet</TableCell></TableRow>
                ) : requests.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.event_name}</TableCell>
                    <TableCell><Badge variant="outline">{r.event_type}</Badge></TableCell>
                    <TableCell>{r.event_date ? format(new Date(r.event_date), "MMM dd, yyyy") : "TBD"}</TableCell>
                    <TableCell>{r.expected_participants}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(r.sponsorship_types || []).map((t: string) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={statusColor(r.status)}>{r.status}</Badge></TableCell>
                    <TableCell>{format(new Date(r.created_at), "MMM dd, yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AmbassadorLayout>
  );
};

export default AmbassadorSponsorship;
