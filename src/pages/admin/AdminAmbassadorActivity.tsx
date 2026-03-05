import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Image, Users, MessageSquare, RefreshCw, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface AmbassadorEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  mode: string | null;
  status: string | null;
  current_attendees: number | null;
  max_attendees: number | null;
  ambassador_id: string;
  created_at: string;
}

interface AmbassadorMedia {
  id: string;
  file_url: string;
  file_name: string | null;
  media_type: string;
  description: string | null;
  ambassador_id: string;
  event_id: string;
  created_at: string;
}

interface AmbassadorCommunityMember {
  id: string;
  ambassador_id: string;
  member_user_id: string;
  role: string | null;
  joined_at: string;
}

interface AmbassadorDiscussion {
  id: string;
  title: string;
  content: string | null;
  ambassador_id: string;
  author_id: string;
  reply_count: number | null;
  is_pinned: boolean | null;
  created_at: string;
}

const AdminAmbassadorActivity = () => {
  const [events, setEvents] = useState<AmbassadorEvent[]>([]);
  const [media, setMedia] = useState<AmbassadorMedia[]>([]);
  const [members, setMembers] = useState<AmbassadorCommunityMember[]>([]);
  const [discussions, setDiscussions] = useState<AmbassadorDiscussion[]>([]);
  const [ambassadorProfiles, setAmbassadorProfiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, mediaRes, membersRes, discussionsRes] = await Promise.all([
        supabase.from("ambassador_events").select("*").order("created_at", { ascending: false }),
        supabase.from("ambassador_event_media").select("*").order("created_at", { ascending: false }),
        supabase.from("ambassador_community_members").select("*").order("joined_at", { ascending: false }),
        supabase.from("ambassador_discussions").select("*").order("created_at", { ascending: false }),
      ]);

      setEvents(eventsRes.data || []);
      setMedia(mediaRes.data || []);
      setMembers(membersRes.data || []);
      setDiscussions(discussionsRes.data || []);

      // Collect unique ambassador IDs and fetch their profiles
      const ids = new Set<string>();
      (eventsRes.data || []).forEach(e => ids.add(e.ambassador_id));
      (mediaRes.data || []).forEach(m => ids.add(m.ambassador_id));
      (membersRes.data || []).forEach(m => ids.add(m.ambassador_id));
      (discussionsRes.data || []).forEach(d => ids.add(d.ambassador_id));

      if (ids.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", Array.from(ids));
        
        const map: Record<string, string> = {};
        (profiles || []).forEach(p => { map[p.user_id] = p.full_name || "Unknown"; });
        setAmbassadorProfiles(map);
      }
    } catch (error) {
      console.error("Error fetching ambassador activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const getName = (id: string) => ambassadorProfiles[id] || "Unknown";

  const statCards = [
    { label: "Total Events", value: events.length, icon: Calendar, color: "text-primary" },
    { label: "Media Uploads", value: media.length, icon: Image, color: "text-green-500" },
    { label: "Community Members", value: members.length, icon: Users, color: "text-blue-500" },
    { label: "Discussions", value: discussions.length, icon: MessageSquare, color: "text-purple-500" },
  ];

  return (
    <AdminLayout
      title="Ambassador Activity"
      headerActions={
        <Button onClick={fetchAll} size="sm" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{isLoading ? "..." : stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="media">Media ({media.length})</TabsTrigger>
          <TabsTrigger value="community">Community ({members.length})</TabsTrigger>
          <TabsTrigger value="discussions">Discussions ({discussions.length})</TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ambassador</TableHead>
                    <TableHead>Event Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No events yet</TableCell></TableRow>
                  ) : events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{getName(event.ambassador_id)}</TableCell>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{event.event_date ? format(new Date(event.event_date), "MMM dd, yyyy") : "TBD"}</TableCell>
                      <TableCell><Badge variant="outline">{event.mode || "offline"}</Badge></TableCell>
                      <TableCell>{event.current_attendees || 0}/{event.max_attendees || "∞"}</TableCell>
                      <TableCell><Badge variant={event.status === "completed" ? "default" : "secondary"}>{event.status || "draft"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ambassador</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {media.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No media uploads yet</TableCell></TableRow>
                  ) : media.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{getName(m.ambassador_id)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{m.file_name || "Unnamed"}</TableCell>
                      <TableCell><Badge variant="outline">{m.media_type}</Badge></TableCell>
                      <TableCell className="max-w-[200px] truncate">{m.description || "-"}</TableCell>
                      <TableCell>{format(new Date(m.created_at), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <a href={m.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ambassador</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No community members yet</TableCell></TableRow>
                  ) : members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{getName(m.ambassador_id)}</TableCell>
                      <TableCell className="font-mono text-xs">{m.member_user_id.slice(0, 8)}...</TableCell>
                      <TableCell><Badge variant="outline">{m.role || "member"}</Badge></TableCell>
                      <TableCell>{format(new Date(m.joined_at), "MMM dd, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discussions Tab */}
        <TabsContent value="discussions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ambassador</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Replies</TableHead>
                    <TableHead>Pinned</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discussions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No discussions yet</TableCell></TableRow>
                  ) : discussions.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{getName(d.ambassador_id)}</TableCell>
                      <TableCell>{d.title}</TableCell>
                      <TableCell>{d.reply_count || 0}</TableCell>
                      <TableCell>{d.is_pinned ? <Badge>Pinned</Badge> : "-"}</TableCell>
                      <TableCell>{format(new Date(d.created_at), "MMM dd, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminAmbassadorActivity;
