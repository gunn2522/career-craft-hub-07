import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { TorchLoader } from "@/components/ui/TorchLoader";
import { 
  ArrowRight, 
  ArrowLeft,
  Brain, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Target,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Award,
  Trophy
} from "lucide-react";

interface Test {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  duration_minutes: number;
}

interface Section {
  id: string;
  title: string;
  description: string | null;
  display_order: number;
}

interface Question {
  id: string;
  section_id: string;
  question_text: string;
  question_type: 'mcq' | 'likert';
  display_order: number;
  is_required: boolean;
}

interface Option {
  id: string;
  question_id: string;
  option_text: string;
  score_value: number;
  stream_mapping: string | null;
  display_order: number;
}

interface Domain {
  id: string;
  name: string;
  description: string | null;
}

type AssessmentStage = 'intro' | 'test' | 'result';

const SchoolAssessment = () => {
  const [stage, setStage] = useState<AssessmentStage>('intro');
  const [test, setTest] = useState<Test | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendedStream, setRecommendedStream] = useState<Domain | null>(null);
  const [streamScores, setStreamScores] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    setIsLoading(true);
    try {
      // Fetch active test for school students
      const { data: testData } = await supabase
        .from("psychometric_tests")
        .select("*")
        .eq("is_active", true)
        .eq("target_role", "school_student")
        .order("display_order")
        .limit(1)
        .single();

      if (!testData) {
        setIsLoading(false);
        return;
      }

      setTest(testData);

      // Fetch sections, questions, options, and domains in parallel
      const [sectionsRes, domainsRes] = await Promise.all([
        supabase
          .from("psychometric_sections")
          .select("*")
          .eq("test_id", testData.id)
          .order("display_order"),
        supabase
          .from("career_domains")
          .select("id, name, description")
          .eq("is_active", true)
      ]);

      if (sectionsRes.data) {
        setSections(sectionsRes.data);

        // Fetch questions for all sections
        const sectionIds = sectionsRes.data.map(s => s.id);
        const { data: questionsData } = await supabase
          .from("psychometric_questions")
          .select("*")
          .in("section_id", sectionIds)
          .order("display_order");

        if (questionsData) {
          setQuestions(questionsData);

          // Fetch options for all questions
          const questionIds = questionsData.map(q => q.id);
          const { data: optionsData } = await supabase
            .from("psychometric_options")
            .select("*")
            .in("question_id", questionIds)
            .order("display_order");

          if (optionsData) setOptions(optionsData);
        }
      }

      if (domainsRes.data) setDomains(domainsRes.data);
    } catch (error) {
      console.error("Error fetching test:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentSection = sections[currentSectionIndex];
  const currentQuestions = questions.filter(q => q.section_id === currentSection?.id);
  
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const canProceed = currentQuestions.every(q => !q.is_required || answers[q.id]);

  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const calculateResults = async () => {
    setSubmitting(true);

    // Calculate scores per stream
    const scores: Record<string, number> = {};
    
    Object.entries(answers).forEach(([questionId, optionId]) => {
      const option = options.find(o => o.id === optionId);
      if (option) {
        if (option.stream_mapping) {
          scores[option.stream_mapping] = (scores[option.stream_mapping] || 0) + option.score_value;
        }
        // Also add general score
        scores['general'] = (scores['general'] || 0) + option.score_value;
      }
    });

    setStreamScores(scores);

    // Find recommended stream
    let maxScore = 0;
    let recommendedId: string | null = null;
    
    Object.entries(scores).forEach(([streamId, score]) => {
      if (streamId !== 'general' && score > maxScore) {
        maxScore = score;
        recommendedId = streamId;
      }
    });

    const recommended = domains.find(d => d.id === recommendedId);
    setRecommendedStream(recommended || null);

    // Save response to database if user is logged in
    if (user && test) {
      try {
        const { data: responseData, error: responseError } = await supabase
          .from("psychometric_responses")
          .insert([{
            user_id: user.id,
            test_id: test.id,
            completed_at: new Date().toISOString(),
            total_score: scores['general'] || 0,
            recommended_stream_id: recommendedId
          }])
          .select()
          .single();

        if (responseError) throw responseError;

        // Save individual answers
        if (responseData) {
          const answersToInsert = Object.entries(answers).map(([questionId, optionId]) => ({
            response_id: responseData.id,
            question_id: questionId,
            option_id: optionId,
            score_earned: options.find(o => o.id === optionId)?.score_value || 0
          }));

          await supabase.from("psychometric_answers").insert(answersToInsert);
        }

        toast({ title: "Assessment Complete!", description: "Your results have been saved." });
      } catch (error) {
        console.error("Error saving response:", error);
      }
    }

    setStage('result');
    setSubmitting(false);
  };

  const getOptionsForQuestion = (questionId: string) => {
    return options.filter(o => o.question_id === questionId);
  };

  const getLikertOptions = () => [
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly Agree" }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <TorchLoader size="lg" text="Loading Assessment..." />
        </div>
      </Layout>
    );
  }

  if (!test) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md text-center p-8">
            <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Assessment Available</h2>
            <p className="text-muted-foreground mb-6">
              The career discovery assessment is currently being prepared. Please check back soon!
            </p>
            <Button asChild>
              <Link to="/school-careers">Explore Careers Instead</Link>
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  // Intro Stage
  if (stage === 'intro') {
    return (
      <Layout>
        <div className="min-h-screen py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
                <Brain className="w-4 h-4" />
                Career Discovery Assessment
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {test.title}
              </h1>
              <p className="text-muted-foreground text-lg">
                {test.description || "Discover your ideal career stream based on your interests and aptitude"}
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Answer Questions</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete {sections.length} sections with {questions.length} questions about your interests and preferences
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Get Your Results</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive personalized stream recommendations based on your responses
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Explore Careers</h4>
                    <p className="text-sm text-muted-foreground">
                      Discover career paths, required degrees, and roadmaps for your recommended stream
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Estimated time: {test.duration_minutes} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{questions.length} questions</span>
              </div>
            </div>

            {test.instructions && (
              <Card className="mb-8 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{test.instructions}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button size="lg" onClick={() => setStage('test')} className="gap-2">
                Start Assessment
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Test Stage
  if (stage === 'test') {
    return (
      <Layout>
        <div className="min-h-screen py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Section {currentSectionIndex + 1} of {sections.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {answeredQuestions} of {totalQuestions} answered
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Section Header */}
            {currentSection && (
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold mb-2">{currentSection.title}</h2>
                {currentSection.description && (
                  <p className="text-muted-foreground">{currentSection.description}</p>
                )}
              </div>
            )}

            {/* Questions */}
            <div className="space-y-8">
              {currentQuestions.map((question, idx) => (
                <Card key={question.id} className={answers[question.id] ? "border-primary/30" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="font-medium">
                        {question.question_text}
                        {question.is_required && <span className="text-destructive ml-1">*</span>}
                      </p>
                    </div>

                    {question.question_type === 'mcq' ? (
                      <RadioGroup
                        value={answers[question.id] || ""}
                        onValueChange={(value) => handleAnswer(question.id, value)}
                        className="space-y-3 ml-9"
                      >
                        {getOptionsForQuestion(question.id).map((option) => (
                          <div key={option.id} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="cursor-pointer">
                              {option.option_text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="ml-9">
                        <RadioGroup
                          value={answers[question.id] || ""}
                          onValueChange={(value) => handleAnswer(question.id, value)}
                          className="flex flex-wrap gap-4"
                        >
                          {getOptionsForQuestion(question.id).map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <Label htmlFor={option.id} className="cursor-pointer text-sm">
                                {option.option_text}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    {answers[question.id] && (
                      <div className="flex items-center gap-1 text-sm text-primary mt-3 ml-9">
                        <CheckCircle2 className="w-4 h-4" />
                        Answered
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePreviousSection}
                disabled={currentSectionIndex === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              <Button
                onClick={handleNextSection}
                disabled={!canProceed || submitting}
                className="gap-2"
              >
                {submitting ? (
                  "Analyzing..."
                ) : currentSectionIndex === sections.length - 1 ? (
                  <>
                    Submit & View Results
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next Section
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Result Stage
  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Your Career Assessment Results
            </h1>
            <p className="text-muted-foreground text-lg">
              Based on your responses, here's our recommendation for your ideal career stream
            </p>
          </div>

          {recommendedStream ? (
            <Card className="mb-8 border-primary/30 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  <CardTitle>Recommended Stream</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold mb-2">{recommendedStream.name}</h3>
                <p className="text-muted-foreground mb-6">
                  {recommendedStream.description || "This stream aligns best with your interests and aptitude based on your assessment responses."}
                </p>
                <Button asChild className="gap-2">
                  <Link to={`/school-careers?stream=${recommendedStream.id}`}>
                    Explore {recommendedStream.name} Careers
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  We couldn't determine a specific stream recommendation. 
                  Explore all available streams to find what interests you most.
                </p>
              </CardContent>
            </Card>
          )}

          {/* All Streams with Scores */}
          <h3 className="font-display text-xl font-bold mb-4">Your Stream Compatibility</h3>
          <div className="grid gap-4 mb-8">
            {domains.map((domain) => {
              const score = streamScores[domain.id] || 0;
              const maxPossibleScore = options.filter(o => o.stream_mapping === domain.id).reduce((sum, o) => sum + o.score_value, 0) || 1;
              const percentage = Math.min(100, Math.round((score / maxPossibleScore) * 100));
              
              return (
                <Card key={domain.id} className={domain.id === recommendedStream?.id ? "border-primary/30" : ""}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{domain.name}</span>
                        {domain.id === recommendedStream?.id && (
                          <Badge variant="default" className="text-xs">Best Match</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/school-careers" className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Explore Career Paths</p>
                    <p className="text-sm text-muted-foreground">Browse careers by stream and category</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link to="/craft" className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">View Roadmaps</p>
                    <p className="text-sm text-muted-foreground">Step-by-step learning paths for your goals</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SchoolAssessment;
