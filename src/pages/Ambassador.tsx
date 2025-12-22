import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TorchElements3D } from "@/components/ui/TorchElements3D";
import { 
  Trophy, Gift, Users, Award, Briefcase, 
  Zap, CheckCircle, ArrowRight, ArrowDown,
  DollarSign, Rocket
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    year: "",
    whyAmbassador: "",
    socialLinks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.college) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("ambassador_applications")
        .insert({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          college: formData.college,
          year_of_study: formData.year || null,
          why_ambassador: formData.whyAmbassador || null,
          social_links: formData.socialLinks ? { links: formData.socialLinks } : null,
          user_id: user?.id || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("You have already submitted an application with this email.");
        } else {
          throw error;
        }
      } else {
        toast.success("Application submitted successfully! We'll contact you within 48 hours.");
        setFormData({ name: "", email: "", phone: "", college: "", year: "", whyAmbassador: "", socialLinks: "" });
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero with Image */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={ambassadorHero} 
            alt="Campus Ambassadors networking" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        </div>

        {/* Torch 3D Elements */}
        <TorchElements3D count={12} />

        <div className="w-full px-4 md:px-8 lg:px-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm mb-6 animate-fade-in">
                <Trophy className="w-4 h-4" />
                Campus Ambassador Program
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Become a Campus{" "}
                <span className="gradient-text">Ambassador</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Lead your campus, earn rewards, and build your career with Career Craft Cafe's elite ambassador program
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Button variant="hero" size="xl" asChild>
                  <a href="#apply" className="group">
                    <Zap className="w-5 h-5" />
                    Apply Now
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                {stats.map((stat, i) => (
                  <div key={i} className="text-left">
                    <div className="font-display text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty space for visual balance - image shows through */}
            <div className="hidden lg:block" />
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight - 100, behavior: "smooth" })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          aria-label="Scroll to content"
        >
          <span className="text-sm font-medium">Discover More</span>
          <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:border-primary transition-colors">
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>
        </button>
      </section>

      {/* Program Details */}
      <section className="py-20 relative">
        <TorchElements3D count={8} />
        <div className="w-full px-4 md:px-8 lg:px-16">
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
      <section id="apply" className="py-20 bg-card relative">
        <TorchElements3D count={10} />
        <div className="w-full px-4 md:px-8 lg:px-16">
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
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
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
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Current Year</label>
                  <Input
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="2nd Year"
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">College/University *</label>
                <Input
                  required
                  value={formData.college}
                  onChange={(e) => setFormData({...formData, college: e.target.value})}
                  placeholder="Your college name"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Why do you want to be an Ambassador?</label>
                <Textarea
                  value={formData.whyAmbassador}
                  onChange={(e) => setFormData({...formData, whyAmbassador: e.target.value})}
                  placeholder="Tell us about your motivation..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Social Media Links (LinkedIn, Instagram, etc.)</label>
                <Input
                  value={formData.socialLinks}
                  onChange={(e) => setFormData({...formData, socialLinks: e.target.value})}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="h-12"
                />
              </div>

              <Button 
                type="submit" 
                variant="gradient" 
                size="lg" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Submit Application
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Ambassador;