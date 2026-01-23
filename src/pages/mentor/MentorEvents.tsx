import { useState } from "react";
import { MentorLayout } from "@/components/mentor/MentorLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Calendar, Users, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface MentorEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  is_paid: boolean;
  price: number;
  max_participants: number | null;
  current_registrations: number;
  meeting_link: string | null;
  status: string;
  is_active: boolean;
}

const MentorEvents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MentorEvent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "webinar",
    start_time: "",
    duration_minutes: 60,
    is_paid: false,
    price: 0,
    max_participants: "",
    meeting_link: "",
  });

  // Fetch mentor profile
  const { data: mentorProfile } = useQuery({
    queryKey: ["mentor-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select("id")
        .eq("user_id", user?.id || "")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ["mentor-events", mentorProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_events")
        .select("*")
        .eq("mentor_id", mentorProfile?.id || "")
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data as MentorEvent[];
    },
    enabled: !!mentorProfile?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("mentor_events").insert({
        mentor_id: mentorProfile?.id,
        title: data.title,
        description: data.description || null,
        event_type: data.event_type,
        start_time: data.start_time,
        duration_minutes: data.duration_minutes,
        is_paid: data.is_paid,
        price: data.is_paid ? data.price : 0,
        max_participants: data.max_participants ? parseInt(data.max_participants) : null,
        meeting_link: data.meeting_link || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-events"] });
      toast.success("Event created successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to create event"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { error } = await supabase
        .from("mentor_events")
        .update({
          title: data.title,
          description: data.description || null,
          event_type: data.event_type,
          start_time: data.start_time,
          duration_minutes: data.duration_minutes,
          is_paid: data.is_paid,
          price: data.is_paid ? data.price : 0,
          max_participants: data.max_participants ? parseInt(data.max_participants) : null,
          meeting_link: data.meeting_link || null,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-events"] });
      toast.success("Event updated successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to update event"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mentor_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-events"] });
      toast.success("Event deleted successfully");
    },
    onError: () => toast.error("Failed to delete event"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      event_type: "webinar",
      start_time: "",
      duration_minutes: 60,
      is_paid: false,
      price: 0,
      max_participants: "",
      meeting_link: "",
    });
    setEditingEvent(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (event: MentorEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      event_type: event.event_type,
      start_time: event.start_time.slice(0, 16),
      duration_minutes: event.duration_minutes,
      is_paid: event.is_paid,
      price: event.price,
      max_participants: event.max_participants?.toString() || "",
      meeting_link: event.meeting_link || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      updateMutation.mutate({ ...formData, id: editingEvent.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="default">Upcoming</Badge>;
      case "live":
        return <Badge className="bg-green-500">Live</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Events</h1>
            <p className="text-muted-foreground">Host webinars, workshops, and AMAs</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEvent(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Event Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Type</Label>
                    <Select
                      value={formData.event_type}
                      onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="ama">AMA Session</SelectItem>
                        <SelectItem value="masterclass">Masterclass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                      min={15}
                      max={480}
                    />
                  </div>
                </div>

                <div>
                  <Label>Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_paid}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                  />
                  <Label>Paid Event</Label>
                </div>

                {formData.is_paid && (
                  <div>
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                )}

                <div>
                  <Label>Max Participants (leave empty for unlimited)</Label>
                  <Input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    placeholder="Unlimited"
                    min={1}
                  />
                </div>

                <div>
                  <Label>Meeting Link</Label>
                  <Input
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingEvent ? "Update" : "Create"} Event
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
              <Calendar className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{events?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {events?.reduce((sum, e) => sum + e.current_registrations, 0) || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
              <IndianRupee className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₹{events?.filter(e => e.is_paid).reduce((sum, e) => sum + (e.price * e.current_registrations), 0) || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading events...</p>
            ) : events?.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No events yet. Create your first event!</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Registrations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.event_type}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(event.start_time)}</TableCell>
                      <TableCell>
                        {event.is_paid ? `₹${event.price}` : "Free"}
                      </TableCell>
                      <TableCell>
                        {event.current_registrations} / {event.max_participants || "∞"}
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(event)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(event.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MentorLayout>
  );
};

export default MentorEvents;
