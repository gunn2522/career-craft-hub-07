import { useEffect, useState } from "react";
import { AmbassadorLayout } from "@/components/ambassador/AmbassadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Image, Users, MessageSquare } from "lucide-react";

const AmbassadorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ events: 0, media: 0, members: 0, discussions: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [eventsRes, mediaRes, membersRes, discussionsRes] = await Promise.all([
        supabase.from("ambassador_events").select("id", { count: "exact", head: true }).eq("ambassador_id", user.id),
        supabase.from("ambassador_event_media").select("id", { count: "exact", head: true }).eq("ambassador_id", user.id),
        supabase.from("ambassador_community_members").select("id", { count: "exact", head: true }).eq("ambassador_id", user.id),
        supabase.from("ambassador_discussions").select("id", { count: "exact", head: true }).eq("ambassador_id", user.id),
      ]);
      setStats({
        events: eventsRes.count || 0,
        media: mediaRes.count || 0,
        members: membersRes.count || 0,
        discussions: discussionsRes.count || 0,
      });
    };
    fetchStats();
  }, [user]);

  const statCards = [
    { label: "Events Hosted", value: stats.events, icon: Calendar, color: "text-primary" },
    { label: "Media Uploaded", value: stats.media, icon: Image, color: "text-green-500" },
    { label: "Community Members", value: stats.members, icon: Users, color: "text-blue-500" },
    { label: "Discussions", value: stats.discussions, icon: MessageSquare, color: "text-purple-500" },
  ];

  return (
    <AmbassadorLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome, Crafter! 🎉
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your events, community, and media all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AmbassadorLayout>
  );
};

// Fix missing import
import { cn } from "@/lib/utils";

export default AmbassadorDashboard;
