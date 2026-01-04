import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  User, 
  Target, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  Rocket,
  X,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface ProfileCompletionProps {
  onComplete: () => void;
}

const CURRENT_LEVELS = [
  { id: "school", label: "School Student", icon: GraduationCap },
  { id: "college", label: "College Student", icon: Building2 },
  { id: "working_professional", label: "Working Professional", icon: Briefcase },
  { id: "founder", label: "Founder / Entrepreneur", icon: Rocket },
];

export const ProfileCompletion = ({ onComplete }: ProfileCompletionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    current_level: "",
    career_goals: "",
    skills: [] as string[],
    short_term_goals: "",
    long_term_goals: "",
    linkedin_url: "",
  });

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          current_level: formData.current_level,
          career_goals: formData.career_goals,
          skills: formData.skills,
          short_term_goals: formData.short_term_goals,
          long_term_goals: formData.long_term_goals,
          linkedin_url: formData.linkedin_url,
          profile_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile completed! Welcome to Career Lab!");
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.full_name.trim() && formData.current_level;
    if (step === 2) return formData.career_goals.trim();
    if (step === 3) return formData.skills.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 mx-auto rounded-2xl bg-primary/10">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Career Profile</CardTitle>
          <CardDescription>
            Step {step} of 4 - Let's personalize your Career Lab experience
          </CardDescription>
          <div className="flex gap-2 justify-center mt-4">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Your full name"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">I am currently a</label>
                <div className="grid grid-cols-2 gap-3">
                  {CURRENT_LEVELS.map(level => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, current_level: level.id }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                        formData.current_level === level.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <level.icon className={`w-6 h-6 ${formData.current_level === level.id ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium text-center ${formData.current_level === level.id ? "text-primary" : ""}`}>
                        {level.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Target className="inline w-4 h-4 mr-1" />
                  Career Interest / Goal
                </label>
                <Input
                  value={formData.career_goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, career_goals: e.target.value }))}
                  placeholder="e.g., UI/UX Designer, Data Scientist, Product Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Short-term Goals (6 months)</label>
                <Textarea
                  value={formData.short_term_goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_term_goals: e.target.value }))}
                  placeholder="What do you want to achieve in the next 6 months?"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Long-term Goals (2-3 years)</label>
                <Textarea
                  value={formData.long_term_goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, long_term_goals: e.target.value }))}
                  placeholder="Where do you see yourself in 2-3 years?"
                  rows={3}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Your Skills</label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill and press Enter"
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button onClick={() => removeSkill(skill)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {formData.skills.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Add at least one skill to continue
                  </p>
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">About You (Bio)</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us a bit about yourself..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn Profile (Optional)</label>
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Saving..." : "Complete Profile"}
                <Sparkles className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
