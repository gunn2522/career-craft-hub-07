import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Trophy, Gift, Users, Award, Briefcase, Star, 
  Zap, Mic, ArrowRight 
} from "lucide-react";

const benefits = [
  { icon: Trophy, text: "Earn money by hosting events" },
  { icon: Gift, text: "Exclusive goodies & merch" },
  { icon: Mic, text: "Host Hackathons + Craftathons" },
  { icon: Users, text: "Build industry connections" },
  { icon: Star, text: "Become the campus face of CCC" },
  { icon: Briefcase, text: "PPO for top Ambassadors" },
];

const badges = [
  { text: "Earn Money", icon: "💰" },
  { text: "Certificates", icon: "📜" },
  { text: "PPO Opportunity", icon: "🚀" },
  { text: "Networking", icon: "🤝" },
];

export const AmbassadorSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-primary opacity-95" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-secondary rounded-full" />
        <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-secondary rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 border-2 border-secondary rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            {/* Animated Badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {badges.map((badge, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary font-medium text-sm backdrop-blur-sm animate-pulse-slow"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  <span>{badge.icon}</span>
                  {badge.text}
                </span>
              ))}
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-6 leading-tight">
              Become a Campus Ambassador & Earn with Career Craft Café
            </h2>

            <p className="text-secondary/80 text-lg mb-8 leading-relaxed">
              Join our elite ambassador program and transform your campus experience. Lead events, build your network, and unlock exclusive career opportunities.
            </p>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl bg-secondary/10 backdrop-blur-sm border border-secondary/20 hover:bg-secondary/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-secondary font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button variant="secondary" size="xl" asChild className="group">
              <Link to="/ambassador">
                <Zap className="w-5 h-5" />
                Join the Ambassador Program
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Visual Side */}
          <div className="relative hidden lg:block">
            {/* Main Card */}
            <div className="relative bg-secondary/10 backdrop-blur-xl rounded-3xl p-8 border border-secondary/30">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-secondary/20 flex items-center justify-center">
                  <Award className="w-12 h-12 text-secondary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-secondary mb-3">
                  Campus Leader Program
                </h3>
                <p className="text-secondary/70 mb-6">
                  Be the change agent on your campus
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-secondary/20">
                  <div>
                    <div className="font-display text-3xl font-bold text-secondary">500+</div>
                    <div className="text-xs text-secondary/60">Ambassadors</div>
                  </div>
                  <div>
                    <div className="font-display text-3xl font-bold text-secondary">100+</div>
                    <div className="text-xs text-secondary/60">Colleges</div>
                  </div>
                  <div>
                    <div className="font-display text-3xl font-bold text-secondary">₹50K+</div>
                    <div className="text-xs text-secondary/60">Avg Earnings</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-xl bg-secondary/20 backdrop-blur-sm flex items-center justify-center animate-float">
              <Trophy className="w-10 h-10 text-secondary" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-xl bg-secondary/20 backdrop-blur-sm flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
              <Gift className="w-8 h-8 text-secondary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};