import { useState } from "react";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plus, CalendarDays, MapPin, Users,
  Trash2, Edit2, AlertCircle, Video, Link as LinkIcon
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  event_date: string;
  end_date: string | null;
  location: string | null;
  is_virtual: boolean;
  meeting_link: string | null;
  registration_url: string | null;
  max_attendees: number | null;
  current_registrations: number;
  domain_id: string | null;
  category_id: string | null;
  target_years: string[] | null;
  target_qualifications: string[] | null;
  target_streams: string[] | null;
  is_active: boolean;
  created_at: string;
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
  { value: "postgraduate", label: "Postgraduate" }
];

const streamOptions = [
  { value: "engineering", label: "Engineering" },
  { value: "science", label: "Science" },
  { value: "commerce", label: "Commerce" },
  { value: "arts", label: "Arts" },
  { value: "management", label: "Management" }
];

const PartnerEventsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("webinar");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [isVirtual, setIsVirtual] = useState(true);
  const [meetingLink, setMeetingLink] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [targetYears, setTargetYears] = useState<string[]>([]);
  const [targetQualifications, setTargetQualifications] = useState<string[]>([]);
  const [targetStreams, setTargetStreams] = useState<string[]>([]);

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

  const { data: domains } = useQuery({
    queryKey: ["career-domains"],
    queryFn: async () => {
      const { data } = await supabase
        .from("career_domains")
        .select("id, name")
        .eq("is_active", true)
        .order("display_order");
      return data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ["career-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("career_categories")
        .select("id, name, domain_id")
        .eq("is_active", true);
      return data;
    }
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ["partner-events", partnerProfile?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("partner_events")
        .select("*")
        .eq("partner_id", partnerProfile?.id)
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!partnerProfile?.id
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventType("webinar");
    setEventDate("");
    setEndDate("");
    setLocation("");
    setIsVirtual(true);
    setMeetingLink("");
    setRegistrationUrl("");
    setMaxAttendees("");
    setSelectedDomain("");
    setSelectedCategory("");
    setTargetYears([]);
    setTargetQualifications([]);
    setTargetStreams([]);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || "");
    setEventType(event.event_type);
    setEventDate(event.event_date.slice(0, 16));
    setEndDate(event.end_date?.slice(0, 16) || "");
    setLocation(event.location || "");
    setIsVirtual(event.is_virtual);
    setMeetingLink(event.meeting_link || "");
    setRegistrationUrl(event.registration_url || "");
    setMaxAttendees(event.max_attendees?.toString() || "");
    setSelectedDomain(event.domain_id || "");
    setSelectedCategory(event.category_id || "");
    setTargetYears(event.target_years || []);
    setTargetQualifications(event.target_qualifications || []);
    setTargetStreams(event.target_streams || []);
  };

  const createEventMutation = useMutation({
    mutationFn: async () => {
      if (!title || !eventDate) throw new Error("Title and date are required");

      const { error } = await (supabase as any).from("partner_events").insert({
        partner_id: partnerProfile?.id,
        title,
        description: description || null,
        event_type: eventType,
        event_date: new Date(eventDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        location: location || null,
        is_virtual: isVirtual,
        meeting_link: meetingLink || null,
        registration_url: registrationUrl || null,
        max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
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
      toast.success("Event created!");
      queryClient.invalidateQueries({ queryKey: ["partner-events"] });
      resetForm();
      setCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create event");
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: async () => {
      if (!editingEvent) return;

      const { error } = await (supabase as any)
        .from("partner_events")
        .update({
          title,
          description: description || null,
          event_type: eventType,
          event_date: new Date(eventDate).toISOString(),
          end_date: endDate ? new Date(endDate).toISOString() : null,
          location: location || null,
          is_virtual: isVirtual,
          meeting_link: meetingLink || null,
          registration_url: registrationUrl || null,
          max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
          domain_id: selectedDomain || null,
          category_id: selectedCategory || null,
          target_years: targetYears,
          target_qualifications: targetQualifications,
          target_streams: targetStreams,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingEvent.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event updated!");
      queryClient.invalidateQueries({ queryKey: ["partner-events"] });
      resetForm();
      setEditingEvent(null);
    },
    onError: () => {
      toast.error("Failed to update event");
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await (supabase as any)
        .from("partner_events")
        .delete()
        .eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["partner-events"] });
    }
  });

  const toggleEventMutation = useMutation({
    mutationFn: async ({ eventId, isActive }: { eventId: string; isActive: boolean }) => {
      const { error } = await (supabase as any)
        .from("partner_events")
        .update({ is_active: isActive })
        .eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-events"] });
    }
  });

  const filteredCategories = categories?.filter(c => c.domain_id === selectedDomain) || [];
  const isVerified = partnerProfile?.verification_status === "verified";

  if (!isVerified) {
    return (
      <PartnerLayout title="Events">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Verification Required</h3>
            <p className="text-muted-foreground mb-4">Complete verification to create events</p>
            <Button asChild><a href="/partner-dashboard/profile">Complete Profile</a></Button>
          </CardContent>
        </Card>
      </PartnerLayout>
    );
  }

  const EventForm = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="space-y-2">
        <Label>Event Title *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Campus Recruitment Drive" />
      </div>

      <div className="space-y-2">
        <Label>Event Type</Label>
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="webinar">Webinar</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="hackathon">Hackathon</SelectItem>
            <SelectItem value="campus_drive">Campus Drive</SelectItem>
            <SelectItem value="career_fair">Career Fair</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event details..." rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date & Time *</Label>
          <Input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>End Date & Time</Label>
          <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox checked={isVirtual} onCheckedChange={(checked) => setIsVirtual(!!checked)} />
        <label className="text-sm">Virtual Event</label>
      </div>

      {isVirtual ? (
        <div className="space-y-2">
          <Label>Meeting Link</Label>
          <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://zoom.us/..." />
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue address" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Registration URL</Label>
          <Input value={registrationUrl} onChange={(e) => setRegistrationUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label>Max Attendees</Label>
          <Input type="number" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} placeholder="100" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Domain</Label>
          <Select value={selectedDomain} onValueChange={(v) => { setSelectedDomain(v); setSelectedCategory(""); }}>
            <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
            <SelectContent>
              {domains?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!selectedDomain}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {filteredCategories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Audience Targeting</CardTitle>
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
                  onClick={() => setTargetYears(prev => prev.includes(opt.value) ? prev.filter(y => y !== opt.value) : [...prev, opt.value])}
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
                  onClick={() => setTargetQualifications(prev => prev.includes(opt.value) ? prev.filter(q => q !== opt.value) : [...prev, opt.value])}
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
                  onClick={() => setTargetStreams(prev => prev.includes(opt.value) ? prev.filter(s => s !== opt.value) : [...prev, opt.value])}
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
    <PartnerLayout title="Events">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Events</h1>
            <p className="text-muted-foreground">Manage your company events and campus drives</p>
          </div>
          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Event</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
              <EventForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => { resetForm(); setCreateDialog(false); }}>Cancel</Button>
                <Button onClick={() => createEventMutation.mutate()} disabled={createEventMutation.isPending}>
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : events?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-4">Create your first event</p>
              <Button onClick={() => setCreateDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Event</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events?.map((event) => (
              <Card key={event.id} className={!event.is_active ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline">{event.event_type.replace('_', ' ')}</Badge>
                        {event.is_virtual ? <Badge><Video className="h-3 w-3 mr-1" />Virtual</Badge> : <Badge variant="secondary"><MapPin className="h-3 w-3 mr-1" />In-Person</Badge>}
                        {!event.is_active && <Badge variant="destructive">Inactive</Badge>}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {format(new Date(event.event_date), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {event.max_attendees && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.current_registrations}/{event.max_attendees}
                          </span>
                        )}
                        {event.registration_url && (
                          <a href={event.registration_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                            <LinkIcon className="h-4 w-4" />Registration
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={event.is_active}
                        onCheckedChange={(checked) => toggleEventMutation.mutate({ eventId: event.id, isActive: checked })}
                      />
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this event?")) deleteEventMutation.mutate(event.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!editingEvent} onOpenChange={() => { setEditingEvent(null); resetForm(); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
            <EventForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditingEvent(null); resetForm(); }}>Cancel</Button>
              <Button onClick={() => updateEventMutation.mutate()} disabled={updateEventMutation.isPending}>
                {updateEventMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PartnerLayout>
  );
};

export default PartnerEventsPage;