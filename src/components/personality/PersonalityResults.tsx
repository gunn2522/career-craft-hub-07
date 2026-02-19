import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import type { PersonalityType } from "@/data/personalityTypes";
import type { DimensionPercentages } from "@/utils/personalityScoring";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  User,
  Swords,
  Heart,
  Briefcase,
  Sprout,
  ArrowRight,
  Map,
} from "lucide-react";

interface PersonalityResultsProps {
  type: string;
  profile: PersonalityType;
  percentages: DimensionPercentages;
  onRetake: () => void;
}

interface MatchedCareer {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  salary: string | null;
}

interface MatchedRoadmap {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
}

const ROLE_COLORS: Record<string, string> = {
  analysts: "hsl(var(--primary))",
  diplomats: "hsl(142 71% 45%)",
  sentinels: "hsl(174 72% 56%)",
  explorers: "hsl(38 92% 50%)",
};

const DIMENSIONS = [
  { dim: "EI" as const, left: "E" as const, right: "I" as const, leftLabel: "Extraversion", rightLabel: "Introversion" },
  { dim: "SN" as const, left: "S" as const, right: "N" as const, leftLabel: "Observant", rightLabel: "Intuitive" },
  { dim: "TF" as const, left: "T" as const, right: "F" as const, leftLabel: "Thinking", rightLabel: "Feeling" },
  { dim: "JP" as const, left: "J" as const, right: "P" as const, leftLabel: "Judging", rightLabel: "Prospecting" },
];

export const PersonalityResults = ({
  type,
  profile,
  percentages,
  onRetake,
}: PersonalityResultsProps) => {
  const [matchedCareers, setMatchedCareers] = useState<MatchedCareer[]>([]);
  const [matchedRoadmaps, setMatchedRoadmaps] = useState<MatchedRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [type, profile]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      // Search careers that match the personality type's career suggestions
      const careerKeywords = profile.careers.map((c) =>
        c.toLowerCase().replace(/\s*\/\s*/g, " ").replace(/[^a-z0-9\s]/g, "")
      );

      // Fetch all active careers and filter by keyword match
      const { data: allCareers } = await supabase
        .from("careers")
        .select("id, title, slug, description, salary")
        .eq("is_active", true);

      if (allCareers) {
        const matched = allCareers.filter((career) => {
          const titleLower = career.title.toLowerCase();
          return careerKeywords.some(
            (keyword) =>
              titleLower.includes(keyword) ||
              keyword.split(" ").some((word) => word.length > 3 && titleLower.includes(word))
          );
        });
        setMatchedCareers(matched.slice(0, 8));
      }

      // Fetch roadmaps that might match
      const { data: allRoadmaps } = await supabase
        .from("roadmaps")
        .select("id, title, description, difficulty");

      if (allRoadmaps) {
        const matchedR = allRoadmaps.filter((roadmap) => {
          const titleLower = roadmap.title.toLowerCase();
          return careerKeywords.some(
            (keyword) =>
              titleLower.includes(keyword) ||
              keyword.split(" ").some((word) => word.length > 3 && titleLower.includes(word))
          );
        });
        setMatchedRoadmaps(matchedR.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const roleColor = ROLE_COLORS[profile.role] || ROLE_COLORS.analysts;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Type Reveal Card */}
      <Card className="glass-card border-border/50 overflow-hidden">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="text-6xl mb-2">{profile.emoji}</div>
          <Badge
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ backgroundColor: `${roleColor}20`, color: roleColor, borderColor: `${roleColor}40` }}
          >
            {profile.roleLabel}
          </Badge>
          <h2
            className="text-4xl md:text-5xl font-bold font-display"
            style={{
              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}aa)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {type}
          </h2>
          <p className="text-xl text-muted-foreground font-medium">"{profile.title}"</p>
          <p className="text-muted-foreground max-w-xl mx-auto">{profile.tagline}</p>
        </CardContent>
      </Card>

      {/* Trait Bars */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Your Trait Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {DIMENSIONS.map(({ left, right, leftLabel, rightLabel }) => {
            const leftPct = percentages[left];
            const rightPct = percentages[right];
            const leftDominant = leftPct > rightPct;

            return (
              <div key={`${left}${right}`} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${leftDominant ? "text-primary" : "text-muted-foreground"}`}>
                    {leftLabel} ({leftPct}%)
                  </span>
                  <span className={`font-medium ${!leftDominant ? "text-primary" : "text-muted-foreground"}`}>
                    {rightLabel} ({rightPct}%)
                  </span>
                </div>
                <div className="flex gap-1 h-3">
                  <div
                    className="rounded-l-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${leftPct}%`,
                      backgroundColor: leftDominant ? roleColor : "hsl(var(--muted))",
                    }}
                  />
                  <div
                    className="rounded-r-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${rightPct}%`,
                      backgroundColor: !leftDominant ? roleColor : "hsl(var(--muted))",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-transparent p-0 mb-4">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full border border-border data-[state=active]:border-primary">
            <User className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="strengths" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full border border-border data-[state=active]:border-primary">
            <Swords className="w-4 h-4" /> Strengths & Weaknesses
          </TabsTrigger>
          <TabsTrigger value="relationships" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full border border-border data-[state=active]:border-primary">
            <Heart className="w-4 h-4" /> Relationships
          </TabsTrigger>
          <TabsTrigger value="careers" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full border border-border data-[state=active]:border-primary">
            <Briefcase className="w-4 h-4" /> Careers
          </TabsTrigger>
          <TabsTrigger value="growth" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full border border-border data-[state=active]:border-primary">
            <Sprout className="w-4 h-4" /> Growth
          </TabsTrigger>
        </TabsList>

        <Card className="glass-card border-border/50">
          <CardContent className="pt-6">
            <TabsContent value="overview" className="mt-0">
              <h3 className="text-xl font-bold mb-3">{profile.emoji} {profile.title} — {type}</h3>
              <p className="text-muted-foreground leading-relaxed">{profile.overview}</p>
            </TabsContent>

            <TabsContent value="strengths" className="mt-0 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">✦ Strengths</h3>
                <ul className="space-y-2">
                  {profile.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">⚠ Weaknesses</h3>
                <ul className="space-y-2">
                  {profile.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-destructive mt-1">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="relationships" className="mt-0">
              <h3 className="text-xl font-bold mb-3">💕 Relationships</h3>
              <p className="text-muted-foreground leading-relaxed">{profile.relationships}</p>
            </TabsContent>

            <TabsContent value="careers" className="mt-0 space-y-4">
              <h3 className="text-xl font-bold mb-3">💼 Ideal Career Paths</h3>
              <p className="text-muted-foreground mb-4">
                Careers that leverage the natural strengths of {type}s:
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.careers.map((c, i) => (
                  <Badge key={i} variant="secondary" className="text-sm py-1.5 px-3">
                    {c}
                  </Badge>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="growth" className="mt-0">
              <h3 className="text-xl font-bold mb-3">🌱 Personal Growth</h3>
              <p className="text-muted-foreground leading-relaxed">{profile.growth}</p>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* Career Recommendations from Database */}
      {matchedCareers.length > 0 && (
        <Card className="glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Recommended Careers for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {matchedCareers.map((career) => (
                <Link
                  key={career.id}
                  to={`/careers/${career.slug || career.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {career.title}
                    </p>
                    {career.salary && (
                      <p className="text-sm text-muted-foreground">{career.salary}</p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roadmap Recommendations */}
      {matchedRoadmaps.length > 0 && (
        <Card className="glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              Recommended Roadmaps in Craft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {matchedRoadmaps.map((roadmap) => (
                <Link
                  key={roadmap.id}
                  to={`/craft/${roadmap.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {roadmap.title}
                    </p>
                    {roadmap.difficulty && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {roadmap.difficulty}
                      </Badge>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Retake Button */}
      <div className="text-center">
        <Button variant="outline" onClick={onRetake} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Retake Test
        </Button>
      </div>
    </div>
  );
};
