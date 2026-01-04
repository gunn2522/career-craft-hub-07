import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  TrendingUp,
  Beaker,
  Award,
  Clock,
  Star,
  BookOpen,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

interface MentorProfile {
  expertise: string[];
  specialization: string;
  years_of_experience: number;
  students_mentored: number;
  sessions_conducted: number;
  availability_status: string;
  rating: number;
}

export const MentorDashboardView = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [pendingMessages, setPendingMessages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      setProfile(profileData);

      // Fetch mentor profile
      const { data: mentorData } = await supabase
        .from("mentor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      setMentorProfile(mentorData);

      // Fetch connections (assigned students)
      const { data: connections } = await supabase
        .from("connections")
        .select(`
          *,
          connected_user:profiles!connections_connected_user_id_fkey(*)
        `)
        .eq("user_id", user.id)
        .limit(5);

      if (connections) {
        setAssignedStudents(connections);
      }

    } catch (error) {
      console.error("Error fetching mentor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    { label: "Students Mentored", value: mentorProfile?.students_mentored || 0, icon: Users },
    { label: "Sessions Conducted", value: mentorProfile?.sessions_conducted || 0, icon: Calendar },
    { label: "Rating", value: mentorProfile?.rating?.toFixed(1) || "N/A", icon: Star },
    { label: "Experience", value: `${mentorProfile?.years_of_experience || 0} yrs`, icon: Clock },
  ];

  return (
    <div className="min-h-screen pt-24 pb-8">
      <div className="px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Beaker className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
                  Mentor Dashboard
                  <Badge variant="secondary">Mentor</Badge>
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {profile?.full_name || "Mentor"}
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/mentor">
                <Settings className="w-4 h-4 mr-2" />
                Full Dashboard
              </Link>
            </Button>
          </div>

          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profile?.full_name?.charAt(0) || "M"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{profile?.full_name}</h2>
                  <p className="text-muted-foreground">
                    {mentorProfile?.specialization || profile?.job_title || "Mentor"}
                  </p>
                  {mentorProfile?.expertise && mentorProfile.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mentorProfile.expertise.slice(0, 4).map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Badge 
                  variant={mentorProfile?.availability_status === "available" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {mentorProfile?.availability_status || "Available"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <stat.icon className="w-8 h-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="students" className="space-y-6">
            <TabsList>
              <TabsTrigger value="students">
                <Users className="w-4 h-4 mr-2" />
                Students
              </TabsTrigger>
              <TabsTrigger value="resources">
                <BookOpen className="w-4 h-4 mr-2" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="messages">
                <MessageCircle className="w-4 h-4 mr-2" />
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Students</CardTitle>
                  <CardDescription>Students you're currently mentoring</CardDescription>
                </CardHeader>
                <CardContent>
                  {assignedStudents.length > 0 ? (
                    <div className="space-y-4">
                      {assignedStudents.map((connection, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg border">
                          <Avatar>
                            <AvatarFallback>S</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">Student {index + 1}</p>
                            <p className="text-sm text-muted-foreground">Active</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No students assigned yet</p>
                      <p className="text-sm">Students will appear here once they connect with you</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardHeader>
                  <CardTitle>Your Resources</CardTitle>
                  <CardDescription>Resources you've shared with students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No resources shared yet</p>
                    <Button asChild className="mt-4">
                      <Link to="/mentor/resources">Add Resources</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Recent messages from students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending messages</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
