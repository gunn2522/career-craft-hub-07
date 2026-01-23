import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, ClipboardList, ChevronRight, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Domain {
  id: string;
  name: string;
}

interface Test {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  duration_minutes: number;
  is_active: boolean;
  display_order: number;
  target_role: string;
  sections_count?: number;
  questions_count?: number;
}

interface Section {
  id: string;
  test_id: string;
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

const AdminPsychometricTests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    duration_minutes: 30,
    is_active: true,
    target_role: "school_student"
  });

  // Section/Question editing
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [testsRes, domainsRes] = await Promise.all([
        supabase.from("psychometric_tests").select("*").order("display_order"),
        supabase.from("career_domains").select("id, name").eq("is_active", true)
      ]);

      if (testsRes.data) {
        // Get counts for each test
        const testsWithCounts = await Promise.all(testsRes.data.map(async (test) => {
          const [sectionsCount, questionsCount] = await Promise.all([
            supabase.from("psychometric_sections").select("id", { count: "exact" }).eq("test_id", test.id),
            supabase.from("psychometric_questions").select("id", { count: "exact" })
              .in("section_id", (await supabase.from("psychometric_sections").select("id").eq("test_id", test.id)).data?.map(s => s.id) || [])
          ]);
          return {
            ...test,
            sections_count: sectionsCount.count || 0,
            questions_count: questionsCount.count || 0
          };
        }));
        setTests(testsWithCounts);
      }

      if (domainsRes.data) setDomains(domainsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    try {
      if (editingTest) {
        const { error } = await supabase
          .from("psychometric_tests")
          .update(formData)
          .eq("id", editingTest.id);
        if (error) throw error;
        toast({ title: "Success", description: "Test updated successfully" });
      } else {
        const { error } = await supabase
          .from("psychometric_tests")
          .insert([{ ...formData, display_order: tests.length }]);
        if (error) throw error;
        toast({ title: "Success", description: "Test created successfully" });
      }
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTestId) return;
    try {
      const { error } = await supabase.from("psychometric_tests").delete().eq("id", deleteTestId);
      if (error) throw error;
      toast({ title: "Success", description: "Test deleted successfully" });
      setDeleteTestId(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (test: Test) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      description: test.description || "",
      instructions: test.instructions || "",
      duration_minutes: test.duration_minutes,
      is_active: test.is_active,
      target_role: test.target_role
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTest(null);
    setFormData({
      title: "",
      description: "",
      instructions: "",
      duration_minutes: 30,
      is_active: true,
      target_role: "school_student"
    });
    setDialogOpen(false);
  };

  const openTestBuilder = async (test: Test) => {
    setSelectedTest(test);
    const { data } = await supabase
      .from("psychometric_sections")
      .select("*")
      .eq("test_id", test.id)
      .order("display_order");
    setSections(data || []);
  };

  const fetchQuestionsForSection = async (section: Section) => {
    setSelectedSection(section);
    const { data } = await supabase
      .from("psychometric_questions")
      .select("*")
      .eq("section_id", section.id)
      .order("display_order");
    setQuestions(data || []);
  };

  const fetchOptionsForQuestion = async (question: Question) => {
    setSelectedQuestion(question);
    const { data } = await supabase
      .from("psychometric_options")
      .select("*")
      .eq("question_id", question.id)
      .order("display_order");
    setOptions(data || []);
  };

  // Section CRUD
  const handleSaveSection = async (title: string, description: string) => {
    if (!selectedTest) return;
    try {
      if (editingSection) {
        await supabase.from("psychometric_sections").update({ title, description }).eq("id", editingSection.id);
      } else {
        await supabase.from("psychometric_sections").insert([{
          test_id: selectedTest.id,
          title,
          description,
          display_order: sections.length
        }]);
      }
      const { data } = await supabase.from("psychometric_sections").select("*").eq("test_id", selectedTest.id).order("display_order");
      setSections(data || []);
      setSectionDialogOpen(false);
      setEditingSection(null);
      toast({ title: "Success", description: "Section saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteSection = async (id: string) => {
    await supabase.from("psychometric_sections").delete().eq("id", id);
    setSections(sections.filter(s => s.id !== id));
    if (selectedSection?.id === id) {
      setSelectedSection(null);
      setQuestions([]);
    }
    toast({ title: "Section deleted" });
  };

  // Question CRUD
  const handleSaveQuestion = async (text: string, type: 'mcq' | 'likert', isRequired: boolean) => {
    if (!selectedSection) return;
    try {
      if (editingQuestion) {
        await supabase.from("psychometric_questions").update({ 
          question_text: text, 
          question_type: type,
          is_required: isRequired 
        }).eq("id", editingQuestion.id);
      } else {
        await supabase.from("psychometric_questions").insert([{
          section_id: selectedSection.id,
          question_text: text,
          question_type: type,
          is_required: isRequired,
          display_order: questions.length
        }]);
      }
      await fetchQuestionsForSection(selectedSection);
      setQuestionDialogOpen(false);
      setEditingQuestion(null);
      toast({ title: "Success", description: "Question saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    await supabase.from("psychometric_questions").delete().eq("id", id);
    setQuestions(questions.filter(q => q.id !== id));
    if (selectedQuestion?.id === id) {
      setSelectedQuestion(null);
      setOptions([]);
    }
    toast({ title: "Question deleted" });
  };

  // Option CRUD
  const handleSaveOption = async (text: string, score: number, streamId: string | null) => {
    if (!selectedQuestion) return;
    try {
      if (editingOption) {
        await supabase.from("psychometric_options").update({ 
          option_text: text, 
          score_value: score,
          stream_mapping: streamId 
        }).eq("id", editingOption.id);
      } else {
        await supabase.from("psychometric_options").insert([{
          question_id: selectedQuestion.id,
          option_text: text,
          score_value: score,
          stream_mapping: streamId,
          display_order: options.length
        }]);
      }
      await fetchOptionsForQuestion(selectedQuestion);
      setOptionDialogOpen(false);
      setEditingOption(null);
      toast({ title: "Success", description: "Option saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteOption = async (id: string) => {
    await supabase.from("psychometric_options").delete().eq("id", id);
    setOptions(options.filter(o => o.id !== id));
    toast({ title: "Option deleted" });
  };

  if (selectedTest) {
    return (
      <AdminLayout title={`Test Builder: ${selectedTest.title}`}>
        <Button variant="ghost" onClick={() => { setSelectedTest(null); setSections([]); setSelectedSection(null); setQuestions([]); setSelectedQuestion(null); setOptions([]); }} className="mb-4">
          ← Back to Tests
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sections Panel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Sections</CardTitle>
              <Button size="sm" onClick={() => { setEditingSection(null); setSectionDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedSection?.id === section.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                  onClick={() => fetchQuestionsForSection(section)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{section.title}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingSection(section); setSectionDialogOpen(true); }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {sections.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No sections yet</p>}
            </CardContent>
          </Card>

          {/* Questions Panel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Questions</CardTitle>
              {selectedSection && (
                <Button size="sm" onClick={() => { setEditingQuestion(null); setQuestionDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {!selectedSection ? (
                <p className="text-sm text-muted-foreground text-center py-4">Select a section first</p>
              ) : questions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No questions yet</p>
              ) : (
                questions.map((question) => (
                  <div
                    key={question.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedQuestion?.id === question.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                    onClick={() => fetchOptionsForQuestion(question)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm">{question.question_text}</p>
                        <Badge variant="outline" className="mt-1 text-xs">{question.question_type.toUpperCase()}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingQuestion(question); setQuestionDialogOpen(true); }}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(question.id); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Options Panel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Options</CardTitle>
              {selectedQuestion && (
                <Button size="sm" onClick={() => { setEditingOption(null); setOptionDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {!selectedQuestion ? (
                <p className="text-sm text-muted-foreground text-center py-4">Select a question first</p>
              ) : options.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No options yet</p>
              ) : (
                options.map((option) => (
                  <div key={option.id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm">{option.option_text}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">Score: {option.score_value}</Badge>
                          {option.stream_mapping && (
                            <Badge variant="outline" className="text-xs">
                              {domains.find(d => d.id === option.stream_mapping)?.name || 'Stream'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingOption(option); setOptionDialogOpen(true); }}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteOption(option.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section Dialog */}
        <SectionDialog
          open={sectionDialogOpen}
          onOpenChange={setSectionDialogOpen}
          editing={editingSection}
          onSave={handleSaveSection}
        />

        {/* Question Dialog */}
        <QuestionDialog
          open={questionDialogOpen}
          onOpenChange={setQuestionDialogOpen}
          editing={editingQuestion}
          onSave={handleSaveQuestion}
        />

        {/* Option Dialog */}
        <OptionDialog
          open={optionDialogOpen}
          onOpenChange={setOptionDialogOpen}
          editing={editingOption}
          domains={domains}
          onSave={handleSaveOption}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Psychometric Tests">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Create and manage psychometric assessments for career discovery</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" /> Add Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTest ? "Edit Test" : "Create New Test"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Career Discovery Assessment" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of this test" />
              </div>
              <div>
                <Label>Instructions</Label>
                <Textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} placeholder="Instructions shown before starting the test" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })} />
                </div>
                <div>
                  <Label>Target Role</Label>
                  <Select value={formData.target_role} onValueChange={(v) => setFormData({ ...formData, target_role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school_student">School Student</SelectItem>
                      <SelectItem value="college_student">College Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit}>{editingTest ? "Update" : "Create"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : tests.length === 0 ? (
        <Card className="p-12 text-center">
          <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tests Created</h3>
          <p className="text-muted-foreground mb-4">Create your first psychometric test to help students discover their career path</p>
          <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create Test</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{test.description || "No description"}</p>
                  </div>
                  <Badge variant={test.is_active ? "default" : "secondary"}>
                    {test.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                  <span>{test.sections_count} sections</span>
                  <span>{test.questions_count} questions</span>
                  <span>{test.duration_minutes} min</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openTestBuilder(test)}>
                    Build Test <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(test)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteTestId(test.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTestId} onOpenChange={() => setDeleteTestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the test and all its sections, questions, and options.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

// Sub-dialogs
const SectionDialog = ({ open, onOpenChange, editing, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; editing: Section | null; onSave: (title: string, description: string) => void }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setDescription(editing.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [editing, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit Section" : "Add Section"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => onSave(title, description)} disabled={!title.trim()}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const QuestionDialog = ({ open, onOpenChange, editing, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; editing: Question | null; onSave: (text: string, type: 'mcq' | 'likert', isRequired: boolean) => void }) => {
  const [text, setText] = useState("");
  const [type, setType] = useState<'mcq' | 'likert'>('mcq');
  const [isRequired, setIsRequired] = useState(true);

  useEffect(() => {
    if (editing) {
      setText(editing.question_text);
      setType(editing.question_type);
      setIsRequired(editing.is_required);
    } else {
      setText("");
      setType('mcq');
      setIsRequired(true);
    }
  }, [editing, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit Question" : "Add Question"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Question Text *</Label><Textarea value={text} onChange={(e) => setText(e.target.value)} /></div>
          <div>
            <Label>Question Type</Label>
            <Select value={type} onValueChange={(v: 'mcq' | 'likert') => setType(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="likert">Likert Scale (1-5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isRequired} onCheckedChange={setIsRequired} />
            <Label>Required</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => onSave(text, type, isRequired)} disabled={!text.trim()}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const OptionDialog = ({ open, onOpenChange, editing, domains, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; editing: Option | null; domains: Domain[]; onSave: (text: string, score: number, streamId: string | null) => void }) => {
  const [text, setText] = useState("");
  const [score, setScore] = useState(0);
  const [streamId, setStreamId] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setText(editing.option_text);
      setScore(editing.score_value);
      setStreamId(editing.stream_mapping);
    } else {
      setText("");
      setScore(0);
      setStreamId(null);
    }
  }, [editing, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit Option" : "Add Option"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Option Text *</Label><Input value={text} onChange={(e) => setText(e.target.value)} /></div>
          <div>
            <Label>Score Value</Label>
            <Input type="number" value={score} onChange={(e) => setScore(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Map to Stream (optional)</Label>
            <Select value={streamId || "none"} onValueChange={(v) => setStreamId(v === "none" ? null : v)}>
              <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No mapping</SelectItem>
                {domains.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => onSave(text, score, streamId)} disabled={!text.trim()}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPsychometricTests;
