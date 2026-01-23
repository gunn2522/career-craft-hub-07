import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TorchLoader } from "@/components/ui/TorchLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, Users, Calendar, Briefcase, Award, ExternalLink, 
  Linkedin, Globe, Clock, CheckCircle, MessageCircle, Video,
  BookOpen, Heart, Bell, Play
} from "lucide-react";
import { toast } from "sonner";

interface MentorProfileData {
  id: string;
  user_id: string;
  bio: string | null;
  expertise: string[] | null;
  specialization: string | null;
  years_of_experience: number | null;
  rating: number | null;
  students_mentored: number | null;
  sessions_conducted: number | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  availability_status: string | null;
  verification_status: string | null;
  achievements: string[] | null;
  certifications: string[] | null;
  languages: string[] | null;
  total_subscribers: number | null;
  featured_video_url: string | null;
  consultation_rate: number | null;
  is_featured: boolean | null;
}

interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
  institution: string | null;
}

interface MentorEvent {
  id: string;
  title: string;
  event_type: string;
  start_time: string;
  is_paid: boolean;
  price: number;
  current_registrations: number;
  max_participants: number | null;
  status: string;
}

interface MentorRoom {
  id: string;
  name: string;
  description: string | null;
  topic: string | null;
  room_type: string;
  access_type: string;
}

const MentorProfile = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const { user } = useAuth();
  const [mentor, setMentor] = useState<MentorProfileData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<MentorEvent[]>([]);
  const [rooms, setRooms] = useState<MentorRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (mentorId) {
      fetchMentorData();
    }
  }, [mentorId, user]);

  const fetchMentorData = async () => {
    try {
      // Fetch mentor profile
      const { data: mentorData, error: mentorError } = await supabase
        .from("mentor_profiles")
        .select("*")
        .eq("id", mentorId)
        .single();

      if (mentorError) throw mentorError;
      setMentor(mentorData);

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, institution")
        .eq("user_id", mentorData.user_id)
        .single();
      
      setProfile(profileData);

      // Fetch events
      const { data: eventsData } = await supabase
        .from("mentor_events")
        .select("*")
        .eq("mentor_id", mentorId)
        .eq("is_active", true)
        .order("start_time", { ascending: true });
      
      setEvents(eventsData || []);

      // Fetch rooms
      const { data: roomsData } = await supabase
        .from("mentor_rooms")
        .select("*")
        .eq("mentor_id", mentorId)
        .eq("is_active", true);
      
      setRooms(roomsData || []);

      // Check subscription status
      if (user) {
        const { data: subData } = await supabase
          .from("mentor_subscriptions")
          .select("id, status")
          .eq("student_id", user.id)
          .eq("mentor_id", mentorId)
          .eq("status", "active")
          .maybeSingle();
        
        setIsSubscribed(!!subData);
      }
    } catch (error) {
      console.error("Error fetching mentor:", error);
      toast.error("Failed to load mentor profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }

    setSubscribing(true);
    try {
      const { error } = await supabase
        .from("mentor_subscriptions")
        .insert({
          student_id: user.id,
          mentor_id: mentorId,
          subscription_type: "free",
          status: "active"
        });

      if (error) throw error;
      setIsSubscribed(true);
      toast.success("Successfully subscribed to mentor!");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("You are already subscribed");
      } else {
        toast.error("Failed to subscribe");
      }
    } finally {
      setSubscribing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <TorchLoader size="lg" text="Loading mentor profile..." />
        </div>
      </Layout>
    );
  }

  if (!mentor || !profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Mentor not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-32 h-32 border-4 border-primary/20">
              <AvatarImage src={mentor.featured_video_url || profile.avatar_url || ""} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {profile.full_name?.charAt(0) || "M"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                {mentor.verification_status === "verified" && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
                {mentor.is_featured && (
                  <Badge variant="secondary">Featured Mentor</Badge>
                )}
              </div>

              <p className="text-xl text-muted-foreground mb-2">
                {mentor.specialization || "Career Mentor"}
              </p>

              {profile.institution && (
                <p className="text-sm text-muted-foreground mb-4">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  {profile.institution}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold">{mentor.rating?.toFixed(1) || "N/A"}</span>
                  <span className="text-muted-foreground">Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-bold">{mentor.total_subscribers || 0}</span>
                  <span className="text-muted-foreground">Subscribers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-bold">{mentor.sessions_conducted || 0}</span>
                  <span className="text-muted-foreground">Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-bold">{mentor.years_of_experience || 0}+</span>
                  <span className="text-muted-foreground">Years Exp.</span>
                </div>
              </div>

              {/* Expertise Tags */}
              {mentor.expertise && mentor.expertise.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.expertise.map((skill, idx) => (
                    <Badge key={idx} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {!isSubscribed ? (
                  <Button onClick={handleSubscribe} disabled={subscribing}>
                    <Bell className="w-4 h-4 mr-2" />
                    {subscribing ? "Subscribing..." : "Subscribe"}
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Subscribed
                  </Button>
                )}
                
                {mentor.linkedin_url && (
                  <Button variant="outline" asChild>
                    <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                
                {mentor.portfolio_url && (
                  <Button variant="outline" asChild>
                    <a href={mentor.portfolio_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Portfolio
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
            <TabsTrigger value="rooms">Rooms ({rooms.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            {/* Bio */}
            {mentor.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{mentor.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Achievements & Certifications */}
            <div className="grid md:grid-cols-2 gap-6">
              {mentor.achievements && mentor.achievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {mentor.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {mentor.certifications && mentor.certifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {mentor.certifications.map((cert, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Languages */}
            {mentor.languages && mentor.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mentor.languages.map((lang, idx) => (
                      <Badge key={idx} variant="secondary">{lang}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            {events.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No upcoming events</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <Card key={event.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={event.status === "upcoming" ? "default" : "secondary"}>
                          {event.event_type}
                        </Badge>
                        {event.is_paid ? (
                          <span className="font-bold text-primary">₹{event.price}</span>
                        ) : (
                          <Badge variant="outline" className="text-green-500 border-green-500">Free</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {formatDate(event.start_time)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {event.current_registrations} / {event.max_participants || "∞"} registered
                        </span>
                        <Button size="sm">
                          <Play className="w-4 h-4 mr-1" />
                          Register
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rooms" className="space-y-4">
            {rooms.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No rooms available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {rooms.map((room) => (
                  <Card key={room.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">{room.room_type}</Badge>
                        <Badge variant={room.access_type === "free" ? "default" : "secondary"}>
                          {room.access_type === "free" ? "Open" : "Subscribers Only"}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{room.name}</h3>
                      {room.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {room.description}
                        </p>
                      )}
                      <Button size="sm" variant="outline" className="w-full">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Join Room
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MentorProfile;
