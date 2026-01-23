import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Lock, User, Building2, Sparkles, GraduationCap, School, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type UserType = "school_student" | "college_student" | "mentor" | "partner";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<UserType>("college_student");
  const [institution, setInstitution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, signIn, signUp, isLoading, userRole } = useAuth();
  const navigate = useNavigate();

  // Get the returnTo URL from query params
  const returnTo = searchParams.get("returnTo") || "/";

  // Handle role-based redirect after authentication
  const getRedirectPath = () => {
    // If there's a specific returnTo path, use it
    if (returnTo && returnTo !== "/") {
      return returnTo;
    }

    // Otherwise, redirect based on user role
    switch (userRole) {
      case "admin":
        return "/admin";
      case "mentor":
        return "/mentor";
      case "partner":
        return "/partner-dashboard";
      default:
        return "/";
    }
  };

  useEffect(() => {
    if (user && !isLoading && userRole !== null) {
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    }
  }, [user, isLoading, userRole, navigate, returnTo]);

  const validateForm = () => {
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        toast.error(e.errors[0].message);
        return false;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        toast.error(e.errors[0].message);
        return false;
      }
    }

    if (!isLogin && !fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          // Navigation will happen via useEffect once userRole is loaded
        }
      } else {
        const { error } = await signUp(email, password, fullName, userType, institution);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created successfully! Welcome to Career Craft Cafe!");
          // Navigation will happen via useEffect once userRole is loaded
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // If user is already logged in, show loading while redirect happens
  if (user) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl gradient-primary glow-gradient">
                <Sparkles className="w-8 h-8 text-secondary" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">
                {isLogin ? "Welcome Back" : "Join Career Craft Cafe"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin ? "Sign in to continue your journey" : "Start your career journey today"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">
              {!isLogin && (
                <>
                  {/* User Type Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-3">I am a</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setUserType("school_student")}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                          userType === "school_student"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <School className={`w-5 h-5 ${userType === "school_student" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium ${userType === "school_student" ? "text-primary" : ""}`}>
                          School Student
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("college_student")}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                          userType === "college_student"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <GraduationCap className={`w-5 h-5 ${userType === "college_student" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium ${userType === "college_student" ? "text-primary" : ""}`}>
                          College Student
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("mentor")}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                          userType === "mentor"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Users className={`w-5 h-5 ${userType === "mentor" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium ${userType === "mentor" ? "text-primary" : ""}`}>
                          Mentor
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("partner")}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                          userType === "partner"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Building2 className={`w-5 h-5 ${userType === "partner" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium ${userType === "partner" ? "text-primary" : ""}`}>
                          Partner
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="h-12 pl-12"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-12 pl-12"
                  />
                </div>
              </div>

              {!isLogin && (
                /* Institution */
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {userType === "school_student" ? "School Name" : userType === "mentor" ? "Organization/Company" : userType === "partner" ? "Company Name" : "College/University"}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder={
                        userType === "school_student" 
                          ? "Your school name" 
                          : userType === "mentor" 
                            ? "Your organization/company" 
                            : userType === "partner"
                              ? "Your company name"
                              : "Your college/university"
                      }
                      className="h-12 pl-12"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 pl-12"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="gradient" 
                size="lg" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-5 h-5" />
              </Button>

            </form>

            <p className="text-center mt-6 text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
