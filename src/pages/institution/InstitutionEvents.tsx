import { useState, useEffect } from "react";
import { InstitutionLayout } from "@/components/institution/InstitutionLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Users, 
  Clock, 
  Edit2, 
  Trash2,
  Video,
  Building2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface InstitutionEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  event_date: string | null;
  location: string | null;
  mode: string | null;
  max_attendees: number | null;
  current_registrations: number;
  audience: string | null;
  is_approved: boolean;
  is_active: boolean;
  registration_url: string | null;
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

const InstitutionEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [events, setEvents] = useState<InstitutionEvent[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<InstitutionEvent | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "workshop",
    event_date: "",
    location: "",
    mode: "offline",
    max_attendees: "",
    audience: "all",
    registration_url: "",
    stream_id: "",
    category_id: ""
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Get institution
      const { data: instData } = await supabase
        .from("institutions")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (instData) {
        setInstitutionId(instData.id);
        
        // Fetch events
        const { data: eventsData } = await supabase
          .from("institution_events")
          .select("*")
          .eq("institution_id", instData.id)
          .order("created_at", { ascending: false });

        if (eventsData) setEvents(eventsData);
      }

      // Fetch domains and categories
      const [domainsRes, categoriesRes] = await Promise.all([
        supabase.from("career_domains").select("id, name").eq("is_active", true),
        supabase.from("career_categories").select("id, name, domain_id").eq("is_active", true)
      ]);

      if (domainsRes.data) setDomains(domainsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) {
      toast({ title: "Please create your institution profile first", variant: "destructive" });
      return;
    }

    try {
      const eventData = {
        institution_id: institutionId,
        title: formData.title,
        description: formData.description || null,
        event_type: formData.event_type,
        event_date: formData.event_date || null,
        location: formData.location || null,
        mode: formData.mode,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        audience: formData.audience,
        registration_url: formData.registration_url || null,
        stream_id: formData.stream_id || null,
        category_id: formData.category_id || null,
        is_active: true,
        is_approved: false
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("institution_events")
          .update(eventData)
          .eq("id", editingEvent.id);
        
        if (error) throw error;
        toast({ title: "Event updated successfully" });
      } else {
        const { error } = await supabase
          .from("institution_events")
          .insert([eventData]);
        
        if (error) throw error;
        toast({ title: "Event created! Pending admin approval." });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({ title: "Failed to save event", variant: "destructive" });
    }
  };

  const handleEdit = (event: InstitutionEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      event_type: event.event_type || "workshop",
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : "",
      location: event.location || "",
      mode: event.mode || "offline",
      max_attendees: event.max_attendees?.toString() || "",
      audience: event.audience || "all",
      registration_url: event.registration_url || "",
      stream_id: "",
      category_id: ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const { error } = await supabase
        .from("institution_events")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Event deleted" });
      fetchData();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({ title: "Failed to delete event", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      event_type: "workshop",
      event_date: "",
      location: "",
      mode: "offline",
      max_attendees: "",
      audience: "all",
      registration_url: "",
      stream_id: "",
      category_id: ""
    });
  };

  const getStatusBadge = (event: InstitutionEvent) => {
    if (event.is_approved) {
      return <Badge className="bg-green-500/10 text-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
    }
    return <Badge className="bg-yellow-500/10 text-yellow-600"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
  };

  if (isLoading) {
    return (
      <InstitutionLayout title="Events">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout title="Events">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Events</h2>
            <p className="text-muted-foreground">Host workshops, career fairs, and guest sessions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event_type">Event Type</Label>
                    <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="career_fair">Career Fair</SelectItem>
                        <SelectItem value="guest_lecture">Guest Lecture</SelectItem>
                        <SelectItem value="hackathon">Hackathon</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="event_date">Date & Time</Label>
                    <Input
                      id="event_date"
                      type="datetime-local"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mode">Mode</Label>
                    <Select value={formData.mode} onValueChange={(v) => setFormData({ ...formData, mode: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location / Link</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder={formData.mode === "online" ? "Meeting link" : "Venue address"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_attendees">Max Attendees</Label>
                    <Input
                      id="max_attendees"
                      type="number"
                      value={formData.max_attendees}
                      onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select value={formData.audience} onValueChange={(v) => setFormData({ ...formData, audience: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="school">School Students</SelectItem>
                        <SelectItem value="college">College Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="stream_id">Stream (Optional)</Label>
                    <Select value={formData.stream_id} onValueChange={(v) => setFormData({ ...formData, stream_id: v })}>
                      <SelectTrigger><SelectValue placeholder="All streams" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Streams</SelectItem>
                        {domains.map((domain) => (
                          <SelectItem key={domain.id} value={domain.id}>{domain.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="registration_url">Registration URL</Label>
                    <Input
                      id="registration_url"
                      type="url"
                      value={formData.registration_url}
                      onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingEvent ? "Update Event" : "Create Event"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {events.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first event to engage with students</p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Create Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        {getStatusBadge(event)}
                        <Badge variant="outline">{event.event_type}</Badge>
                      </div>
                      {event.description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {event.event_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(event.event_date).toLocaleString()}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            {event.mode === "online" ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                            {event.location}
                          </span>
                        )}
                        {event.max_attendees && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.current_registrations || 0}/{event.max_attendees}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(event)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </InstitutionLayout>
  );
};

export default InstitutionEvents;
