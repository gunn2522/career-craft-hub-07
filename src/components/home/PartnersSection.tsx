import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, ExternalLink } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  partner_type: string;
}

export const PartnersSection = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("id, name, logo_url, website_url, partner_type")
        .eq("is_visible", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Loading partners...</div>
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null; // Don't show section if no partners
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Building2 className="w-4 h-4" />
            Our Partners
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We collaborate with top companies to provide students with real-world opportunities
          </p>
        </div>

        {/* Partner Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-items-center">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.website_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-all duration-300 w-full flex items-center justify-center min-h-[100px]"
              title={partner.name}
            >
              {partner.logo_url ? (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="max-h-12 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                  <Building2 className="w-8 h-8" />
                  <span className="text-sm font-medium text-center">{partner.name}</span>
                </div>
              )}
            </a>
          ))}
        </div>

        {/* Partner Types Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {["hiring", "training", "industry"].map((type) => {
            const count = partners.filter(p => p.partner_type === type).length;
            if (count === 0) return null;
            return (
              <div key={type} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={`w-3 h-3 rounded-full ${
                  type === "hiring" ? "bg-green-500" :
                  type === "training" ? "bg-blue-500" :
                  "bg-purple-500"
                }`} />
                <span className="capitalize">{type} Partners ({count})</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
