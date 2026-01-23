import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle2, 
  Building2, 
  Briefcase, 
  GraduationCap,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface Plan {
  id: string;
  name: string;
  plan_type: string;
  description: string | null;
  price: number;
  billing_cycle: string;
  features: string[] | null;
  is_active: boolean | null;
}

const PlansAndPricing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("institution");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await supabase
        .from("organization_plans")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (data) {
        // Parse features from JSON and map to Plan interface
        const parsedPlans: Plan[] = data.map(plan => ({
          id: plan.id,
          name: plan.name,
          plan_type: plan.plan_type || 'institution',
          description: plan.description,
          price: plan.price,
          billing_cycle: plan.billing_cycle,
          features: plan.features ? (Array.isArray(plan.features) ? plan.features as string[] : []) : [],
          is_active: plan.is_active
        }));
        setPlans(parsedPlans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredPlans = (type: string) => {
    return plans.filter(plan => plan.plan_type === type);
  };

  const formatPrice = (price: number, cycle: string) => {
    if (price === 0) return "Free";
    return `₹${price.toLocaleString()}/${cycle === "yearly" ? "year" : "month"}`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "school":
      case "college":
      case "institution":
        return <GraduationCap className="w-6 h-6" />;
      case "partner":
      case "company":
        return <Briefcase className="w-6 h-6" />;
      default:
        return <Building2 className="w-6 h-6" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Plans & Pricing</Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Whether you're a school, college, or company — we have the right plan to help you connect with students
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="institution" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Institutions
              </TabsTrigger>
              <TabsTrigger value="partner" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Companies
              </TabsTrigger>
            </TabsList>

            <TabsContent value="institution">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {getFilteredPlans("institution").length === 0 ? (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-muted-foreground">Plans coming soon. Contact us for custom pricing.</p>
                  </div>
                ) : (
                  getFilteredPlans("institution").map((plan, idx) => (
                    <Card 
                      key={plan.id} 
                      className={`relative ${idx === 1 ? 'border-primary shadow-lg scale-105' : ''}`}
                    >
                      {idx === 1 && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="gap-1">
                            <Sparkles className="w-3 h-3" /> Most Popular
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pb-4">
                        <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${idx === 1 ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                          {getIcon(plan.plan_type)}
                        </div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="text-3xl font-bold mt-4">
                          {formatPrice(plan.price, plan.billing_cycle)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 mb-6">
                          {(plan.features as string[])?.map((feature, fidx) => (
                            <li key={fidx} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className="w-full gap-2" 
                          variant={idx === 1 ? "default" : "outline"}
                          asChild
                        >
                          <Link to="/institution">
                            Get Started <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="partner">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {getFilteredPlans("partner").length === 0 ? (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-muted-foreground">Plans coming soon. Contact us for custom pricing.</p>
                  </div>
                ) : (
                  getFilteredPlans("partner").map((plan, idx) => (
                    <Card 
                      key={plan.id} 
                      className={`relative ${idx === 1 ? 'border-primary shadow-lg scale-105' : ''}`}
                    >
                      {idx === 1 && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="gap-1">
                            <Sparkles className="w-3 h-3" /> Most Popular
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pb-4">
                        <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${idx === 1 ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                          {getIcon(plan.plan_type)}
                        </div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="text-3xl font-bold mt-4">
                          {formatPrice(plan.price, plan.billing_cycle)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 mb-6">
                          {(plan.features as string[])?.map((feature, fidx) => (
                            <li key={fidx} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className="w-full gap-2" 
                          variant={idx === 1 ? "default" : "outline"}
                          asChild
                        >
                          <Link to="/partner-dashboard">
                            Get Started <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
              <CardContent className="pt-8 pb-8">
                <h3 className="font-display text-2xl font-bold mb-2">Need a Custom Plan?</h3>
                <p className="text-muted-foreground mb-4">
                  Contact us for custom pricing tailored to your organization's needs
                </p>
                <Button asChild>
                  <a href="mailto:careercraftcafe0@gmail.com">Contact Sales</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlansAndPricing;
