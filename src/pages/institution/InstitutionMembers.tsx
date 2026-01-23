import { useState, useEffect } from "react";
import { InstitutionLayout } from "@/components/institution/InstitutionLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, GraduationCap } from "lucide-react";

interface Member {
  id: string;
  user_id: string;
  role: string | null;
  joined_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    user_type: string | null;
  };
}

const InstitutionMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchMembers();
  }, [user]);

  const fetchMembers = async () => {
    try {
      const { data: institution } = await supabase
        .from("institutions")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (institution) {
        const { data: membersData } = await supabase
          .from("institution_members")
          .select(`
            id,
            user_id,
            role,
            joined_at
          `)
          .eq("institution_id", institution.id)
          .order("joined_at", { ascending: false });

        if (membersData) {
          // Fetch profiles for each member
          const memberIds = membersData.map(m => m.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url, user_type")
            .in("user_id", memberIds);

          const membersWithProfiles = membersData.map(member => ({
            ...member,
            profile: profiles?.find(p => p.user_id === member.user_id)
          }));

          setMembers(membersWithProfiles);
        }
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <InstitutionLayout title="Members">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout title="Members">
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <p className="text-muted-foreground">View and manage your institution members</p>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Total Members: {members.length}
            </CardTitle>
          </CardHeader>
        </Card>

        {filteredMembers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? "No members found matching your search" : "No members have joined yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.profile?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {member.profile?.full_name || "Unknown User"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {member.role || "Member"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {member.profile?.user_type || "student"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </span>
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

export default InstitutionMembers;
