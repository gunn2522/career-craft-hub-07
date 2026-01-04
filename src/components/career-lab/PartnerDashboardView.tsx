import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building2, 
  Briefcase, 
  Users,
  Eye,
  TrendingUp,
  Plus,
  Globe,
  Beaker,
} from "lucide-react";
import { Link } from "react-router-dom";

interface PartnerProfile {
  company_name: string;
  company_website: string;
  company_description: string;
  industry: string;
  jobs_posted: number;
  students_engaged: number;
}

export const PartnerDashboardView = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null);
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
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

      // Fetch partner profile
      const { data: partnerData } = await supabase
        .from("partner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      setPartnerProfile(partnerData);

      // Fetch internships posted by company (future enhancement)
      // For now, we'll show placeholder data

    } catch (error) {
      console.error("Error fetching partner data:", error);
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
    { label: "Jobs Posted", value: partnerProfile?.jobs_posted || 0, icon: Briefcase },
    { label: "Students Engaged", value: partnerProfile?.students_engaged || 0, icon: Users },
    { label: "Profile Views", value: 0, icon: Eye },
    { label: "Brand Visibility", value: "Active", icon: TrendingUp },
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
                  Partner Dashboard
                  <Badge variant="secondary">Partner</Badge>
                </h1>
                <p className="text-muted-foreground">
                  Welcome, {partnerProfile?.company_name || profile?.full_name || "Partner"}
                </p>
              </div>
            </div>
          </div>

          {/* Company Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">
                    {partnerProfile?.company_name || "Your Company"}
                  </h2>
                  <p className="text-muted-foreground">
                    {partnerProfile?.industry || "Industry not set"}
                  </p>
                  {partnerProfile?.company_website && (
                    <a 
                      href={partnerProfile.company_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary text-sm flex items-center gap-1 mt-1 hover:underline"
                    >
                      <Globe className="w-3 h-3" />
                      {partnerProfile.company_website}
                    </a>
                  )}
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
              </div>
              {partnerProfile?.company_description && (
                <p className="mt-4 text-muted-foreground">
                  {partnerProfile.company_description}
                </p>
              )}
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
          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList>
              <TabsTrigger value="jobs">
                <Briefcase className="w-4 h-4 mr-2" />
                Jobs & Internships
              </TabsTrigger>
              <TabsTrigger value="engagement">
                <Users className="w-4 h-4 mr-2" />
                Student Engagement
              </TabsTrigger>
              <TabsTrigger value="visibility">
                <Eye className="w-4 h-4 mr-2" />
                Brand Visibility
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>Posted Jobs & Internships</CardTitle>
                  <CardDescription>Manage your job postings</CardDescription>
                </CardHeader>
                <CardContent>
                  {postedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {postedJobs.map((job, index) => (
                        <div key={index} className="p-4 rounded-lg border">
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-muted-foreground">{job.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No jobs posted yet</p>
                      <p className="text-sm mb-4">Start posting to engage with talented students</p>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engagement">
              <Card>
                <CardHeader>
                  <CardTitle>Student Engagement</CardTitle>
                  <CardDescription>Students who have engaged with your company</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No student engagement data yet</p>
                    <p className="text-sm">Post jobs to start engaging with students</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visibility">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Visibility</CardTitle>
                  <CardDescription>Your brand presence on Career Craft Cafe</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg border">
                      <h3 className="font-medium mb-2">Logo Display</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your logo appears in the Partners section on the website
                      </p>
                      <Badge variant="secondary">Pending Setup</Badge>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <h3 className="font-medium mb-2">Company Profile</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Complete your profile to increase visibility
                      </p>
                      <Button variant="outline" size="sm">Edit Profile</Button>
                    </div>
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
