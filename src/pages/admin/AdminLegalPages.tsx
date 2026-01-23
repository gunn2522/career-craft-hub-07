import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Save, Loader2 } from "lucide-react";

interface LegalPage {
  id: string;
  page_key: string;
  title: string;
  content: string;
  is_published: boolean;
  last_updated: string;
}

const pageLabels: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  refund: "Refund Policy",
};

const AdminLegalPages = () => {
  const [activeTab, setActiveTab] = useState("privacy");
  const [editData, setEditData] = useState<Record<string, { title: string; content: string; is_published: boolean }>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin-legal-pages"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("legal_pages")
        .select("*")
        .order("page_key");
      if (error) throw error;
      return data as LegalPage[];
    },
  });

  useEffect(() => {
    if (pages) {
      const initial: Record<string, { title: string; content: string; is_published: boolean }> = {};
      pages.forEach((page) => {
        initial[page.page_key] = {
          title: page.title,
          content: page.content,
          is_published: page.is_published,
        };
      });
      setEditData(initial);
    }
  }, [pages]);

  const updateMutation = useMutation({
    mutationFn: async ({ pageKey, data }: { pageKey: string; data: { title: string; content: string; is_published: boolean } }) => {
      const { error } = await (supabase as any)
        .from("legal_pages")
        .update({ ...data, last_updated: new Date().toISOString() })
        .eq("page_key", pageKey);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-legal-pages"] });
      toast({ title: "Page updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update page", variant: "destructive" });
    },
  });

  const handleSave = (pageKey: string) => {
    const data = editData[pageKey];
    if (data) {
      updateMutation.mutate({ pageKey, data });
    }
  };

  const updateField = (pageKey: string, field: keyof typeof editData[string], value: string | boolean) => {
    setEditData((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [field]: value,
      },
    }));
  };

  const getPage = (pageKey: string) => pages?.find((p) => p.page_key === pageKey);

  if (isLoading) {
    return (
      <AdminLayout title="Legal Pages">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Legal Pages">
      <p className="text-muted-foreground mb-6">
        Manage Privacy Policy, Terms of Service, and other legal documents
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {Object.entries(pageLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(pageLabels).map(([pageKey, label]) => {
          const page = getPage(pageKey);
          const data = editData[pageKey] || { title: "", content: "", is_published: true };

          return (
            <TabsContent key={pageKey} value={pageKey}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Page Title</Label>
                    <Input
                      value={data.title}
                      onChange={(e) => updateField(pageKey, "title", e.target.value)}
                      placeholder="Enter page title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Content (Markdown supported)</Label>
                    <Textarea
                      value={data.content}
                      onChange={(e) => updateField(pageKey, "content", e.target.value)}
                      placeholder="Enter page content..."
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={data.is_published}
                      onCheckedChange={(checked) => updateField(pageKey, "is_published", checked)}
                    />
                    <Label>Published</Label>
                  </div>

                  {page && (
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(page.last_updated).toLocaleDateString()}
                    </p>
                  )}

                  <Button onClick={() => handleSave(pageKey)} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </AdminLayout>
  );
};

export default AdminLegalPages;