import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, HelpCircle } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  display_order: number;
  is_published: boolean;
}

const categories = ["general", "careers", "programs", "mentors", "partners", "payments", "technical"];

const AdminFAQs = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "general",
    display_order: 0,
    is_published: true,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("faqs")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as FAQ[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await (supabase as any).from("faqs").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast({ title: "FAQ created successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create FAQ", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await (supabase as any).from("faqs").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast({ title: "FAQ updated successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update FAQ", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast({ title: "FAQ deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete FAQ", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ question: "", answer: "", category: "general", display_order: 0, is_published: true });
    setEditingFAQ(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "general",
      display_order: faq.display_order,
      is_published: faq.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFAQ) {
      updateMutation.mutate({ id: editingFAQ.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const groupedFaqs = faqs?.reduce((acc, faq) => {
    const cat = faq.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <AdminLayout title="FAQs Management">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Manage frequently asked questions</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingFAQ ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the answer"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label>Published</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingFAQ ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : !faqs?.length ? (
        <Card className="p-12 text-center">
          <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No FAQs yet</h3>
          <p className="text-muted-foreground mb-4">Create your first FAQ to help users</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedFaqs || {}).map(([category, categoryFaqs]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
              <div className="space-y-3">
                {categoryFaqs.map((faq) => (
                  <Card key={faq.id} className={!faq.is_published ? "opacity-60" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{faq.question}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">{faq.category}</span>
                            {!faq.is_published && (
                              <span className="text-xs text-amber-500">Draft</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(faq)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Delete this FAQ?")) {
                                deleteMutation.mutate(faq.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminFAQs;