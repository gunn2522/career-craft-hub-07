import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Search, 
  MapPin, 
  Users, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const Institutions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: institutions, isLoading } = useQuery({
    queryKey: ["institutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institutions")
        .select("*")
        .eq("is_visible", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'school': return <GraduationCap className="w-5 h-5" />;
      case 'college': return <Building2 className="w-5 h-5" />;
      case 'company': return <Briefcase className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  const filteredInstitutions = institutions?.filter((inst) => {
    const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTab === "all" || inst.type === activeTab;
    return matchesSearch && matchesType;
  });

  const counts = {
    all: institutions?.length || 0,
    school: institutions?.filter(i => i.type === 'school').length || 0,
    college: institutions?.filter(i => i.type === 'college').length || 0,
    company: institutions?.filter(i => i.type === 'company').length || 0,
  };

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="w-full px-4 md:px-8 lg:px-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm mb-4">
              <Building2 className="w-4 h-4" />
              Partner Network
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Our <span className="gradient-text">Institutions & Partners</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Connect with schools, colleges, and companies that are part of our growing network
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="school" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Schools
              </TabsTrigger>
              <TabsTrigger value="college" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Colleges
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Companies
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Institutions Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredInstitutions?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No institutions found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstitutions?.map((institution) => (
                <Link key={institution.id} to={`/institutions/${institution.id}`}>
                  <Card className="h-full transition-all duration-300 hover:scale-105 hover:border-primary/50 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          {institution.logo_url ? (
                            <img 
                              src={institution.logo_url} 
                              alt={institution.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            getTypeIcon(institution.type)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {institution.name}
                            {institution.is_verified && (
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            )}
                          </CardTitle>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {institution.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {institution.description || "Explore this institution"}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {institution.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {institution.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {institution.member_count} members
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Institutions;
