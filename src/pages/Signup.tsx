import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Lock, User, GraduationCap, School, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "";
  
  const [userType, setUserType] = useState<"school" | "college" | "">(initialType as "school" | "college" | "");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    institution: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) {
      toast.error("Please select your student type");
      return;
    }
    toast.success("Signup feature coming soon! Connect Lovable Cloud for authentication.");
  };

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl gradient-primary glow-gradient">
                <Sparkles className="w-8 h-8 text-secondary" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">Create Your Account</h1>
              <p className="text-muted-foreground">Start your career journey today</p>
            </div>

            {/* User Type Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setUserType("school")}
                className={`glass-card rounded-xl p-6 transition-all hover:scale-105 ${
                  userType === "school" ? "border-primary ring-2 ring-primary/20" : ""
                }`}
              >
                <School className={`w-8 h-8 mx-auto mb-3 ${userType === "school" ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="font-bold mb-1">School Student</h3>
                <p className="text-xs text-muted-foreground">Grades 8-12</p>
              </button>

              <button
                type="button"
                onClick={() => setUserType("college")}
                className={`glass-card rounded-xl p-6 transition-all hover:scale-105 ${
                  userType === "college" ? "border-primary ring-2 ring-primary/20" : ""
                }`}
              >
                <GraduationCap className={`w-8 h-8 mx-auto mb-3 ${userType === "college" ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="font-bold mb-1">College Student</h3>
                <p className="text-xs text-muted-foreground">Undergrad & above</p>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="h-12 pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="h-12 pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {userType === "school" ? "School Name" : "College/University"}
                </label>
                <div className="relative">
                  {userType === "school" ? (
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  ) : (
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  )}
                  <Input
                    required
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    placeholder={userType === "school" ? "Your school name" : "Your college name"}
                    className="h-12 pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="h-12 pl-12"
                  />
                </div>
              </div>

              <Button type="submit" variant="gradient" size="lg" className="w-full">
                Create Account
                <ArrowRight className="w-5 h-5" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By signing up, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </form>

            <p className="text-center mt-6 text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Signup;