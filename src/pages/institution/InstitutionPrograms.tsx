import { InstitutionLayout } from "@/components/institution/InstitutionLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const programs = [
  {
    title: "Career Awareness Program",
    description: "Help students discover career paths aligned with their interests and aptitudes",
    features: ["Psychometric assessments", "Career counseling sessions", "Industry exposure visits"],
    badge: "Popular",
    icon: GraduationCap,
  },
  {
    title: "Skill Development Workshop",
    description: "Hands-on workshops to develop essential industry skills",
    features: ["Technical training", "Soft skills development", "Project-based learning"],
    badge: "New",
    icon: BookOpen,
  },
  {
    title: "Industry Connect Program",
    description: "Bridge the gap between academia and industry",
    features: ["Internship opportunities", "Mentorship programs", "Campus recruitment support"],
    badge: "",
    icon: Briefcase,
  },
];

const InstitutionPrograms = () => {
  return (
    <InstitutionLayout title="Programs">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">
            Explore and enroll in programs designed to enhance student career readiness
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program, index) => {
            const Icon = program.icon;
            return (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    {program.badge && (
                      <Badge variant="secondary">{program.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{program.title}</CardTitle>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {program.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4" variant="outline" asChild>
                    <Link to="/institution/inquiries">
                      Enquire Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Need a Custom Program?</h3>
              <p className="text-muted-foreground mb-4">
                We can design tailored programs to meet your institution's specific needs
              </p>
              <Button asChild>
                <Link to="/institution/inquiries">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstitutionLayout>
  );
};

export default InstitutionPrograms;
