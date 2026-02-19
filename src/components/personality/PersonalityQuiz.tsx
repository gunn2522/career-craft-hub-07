import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { QUESTIONS, DIMENSION_LABELS } from "@/data/personalityQuestions";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuizFlowProps {
  onComplete: (answers: (number | null)[]) => void;
}

const LIKERT_OPTIONS = [
  { value: -3, label: "Strongly Disagree" },
  { value: -2, label: "Disagree" },
  { value: -1, label: "Slightly Disagree" },
  { value: 0, label: "Neutral" },
  { value: 1, label: "Slightly Agree" },
  { value: 2, label: "Agree" },
  { value: 3, label: "Strongly Agree" },
];

export const PersonalityQuiz = ({ onComplete }: QuizFlowProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(QUESTIONS.length).fill(null)
  );

  const selectAnswer = useCallback(
    (value: number) => {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = value;
      setAnswers(newAnswers);

      setTimeout(() => {
        setCurrentQuestion((prev) =>
          prev < QUESTIONS.length - 1 ? prev + 1 : prev
        );
      }, 350);
    },
    [currentQuestion, answers]
  );

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const isLast = currentQuestion === QUESTIONS.length - 1;
  const q = QUESTIONS[currentQuestion];
  if (!q) return null;

  const goNext = () => {
    if (answers[currentQuestion] === null) return;
    if (isLast) {
      onComplete(answers);
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <Badge variant="outline" className="font-normal">
            {DIMENSION_LABELS[q.dimension]}
          </Badge>
          <span className="text-muted-foreground font-medium">
            {currentQuestion + 1} / {QUESTIONS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="glass-card border-border/50">
        <CardContent className="pt-8 pb-6 px-6 md:px-8">
          <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed text-center mb-8">
            "{q.text}"
          </p>

          {/* Likert Scale */}
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
            {LIKERT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => selectAnswer(opt.value)}
                className={`
                  flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  text-xs font-medium
                  ${
                    answers[currentQuestion] === opt.value
                      ? "border-primary bg-primary/20 text-primary scale-105"
                      : "border-border/50 bg-card/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
                  }
                `}
              >
                <span className="text-base font-bold">
                  {opt.value > 0 ? `+${opt.value}` : opt.value}
                </span>
                <span className="hidden sm:block leading-tight text-center">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentQuestion === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          onClick={goNext}
          disabled={answers[currentQuestion] === null}
          className="gap-2"
        >
          {isLast ? "See Results" : "Next"}
          {!isLast && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};
