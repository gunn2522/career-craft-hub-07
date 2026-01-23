import { useState, useEffect } from "react";
import { InstitutionLayout } from "@/components/institution/InstitutionLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Json } from "@/integrations/supabase/types";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billing_cycle: string;
  features: string[];
}

const parseFeatures = (features: Json | null): string[] => {
  if (!features) return [];
  if (Array.isArray(features)) {
    return features.filter((f): f is string => typeof f === "string");
  }
  return [];
};

const InstitutionPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Using or filter instead of .in() to avoid deep type instantiation
      const { data, error } = await supabase
        .from("organization_plans")
        .select("id, name, description, price, billing_cycle, features")
        .eq("is_active", true)
        .or("target_type.eq.institution,target_type.eq.school,target_type.eq.college,target_type.eq.all")
        .order("display_order");
      
      if (error) throw error;
      
      const mappedPlans: Plan[] = ((data as unknown) as Array<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        billing_cycle: string;
        features: Json | null;
      }> || []).map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        billing_cycle: row.billing_cycle,
        features: parseFeatures(row.features),
      }));
      
      setPlans(mappedPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <InstitutionLayout title="Plans & Pricing">
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout title="Plans & Pricing">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">
            Choose the perfect plan for your institution's career development needs
          </p>
        </div>

        {plans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No plans available at the moment</p>
              <Button asChild className="mt-4">
                <Link to="/institution/inquiries">Contact Us for Custom Pricing</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card 
                key={plan.id} 
                className={`flex flex-col ${index === 1 ? "border-primary shadow-lg" : ""}`}
              >
                <CardHeader>
                  {index === 1 && (
                    <Badge className="w-fit mb-2">Most Popular</Badge>
                  )}
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₹{plan.price.toLocaleString()}</span>
                    <span className="text-muted-foreground">/{plan.billing_cycle}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-6" 
                    variant={index === 1 ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/institution/inquiries">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-muted/50">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Need Enterprise Solutions?</h3>
              <p className="text-muted-foreground mb-4">
                For large institutions requiring custom features and dedicated support
              </p>
              <Button variant="outline" asChild>
                <Link to="/institution/inquiries">Contact Sales</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstitutionLayout>
  );
};

export default InstitutionPlans;
