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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Upload, 
  Save,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Instagram
} from "lucide-react";

interface PartnerProfileData {
  id?: string;
  company_name: string;
  company_description: string;
  company_website: string;
  industry: string;
  logo_url: string;
  email: string;
  phone: string;
  hiring_focus: string[];
  internship_opportunities: string;
  project_opportunities: string;
  events_initiatives: string;
  social_links: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  is_visible: boolean;
}

const PartnerProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<PartnerProfileData>({
    company_name: "",
    company_description: "",
    company_website: "",
    industry: "",
    logo_url: "",
    email: "",
    phone: "",
    hiring_focus: [],
    internship_opportunities: "",
    project_opportunities: "",
    events_initiatives: "",
    social_links: {},
    is_visible: false
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
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
          email: data.email || "",
          phone: data.phone || "",
          hiring_focus: data.hiring_focus || [],
          internship_opportunities: data.internship_opportunities || "",
          project_opportunities: data.project_opportunities || "",
          events_initiatives: data.events_initiatives || "",
          social_links: (data.social_links as { linkedin?: string; twitter?: string; instagram?: string }) || {},
          is_visible: data.is_visible || false
        });
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
      const fileName = `partner-${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

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
        email: profile.email,
        phone: profile.phone,
        hiring_focus: profile.hiring_focus,
        internship_opportunities: profile.internship_opportunities,
        project_opportunities: profile.project_opportunities,
        events_initiatives: profile.events_initiatives,
        social_links: profile.social_links,
        is_visible: profile.is_visible,
        approval_status: 'pending'
      };

      if (profile.id) {
        const { error } = await supabase
          .from("partner_profiles")
          .update(profileData)
          .eq("id", profile.id);
        if (error) throw error;
      } else {
        const { error, data } = await supabase
          .from("partner_profiles")
          .insert(profileData)
          .select()
          .single();
        if (error) throw error;
        if (data) setProfile(prev => ({ ...prev, id: data.id }));
      }

      toast({ title: "Profile saved successfully", description: "Your profile is now pending admin approval." });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

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
                <Label>Industry</Label>
                <Input
                  value={profile.industry}
                  onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="Technology, Finance, Healthcare..."
                />
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
            <CardTitle>Opportunities & Initiatives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Hiring Focus (comma-separated)</Label>
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
                <p className="text-sm text-muted-foreground">Your logo will appear on homepage after admin approval</p>
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
