import { useEffect, useState } from "react";
import { AmbassadorLayout } from "@/components/ambassador/AmbassadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Loader2, Users, UserMinus, Search } from "lucide-react";

interface Member {
  id: string;
  member_user_id: string;
  role: string | null;
  joined_at: string;
  profile?: { full_name: string | null; email: string | null };
}

const AmbassadorCommunity = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<{ user_id: string; full_name: string; email: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user) fetchMembers();
  }, [user]);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("ambassador_community_members")
      .select("*")
      .eq("ambassador_id", user!.id)
      .order("joined_at", { ascending: false });

    if (!error && data) {
      // Fetch profiles for members
      const userIds = data.map((m) => m.member_user_id);
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
        setMembers(data.map((m) => ({ ...m, profile: profileMap.get(m.member_user_id) || undefined })));
      } else {
        setMembers([]);
      }
    }
    setIsLoading(false);
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchResult(null);

    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .eq("email", searchEmail.trim())
      .maybeSingle();

    if (error || !data) toast.error("User not found");
    else setSearchResult(data);
    setSearching(false);
  };

  const handleAdd = async () => {
    if (!searchResult) return;
    setAdding(true);

    const { error } = await supabase.from("ambassador_community_members").insert({
      ambassador_id: user!.id,
      member_user_id: searchResult.user_id,
    });

    if (error) {
      if (error.code === "23505") toast.error("Already a member");
      else toast.error("Failed to add member");
    } else {
      toast.success("Member added!");
      setDialogOpen(false);
      setSearchEmail("");
      setSearchResult(null);
      fetchMembers();
    }
    setAdding(false);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this member?")) return;
    const { error } = await supabase.from("ambassador_community_members").delete().eq("id", id);
    if (error) toast.error("Failed to remove");
    else {
      toast.success("Member removed");
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <AmbassadorLayout title="My Community">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Invite and manage your campus community</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Invite Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Invite Member</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Enter member's email" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} />
                  <Button onClick={handleSearch} disabled={searching}>
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
                {searchResult && (
                  <Card>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{searchResult.full_name || "No name"}</p>
                        <p className="text-sm text-muted-foreground">{searchResult.email}</p>
                      </div>
                      <Button size="sm" onClick={handleAdd} disabled={adding}>
                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : members.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No members yet. Start building your community!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <Card key={member.id} className="glass-card">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{member.profile?.full_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground truncate">{member.profile?.email || ""}</p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role || "member"}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => handleRemove(member.id)}>
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AmbassadorLayout>
  );
};

export default AmbassadorCommunity;
