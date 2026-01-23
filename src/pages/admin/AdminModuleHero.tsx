import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, GraduationCap, Briefcase, Users, Building2, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModuleHero {
  id: string;
  module_key: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cta_text: string | null;
  cta_link: string | null;
  secondary_cta_text: string | null;
  secondary_cta_link: string | null;
  background_image: string | null;
  is_active: boolean;
}

const moduleIcons: Record<string, React.ElementType> = {
  school_student: GraduationCap,
  college_student: Briefcase,
  mentor: Users,
  institution: Building2,
  partner_company: Building
};

const moduleLabels: Record<string, string> = {
  school_student: "School Students",
  college_student: "College Students",
  mentor: "Mentors",
  institution: "Schools / Colleges",
  partner_company: "Partner Companies"
};

const AdminModuleHero = () => {
  const [modules, setModules] = useState<ModuleHero[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("module_hero_content")
        .select("*")
        .order("module_key");

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (module: ModuleHero) => {
    setSaving(module.id);
    try {
      const { error } = await supabase
        .from("module_hero_content")
        .update({
          title: module.title,
          subtitle: module.subtitle,
          description: module.description,
          cta_text: module.cta_text,
          cta_link: module.cta_link,
          secondary_cta_text: module.secondary_cta_text,
          secondary_cta_link: module.secondary_cta_link,
          background_image: module.background_image,
          is_active: module.is_active
        })
        .eq("id", module.id);

      if (error) throw error;
      toast({ title: "Success", description: "Module hero updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const updateModule = (id: string, field: keyof ModuleHero, value: any) => {
    setModules(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  return (
    <AdminLayout title="Module Hero Content">
      <p className="text-muted-foreground mb-6">
        Configure the hero section content for each user module. Each module has its own personalized hero section displayed when users select that role.
      </p>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {modules.map((module) => {
            const Icon = moduleIcons[module.module_key] || GraduationCap;
            return (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{moduleLabels[module.module_key] || module.module_key}</CardTitle>
                        <p className="text-sm text-muted-foreground">Module: {module.module_key}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={module.is_active} 
                          onCheckedChange={(c) => updateModule(module.id, "is_active", c)} 
                        />
                        <Label>Active</Label>
                      </div>
                      <Badge variant={module.is_active ? "default" : "secondary"}>
                        {module.is_active ? "Live" : "Hidden"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Hero Title *</Label>
                      <Input 
                        value={module.title} 
                        onChange={(e) => updateModule(module.id, "title", e.target.value)} 
                        placeholder="Main headline for this module"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Subtitle</Label>
                      <Textarea 
                        value={module.subtitle || ""} 
                        onChange={(e) => updateModule(module.id, "subtitle", e.target.value)} 
                        placeholder="Supporting text shown below the title"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea 
                        value={module.description || ""} 
                        onChange={(e) => updateModule(module.id, "description", e.target.value)} 
                        placeholder="Additional description text (optional)"
                      />
                    </div>
                    <div>
                      <Label>Primary CTA Text</Label>
                      <Input 
                        value={module.cta_text || ""} 
                        onChange={(e) => updateModule(module.id, "cta_text", e.target.value)} 
                        placeholder="Start Now"
                      />
                    </div>
                    <div>
                      <Label>Primary CTA Link</Label>
                      <Input 
                        value={module.cta_link || ""} 
                        onChange={(e) => updateModule(module.id, "cta_link", e.target.value)} 
                        placeholder="/school-careers"
                      />
                    </div>
                    <div>
                      <Label>Secondary CTA Text</Label>
                      <Input 
                        value={module.secondary_cta_text || ""} 
                        onChange={(e) => updateModule(module.id, "secondary_cta_text", e.target.value)} 
                        placeholder="Learn More"
                      />
                    </div>
                    <div>
                      <Label>Secondary CTA Link</Label>
                      <Input 
                        value={module.secondary_cta_link || ""} 
                        onChange={(e) => updateModule(module.id, "secondary_cta_link", e.target.value)} 
                        placeholder="/about"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Background Image URL</Label>
                      <Input 
                        value={module.background_image || ""} 
                        onChange={(e) => updateModule(module.id, "background_image", e.target.value)} 
                        placeholder="https://example.com/hero-bg.jpg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={() => handleUpdate(module)} 
                      disabled={saving === module.id}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving === module.id ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminModuleHero;
