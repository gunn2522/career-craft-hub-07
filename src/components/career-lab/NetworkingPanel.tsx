import { useState } from "react";
import { Users, UserPlus, MessageCircle, Search, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNetworking, PublicProfile, PublicProfileDiscovery } from "@/hooks/useNetworking";

export const NetworkingPanel = () => {
  const {
    isLoading,
    connections,
    connectionRequests,
    discoverPeople,
    sendConnectionRequest,
    respondToRequest,
    startDirectChat,
  } = useNetworking();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<PublicProfileDiscovery | null>(null);
  const [connectPurpose, setConnectPurpose] = useState("");
  const [connectMessage, setConnectMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter discover people by name, user_type, institution, or skills (limited public data)
  const filteredPeople = discoverPeople.filter(
    (person) =>
      person.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.user_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pendingIncoming = connectionRequests.filter((r) => r.to_profile);

  const handleConnect = async () => {
    if (selectedPerson && connectPurpose) {
      await sendConnectionRequest(selectedPerson.user_id, connectPurpose, connectMessage);
      setIsDialogOpen(false);
      setSelectedPerson(null);
      setConnectPurpose("");
      setConnectMessage("");
    }
  };

  // Card for displaying discovery profiles (limited public data)
  const DiscoverPersonCard = ({ person }: { person: PublicProfileDiscovery }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <Avatar className="w-12 h-12">
        <AvatarImage src={person.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {person.full_name?.[0] || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{person.full_name || "Anonymous"}</p>
        {person.user_type && (
          <p className="text-sm text-muted-foreground truncate capitalize">
            {person.user_type.replace('_', ' ')}
            {person.institution && ` at ${person.institution}`}
          </p>
        )}
        {person.skills && person.skills.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {person.skills.slice(0, 2).map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {person.skills.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{person.skills.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
      <Dialog open={isDialogOpen && selectedPerson?.user_id === person.user_id} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSelectedPerson(person)}
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect with {person.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Purpose</label>
              <Select value={connectPurpose} onValueChange={setConnectPurpose}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mentorship">Mentorship</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="guidance">Career Guidance</SelectItem>
                  <SelectItem value="hiring">Hiring/Opportunities</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message (optional)</label>
              <Textarea
                placeholder="Introduce yourself..."
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
              />
            </div>
            <Button onClick={handleConnect} disabled={!connectPurpose} className="w-full">
              Send Connection Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Card for displaying connected user profiles (full profile data)
  const ConnectionCard = ({ person }: { person: PublicProfile }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <Avatar className="w-12 h-12">
        <AvatarImage src={person.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {person.full_name?.[0] || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{person.full_name || "Anonymous"}</p>
        {person.job_title && (
          <p className="text-sm text-muted-foreground truncate">
            {person.job_title}
            {person.current_company && ` at ${person.current_company}`}
          </p>
        )}
        <div className="flex gap-1 mt-1">
          {person.is_mentor && (
            <Badge variant="secondary" className="text-xs">
              <GraduationCap className="w-3 h-3 mr-1" />
              Mentor
            </Badge>
          )}
          {person.is_recruiter && (
            <Badge variant="secondary" className="text-xs">
              <Briefcase className="w-3 h-3 mr-1" />
              Recruiter
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          My Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="connections">
              Connections {connections.length > 0 && `(${connections.length})`}
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests {pendingIncoming.length > 0 && `(${pendingIncoming.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredPeople.length > 0 ? (
                filteredPeople.map((person) => (
                  <DiscoverPersonCard key={person.user_id} person={person} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No people found. Make your profile public to appear here!
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-3">
            {connections.length > 0 ? (
              connections.map((connection) =>
                connection.profile && (
                  <div
                    key={connection.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={connection.profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {connection.profile.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{connection.profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {connection.profile.job_title}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => startDirectChat(connection.connected_user_id, "networking")}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                )
              )
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No connections yet. Start discovering people!
              </p>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-3">
            {pendingIncoming.length > 0 ? (
              pendingIncoming.map((request) =>
                request.from_profile && (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.from_profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {request.from_profile.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{request.from_profile.full_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {request.purpose || "Connection request"}
                      </p>
                      {request.message && (
                        <p className="text-sm mt-1">{request.message}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => respondToRequest(request.id, true)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondToRequest(request.id, false)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                )
              )
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No pending requests
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
