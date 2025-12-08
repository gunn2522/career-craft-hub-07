import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, School, ArrowRight, Sparkles } from "lucide-react";

export const SignupCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-card" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl gradient-primary">
            <Sparkles className="w-8 h-8 text-secondary" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="gradient-text">Start Your Journey?</span>
          </h2>

          <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            Create your personalized profile and unlock a world of career opportunities, resources, and guidance tailored just for you.
          </p>

          {/* Signup Cards */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link to="/signup?type=school" className="group">
              <div className="glass-card rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:border-primary/50 h-full">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <School className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">School Student</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Grades 8-12 exploring future career options
                </p>
                <div className="flex items-center justify-center gap-2 text-primary font-medium">
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

            <Link to="/signup?type=college" className="group">
              <div className="glass-card rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:border-primary/50 h-full">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">College Student</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Undergraduates & graduates building careers
                </p>
                <div className="flex items-center justify-center gap-2 text-primary font-medium">
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};