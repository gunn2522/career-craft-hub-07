import { MentorLayout } from "@/components/mentor/MentorLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, TrendingUp, Calendar, IndianRupee } from "lucide-react";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  student_id: string;
  subscription_type: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    institution: string | null;
  } | null;
}

const MentorSubscribers = () => {
  const { user } = useAuth();

  // Fetch mentor profile
  const { data: mentorProfile } = useQuery({
    queryKey: ["mentor-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select("id, total_subscribers, total_earnings")
        .eq("user_id", user?.id || "")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch subscribers
  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["mentor-subscribers", mentorProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_subscriptions")
        .select("*")
        .eq("mentor_id", mentorProfile?.id || "")
        .order("started_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each subscriber
      const subscribersWithProfiles = await Promise.all(
        (data || []).map(async (sub) => {
          const { data: profileResults } = await supabase
            .rpc("get_public_profiles", { user_ids: [sub.student_id] });
          const profile = profileResults?.[0] || null;
          return { ...sub, profile } as Subscriber;
        })
      );

      return subscribersWithProfiles;
    },
    enabled: !!mentorProfile?.id,
  });

  const activeSubscribers = subscribers?.filter((s) => s.status === "active") || [];
  const paidSubscribers = subscribers?.filter((s) => s.subscription_type === "paid") || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Subscribers</h1>
          <p className="text-muted-foreground">Manage your subscriber community</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Subscribers
              </CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{subscribers?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Subscribers
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{activeSubscribers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid Subscribers
              </CardTitle>
              <IndianRupee className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{paidSubscribers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <Calendar className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {subscribers?.filter((s) => {
                  const startDate = new Date(s.started_at);
                  const now = new Date();
                  return (
                    startDate.getMonth() === now.getMonth() &&
                    startDate.getFullYear() === now.getFullYear()
                  );
                }).length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscribers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading subscribers...</p>
            ) : subscribers?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No subscribers yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your profile to get subscribers
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscriber</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed On</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers?.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={subscriber.profile?.avatar_url || ""} />
                            <AvatarFallback>
                              {subscriber.profile?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {subscriber.profile?.full_name || "Unknown"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {subscriber.profile?.institution || "No institution"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {subscriber.profile?.institution || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={subscriber.subscription_type === "paid" ? "default" : "outline"}>
                          {subscriber.subscription_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                      <TableCell>
                        {format(new Date(subscriber.started_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {subscriber.expires_at
                          ? format(new Date(subscriber.expires_at), "MMM d, yyyy")
                          : "Never"}
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

export default MentorSubscribers;
