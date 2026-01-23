import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, GraduationCap, Building2, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const collaborationTypes = [
  {
    title: "Campus Recruitment",
    description: "Partner with institutions for direct campus hiring and placement drives",
    features: ["Access to pre-screened candidates", "Bulk hiring opportunities", "Campus ambassador programs"],
    icon: GraduationCap,
    badge: "Popular",
  },
  {
    title: "Industry Projects",
    description: "Collaborate with students on real-world industry projects",
    features: ["Access fresh talent", "Innovation partnerships", "Cost-effective solutions"],
    icon: Building2,
    badge: "",
  },
  {
    title: "Mentorship Programs",
    description: "Guide students with industry expertise and career advice",
    features: ["Build employer brand", "Early talent engagement", "CSR initiatives"],
    icon: Users,
    badge: "New",
  },
];

const PartnerCollaborations = () => {
  return (
    <PartnerLayout title="Collaborations">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Explore collaboration opportunities with institutions and students
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {collaborationTypes.map((collab, index) => {
            const Icon = collab.icon;
            return (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    {collab.badge && <Badge variant="secondary">{collab.badge}</Badge>}
                  </div>
                  <CardTitle className="mt-4">{collab.title}</CardTitle>
                  <CardDescription>{collab.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {collab.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4" variant="outline" asChild>
                    <Link to="/partner-dashboard/inquiries">
                      Learn More <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-8">
            <div className="flex items-center gap-4">
              <Handshake className="w-12 h-12 text-primary" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">Looking for Custom Collaboration?</h3>
                <p className="text-muted-foreground">
                  We can design tailored collaboration programs to meet your specific needs
                </p>
              </div>
              <Button asChild>
                <Link to="/partner-dashboard/inquiries">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PartnerLayout>
  );
};

export default PartnerCollaborations;
