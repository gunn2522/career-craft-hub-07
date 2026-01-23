import { useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TorchLoader } from "@/components/ui/TorchLoader";
import { FileText } from "lucide-react";

interface LegalPageData {
  title: string;
  content: string;
  last_updated: string;
}

const LegalPage = () => {
  const location = useLocation();
  // Extract page key from path: /privacy -> privacy, /terms -> terms
  const pageKey = location.pathname.replace("/", "");

  const { data: page, isLoading } = useQuery({
    queryKey: ["legal-page", pageKey],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("legal_pages")
        .select("*")
        .eq("page_key", pageKey)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data as LegalPageData | null;
    },
    enabled: !!pageKey,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <TorchLoader size="lg" text="Loading..." />
        </div>
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <FileText className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">This page doesn't exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-4xl font-bold mb-4">{page.title}</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Last updated: {new Date(page.last_updated).toLocaleDateString()}
          </p>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {page.content.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegalPage;