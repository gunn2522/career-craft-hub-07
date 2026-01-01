import { useState } from "react";
import { MentorLayout } from "@/components/mentor/MentorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MentorPrograms = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    price: 0,
    is_free: true,
    features: "",
    outcomes: "",
    start_date: "",
    end_date: "",
  });

  const { data: programs, isLoading } = useQuery({
    queryKey: ["mentor-programs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("created_by", user?.id || "")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("programs").insert([{
        ...data,
        created_by: user?.id,
        features: data.features.split("\n").filter((f: string) => f.trim()),
        outcomes: data.outcomes.split("\n").filter((o: string) => o.trim()),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-programs"] });
      toast({ title: "Success", description: "Program created successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from("programs").update({
        ...data,
        features: data.features.split("\n").filter((f: string) => f.trim()),
        outcomes: data.outcomes.split("\n").filter((o: string) => o.trim()),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-programs"] });
      toast({ title: "Success", description: "Program updated successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("programs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-programs"] });
      toast({ title: "Success", description: "Program deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: "",
      price: 0,
      is_free: true,
      features: "",
      outcomes: "",
      start_date: "",
      end_date: "",
    });
    setEditingProgram(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (program: any) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      description: program.description || "",
      duration: program.duration || "",
      price: program.price || 0,
      is_free: program.is_free ?? true,
      features: (program.features || []).join("\n"),
      outcomes: (program.outcomes || []).join("\n"),
      start_date: program.start_date ? program.start_date.split("T")[0] : "",
      end_date: program.end_date ? program.end_date.split("T")[0] : "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <MentorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Programs</h1>
            <p className="text-muted-foreground mt-1">Create and manage your programs and sessions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProgram ? "Edit Program" : "Create New Program"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Program Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 4 weeks"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Free Program</Label>
                      <Switch
                        checked={formData.is_free}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                      />
                    </div>
                    {!formData.is_free && (
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        placeholder="Price in INR"
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <Textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={3}
                    placeholder="Live sessions&#10;Mentorship&#10;Certificate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Outcomes (one per line)</Label>
                  <Textarea
                    value={formData.outcomes}
                    onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
                    rows={3}
                    placeholder="Build real projects&#10;Get job ready"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit">{editingProgram ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Programs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : programs?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No programs yet. Create your first program!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs?.map((program: any) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.name}</TableCell>
                      <TableCell>{program.duration || "N/A"}</TableCell>
                      <TableCell>{program.is_free ? "Free" : `₹${program.price}`}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${program.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                          {program.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(program)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(program.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MentorLayout>
  );
};

export default MentorPrograms;