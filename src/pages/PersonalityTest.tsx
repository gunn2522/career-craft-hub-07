import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PersonalityQuiz } from "@/components/personality/PersonalityQuiz";
import { PersonalityResults } from "@/components/personality/PersonalityResults";
import { getPersonalityProfile } from "@/utils/personalityScoring";
import { PERSONALITY_TYPES, ROLE_GROUPS } from "@/data/personalityTypes";
import { TorchElements3D } from "@/components/ui/TorchElements3D";
import { Brain, Sparkles, ArrowRight } from "lucide-react";
import type { DimensionPercentages } from "@/utils/personalityScoring";
import type { PersonalityType } from "@/data/personalityTypes";

type Screen = "landing" | "quiz" | "results";

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  analysts: { label: "Analysts", color: "hsl(var(--primary))", bg: "bg-primary/10" },
  diplomats: { label: "Diplomats", color: "hsl(142 71% 45%)", bg: "bg-green-500/10" },
  sentinels: { label: "Sentinels", color: "hsl(174 72% 56%)", bg: "bg-teal-500/10" },
  explorers: { label: "Explorers", color: "hsl(38 92% 50%)", bg: "bg-amber-500/10" },
};

const PersonalityTest = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [result, setResult] = useState<{
    type: string;
    profile: PersonalityType;
    percentages: DimensionPercentages;
  } | null>(null);

  const handleQuizComplete = (answers: (number | null)[]) => {
    const res = getPersonalityProfile(answers);
    if (res) {
      setResult({ type: res.type, profile: res.profile, percentages: res.percentages });
      setScreen("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRetake = () => {
    setResult(null);
    setScreen("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Group types by role
  const groupedTypes = ROLE_GROUPS.reduce(
    (acc, role) => {
      acc[role] = Object.values(PERSONALITY_TYPES).filter((t) => t.role === role);
      return acc;
    },
    {} as Record<string, PersonalityType[]>
  );

  return (
    <Layout>
      {screen === "landing" && (
        <>
          {/* Hero Section */}
          <section className="relative min-h-[70vh] flex items-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
            <TorchElements3D count={10} />

            <div className="container mx-auto px-4 relative z-10 py-20">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm">
                  <Brain className="w-4 h-4" />
                  60 Research-Backed Questions
                </div>

                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                  Discover Your{" "}
                  <span className="gradient-text">Personality Type</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Take our scientifically-backed personality assessment based on IPIP Big Five research
                  to discover your type and get personalized career recommendations.
                </p>

                <Button
                  size="lg"
                  onClick={() => {
                    setScreen("quiz");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="gap-2 text-lg px-8 py-6 rounded-full glow-primary"
                >
                  <Sparkles className="w-5 h-5" />
                  Start the Test
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </section>

          {/* 16 Types Showcase */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl font-bold mb-3">
                  The 16 Personality Types
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Each type has unique strengths, preferences, and career paths
                </p>
              </div>

              <div className="space-y-10">
                {ROLE_GROUPS.map((role) => {
                  const meta = ROLE_META[role];
                  return (
                    <div key={role}>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${meta.color}20`,
                            color: meta.color,
                            borderColor: `${meta.color}40`,
                          }}
                        >
                          {meta.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {groupedTypes[role]?.map((t) => (
                          <Card
                            key={t.code}
                            className="glass-card border-border/50 hover:border-primary/40 transition-all cursor-default group"
                          >
                            <CardContent className="p-4 text-center space-y-1">
                              <div className="text-3xl">{t.emoji}</div>
                              <div
                                className="font-bold font-display"
                                style={{ color: meta.color }}
                              >
                                {t.code}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t.title}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {screen === "quiz" && (
        <section className="min-h-screen pt-32 pb-16 px-4">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold mb-2">
              Personality Assessment
            </h2>
            <p className="text-muted-foreground">
              Rate how much each statement describes you
            </p>
          </div>
          <PersonalityQuiz onComplete={handleQuizComplete} />
        </section>
      )}

      {screen === "results" && result && (
        <section className="min-h-screen pt-32 pb-16 px-4">
          <PersonalityResults
            type={result.type}
            profile={result.profile}
            percentages={result.percentages}
            onRetake={handleRetake}
          />
        </section>
      )}
    </Layout>
  );
};

export default PersonalityTest;
