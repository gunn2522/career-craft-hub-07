import { useState, useEffect, useRef } from "react";
import { MentorLayout } from "@/components/mentor/MentorLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  User, Camera, Save, Eye, Edit3, 
  Star, Users, Calendar, Clock, 
  CheckCircle, Linkedin, Globe, Award, BookOpen, Briefcase
} from "lucide-react";

interface MentorProfileData {
  id: string;
  bio: string | null;
  expertise: string[] | null;
  specialization: string | null;
  years_of_experience: number | null;
  rating: number | null;
  students_mentored: number | null;
  sessions_conducted: number | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  availability_status: string | null;
  verification_status: string | null;
  achievements: string[] | null;
  certifications: string[] | null;
  languages: string[] | null;
  total_subscribers: number | null;
  consultation_rate: number | null;
}

interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
  institution: string | null;
  email: string | null;
}

const MentorMyProfile = () => {
  const { user } = useAuth();
  const [mentorProfile, setMentorProfile] = useState<MentorProfileData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [bio, setBio] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("available");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [achievementsInput, setAchievementsInput] = useState("");
  const [achievements, setAchievements] = useState<string[]>([]);
  const [certificationsInput, setCertificationsInput] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [languagesInput, setLanguagesInput] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [consultationRate, setConsultationRate] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, institution, email")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) {
        setUserProfile(profileData);
        setFullName(profileData.full_name || "");
        setInstitution(profileData.institution || "");
      }

      // Fetch mentor profile
      const { data: mentorData } = await supabase
        .from("mentor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (mentorData) {
        setMentorProfile(mentorData);
        setBio(mentorData.bio || "");
        setSpecialization(mentorData.specialization || "");
        setYearsOfExperience(mentorData.years_of_experience || 0);
        setLinkedinUrl(mentorData.linkedin_url || "");
        setPortfolioUrl(mentorData.portfolio_url || "");
        setAvailabilityStatus(mentorData.availability_status || "available");
        setExpertise(mentorData.expertise || []);
        setAchievements(mentorData.achievements || []);
        setCertifications(mentorData.certifications || []);
        setLanguages(mentorData.languages || []);
        setConsultationRate(mentorData.consultation_rate || 0);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("mentor-avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("mentor-avatars")
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl.publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setUserProfile(prev => prev ? { ...prev, avatar_url: publicUrl.publicUrl } : null);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          institution: institution
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Update mentor profile
      const { error: mentorError } = await supabase
        .from("mentor_profiles")
        .update({
          bio,
          specialization,
          years_of_experience: yearsOfExperience,
          linkedin_url: linkedinUrl || null,
          portfolio_url: portfolioUrl || null,
          availability_status: availabilityStatus,
          expertise,
          achievements,
          certifications,
          languages,
          consultation_rate: consultationRate
        })
        .eq("user_id", user.id);

      if (mentorError) throw mentorError;

      toast.success("Profile updated successfully!");
      fetchProfileData();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const addToList = (
    input: string, 
    setInput: (v: string) => void, 
    list: string[], 
    setList: (v: string[]) => void
  ) => {
    const trimmed = input.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setInput("");
    }
  };

  const removeFromList = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter(i => i !== item));
  };

  if (isLoading) {
    return (
      <MentorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your mentor profile and see how students view it</p>
          </div>
        </div>

        <Tabs defaultValue="edit" className="space-y-6">
          <TabsList>
            <TabsTrigger value="edit" className="gap-2">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Student Preview
            </TabsTrigger>
          </TabsList>

          {/* Edit Profile Tab */}
          <TabsContent value="edit" className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-primary/20">
                      <AvatarImage src={userProfile?.avatar_url || ""} />
                      <AvatarFallback className="text-2xl">
                        {fullName?.charAt(0) || "M"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <p className="font-medium">Upload a profile picture</p>
                    <p className="text-sm text-muted-foreground">
                      Recommended: Square image, max 5MB
                    </p>
                    {isUploading && (
                      <p className="text-sm text-primary mt-1">Uploading...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution">Organization/Company</Label>
                    <Input
                      id="institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Your organization"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g., Career Coach, Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min={0}
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell students about yourself, your experience, and what you can help them with..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Links & Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Links & Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                      id="linkedin"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio URL</Label>
                    <Input
                      id="portfolio"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability Status</Label>
                    <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Consultation Rate (₹/hour)</Label>
                    <Input
                      id="rate"
                      type="number"
                      min={0}
                      value={consultationRate}
                      onChange={(e) => setConsultationRate(parseInt(e.target.value) || 0)}
                      placeholder="0 for free"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expertise */}
            <Card>
              <CardHeader>
                <CardTitle>Expertise & Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    placeholder="Add expertise (press Enter)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToList(expertiseInput, setExpertiseInput, expertise, setExpertise);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addToList(expertiseInput, setExpertiseInput, expertise, setExpertise)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expertise.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeFromList(item, expertise, setExpertise)}>
                      {item} ×
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements & Certifications */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={achievementsInput}
                      onChange={(e) => setAchievementsInput(e.target.value)}
                      placeholder="Add achievement"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addToList(achievementsInput, setAchievementsInput, achievements, setAchievements);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addToList(achievementsInput, setAchievementsInput, achievements, setAchievements)}
                    >
                      Add
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {achievements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Award className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="flex-1">{item}</span>
                        <button
                          onClick={() => removeFromList(item, achievements, setAchievements)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={certificationsInput}
                      onChange={(e) => setCertificationsInput(e.target.value)}
                      placeholder="Add certification"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addToList(certificationsInput, setCertificationsInput, certifications, setCertifications);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addToList(certificationsInput, setCertificationsInput, certifications, setCertifications)}
                    >
                      Add
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {certifications.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="flex-1">{item}</span>
                        <button
                          onClick={() => removeFromList(item, certifications, setCertifications)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={languagesInput}
                    onChange={(e) => setLanguagesInput(e.target.value)}
                    placeholder="Add language (e.g., English, Hindi)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToList(languagesInput, setLanguagesInput, languages, setLanguages);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addToList(languagesInput, setLanguagesInput, languages, setLanguages)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {languages.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => removeFromList(item, languages, setLanguages)}>
                      {item} ×
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isSaving} size="lg">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card className="border-2 border-dashed border-primary/30">
              <CardHeader>
                <CardDescription className="text-center">
                  This is how students will see your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Preview Hero */}
                <div className="glass-card rounded-2xl p-8 mb-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="w-32 h-32 border-4 border-primary/20">
                      <AvatarImage src={userProfile?.avatar_url || ""} />
                      <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {fullName?.charAt(0) || "M"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold">{fullName || "Your Name"}</h2>
                        {mentorProfile?.verification_status === "verified" && (
                          <Badge variant="default" className="bg-primary">
                            <CheckCircle className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        )}
                      </div>

                      <p className="text-xl text-muted-foreground mb-2">
                        {specialization || "Your Specialization"}
                      </p>

                      {institution && (
                        <p className="text-sm text-muted-foreground mb-4">
                          <Briefcase className="w-4 h-4 inline mr-1" />
                          {institution}
                        </p>
                      )}

                      {/* Stats Preview */}
                      <div className="flex flex-wrap gap-6 mb-4">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-primary" />
                          <span className="font-bold">{mentorProfile?.rating?.toFixed(1) || "N/A"}</span>
                          <span className="text-muted-foreground">Rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          <span className="font-bold">{mentorProfile?.total_subscribers || 0}</span>
                          <span className="text-muted-foreground">Subscribers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span className="font-bold">{mentorProfile?.sessions_conducted || 0}</span>
                          <span className="text-muted-foreground">Sessions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          <span className="font-bold">{yearsOfExperience}+</span>
                          <span className="text-muted-foreground">Years Exp.</span>
                        </div>
                      </div>

                      {/* Expertise Tags */}
                      {expertise.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {expertise.map((skill, idx) => (
                            <Badge key={idx} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Links Preview */}
                      <div className="flex flex-wrap gap-3">
                        <Button variant="default" disabled>
                          Subscribe
                        </Button>
                        {linkedinUrl && (
                          <Button variant="outline" disabled>
                            <Linkedin className="w-4 h-4 mr-2" />
                            LinkedIn
                          </Button>
                        )}
                        {portfolioUrl && (
                          <Button variant="outline" disabled>
                            <Globe className="w-4 h-4 mr-2" />
                            Portfolio
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio Preview */}
                {bio && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{bio}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Achievements & Certs Preview */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {achievements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-primary" />
                          Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {achievements.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {certifications.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-primary" />
                          Certifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {certifications.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Languages Preview */}
                {languages.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Languages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang, idx) => (
                          <Badge key={idx} variant="secondary">{lang}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MentorLayout>
  );
};

export default MentorMyProfile;
