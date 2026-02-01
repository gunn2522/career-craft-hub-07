import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Building2, 
  Upload, 
  Save,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Instagram,
  MapPin,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink
} from "lucide-react";

interface PartnerProfileData {
  id?: string;
  company_name: string;
  company_description: string;
  company_website: string;
  industry: string;
  logo_url: string;
  cover_image_url: string;
  email: string;
  phone: string;
  hiring_focus: string[];
  hiring_roles: string[];
  internship_opportunities: string;
  project_opportunities: string;
  events_initiatives: string;
  social_links: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  is_visible: boolean;
  tagline: string;
  founded_year: number | null;
  company_size: string;
  headquarters: string;
  locations: string[];
  verification_status: string;
  profile_completion: number;
  slug: string;
}

interface Domain {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  domain_id: string;
}

const PartnerProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [profile, setProfile] = useState<PartnerProfileData>({
    company_name: "",
    company_description: "",
    company_website: "",
    industry: "",
    logo_url: "",
    cover_image_url: "",
    email: "",
    phone: "",
    hiring_focus: [],
    hiring_roles: [],
    internship_opportunities: "",
    project_opportunities: "",
    events_initiatives: "",
    social_links: {},
    is_visible: false,
    tagline: "",
    founded_year: null,
    company_size: "",
    headquarters: "",
    locations: [],
    verification_status: "unverified",
    profile_completion: 0,
    slug: ""
  });

  // Fetch domains
  const { data: domains } = useQuery({
    queryKey: ["career-domains"],
    queryFn: async () => {
      const { data } = await supabase
        .from("career_domains")
        .select("id, name")
        .eq("is_active", true)
        .order("display_order");
      return data as Domain[];
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["career-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("career_categories")
        .select("id, name, domain_id")
        .eq("is_active", true)
        .order("display_order");
      return data as Category[];
    }
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await (supabase as any)
        .from("partner_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (data) {
        setProfile({
          id: data.id,
          company_name: data.company_name || "",
          company_description: data.company_description || "",
          company_website: data.company_website || "",
          industry: data.industry || "",
          logo_url: data.logo_url || "",
          cover_image_url: data.cover_image_url || "",
          email: data.email || "",
          phone: data.phone || "",
          hiring_focus: data.hiring_focus || [],
          hiring_roles: data.hiring_roles || [],
          internship_opportunities: data.internship_opportunities || "",
          project_opportunities: data.project_opportunities || "",
          events_initiatives: data.events_initiatives || "",
          social_links: (data.social_links as { linkedin?: string; twitter?: string; instagram?: string }) || {},
          is_visible: data.is_visible || false,
          tagline: data.tagline || "",
          founded_year: data.founded_year,
          company_size: data.company_size || "",
          headquarters: data.headquarters || "",
          locations: data.locations || [],
          verification_status: data.verification_status || "unverified",
          profile_completion: data.profile_completion || 0,
          slug: data.slug || ""
        });

        // Fetch verified domains
        const { data: domainsData } = await (supabase as any)
          .from("partner_verified_domains")
          .select("domain_id")
          .eq("partner_id", data.id);
        
        if (domainsData) {
          setSelectedDomains(domainsData.map((d: any) => d.domain_id));
        }

        // Fetch verified categories
        const { data: categoriesData } = await (supabase as any)
          .from("partner_verified_categories")
          .select("category_id")
          .eq("partner_id", data.id);
        
        if (categoriesData) {
          setSelectedCategories(categoriesData.map((c: any) => c.category_id));
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 2MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      // File must be in user's folder to satisfy RLS policy
      const filePath = `${user.id}/logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(filePath);

      setProfile(prev => ({ ...prev, logo_url: publicUrl }));
      toast({ title: "Logo uploaded successfully" });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const profileData = {
        user_id: user.id,
        company_name: profile.company_name,
        company_description: profile.company_description,
        company_website: profile.company_website,
        industry: profile.industry,
        logo_url: profile.logo_url,
        cover_image_url: profile.cover_image_url,
        email: profile.email,
        phone: profile.phone,
        hiring_focus: profile.hiring_focus,
        hiring_roles: profile.hiring_roles,
        internship_opportunities: profile.internship_opportunities,
        project_opportunities: profile.project_opportunities,
        events_initiatives: profile.events_initiatives,
        social_links: profile.social_links,
        is_visible: profile.is_visible,
        tagline: profile.tagline,
        founded_year: profile.founded_year,
        company_size: profile.company_size,
        headquarters: profile.headquarters,
        locations: profile.locations,
        approval_status: 'pending'
      };

      let partnerId = profile.id;

      if (profile.id) {
        const { error } = await (supabase as any)
          .from("partner_profiles")
          .update(profileData)
          .eq("id", profile.id);
        if (error) throw error;
      } else {
        const { error, data } = await (supabase as any)
          .from("partner_profiles")
          .insert(profileData)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setProfile(prev => ({ ...prev, id: data.id, slug: data.slug }));
          partnerId = data.id;
        }
      }

      // Save domain selections
      if (partnerId) {
        await (supabase as any)
          .from("partner_verified_domains")
          .delete()
          .eq("partner_id", partnerId);

        if (selectedDomains.length > 0) {
          await (supabase as any)
            .from("partner_verified_domains")
            .insert(selectedDomains.map(domainId => ({
              partner_id: partnerId,
              domain_id: domainId
            })));
        }

        // Save category selections
        await (supabase as any)
          .from("partner_verified_categories")
          .delete()
          .eq("partner_id", partnerId);

        if (selectedCategories.length > 0) {
          await (supabase as any)
            .from("partner_verified_categories")
            .insert(selectedCategories.map(categoryId => ({
              partner_id: partnerId,
              category_id: categoryId
            })));
        }
      }

      toast({ title: "Profile saved successfully", description: "Your profile is now pending admin approval." });
      fetchProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const getVerificationBadge = () => {
    switch (profile.verification_status) {
      case "verified":
        return <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>;
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending Verification</Badge>;
      case "suspended":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Suspended</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" /> Unverified</Badge>;
    }
  };

  const filteredCategories = categories?.filter(c => selectedDomains.includes(c.domain_id)) || [];

  if (isLoading) {
    return (
      <PartnerLayout title="Company Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout title="Company Profile">
      <div className="max-w-4xl space-y-8">
        {/* Status & Completion */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Profile Status</h2>
                {getVerificationBadge()}
              </div>
              {profile.slug && profile.verification_status === "verified" && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`/company/${profile.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Page
                  </a>
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium">{profile.profile_completion}%</span>
              </div>
              <Progress value={profile.profile_completion} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Logo & Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>Build your company's presence on Career Craft Cafe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.logo_url} />
                <AvatarFallback><Building2 className="w-12 h-12" /></AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Upload className="w-4 h-4" />
                    {isUploading ? "Uploading..." : "Upload Logo"}
                  </div>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB. This will appear on homepage after approval.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  value={profile.company_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  value={profile.tagline}
                  onChange={(e) => setProfile(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Your company's tagline"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input
                  value={profile.industry}
                  onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="Technology, Finance..."
                />
              </div>
              <div className="space-y-2">
                <Label>Founded Year</Label>
                <Input
                  type="number"
                  value={profile.founded_year || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, founded_year: parseInt(e.target.value) || null }))}
                  placeholder="2020"
                />
              </div>
              <div className="space-y-2">
                <Label>Company Size</Label>
                <Select 
                  value={profile.company_size} 
                  onValueChange={(value) => setProfile(prev => ({ ...prev, company_size: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1001+">1001+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company Description *</Label>
              <Textarea
                value={profile.company_description}
                onChange={(e) => setProfile(prev => ({ ...prev, company_description: e.target.value }))}
                placeholder="Describe your company..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Domain & Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Domains & Categories</CardTitle>
            <CardDescription>Select the domains and categories your company operates in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Domains</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {domains?.map((domain) => (
                  <div key={domain.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`domain-${domain.id}`}
                      checked={selectedDomains.includes(domain.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDomains(prev => [...prev, domain.id]);
                        } else {
                          setSelectedDomains(prev => prev.filter(d => d !== domain.id));
                          setSelectedCategories(prev => 
                            prev.filter(c => !categories?.find(cat => cat.id === c && cat.domain_id === domain.id))
                          );
                        }
                      }}
                    />
                    <label htmlFor={`domain-${domain.id}`} className="text-sm cursor-pointer">
                      {domain.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {filteredCategories.length > 0 && (
              <div className="space-y-4">
                <Label>Categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories(prev => [...prev, category.id]);
                          } else {
                            setSelectedCategories(prev => prev.filter(c => c !== category.id));
                          }
                        }}
                      />
                      <label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Headquarters</Label>
                <Input
                  value={profile.headquarters}
                  onChange={(e) => setProfile(prev => ({ ...prev, headquarters: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label>Other Locations (comma-separated)</Label>
                <Input
                  value={profile.locations.join(", ")}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="Mumbai, Delhi, Bangalore..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Globe className="w-4 h-4" /> Website</Label>
                <Input
                  value={profile.company_website}
                  onChange={(e) => setProfile(prev => ({ ...prev, company_website: e.target.value }))}
                  placeholder="https://www.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="hr@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</Label>
                <Input
                  value={profile.social_links.linkedin || ""}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    social_links: { ...prev.social_links, linkedin: e.target.value }
                  }))}
                  placeholder="LinkedIn URL"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter</Label>
                <Input
                  value={profile.social_links.twitter || ""}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    social_links: { ...prev.social_links, twitter: e.target.value }
                  }))}
                  placeholder="Twitter URL"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram</Label>
                <Input
                  value={profile.social_links.instagram || ""}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    social_links: { ...prev.social_links, instagram: e.target.value }
                  }))}
                  placeholder="Instagram URL"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle>Hiring & Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Hiring Focus (comma-separated roles)</Label>
              <Textarea
                value={profile.hiring_focus.join(", ")}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  hiring_focus: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                placeholder="Software Engineering, Data Science, Marketing..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Hiring Roles</Label>
              <Textarea
                value={profile.hiring_roles.join(", ")}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  hiring_roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                placeholder="Frontend Developer, Backend Developer, DevOps..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Internship Opportunities</Label>
              <Textarea
                value={profile.internship_opportunities}
                onChange={(e) => setProfile(prev => ({ ...prev, internship_opportunities: e.target.value }))}
                placeholder="Describe internship programs..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Project Opportunities</Label>
              <Textarea
                value={profile.project_opportunities}
                onChange={(e) => setProfile(prev => ({ ...prev, project_opportunities: e.target.value }))}
                placeholder="Describe project collaborations..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Events & Initiatives</Label>
              <Textarea
                value={profile.events_initiatives}
                onChange={(e) => setProfile(prev => ({ ...prev, events_initiatives: e.target.value }))}
                placeholder="Describe company events and CSR initiatives..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Visibility Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Make Profile Public</p>
                <p className="text-sm text-muted-foreground">Your profile will be visible on the platform after admin approval</p>
              </div>
              <Switch
                checked={profile.is_visible}
                onCheckedChange={(checked) => setProfile(prev => ({ ...prev, is_visible: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/partner-dashboard")}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PartnerProfilePage;