import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, GraduationCap } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
}

interface Institution {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  type: string;
}

export const InstitutionsLogosSection = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const { data, error } = await supabase
        .from("institutions")
        .select("id, name, logo_url, website_url, type")
        .eq("is_visible", true)
        .eq("is_approved", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || institutions.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4" />
            Our Partner Institutions
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Educational Institutions with Us
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Leading schools and colleges partnering with us to provide career guidance
          </p>
        </div>

        {/* Institution Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-items-center">
          {institutions.map((institution) => (
            <a
              key={institution.id}
              href={institution.website_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-all duration-300 w-full flex items-center justify-center min-h-[100px]"
              title={institution.name}
            >
              {institution.logo_url ? (
                <img
                  src={institution.logo_url}
                  alt={institution.name}
                  className="max-h-12 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                  <Building2 className="w-8 h-8" />
                  <span className="text-sm font-medium text-center">{institution.name}</span>
                </div>
              )}
            </a>
          ))}
        </div>

        {/* Institution Types Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {["school", "college", "university"].map((type) => {
            const count = institutions.filter(i => i.type === type).length;
            if (count === 0) return null;
            return (
              <div key={type} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={`w-3 h-3 rounded-full ${
                  type === "school" ? "bg-emerald-500" :
                  type === "college" ? "bg-sky-500" :
                  "bg-violet-500"
                }`} />
                <span className="capitalize">{type}s ({count})</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
