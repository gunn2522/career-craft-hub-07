import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, CheckCircle, ArrowRight } from "lucide-react";
import { FloatingShapes3D } from "@/components/ui/FloatingShapes3D";

const features = [
  "1-on-1 personalized guidance",
  "Industry expert mentors",
  "Career path clarity",
  "Resume & portfolio review",
  "Interview preparation",
  "Salary negotiation tips",
];

export const ConsultancySection = () => {
  return (
    <section className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />
      
      {/* 3D Floating Elements */}
      <FloatingShapes3D count={6} />
      
      <div className="w-full px-4 md:px-8 lg:px-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                  <Phone className="w-4 h-4" />
                  Expert Guidance
                </span>

                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                  Get a <span className="gradient-text">Clarity Call</span> with Career Experts
                </h2>

                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Feeling lost about your career direction? Our expert mentors will help you find clarity, set goals, and create an actionable roadmap to success.
                </p>

                <ul className="space-y-3 mb-8">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="gradient" size="lg" asChild className="group">
                  <Link to="/book-call">
                    <Calendar className="w-5 h-5" />
                    Book a Clarity Call
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>

              {/* Visual */}
              <div className="relative">
                <div className="aspect-square rounded-2xl gradient-primary p-1">
                  <div className="w-full h-full rounded-xl bg-background flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center glow-gradient">
                        <Phone className="w-10 h-10 text-secondary" />
                      </div>
                      <h3 className="font-display text-2xl font-bold mb-3">30-Minute Call</h3>
                      <p className="text-muted-foreground mb-4">One call that can change your career trajectory</p>
                      <div className="text-4xl font-display font-bold gradient-text">Free</div>
                      <p className="text-sm text-muted-foreground mt-1">for first-time users</p>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary animate-pulse" />
                <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-full bg-destructive/50 animate-pulse" style={{ animationDelay: "0.5s" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};