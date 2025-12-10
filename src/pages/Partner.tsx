import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Award, 
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Target
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const benefits = [
  {
    icon: Users,
    title: "Access Top Talent",
    description: "Connect with career-ready students who have completed our skill development programs."
  },
  {
    icon: TrendingUp,
    title: "Brand Visibility",
    description: "Showcase your organization to thousands of ambitious students across campuses."
  },
  {
    icon: GraduationCap,
    title: "Campus Events",
    description: "Host workshops, seminars, and recruitment drives at partner institutions."
  },
  {
    icon: Briefcase,
    title: "Internship Pipeline",
    description: "Get early access to skilled candidates for internships and entry-level positions."
  },
  {
    icon: Target,
    title: "Targeted Recruitment",
    description: "Find candidates with specific skills matching your requirements."
  },
  {
    icon: Award,
    title: "Industry Recognition",
    description: "Build reputation as a student-friendly, growth-oriented organization."
  }
];

const Partner = () => {
  const [formData, setFormData] = useState({
    organizationName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    partnershipType: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for your interest! Our team will contact you within 48 hours.");
    setFormData({
      organizationName: "",
      contactPerson: "",
      email: "",
      phone: "",
      website: "",
      partnershipType: "",
      message: ""
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <Building2 className="w-4 h-4" />
              Partnership Program
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Partner with <span className="gradient-text">Career Craft Café</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our network of schools, colleges, and companies to shape the future of career development and talent acquisition.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Why Partner With Us?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Unlock exclusive benefits and connect with the next generation of professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <benefit.icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Partnership Types
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Schools",
                description: "Bring career awareness and skill development programs to your students.",
                features: ["Career workshops", "Student counseling", "Parent seminars", "Annual events"]
              },
              {
                title: "Colleges",
                description: "Enhance placement readiness and connect students with opportunities.",
                features: ["Placement training", "Industry talks", "Hackathons", "Internship drives"]
              },
              {
                title: "Companies",
                description: "Access pre-trained talent and build your employer brand.",
                features: ["Campus hiring", "Skill workshops", "Internship programs", "Brand visibility"]
              }
            ].map((type, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
                <h3 className="font-display text-2xl font-bold mb-4 gradient-text">{type.title}</h3>
                <p className="text-muted-foreground mb-6">{type.description}</p>
                <ul className="space-y-2 text-left">
                  {type.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                Get in Touch
              </h2>
              <p className="text-muted-foreground">
                Fill out the form below and our partnership team will reach out within 48 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization Name *</label>
                  <Input
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    placeholder="Your school/college/company"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Person *</label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@organization.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Partnership Type *</label>
                <select
                  className="w-full h-11 px-3 rounded-lg border border-border bg-input text-foreground"
                  value={formData.partnershipType}
                  onChange={(e) => setFormData({ ...formData, partnershipType: e.target.value })}
                  required
                >
                  <option value="">Select type</option>
                  <option value="school">School Partnership</option>
                  <option value="college">College Partnership</option>
                  <option value="company">Company Partnership</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your organization and partnership goals..."
                  rows={4}
                />
              </div>

              <Button type="submit" variant="gradient" size="lg" className="w-full group">
                Submit Partnership Request
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Partner;
