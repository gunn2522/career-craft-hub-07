import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Image, Users, MessageSquare, RefreshCw, ArrowLeft, Eye, Trophy } from "lucide-react";
import { format } from "date-fns";

interface AmbassadorSummary {
  id: string;
  name: string;
  events: number;
  media: number;
  members: number;
  discussions: number;
  totalParticipants: number;
}

const AdminAmbassadorActivity = () => {
  const [ambassadors, setAmbassadors] = useState<AmbassadorSummary[]>([]);
  const [selectedAmbassador, setSelectedAmbassador] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [detail, setDetail] = useState<{ events: any[]; media: any[]; members: any[]; discussions: any[] }>({ events: [], media: [], members: [], discussions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      // Get all ambassador user_ids
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "ambassador");

      if (!roles || roles.length === 0) {
        setAmbassadors([]);
        setIsLoading(false);
        return;
      }

      const ids = roles.map((r: any) => r.user_id);

      const [profilesRes, eventsRes, mediaRes, membersRes, discussionsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", ids),
        supabase.from("ambassador_events").select("ambassador_id, current_attendees").in("ambassador_id", ids),
        supabase.from("ambassador_event_media").select("ambassador_id").in("ambassador_id", ids),
        supabase.from("ambassador_community_members").select("ambassador_id").in("ambassador_id", ids),
        supabase.from("ambassador_discussions").select("ambassador_id").in("ambassador_id", ids),
      ]);

      const profileMap: Record<string, string> = {};
      (profilesRes.data || []).forEach((p: any) => { profileMap[p.user_id] = p.full_name || "Unknown"; });

      const summaryMap: Record<string, AmbassadorSummary> = {};
      ids.forEach((id: string) => {
        summaryMap[id] = { id, name: profileMap[id] || "Unknown", events: 0, media: 0, members: 0, discussions: 0, totalParticipants: 0 };
      });

      (eventsRes.data || []).forEach((e: any) => {
        if (summaryMap[e.ambassador_id]) {
          summaryMap[e.ambassador_id].events++;
          summaryMap[e.ambassador_id].totalParticipants += e.current_attendees || 0;
        }
      });
      (mediaRes.data || []).forEach((m: any) => { if (summaryMap[m.ambassador_id]) summaryMap[m.ambassador_id].media++; });
      (membersRes.data || []).forEach((m: any) => { if (summaryMap[m.ambassador_id]) summaryMap[m.ambassador_id].members++; });
      (discussionsRes.data || []).forEach((d: any) => { if (summaryMap[d.ambassador_id]) summaryMap[d.ambassador_id].discussions++; });

      setAmbassadors(Object.values(summaryMap).sort((a, b) => (b.events + b.media + b.members + b.discussions) - (a.events + a.media + a.members + a.discussions)));
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetail = async (ambassadorId: string) => {
    setDetailLoading(true);
    try {
      const [eventsRes, mediaRes, membersRes, discussionsRes] = await Promise.all([
        supabase.from("ambassador_events").select("*").eq("ambassador_id", ambassadorId).order("created_at", { ascending: false }),
        supabase.from("ambassador_event_media").select("*").eq("ambassador_id", ambassadorId).order("created_at", { ascending: false }),
        supabase.from("ambassador_community_members").select("*").eq("ambassador_id", ambassadorId).order("joined_at", { ascending: false }),
        supabase.from("ambassador_discussions").select("*").eq("ambassador_id", ambassadorId).order("created_at", { ascending: false }),
      ]);
      setDetail({
        events: eventsRes.data || [],
        media: mediaRes.data || [],
        members: membersRes.data || [],
        discussions: discussionsRes.data || [],
      });
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  const totalStats = ambassadors.reduce(
    (acc, a) => ({
      ambassadors: acc.ambassadors + 1,
      events: acc.events + a.events,
      participants: acc.participants + a.totalParticipants,
      activities: acc.activities + a.events + a.media + a.discussions,
    }),
    { ambassadors: 0, events: 0, participants: 0, activities: 0 }
  );

  const topPerformer = ambassadors[0];

  const handleSelect = (a: AmbassadorSummary) => {
    setSelectedAmbassador(a.id);
    setSelectedName(a.name);
    fetchDetail(a.id);
  };

  if (selectedAmbassador) {
    const amb = ambassadors.find(a => a.id === selectedAmbassador);
    return (
      <AdminLayout
        title={`Ambassador: ${selectedName}`}
        headerActions={
          <Button variant="outline" size="sm" onClick={() => setSelectedAmbassador(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Summary
          </Button>
        }
      >
        {/* Individual stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Events", value: amb?.events || 0, icon: Calendar, color: "text-primary" },
            { label: "Media", value: amb?.media || 0, icon: Image, color: "text-green-500" },
            { label: "Community", value: amb?.members || 0, icon: Users, color: "text-blue-500" },
            { label: "Discussions", value: amb?.discussions || 0, icon: MessageSquare, color: "text-purple-500" },
          ].map(s => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{detailLoading ? "..." : s.value}</p></CardContent>
            </Card>
          ))}
        </div>

        {/* Events timeline */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Events Timeline</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.events.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No events</TableCell></TableRow>
                ) : detail.events.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell>{e.event_date ? format(new Date(e.event_date), "MMM dd, yyyy") : "TBD"}</TableCell>
                    <TableCell><Badge variant="outline">{e.mode || "offline"}</Badge></TableCell>
                    <TableCell>{e.current_attendees || 0}/{e.max_attendees || "∞"}</TableCell>
                    <TableCell><Badge variant={e.status === "completed" ? "default" : "secondary"}>{e.status || "draft"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Media uploads */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Media Uploads</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.media.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No media</TableCell></TableRow>
                ) : detail.media.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="max-w-[200px] truncate">{m.file_name || "Unnamed"}</TableCell>
                    <TableCell><Badge variant="outline">{m.media_type}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate">{m.description || "-"}</TableCell>
                    <TableCell>{format(new Date(m.created_at), "MMM dd, yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Discussions */}
        <Card>
          <CardHeader><CardTitle className="text-base">Discussions</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Replies</TableHead>
                  <TableHead>Pinned</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.discussions.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No discussions</TableCell></TableRow>
                ) : detail.discussions.map((d: any) => (
                  <TableRow key={d.id}>
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
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Ambassador Activity"
      headerActions={
        <Button onClick={fetchSummary} size="sm" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      }
    >
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Ambassadors", value: totalStats.ambassadors, icon: Users, color: "text-primary" },
          { label: "Total Activities", value: totalStats.activities, icon: Calendar, color: "text-green-500" },
          { label: "Events Conducted", value: totalStats.events, icon: Calendar, color: "text-blue-500" },
          { label: "Participants Reached", value: totalStats.participants, icon: Users, color: "text-purple-500" },
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

      {/* Top Performer */}
      {topPerformer && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="flex items-center gap-4 py-4">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Top Performer</p>
              <p className="text-lg font-bold text-foreground">{topPerformer.name}</p>
              <p className="text-sm text-muted-foreground">
                {topPerformer.events} events · {topPerformer.totalParticipants} participants · {topPerformer.members} community members
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ambassador list */}
      <Card>
        <CardHeader><CardTitle>All Ambassadors</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ambassador</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Community</TableHead>
                <TableHead>Discussions</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ambassadors.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No ambassadors yet</TableCell></TableRow>
              ) : ambassadors.map(a => (
                <TableRow key={a.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelect(a)}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.events}</TableCell>
                  <TableCell>{a.media}</TableCell>
                  <TableCell>{a.members}</TableCell>
                  <TableCell>{a.discussions}</TableCell>
                  <TableCell>{a.totalParticipants}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleSelect(a); }}>
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAmbassadorActivity;
