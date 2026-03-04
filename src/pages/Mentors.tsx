import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { TorchLoader } from "@/components/ui/TorchLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TorchElements3D } from "@/components/ui/TorchElements3D";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, Star, Users, Clock, CheckCircle, 
  Filter, ChevronDown, UserCheck, GraduationCap
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

interface MentorWithProfile {
  id: string;
  user_id: string;
  bio: string | null;
  expertise: string[] | null;
  specialization: string | null;
  years_of_experience: number | null;
  rating: number | null;
  total_subscribers: number | null;
  verification_status: string | null;
  availability_status: string | null;
  is_featured: boolean | null;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    institution: string | null;
  } | null;
}

const Mentors = () => {
  const [mentors, setMentors] = useState<MentorWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      // Optimized: Single query with join instead of N+1 queries
      const { data: mentorData, error } = await supabase
        .from("mentor_profiles")
        .select(`
          id,
          user_id,
          bio,
          expertise,
          specialization,
          years_of_experience,
          rating,
          total_subscribers,
          verification_status,
          availability_status,
          is_featured
        `)
        .eq("verification_status", "verified");

      if (error) throw error;

      if (!mentorData || mentorData.length === 0) {
        setMentors([]);
        setIsLoading(false);
        return;
      }

      // Fetch all profiles in a single query using the user_ids
      const userIds = mentorData.map(m => m.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .rpc("get_public_profiles", { user_ids: userIds });

      if (profilesError) throw profilesError;

      // Create a map for quick profile lookup
      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Merge mentor data with profiles
      const mentorsWithProfiles: MentorWithProfile[] = mentorData.map(mentor => ({
        ...mentor,
        profile: profileMap.get(mentor.user_id) || null,
      }));

      setMentors(mentorsWithProfiles);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique expertise tags
  const allExpertise = Array.from(
    new Set(mentors.flatMap((m) => m.expertise || []))
  );

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      mentor.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      mentor.expertise?.some((e) => e.toLowerCase().includes(search.toLowerCase()));

    const matchesExpertise =
      expertiseFilter === "all" || mentor.expertise?.includes(expertiseFilter);

    const matchesAvailability =
      availabilityFilter === "all" ||
      mentor.availability_status === availabilityFilter;

    return matchesSearch && matchesExpertise && matchesAvailability;
  });

  // Sort: featured first, then by rating
  const sortedMentors = [...filteredMentors].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return (b.rating || 0) - (a.rating || 0);
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Mentors background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        </div>

        <TorchElements3D count={8} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm mb-6">
              <UserCheck className="w-4 h-4" />
              Industry Experts
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Learn from <span className="gradient-text">Expert Mentors</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl">
              Connect with verified industry professionals who can guide your career journey
            </p>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search mentors by name, expertise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 h-14 rounded-xl bg-card/80 backdrop-blur-sm border-border/50 text-lg"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => window.scrollTo({ top: window.innerHeight - 100, behavior: "smooth" })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <span className="text-sm font-medium">Browse Mentors</span>
          <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center">
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </button>
      </section>

      {/* Filters & Mentors Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">Filters:</span>
            </div>

            <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Expertise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Expertise</SelectItem>
                {allExpertise.map((exp) => (
                  <SelectItem key={exp} value={exp}>
                    {exp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="away">Away</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto text-muted-foreground">
              {sortedMentors.length} mentor{sortedMentors.length !== 1 ? "s" : ""} found
            </div>
          </div>

          {/* Mentors Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <TorchLoader size="lg" text="Loading mentors..." />
            </div>
          ) : sortedMentors.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No mentors found matching your criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedMentors.map((mentor) => (
                <Link key={mentor.id} to={`/mentors/${mentor.id}`}>
                  <Card className="h-full hover:border-primary/50 transition-all group">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-16 h-16 border-2 border-primary/20">
                          <AvatarImage src={mentor.profile?.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {mentor.profile?.full_name?.charAt(0) || "M"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                              {mentor.profile?.full_name || "Mentor"}
                            </h3>
                            {mentor.verification_status === "verified" && (
                              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {mentor.specialization || "Career Mentor"}
                          </p>
                          {mentor.is_featured && (
                            <Badge variant="secondary" className="mt-1">Featured</Badge>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500" />
                          <span className="font-medium">{mentor.rating?.toFixed(1) || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{mentor.total_subscribers || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{mentor.years_of_experience || 0}+ yrs</span>
                        </div>
                      </div>

                      {/* Expertise Tags */}
                      {mentor.expertise && mentor.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {mentor.expertise.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {mentor.expertise.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{mentor.expertise.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Availability */}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={mentor.availability_status === "available" ? "default" : "secondary"}
                          className={mentor.availability_status === "available" ? "bg-primary" : ""}
                        >
                          {mentor.availability_status || "Available"}
                        </Badge>
                        <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Mentors;
