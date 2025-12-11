import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Trophy, Gift, Users, Award, Briefcase, 
  Zap, Mic, ArrowRight, CheckCircle, DollarSign, Rocket
} from "lucide-react";

const benefits = [
  { icon: DollarSign, title: "Earn Money", desc: "Get paid for every event" },
  { icon: Gift, title: "Exclusive Goodies", desc: "Premium merchandise" },
  { icon: Mic, title: "Host Events", desc: "Hackathons & Craftathons" },
  { icon: Users, title: "Build Network", desc: "Industry connections" },
  { icon: Briefcase, title: "PPO Opportunity", desc: "Top performer offers" },
  { icon: Rocket, title: "Career Growth", desc: "Fast-track journey" },
];

const responsibilities = [
  "Host events and workshops at your campus",
  "Spread awareness about Career Craft Cafe",
  "Build and manage campus communities",
  "Mentor juniors and peers",
];

export const AmbassadorSection = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            Campus Ambassador Program
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Become a Campus Ambassador & <span className="gradient-text">Earn with CCC</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join our elite ambassador program and transform your campus experience. Lead events, build your network, and unlock exclusive career opportunities.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - What You'll Do (Responsibilities Style) */}
          <div>
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              What You'll Do
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-8">
              Your <span className="gradient-text">Responsibilities</span>
            </h3>
            <div className="space-y-4">
              {responsibilities.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-background hover:bg-muted/50 transition-colors border border-border/50">
                  <CheckCircle className="w-6 h-6 text-highlight flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{item}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border/50">
              <div className="text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-primary">500+</div>
                <div className="text-xs text-muted-foreground">Ambassadors</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-primary">100+</div>
                <div className="text-xs text-muted-foreground">Colleges</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-primary">₹50K+</div>
                <div className="text-xs text-muted-foreground">Avg Earnings</div>
              </div>
            </div>
          </div>

          {/* Right - What You'll Get (Perks Grid) */}
          <div>
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              What You'll Get
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-8">
              Exclusive <span className="gradient-text">Perks</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, i) => (
                <div 
                  key={i} 
                  className="glass-card rounded-xl p-5 hover:border-primary/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="font-bold mb-1">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button variant="gradient" size="xl" asChild className="group">
            <Link to="/ambassador">
              <Zap className="w-5 h-5" />
              Join the Ambassador Program
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};