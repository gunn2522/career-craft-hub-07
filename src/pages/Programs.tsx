import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { TorchElements3D } from "@/components/ui/TorchElements3D";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Target, 
  ChevronDown,
  Sparkles,
  Users,
  Trophy,
  ArrowRight,
  Zap,
  GraduationCap,
  Briefcase,
  IndianRupee,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Program {
  id: string;
  name: string;
  description: string | null;
  banner_url: string | null;
  duration: string | null;
  features: string[];
  outcomes: string[];
  is_highlighted: boolean | null;
  is_free: boolean | null;
  price: number | null;
  currency: string | null;
  start_date: string | null;
  end_date: string | null;
}

const Programs = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (user) {
      setRegistrationForm(prev => ({
        ...prev,
        email: user.email || "",
      }));
    }
  }, [user]);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: "smooth" });
  };

  const formatPrice = (program: Program) => {
    if (program.is_free) return "Free";
    const currency = program.currency === "INR" ? "₹" : "$";
    return `${currency}${program.price?.toLocaleString() || 0}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram || !user) return;

    setIsRegistering(true);
    try {
      // Check if already registered
      const { data: existing } = await supabase
        .from("program_registrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("program_id", selectedProgram.id)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Already Registered",
          description: "You have already registered for this program.",
          variant: "destructive",
        });
        setIsRegistering(false);
        return;
      }

      const paymentStatus = selectedProgram.is_free ? "completed" : "pending";

      // Create registration
      const { error: regError } = await supabase
        .from("program_registrations")
        .insert({
          user_id: user.id,
          program_id: selectedProgram.id,
          full_name: registrationForm.full_name,
          email: registrationForm.email,
          phone: registrationForm.phone || null,
          payment_status: paymentStatus,
          payment_amount: selectedProgram.is_free ? 0 : selectedProgram.price,
        });

      if (regError) throw regError;

      // Send confirmation email
      try {
        await supabase.functions.invoke("send-program-confirmation", {
          body: {
            to_email: registrationForm.email,
            to_name: registrationForm.full_name,
            program_name: selectedProgram.name,
            program_duration: selectedProgram.duration,
            is_free: selectedProgram.is_free,
            price: selectedProgram.price,
            currency: selectedProgram.currency,
            payment_status: paymentStatus,
          },
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      toast({
        title: "🎉 Registration Successful!",
        description: selectedProgram.is_free 
          ? "You're all set! Check your email for details."
          : "Registration received! Our team will contact you for payment details.",
      });

      setSelectedProgram(null);
      setRegistrationForm({ full_name: "", email: user.email || "", phone: "" });
    } catch (error) {
      console.error("Error registering:", error);
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const openRegistration = (program: Program) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to register for programs.",
        variant: "destructive",
      });
      return;
    }
    setSelectedProgram(program);
  };

  const highlightedPrograms = programs.filter(p => p.is_highlighted);
  const regularPrograms = programs.filter(p => !p.is_highlighted);

  // These will be fetched from site_metrics in the future
  // For now, using placeholder values that can be managed via admin
  const stats = [
    { icon: Users, value: "5000+", label: "Students Trained" },
    { icon: Trophy, value: `${programs.length}+`, label: "Programs Offered" },
    { icon: Target, value: "85%", label: "Success Rate" },
    { icon: Briefcase, value: "500+", label: "Placements" },
  ];

  const benefits = [
    { icon: GraduationCap, title: "Industry-Ready Skills", desc: "Learn what companies actually need" },
    { icon: Zap, title: "Fast-Track Growth", desc: "Accelerate your career in weeks, not years" },
    { icon: Users, title: "Expert Mentorship", desc: "Learn from industry professionals" },
  ];

  return (
    <Layout>
      {/* Registration Dialog */}
      <Dialog open={!!selectedProgram} onOpenChange={(open) => !open && setSelectedProgram(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register for Program</DialogTitle>
          </DialogHeader>
          {selectedProgram && (
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Program Summary */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-lg mb-2">{selectedProgram.name}</h3>
                {selectedProgram.duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    <span>{selectedProgram.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedProgram.is_free 
                      ? "bg-green-500/20 text-green-500" 
                      : "bg-primary/20 text-primary"
                  }`}>
                    {formatPrice(selectedProgram)}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={registrationForm.full_name}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={registrationForm.email}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={registrationForm.phone}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Payment Info for Paid Programs */}
              {!selectedProgram.is_free && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <IndianRupee className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-500">Payment Information</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        After registration, our team will contact you with payment details. 
                        Your spot will be confirmed once payment is received.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isRegistering}>
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : selectedProgram.is_free ? (
                  "Complete Registration"
                ) : (
                  `Register — ${formatPrice(selectedProgram)}`
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By registering, you agree to receive program updates via email.
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Hero Section - Conversion Focused */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        
        <TorchElements3D count={12} />
        
        {/* Subtle Gradient Orbs */}
        <div className="absolute top-1/4 left-1/6 w-[350px] h-[350px] bg-primary/8 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/3 right-1/6 w-[280px] h-[280px] bg-primary/10 rounded-full blur-[120px] animate-float" />
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-7xl mx-auto">
            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content - Text */}
              <div className="text-left">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-card mb-6 animate-fade-in border border-primary/20 backdrop-blur-xl">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-semibold text-primary tracking-wide">Industry-Ready Programs</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <span className="block text-foreground">Transform Your</span>
                  <span className="block gradient-text mt-2">Career in Weeks</span>
                </h1>
                
                <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-6 animate-fade-in max-w-xl" style={{ animationDelay: "0.2s" }}>
                  Join <span className="text-primary font-bold">5000+ students</span> who landed their dream jobs through our 
                  <span className="font-semibold"> industry-focused programs</span>. 
                  No fluff, just real skills that get you hired.
                </p>

                {/* Benefits List */}
                <div className="space-y-3 mb-8 animate-fade-in" style={{ animationDelay: "0.25s" }}>
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-semibold">{benefit.title}</span>
                        <span className="text-muted-foreground"> — {benefit.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <Button variant="hero" size="lg" onClick={scrollToContent} className="shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all group">
                    Explore Programs
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="gradient" size="lg" asChild>
                    <Link to="/partner">Partner With Us</Link>
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-4 mt-6 animate-fade-in" style={{ animationDelay: "0.35s" }}>
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full gradient-primary border-2 border-background flex items-center justify-center text-xs font-bold"
                      >
                        {["A", "R", "S", "M"][i]}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-foreground font-semibold">4.9/5</span> from 500+ reviews
                  </div>
                </div>
              </div>

              {/* Right Content - Stats Grid */}
              <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div 
                      key={index}
                      className="glass-card p-5 md:p-6 rounded-2xl text-center group hover:glow-primary transition-all duration-500 hover:scale-105 border border-primary/15"
                    >
                      <stat.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                      <div className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Featured Program Preview */}
                {highlightedPrograms.length > 0 && (
                  <div className="mt-6 glass-card p-4 rounded-2xl border border-primary/20">
                    <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
                      <Sparkles className="w-4 h-4" />
                      Most Popular Program
                    </div>
                    <h3 className="font-bold text-lg">{highlightedPrograms[0].name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      {highlightedPrograms[0].duration && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{highlightedPrograms[0].duration}</span>
                        </div>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        highlightedPrograms[0].is_free 
                          ? "bg-green-500/20 text-green-500" 
                          : "bg-primary/20 text-primary"
                      }`}>
                        {formatPrice(highlightedPrograms[0])}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group z-20"
          aria-label="Scroll to content"
        >
          <span className="text-sm font-medium">Explore Programs</span>
          <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </div>
        </button>
      </section>

      {/* Highlighted Programs */}
      {highlightedPrograms.length > 0 && (
        <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative bg-card/30">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Featured Programs</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Program <span className="gradient-text">Highlights</span>
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Our most impactful programs that have transformed thousands of careers.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {highlightedPrograms.map((program) => (
                <div
                  key={program.id}
                  className="glass-card rounded-2xl overflow-hidden group hover:glow-primary transition-all duration-500 hover:scale-[1.02]"
                >
                  {program.banner_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={program.banner_url}
                        alt={program.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                          Featured
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          program.is_free 
                            ? "bg-green-500 text-white" 
                            : "bg-amber-500 text-white"
                        }`}>
                          {formatPrice(program)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                      <Sparkles className="w-12 h-12 text-primary/50" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                          Featured
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          program.is_free 
                            ? "bg-green-500 text-white" 
                            : "bg-amber-500 text-white"
                        }`}>
                          {formatPrice(program)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{program.name}</h3>
                    {program.duration && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Clock className="w-4 h-4" />
                        <span>{program.duration}</span>
                      </div>
                    )}
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {program.description}
                    </p>

                    {program.features && program.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {program.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    <Button 
                      variant="gradient" 
                      size="sm" 
                      className="w-full group"
                      onClick={() => openRegistration(program)}
                    >
                      {program.is_free ? "Enroll Free" : `Enroll — ${formatPrice(program)}`}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Programs */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">All Programs</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Explore Our <span className="gradient-text">Offerings</span>
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Find the perfect program to accelerate your career growth.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-6">
                  <Skeleton className="h-40 w-full mb-4 rounded-xl" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <Sparkles className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                Exciting new programs are being developed. Stay tuned!
              </p>
              <Button variant="gradient" asChild>
                <Link to="/auth">Get Notified</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {regularPrograms.map((program) => (
                <div
                  key={program.id}
                  className="glass-card rounded-2xl overflow-hidden group hover:glow-primary transition-all duration-500"
                >
                  <div className="flex flex-col md:flex-row">
                    {program.banner_url ? (
                      <div className="md:w-2/5 h-48 md:h-auto overflow-hidden relative">
                        <img
                          src={program.banner_url}
                          alt={program.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                          program.is_free 
                            ? "bg-green-500 text-white" 
                            : "bg-amber-500 text-white"
                        }`}>
                          {formatPrice(program)}
                        </span>
                      </div>
                    ) : (
                      <div className="md:w-2/5 h-48 md:h-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center min-h-[180px] relative">
                        <Target className="w-12 h-12 text-primary/50" />
                        <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                          program.is_free 
                            ? "bg-green-500 text-white" 
                            : "bg-amber-500 text-white"
                        }`}>
                          {formatPrice(program)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 p-6">
                      <h3 className="text-xl font-bold mb-2">{program.name}</h3>
                      
                      <div className="flex flex-wrap gap-3 mb-3">
                        {program.duration && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{program.duration}</span>
                          </div>
                        )}
                        {program.start_date && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Starts {new Date(program.start_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {program.description}
                      </p>

                      {program.outcomes && program.outcomes.length > 0 && (
                        <div className="space-y-1 mb-4">
                          {program.outcomes.slice(0, 2).map((outcome, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-muted-foreground">{outcome}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-primary/50 text-primary hover:bg-primary/10 group"
                        onClick={() => openRegistration(program)}
                      >
                        {program.is_free ? "Enroll Free" : `Enroll — ${formatPrice(program)}`}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative bg-card/30">
        <div className="max-w-7xl mx-auto w-full">
          <div className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Transform Your{" "}
                  <span className="gradient-text">Career?</span>
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  Join our programs and get the skills, guidance, and opportunities 
                  you need to succeed in today's competitive job market.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button variant="gradient" size="lg" asChild className="group">
                    <Link to="/auth" className="flex items-center gap-2">
                      Get Started Today
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10" asChild>
                    <Link to="/ambassador">Become a Crafter</Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "85%", label: "Placement Rate" },
                  { value: "₹8L+", label: "Avg. Package" },
                  { value: "100+", label: "Partner Companies" },
                  { value: "24/7", label: "Mentor Support" },
                ].map((stat, index) => (
                  <div key={index} className="text-center p-4 rounded-xl bg-background/50">
                    <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Programs;