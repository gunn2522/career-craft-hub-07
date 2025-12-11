import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trophy, Gift, Users, Award, Briefcase, 
  Zap, CheckCircle, ArrowRight, ArrowDown,
  DollarSign, Rocket
} from "lucide-react";
import { toast } from "sonner";
import ambassadorHero from "@/assets/ambassador-hero.jpg";

const responsibilities = [
  "Host events and workshops at your campus",
  "Spread awareness about Career Craft Cafe",
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
      {/* Hero with Image */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={ambassadorHero} 
            alt="Campus Ambassadors networking" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#12122B] via-[#12122B]/85 to-[#12122B]/70" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-highlight/20 backdrop-blur-sm">
                <Trophy className="w-8 h-8 text-highlight" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6 leading-tight">
                Become a Campus Ambassador
              </h1>
              <p className="text-secondary/80 text-lg mb-8 max-w-lg">
                Lead your campus, earn rewards, and build your career with Career Craft Cafe's elite ambassador program
              </p>
              
              <Button variant="secondary" size="xl" asChild className="group mb-8">
                <a href="#apply">
                  <Zap className="w-5 h-5" />
                  Apply Now
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-secondary/10 backdrop-blur-sm rounded-xl p-4 border border-secondary/20">
                    <div className="font-display text-xl md:text-2xl font-bold text-secondary">{stat.value}</div>
                    <div className="text-xs text-secondary/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty space for visual balance - image shows through */}
            <div className="hidden lg:block" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-secondary/60" />
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
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card hover:bg-muted/50 transition-colors border border-border/50">
                    <CheckCircle className="w-6 h-6 text-highlight flex-shrink-0 mt-0.5" />
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
      <section id="apply" className="py-20 bg-card">
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