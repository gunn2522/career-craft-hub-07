import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  Mail,
  Linkedin,
  Globe,
  Github,
  Instagram,
  Briefcase,
  Layers,
  Send,
  Lock,
  AlertCircle,
  ArrowRight,
  ExternalLink
} from "lucide-react";

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface Domain {
  id: string;
  name: string;
  description: string | null;
}

interface Category {
  id: string;
  name: string;
  domain_id: string;
}

interface MentorProfileData {
  id: string;
  user_id: string;
  verification_status: string | null;
  email_verified: boolean | null;
  phone_verified: boolean | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  website_url: string | null;
  instagram_url: string | null;
  verified_domain_id: string | null;
  is_verified: boolean | null;
}

export const MentorVerificationFlow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [mentorProfile, setMentorProfile] = useState<MentorProfileData | null>(null);
  
  // Email verification
  const [emailOtp, setEmailOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  
  // Professional links
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  
  // Domain & Categories
  const [domains, setDomains] = useState<Domain[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const steps: VerificationStep[] = [
    {
      id: "email",
      title: "Email Verification",
      description: "Verify your email address",
      completed: mentorProfile?.email_verified || false,
      current: currentStep === 0
    },
    {
      id: "links",
      title: "Professional Links",
      description: "Connect your LinkedIn (mandatory)",
      completed: !!mentorProfile?.linkedin_url,
      current: currentStep === 1
    },
    {
      id: "domain",
      title: "Domain Selection",
      description: "Choose your expertise domain",
      completed: !!mentorProfile?.verified_domain_id,
      current: currentStep === 2
    },
    {
      id: "categories",
      title: "Category Selection",
      description: "Select categories within your domain",
      completed: false,
      current: currentStep === 3
    },
    {
      id: "submit",
      title: "Submit for Review",
      description: "Request interview scheduling",
      completed: mentorProfile?.verification_status === 'pending_interview' || 
                 mentorProfile?.verification_status === 'interview_scheduled' ||
                 mentorProfile?.verification_status === 'verified',
      current: currentStep === 4
    }
  ];

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch mentor profile using any to bypass type checking for new columns
      const { data: mentor, error } = await (supabase
        .from("mentor_profiles") as any)
        .select("*")
        .eq("user_id", user?.id || "")
        .maybeSingle();

      if (error) throw error;
      
      if (mentor) {
        const mentorData = mentor as MentorProfileData;
        setMentorProfile(mentorData);
        setLinkedinUrl(mentorData.linkedin_url || "");
        setGithubUrl(mentorData.github_url || "");
        setPortfolioUrl(mentorData.portfolio_url || "");
        setWebsiteUrl(mentorData.website_url || "");
        setInstagramUrl(mentorData.instagram_url || "");
        setSelectedDomain(mentorData.verified_domain_id);
        
        // Determine current step based on verification progress
        if (!mentorData.email_verified) setCurrentStep(0);
        else if (!mentorData.linkedin_url) setCurrentStep(1);
        else if (!mentorData.verified_domain_id) setCurrentStep(2);
        else if (mentorData.verification_status === 'pending_domain') setCurrentStep(3);
        else if (mentorData.verification_status !== 'verified') setCurrentStep(4);
        else navigate("/mentor");

        // Fetch verified categories
        const { data: verifiedCats } = await (supabase as any)
          .from("mentor_verified_categories")
          .select("category_id")
          .eq("mentor_id", mentorData.id);
        
        if (verifiedCats && Array.isArray(verifiedCats)) {
          setSelectedCategories(verifiedCats.map((c: { category_id: string }) => c.category_id));
        }
      }

      // Fetch domains
      const { data: domainsData } = await supabase
        .from("career_domains")
        .select("id, name, description")
        .eq("is_active", true)
        .order("display_order");
      
      if (domainsData) setDomains(domainsData);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("career_categories")
        .select("id, name, domain_id")
        .eq("is_active", true)
        .order("display_order");
      
      if (categoriesData) setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load verification data");
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailOtp = async () => {
    if (!user?.email) return;
    
    setEmailVerifying(true);
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      toast.success(`OTP sent to ${user.email}. (Demo: ${otp})`);
      setEmailSent(true);
      localStorage.setItem(`mentor_otp_${user.id}`, JSON.stringify({
        code: otp,
        expires: Date.now() + 10 * 60 * 1000
      }));
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP");
    } finally {
      setEmailVerifying(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!emailOtp || !user) return;
    
    setEmailVerifying(true);
    try {
      const stored = localStorage.getItem(`mentor_otp_${user.id}`);
      if (!stored) {
        toast.error("No OTP found. Please request a new one.");
        return;
      }
      
      const { code, expires } = JSON.parse(stored);
      if (Date.now() > expires) {
        toast.error("OTP expired. Please request a new one.");
        localStorage.removeItem(`mentor_otp_${user.id}`);
        return;
      }
      
      if (code !== emailOtp) {
        toast.error("Invalid OTP");
        return;
      }

      localStorage.removeItem(`mentor_otp_${user.id}`);

      const { error } = await (supabase
        .from("mentor_profiles") as any)
        .update({ 
          email_verified: true,
          verification_status: 'pending_profile'
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Email verified successfully!");
      setCurrentStep(1);
      fetchData();
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Verification failed");
    } finally {
      setEmailVerifying(false);
    }
  };

  const saveProfessionalLinks = async () => {
    if (!linkedinUrl) {
      toast.error("LinkedIn URL is mandatory");
      return;
    }

    if (!linkedinUrl.includes("linkedin.com")) {
      toast.error("Please enter a valid LinkedIn URL");
      return;
    }

    try {
      await (supabase
        .from("mentor_profiles") as any)
        .update({
          linkedin_url: linkedinUrl,
          github_url: githubUrl || null,
          portfolio_url: portfolioUrl || null,
          website_url: websiteUrl || null,
          instagram_url: instagramUrl || null,
          verification_status: 'pending_domain'
        })
        .eq("user_id", user?.id);

      toast.success("Professional links saved!");
      setCurrentStep(2);
      fetchData();
    } catch (error) {
      console.error("Error saving links:", error);
      toast.error("Failed to save links");
    }
  };

  const saveDomainSelection = async () => {
    if (!selectedDomain) {
      toast.error("Please select a domain");
      return;
    }

    try {
      await (supabase
        .from("mentor_profiles") as any)
        .update({
          verified_domain_id: selectedDomain,
          verification_status: 'pending_domain'
        })
        .eq("user_id", user?.id);

      toast.success("Domain selected!");
      setCurrentStep(3);
      fetchData();
    } catch (error) {
      console.error("Error saving domain:", error);
      toast.error("Failed to save domain");
    }
  };

  const saveCategorySelection = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    try {
      if (mentorProfile?.id) {
        await (supabase as any)
          .from("mentor_verified_categories")
          .delete()
          .eq("mentor_id", mentorProfile.id);
      }

      const insertData = selectedCategories.map(catId => ({
        mentor_id: mentorProfile?.id,
        category_id: catId
      }));

      await (supabase as any).from("mentor_verified_categories").insert(insertData);

      await (supabase
        .from("mentor_profiles") as any)
        .update({ verification_status: 'pending_interview' })
        .eq("user_id", user?.id);

      toast.success("Categories saved!");
      setCurrentStep(4);
      fetchData();
    } catch (error) {
      console.error("Error saving categories:", error);
      toast.error("Failed to save categories");
    }
  };

  const submitForReview = async () => {
    try {
      await (supabase as any).from("mentor_interviews").insert({
        mentor_id: mentorProfile?.id,
        domain_id: selectedDomain,
        category_ids: selectedCategories,
        status: 'pending',
        interview_type: 'domain_verification'
      });

      await (supabase
        .from("mentor_profiles") as any)
        .update({ verification_status: 'pending_interview' })
        .eq("user_id", user?.id);

      toast.success("Profile submitted for review! An admin will schedule your interview.");
      fetchData();
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Failed to submit for review");
    }
  };

  const filteredCategories = categories.filter(c => c.domain_id === selectedDomain);
  const completedSteps = steps.filter(s => s.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (mentorProfile?.verification_status === 'verified') {
    navigate("/mentor");
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Mentor Verification</h1>
          <p className="text-muted-foreground">Complete all steps to become a verified mentor</p>
          <div className="mt-4 max-w-md mx-auto">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{completedSteps} of {steps.length} steps completed</p>
          </div>
        </div>

        {mentorProfile?.verification_status === 'pending_interview' && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Awaiting Interview</p>
                  <p className="text-sm text-muted-foreground">
                    Your profile is under review. An admin will schedule your interview soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {mentorProfile?.verification_status === 'interview_failed' && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium">Interview Not Passed</p>
                  <p className="text-sm text-muted-foreground">
                    You can reschedule your interview after reviewing the feedback.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                  step.completed 
                    ? "bg-primary/20 text-primary" 
                    : step.current 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                }`}
                onClick={() => step.completed && setCurrentStep(index)}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : step.current ? (
                  <Circle className="h-5 w-5 fill-current" />
                ) : (
                  <Lock className="h-5 w-5" />
                )}
                <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 0 && <Mail className="h-5 w-5" />}
              {currentStep === 1 && <Linkedin className="h-5 w-5" />}
              {currentStep === 2 && <Briefcase className="h-5 w-5" />}
              {currentStep === 3 && <Layers className="h-5 w-5" />}
              {currentStep === 4 && <Send className="h-5 w-5" />}
              {steps[currentStep]?.title}
            </CardTitle>
            <CardDescription>{steps[currentStep]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                {!emailSent ? (
                  <>
                    <p className="text-muted-foreground">
                      We'll send a verification code to: <strong>{user?.email}</strong>
                    </p>
                    <Button onClick={sendEmailOtp} disabled={emailVerifying}>
                      {emailVerifying ? "Sending..." : "Send Verification Code"}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">
                      Enter the 6-digit code sent to your email
                    </p>
                    <div className="flex gap-2 max-w-xs">
                      <Input
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        placeholder="Enter OTP"
                        maxLength={6}
                      />
                      <Button onClick={verifyEmailOtp} disabled={emailVerifying || emailOtp.length !== 6}>
                        {emailVerifying ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                    <Button variant="link" className="p-0" onClick={sendEmailOtp}>
                      Resend Code
                    </Button>
                  </>
                )}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                    LinkedIn URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub URL (Optional)
                    </Label>
                    <Input
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Portfolio URL (Optional)
                    </Label>
                    <Input
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website URL (Optional)
                    </Label>
                    <Input
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-[#E4405F]" />
                      Instagram (Optional)
                    </Label>
                    <Input
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>
                <Button onClick={saveProfessionalLinks}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select ONE domain that represents your primary expertise. 
                  <strong className="text-destructive"> This cannot be changed later without a new interview.</strong>
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {domains.map((domain) => (
                    <Card
                      key={domain.id}
                      className={`cursor-pointer transition-all ${
                        selectedDomain === domain.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedDomain(domain.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-4 w-4 rounded-full border-2 ${
                            selectedDomain === domain.id 
                              ? "border-primary bg-primary" 
                              : "border-muted-foreground"
                          }`}>
                            {selectedDomain === domain.id && (
                              <CheckCircle2 className="h-full w-full text-primary-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{domain.name}</p>
                            {domain.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {domain.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button onClick={saveDomainSelection} disabled={!selectedDomain}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select categories within your domain. You can select multiple categories.
                  Your posts and tasks will be visible to students in these categories.
                </p>
                {filteredCategories.length === 0 ? (
                  <p className="text-muted-foreground">No categories available for the selected domain.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedCategories.includes(category.id)
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => {
                          if (selectedCategories.includes(category.id)) {
                            setSelectedCategories(prev => prev.filter(id => id !== category.id));
                          } else {
                            setSelectedCategories(prev => [...prev, category.id]);
                          }
                        }}
                      >
                        <Checkbox checked={selectedCategories.includes(category.id)} />
                        <span>{category.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Button onClick={saveCategorySelection} disabled={selectedCategories.length === 0}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3">Profile Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {user?.email} ✓</p>
                    <p>
                      <strong>LinkedIn:</strong>{" "}
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {linkedinUrl} <ExternalLink className="inline h-3 w-3" />
                      </a>
                    </p>
                    <p><strong>Domain:</strong> {domains.find(d => d.id === selectedDomain)?.name}</p>
                    <p>
                      <strong>Categories:</strong>{" "}
                      {selectedCategories.map(catId => 
                        categories.find(c => c.id === catId)?.name
                      ).join(", ")}
                    </p>
                  </div>
                </div>

                {mentorProfile?.verification_status === 'pending_interview' ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
                    <p className="font-medium">Application Submitted!</p>
                    <p className="text-sm text-muted-foreground">
                      An admin will review your profile and schedule an interview.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      By submitting, you confirm that all information provided is accurate.
                      An admin will review your profile and schedule an interview
                      to verify your expertise in the selected domain.
                    </p>
                    <Button onClick={submitForReview} className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Submit for Review
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
