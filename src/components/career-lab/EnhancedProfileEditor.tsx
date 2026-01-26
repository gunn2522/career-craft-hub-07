import { useState, useEffect, useCallback } from "react";
import { User, Briefcase, Link, Linkedin, Globe, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  bio: string;
  career_goals: string;
  skills: string[];
  linkedin_url: string;
  portfolio_url: string;
  is_public: boolean;
  is_mentor: boolean;
  job_title: string;
  current_company: string;
  years_experience: number;
}

export const EnhancedProfileEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [profile, setProfile] = useState<ProfileData>({
    bio: "",
    career_goals: "",
    skills: [],
    linkedin_url: "",
    portfolio_url: "",
    is_public: false,
    is_mentor: false,
    job_title: "",
    current_company: "",
    years_experience: 0,
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select(
        "bio, career_goals, skills, linkedin_url, portfolio_url, is_public, is_mentor, job_title, current_company, years_experience"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setProfile({
        bio: data.bio || "",
        career_goals: data.career_goals || "",
        skills: data.skills || [],
        linkedin_url: data.linkedin_url || "",
        portfolio_url: data.portfolio_url || "",
        is_public: data.is_public || false,
        is_mentor: data.is_mentor || false,
        job_title: data.job_title || "",
        current_company: data.current_company || "",
        years_experience: data.years_experience || 0,
      });
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const saveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated!",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
          <div className="flex items-center gap-3">
            {profile.is_public ? (
              <Eye className="w-5 h-5 text-primary" />
            ) : (
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Public Profile</p>
              <p className="text-sm text-muted-foreground">
                Allow others to discover and connect with you
              </p>
            </div>
          </div>
          <Switch
            checked={profile.is_public}
            onCheckedChange={(checked) =>
              setProfile((prev) => ({ ...prev, is_public: checked }))
            }
          />
        </div>

        {/* Mentor Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Available as Mentor</p>
              <p className="text-sm text-muted-foreground">
                Offer guidance to aspiring professionals
              </p>
            </div>
          </div>
          <Switch
            checked={profile.is_mentor}
            onCheckedChange={(checked) =>
              setProfile((prev) => ({ ...prev, is_mentor: checked }))
            }
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell others about yourself..."
            value={profile.bio}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, bio: e.target.value }))
            }
            rows={4}
          />
        </div>

        {/* Career Goals */}
        <div className="space-y-2">
          <Label htmlFor="career_goals">Career Goals</Label>
          <Textarea
            id="career_goals"
            placeholder="What are you working towards?"
            value={profile.career_goals}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, career_goals: e.target.value }))
            }
            rows={3}
          />
        </div>

        {/* Current Position */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="job_title">Current Role</Label>
            <Input
              id="job_title"
              placeholder="e.g., Software Engineer"
              value={profile.job_title}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, job_title: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_company">Company</Label>
            <Input
              id="current_company"
              placeholder="e.g., Google"
              value={profile.current_company}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, current_company: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <Label htmlFor="years_experience">Years of Experience</Label>
          <Input
            id="years_experience"
            type="number"
            min="0"
            value={profile.years_experience}
            onChange={(e) =>
              setProfile((prev) => ({
                ...prev,
                years_experience: parseInt(e.target.value) || 0,
              }))
            }
          />
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <Label>Skills</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} variant="secondary">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20"
                onClick={() => removeSkill(skill)}
              >
                {skill} ×
              </Badge>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn URL
            </Label>
            <Input
              id="linkedin_url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={profile.linkedin_url}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, linkedin_url: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio_url" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Portfolio URL
            </Label>
            <Input
              id="portfolio_url"
              placeholder="https://yourportfolio.com"
              value={profile.portfolio_url}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, portfolio_url: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={saveProfile} disabled={isSaving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
};
