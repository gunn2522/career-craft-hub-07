import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, 
  Calculator, 
  Stethoscope, 
  FlaskConical,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

interface StreamOption {
  id: string;
  value: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const streams: StreamOption[] = [
  {
    id: "arts",
    value: "arts",
    label: "Arts / Humanities",
    description: "Literature, History, Psychology, Languages, Fine Arts",
    icon: Palette,
    color: "bg-amber-500/10 text-amber-600"
  },
  {
    id: "commerce",
    value: "commerce",
    label: "Commerce",
    description: "Accounting, Business Studies, Economics, Finance",
    icon: Calculator,
    color: "bg-emerald-500/10 text-emerald-600"
  },
  {
    id: "medical",
    value: "medical",
    label: "Medical / Biology",
    description: "Medicine, Pharmacy, Biotechnology, Healthcare",
    icon: Stethoscope,
    color: "bg-rose-500/10 text-rose-600"
  },
  {
    id: "non_medical",
    value: "non_medical",
    label: "Non-Medical / PCM",
    description: "Engineering, Technology, Mathematics, Physics",
    icon: FlaskConical,
    color: "bg-sky-500/10 text-sky-600"
  }
];

interface StreamSelectionProps {
  psychometricResponseId?: string;
  onComplete: (stream: string) => void;
}

export const StreamSelection = ({ psychometricResponseId, onComplete }: StreamSelectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedStream, setSelectedStream] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStream) {
      toast({ title: "Please select a stream", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      if (user) {
        // Save to database
        const { error } = await supabase
          .from("student_stream_selections")
          .upsert({
            user_id: user.id,
            selected_stream: selectedStream,
            psychometric_response_id: psychometricResponseId || null,
            is_confirmed: true
          }, { onConflict: 'user_id' });

        if (error) throw error;
      }

      // Store in localStorage for non-logged-in users
      localStorage.setItem('selected_stream', selectedStream);
      
      toast({ title: "Stream selected!", description: `You've selected ${streams.find(s => s.value === selectedStream)?.label}` });
      onComplete(selectedStream);
    } catch (error) {
      console.error("Error saving stream:", error);
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Your Stream</CardTitle>
          <CardDescription>
            Select your preferred academic stream to see relevant careers, degrees, and opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedStream}
            onValueChange={setSelectedStream}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {streams.map((stream) => {
              const Icon = stream.icon;
              const isSelected = selectedStream === stream.value;
              
              return (
                <Label
                  key={stream.id}
                  htmlFor={stream.id}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value={stream.value} id={stream.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${stream.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">{stream.label}</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{stream.description}</p>
                    </div>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>

          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!selectedStream || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? "Saving..." : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamSelection;
