import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InstitutionLayout } from "@/components/institution/InstitutionLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  MapPin,
  Linkedin,
  Twitter,
  Instagram
} from "lucide-react";

interface InstitutionProfile {
  id?: string;
  name: string;
  institution_type: string;
  type: string;
  description: string;
  vision: string;
  focus_areas: string[];
  programs_offered: string[];
  past_collaborations: string[];
  logo_url: string;
  website_url: string;
  location: string;
  contact_email: string;
  phone: string;
  social_links: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  is_visible: boolean;
}

const InstitutionProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<InstitutionProfile>({
    name: "",
    institution_type: "college",
    type: "college",
    description: "",
    vision: "",
    focus_areas: [],
    programs_offered: [],
    past_collaborations: [],
    logo_url: "",
    website_url: "",
    location: "",
    contact_email: "",
    phone: "",
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
        .from("institutions")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (data) {
        setProfile({
          id: data.id,
          name: data.name || "",
          institution_type: data.institution_type || "college",
          type: data.type || "college",
          description: data.description || "",
          vision: data.vision || "",
          focus_areas: data.focus_areas || [],
          programs_offered: data.programs_offered || [],
          past_collaborations: data.past_collaborations || [],
          logo_url: data.logo_url || "",
          website_url: data.website_url || "",
          location: data.location || "",
          contact_email: data.contact_email || "",
          phone: data.phone || "",
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
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

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
        name: profile.name,
        institution_type: profile.institution_type,
        type: profile.type,
        description: profile.description,
        vision: profile.vision,
        focus_areas: profile.focus_areas,
        programs_offered: profile.programs_offered,
        past_collaborations: profile.past_collaborations,
        logo_url: profile.logo_url,
        website_url: profile.website_url,
        location: profile.location,
        contact_email: profile.contact_email,
        phone: profile.phone,
        social_links: profile.social_links,
        is_visible: profile.is_visible,
        approval_status: 'pending'
      };

      if (profile.id) {
        const { error } = await supabase
          .from("institutions")
          .update(profileData)
          .eq("id", profile.id);
        if (error) throw error;
      } else {
        const { error, data } = await supabase
          .from("institutions")
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

  const updateArrayField = (field: 'focus_areas' | 'programs_offered' | 'past_collaborations', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setProfile(prev => ({ ...prev, [field]: items }));
  };

  if (isLoading) {
    return (
      <InstitutionLayout title="My Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout title="My Profile">
      <div className="max-w-4xl space-y-8">
        {/* Logo & Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Institution Profile</CardTitle>
            <CardDescription>Build your institution's public presence on Career Craft Cafe</CardDescription>
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
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution Name *</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter institution name"
                />
              </div>
              <div className="space-y-2">
                <Label>Institution Type *</Label>
                <Select
                  value={profile.institution_type}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, institution_type: value, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>About Us / Description *</Label>
              <Textarea
                value={profile.description}
                onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your institution..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Vision & Focus Areas</Label>
              <Textarea
                value={profile.vision}
                onChange={(e) => setProfile(prev => ({ ...prev, vision: e.target.value }))}
                placeholder="Describe your institution's vision..."
                rows={3}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Globe className="w-4 h-4" /> Website</Label>
                <Input
                  value={profile.website_url}
                  onChange={(e) => setProfile(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://www.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
                <Input
                  type="email"
                  value={profile.contact_email}
                  onChange={(e) => setProfile(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="contact@example.com"
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
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</Label>
                <Input
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State"
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

        {/* Programs & Collaborations */}
        <Card>
          <CardHeader>
            <CardTitle>Programs & Collaborations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Programs Offered (comma-separated)</Label>
              <Textarea
                value={profile.programs_offered.join(", ")}
                onChange={(e) => updateArrayField('programs_offered', e.target.value)}
                placeholder="B.Tech, MBA, BCA, MCA..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Focus Areas (comma-separated)</Label>
              <Textarea
                value={profile.focus_areas.join(", ")}
                onChange={(e) => updateArrayField('focus_areas', e.target.value)}
                placeholder="Technology, Business, Healthcare..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Past Collaborations (comma-separated)</Label>
              <Textarea
                value={profile.past_collaborations.join(", ")}
                onChange={(e) => updateArrayField('past_collaborations', e.target.value)}
                placeholder="Company A, Organization B..."
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
                <p className="text-sm text-muted-foreground">Your profile will be visible after admin approval</p>
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
          <Button variant="outline" onClick={() => navigate("/institution")}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </InstitutionLayout>
  );
};

export default InstitutionProfile;
