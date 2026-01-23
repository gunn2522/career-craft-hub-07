import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, Mail, Phone, MapPin, Linkedin, Instagram, Youtube } from "lucide-react";

interface SiteConfig {
  id: string;
  config_key: string;
  config_value: Record<string, string>;
}

const AdminSiteConfig = () => {
  const [contact, setContact] = useState({ email: "", phone: "", address: "" });
  const [socialLinks, setSocialLinks] = useState({ linkedin: "", instagram: "", youtube: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configs, isLoading } = useQuery({
    queryKey: ["admin-site-config"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("site_config")
        .select("*");
      if (error) throw error;
      return data as SiteConfig[];
    },
  });

  useEffect(() => {
    if (configs) {
      const contactConfig = configs.find((c) => c.config_key === "contact");
      const socialConfig = configs.find((c) => c.config_key === "social_links");
      
      if (contactConfig?.config_value) {
        setContact({
          email: (contactConfig.config_value as Record<string, string>).email || "",
          phone: (contactConfig.config_value as Record<string, string>).phone || "",
          address: (contactConfig.config_value as Record<string, string>).address || "",
        });
      }
      
      if (socialConfig?.config_value) {
        setSocialLinks({
          linkedin: (socialConfig.config_value as Record<string, string>).linkedin || "",
          instagram: (socialConfig.config_value as Record<string, string>).instagram || "",
          youtube: (socialConfig.config_value as Record<string, string>).youtube || "",
        });
      }
    }
  }, [configs]);

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Record<string, string> }) => {
      const { error } = await (supabase as any)
        .from("site_config")
        .upsert({ 
          config_key: key, 
          config_value: value,
          updated_at: new Date().toISOString()
        }, { onConflict: "config_key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-config"] });
      toast({ title: "Configuration saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save configuration", variant: "destructive" });
    },
  });

  const saveContact = () => {
    updateMutation.mutate({ key: "contact", value: contact });
  };

  const saveSocialLinks = () => {
    updateMutation.mutate({ key: "social_links", value: socialLinks });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Site Configuration">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Site Configuration">
      <p className="text-muted-foreground mb-6">
        Manage contact information and social media links displayed on the website
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </Label>
              <Input
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone
              </Label>
              <Input
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                placeholder="+91 12345 67890"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Address
              </Label>
              <Input
                value={contact.address}
                onChange={(e) => setContact({ ...contact, address: e.target.value })}
                placeholder="City, State"
              />
            </div>
            <Button onClick={saveContact} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Contact Info
            </Button>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Linkedin className="w-5 h-5" />
              Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </Label>
              <Input
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Instagram className="w-4 h-4" /> Instagram
              </Label>
              <Input
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Youtube className="w-4 h-4" /> YouTube
              </Label>
              <Input
                value={socialLinks.youtube}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                placeholder="https://youtube.com/@..."
              />
            </div>
            <Button onClick={saveSocialLinks} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Social Links
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSiteConfig;