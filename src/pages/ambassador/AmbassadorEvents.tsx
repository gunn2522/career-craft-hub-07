import { useEffect, useState } from "react";
import { AmbassadorLayout } from "@/components/ambassador/AmbassadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Calendar, MapPin, Users, Loader2, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

interface AmbassadorEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  mode: string | null;
  max_attendees: number | null;
  current_attendees: number | null;
  status: string | null;
  created_at: string;
}

const AmbassadorEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<AmbassadorEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    mode: "offline",
    max_attendees: "",
  });

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("ambassador_events")
      .select("*")
      .eq("ambassador_id", user!.id)
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load events");
    else setEvents(data || []);
    setIsLoading(false);
  };

  const resetForm = () => {
    setForm({ title: "", description: "", event_date: "", location: "", mode: "offline", max_attendees: "" });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);

    const payload = {
      ambassador_id: user!.id,
      title: form.title,
      description: form.description || null,
      event_date: form.event_date || null,
      location: form.location || null,
      mode: form.mode,
      max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("ambassador_events").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("ambassador_events").insert(payload));
    }

    if (error) toast.error("Failed to save event");
    else {
      toast.success(editingId ? "Event updated" : "Event created");
      resetForm();
      setDialogOpen(false);
      fetchEvents();
    }
    setSaving(false);
  };

  const handleEdit = (event: AmbassadorEvent) => {
    setForm({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date ? event.event_date.slice(0, 16) : "",
      location: event.location || "",
      mode: event.mode || "offline",
      max_attendees: event.max_attendees?.toString() || "",
    });
    setEditingId(event.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("ambassador_events").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Event deleted"); setEvents((prev) => prev.filter((e) => e.id !== id)); }
  };

  return (
    <AmbassadorLayout title="My Events">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Host and manage campus events</p>
          <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Create Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Event" : "Create Event"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Event Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
                <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Max Attendees" value={form.max_attendees} onChange={(e) => setForm({ ...form, max_attendees: e.target.value })} />
                <Button onClick={handleSubmit} disabled={saving} className="w-full">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingId ? "Update Event" : "Create Event"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : events.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No events yet. Create your first event!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => (
              <Card key={event.id} className="glass-card">
                <CardHeader className="flex flex-row items-start justify-between">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {event.description && <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {event.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(event.event_date), "MMM d, yyyy h:mm a")}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                    {event.max_attendees && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.current_attendees || 0}/{event.max_attendees}
                      </span>
                    )}
                  </div>
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{event.mode}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AmbassadorLayout>
  );
};

export default AmbassadorEvents;
