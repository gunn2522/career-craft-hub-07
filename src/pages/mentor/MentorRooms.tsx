import { useState } from "react";
import { MentorLayout } from "@/components/mentor/MentorLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Edit, Trash2, MessageCircle, Users, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

interface MentorRoom {
  id: string;
  name: string;
  description: string | null;
  topic: string | null;
  room_type: string;
  access_type: string;
  price: number;
  max_members: number | null;
  is_active: boolean;
}

const MentorRooms = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MentorRoom | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    topic: "",
    room_type: "discussion",
    access_type: "free",
    price: 0,
    max_members: "",
  });

  // Fetch mentor profile
  const { data: mentorProfile } = useQuery({
    queryKey: ["mentor-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select("id")
        .eq("user_id", user?.id || "")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch rooms
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["mentor-rooms", mentorProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_rooms")
        .select("*")
        .eq("mentor_id", mentorProfile?.id || "")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MentorRoom[];
    },
    enabled: !!mentorProfile?.id,
  });

  // Fetch member counts
  const { data: memberCounts } = useQuery({
    queryKey: ["room-member-counts", rooms?.map(r => r.id)],
    queryFn: async () => {
      if (!rooms || rooms.length === 0) return {};
      
      const counts: Record<string, number> = {};
      for (const room of rooms) {
        const { count } = await supabase
          .from("mentor_room_members")
          .select("*", { count: "exact", head: true })
          .eq("room_id", room.id);
        counts[room.id] = count || 0;
      }
      return counts;
    },
    enabled: !!rooms && rooms.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("mentor_rooms").insert({
        mentor_id: mentorProfile?.id,
        name: data.name,
        description: data.description || null,
        topic: data.topic || null,
        room_type: data.room_type,
        access_type: data.access_type,
        price: data.access_type === "paid" ? data.price : 0,
        max_members: data.max_members ? parseInt(data.max_members) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-rooms"] });
      toast.success("Room created successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to create room"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { error } = await supabase
        .from("mentor_rooms")
        .update({
          name: data.name,
          description: data.description || null,
          topic: data.topic || null,
          room_type: data.room_type,
          access_type: data.access_type,
          price: data.access_type === "paid" ? data.price : 0,
          max_members: data.max_members ? parseInt(data.max_members) : null,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-rooms"] });
      toast.success("Room updated successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to update room"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mentor_rooms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-rooms"] });
      toast.success("Room deleted successfully");
    },
    onError: () => toast.error("Failed to delete room"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("mentor_rooms")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-rooms"] });
      toast.success("Room status updated");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      topic: "",
      room_type: "discussion",
      access_type: "free",
      price: 0,
      max_members: "",
    });
    setEditingRoom(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (room: MentorRoom) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description || "",
      topic: room.topic || "",
      room_type: room.room_type,
      access_type: room.access_type,
      price: room.price,
      max_members: room.max_members?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateMutation.mutate({ ...formData, id: editingRoom.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getAccessIcon = (type: string) => {
    switch (type) {
      case "free":
        return <Unlock className="w-4 h-4 text-green-500" />;
      case "subscribers_only":
      case "paid":
        return <Lock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Rooms</h1>
            <p className="text-muted-foreground">Create communities and discussion rooms</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingRoom(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingRoom ? "Edit Room" : "Create New Room"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Room Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter room name"
                    required
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What is this room about?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Topic</Label>
                  <Input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Web Development, Career Advice"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Room Type</Label>
                    <Select
                      value={formData.room_type}
                      onValueChange={(value) => setFormData({ ...formData, room_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discussion">Discussion</SelectItem>
                        <SelectItem value="q&a">Q&A</SelectItem>
                        <SelectItem value="announcements">Announcements</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Access Type</Label>
                    <Select
                      value={formData.access_type}
                      onValueChange={(value) => setFormData({ ...formData, access_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free (Open)</SelectItem>
                        <SelectItem value="subscribers_only">Subscribers Only</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.access_type === "paid" && (
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
                  <Label>Max Members (leave empty for unlimited)</Label>
                  <Input
                    type="number"
                    value={formData.max_members}
                    onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
                    placeholder="Unlimited"
                    min={1}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRoom ? "Update" : "Create"} Room
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Rooms</CardTitle>
              <MessageCircle className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{rooms?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Rooms</CardTitle>
              <Unlock className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{rooms?.filter(r => r.is_active).length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {memberCounts ? Object.values(memberCounts).reduce((a, b) => a + b, 0) : 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rooms Grid */}
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Loading rooms...</p>
        ) : rooms?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No rooms yet. Create your first community!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms?.map((room) => (
              <Card key={room.id} className={!room.is_active ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getAccessIcon(room.access_type)}
                      <Badge variant="outline">{room.room_type}</Badge>
                    </div>
                    <Badge variant={room.is_active ? "default" : "secondary"}>
                      {room.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{room.name}</h3>
                  {room.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {room.description}
                    </p>
                  )}

                  {room.topic && (
                    <Badge variant="secondary" className="mb-3">
                      {room.topic}
                    </Badge>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {memberCounts?.[room.id] || 0} / {room.max_members || "∞"}
                    </span>
                    {room.access_type === "paid" && (
                      <span>₹{room.price}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => toggleActiveMutation.mutate({ id: room.id, is_active: !room.is_active })}
                    >
                      {room.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(room)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(room.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MentorLayout>
  );
};

export default MentorRooms;
