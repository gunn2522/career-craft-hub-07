import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trophy, Gift, Users, Award, Briefcase, Star, 
  Zap, Mic, CheckCircle, ArrowRight, GraduationCap,
  DollarSign, Rocket
} from "lucide-react";
import { toast } from "sonner";

const responsibilities = [
  "Host events and workshops at your campus",
  "Spread awareness about Career Craft Café",
  "Build and manage campus communities",
  "Mentor juniors and peers",
  "Organize hackathons and craftathons",
  "Represent CCC at college festivals",
];

const perks = [
  { icon: DollarSign, title: "Earn Money", desc: "Get paid for every event you organize" },
  { icon: Gift, title: "Exclusive Goodies", desc: "Premium merchandise and swag" },
  { icon: Award, title: "Certificates", desc: "Official recognition certificates" },
  { icon: Briefcase, title: "PPO Opportunity", desc: "Pre-placement offers for top performers" },
  { icon: Users, title: "Network Building", desc: "Connect with industry leaders" },
  { icon: Rocket, title: "Career Growth", desc: "Fast-track your professional journey" },
];

const stats = [
  { value: "500+", label: "Active Ambassadors" },
  { value: "150+", label: "Partner Colleges" },
  { value: "₹50K+", label: "Avg. Annual Earnings" },
  { value: "200+", label: "Events Hosted" },
];

const Ambassador = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    year: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Application submitted successfully! We'll contact you within 48 hours.");
    setFormData({ name: "", email: "", phone: "", college: "", year: "" });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border-2 border-secondary rounded-full" />
          <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-secondary rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-2xl bg-secondary/20 backdrop-blur-sm">
              <Trophy className="w-10 h-10 text-secondary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6">
              Become a Campus Ambassador
            </h1>
            <p className="text-secondary/80 text-lg mb-10">
              Lead your campus, earn rewards, and build your career with Career Craft Café's elite ambassador program
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-secondary/10 backdrop-blur-sm rounded-xl p-4 border border-secondary/20">
                  <div className="font-display text-2xl md:text-3xl font-bold text-secondary">{stat.value}</div>
                  <div className="text-sm text-secondary/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Program Details */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Responsibilities */}
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                What You'll Do
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-8">
                Your <span className="gradient-text">Responsibilities</span>
              </h2>
              <div className="space-y-4">
                {responsibilities.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card hover:bg-muted/50 transition-colors">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Perks */}
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                What You'll Get
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-8">
                Exclusive <span className="gradient-text">Perks</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {perks.map((perk, i) => (
                  <div key={i} className="glass-card rounded-xl p-6 hover:border-primary/50 transition-all">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                      <perk.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="font-bold mb-2">{perk.title}</h3>
                    <p className="text-sm text-muted-foreground">{perk.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                Join the Program
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Apply Now
              </h2>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you within 48 hours
              </p>
            </div>

            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Current Year</label>
                  <Input
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="2nd Year"
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">College/University</label>
                <Input
                  required
                  value={formData.college}
                  onChange={(e) => setFormData({...formData, college: e.target.value})}
                  placeholder="Your college name"
                  className="h-12"
                />
              </div>

              <Button type="submit" variant="gradient" size="lg" className="w-full">
                <Zap className="w-5 h-5" />
                Submit Application
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Ambassador;