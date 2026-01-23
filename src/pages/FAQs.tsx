import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { TorchLoader } from "@/components/ui/TorchLoader";
import { HelpCircle } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

const FAQs = () => {
  const { data: faqs, isLoading } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("faqs")
        .select("id, question, answer, category")
        .eq("is_published", true)
        .order("display_order");
      if (error) throw error;
      return data as FAQ[];
    },
  });

  const groupedFaqs = faqs?.reduce((acc, faq) => {
    const cat = faq.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <TorchLoader size="lg" text="Loading FAQs..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
              <HelpCircle className="w-4 h-4" />
              Help Center
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find answers to common questions about Career Craft Cafe
            </p>
          </div>

          {/* FAQs */}
          {!faqs?.length ? (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No FAQs available yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedFaqs || {}).map(([category, categoryFaqs]) => (
                <div key={category}>
                  <Badge variant="outline" className="mb-4 capitalize">
                    {category}
                  </Badge>
                  <Accordion type="single" collapsible className="space-y-2">
                    {categoryFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left font-medium">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground whitespace-pre-wrap">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FAQs;