import { useState } from "react";
import { Clock, Zap, Target, Upload, Github, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DailyAssignment {
  id: string;
  title: string;
  description: string | null;
  skill_focus: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  instructions: string | null;
}

interface DailyTaskProps {
  assignment: DailyAssignment | null;
  isSubmitted: boolean;
  onSubmit: (assignmentId: string, type: string, url: string, fileName?: string) => void;
}

export const DailyTask = ({ assignment, isSubmitted, onSubmit }: DailyTaskProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  if (!assignment) {
    return (
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <h2 className="font-display text-xl md:text-2xl font-bold mb-4">
          Today's Task
        </h2>
        <div className="text-center py-8 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No assignments available yet.</p>
          <p className="text-sm">Check back soon for new tasks!</p>
        </div>
      </div>
    );
  }

  const handleGithubSubmit = () => {
    if (githubUrl.trim()) {
      onSubmit(assignment.id, "github", githubUrl.trim());
      setIsOpen(false);
      setGithubUrl("");
    }
  };

  const handleDocumentSubmit = () => {
    if (documentUrl.trim()) {
      onSubmit(assignment.id, "document", documentUrl.trim());
      setIsOpen(false);
      setDocumentUrl("");
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-500 bg-green-500/10";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10";
      case "hard":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 border-2 border-primary/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl md:text-2xl font-bold">
          Today's Task
        </h2>
        {isSubmitted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Submitted
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{assignment.title}</h3>
        
        {assignment.description && (
          <p className="text-muted-foreground">{assignment.description}</p>
        )}

        <div className="flex flex-wrap gap-3">
          {assignment.estimated_time && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
              <Clock className="w-4 h-4 text-primary" />
              {assignment.estimated_time}
            </div>
          )}
          
          {assignment.skill_focus && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
              <Zap className="w-4 h-4 text-primary" />
              {assignment.skill_focus}
            </div>
          )}
          
          {assignment.difficulty && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${getDifficultyColor(assignment.difficulty)}`}>
              <Target className="w-4 h-4" />
              {assignment.difficulty}
            </div>
          )}
        </div>

        {assignment.instructions && (
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <h4 className="font-semibold mb-2">Instructions</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {assignment.instructions}
            </p>
          </div>
        )}

        {!isSubmitted && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="lg" className="w-full">
                <Upload className="w-5 h-5 mr-2" />
                Submit Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Your Work</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="github" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="github" className="flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub
                  </TabsTrigger>
                  <TabsTrigger value="document" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="github" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-url">GitHub Repository URL</Label>
                    <Input
                      id="github-url"
                      placeholder="https://github.com/username/repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleGithubSubmit} 
                    className="w-full"
                    disabled={!githubUrl.trim()}
                  >
                    Submit GitHub Link
                  </Button>
                </TabsContent>
                
                <TabsContent value="document" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc-url">Document URL (Google Docs, Notion, etc.)</Label>
                    <Input
                      id="doc-url"
                      placeholder="https://docs.google.com/..."
                      value={documentUrl}
                      onChange={(e) => setDocumentUrl(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleDocumentSubmit} 
                    className="w-full"
                    disabled={!documentUrl.trim()}
                  >
                    Submit Document Link
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
