import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, BarChart3 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Metric {
  id: string;
  metric_key: string;
  display_label: string;
  table_name: string | null;
  custom_value: string | null;
  value_type: string;
  display_order: number;
  is_visible: boolean;
}

const AdminMetrics = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [formData, setFormData] = useState({
    metric_key: "",
    display_label: "",
    table_name: "",
    custom_value: "",
    value_type: "count",
    display_order: 0,
    is_visible: true,
  });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_metrics")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as Metric[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("admin_metrics").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast({ title: "Success", description: "Metric created successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof formData) => {
      const { error } = await supabase.from("admin_metrics").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast({ title: "Success", description: "Metric updated successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_metrics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast({ title: "Success", description: "Metric deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      metric_key: "",
      display_label: "",
      table_name: "",
      custom_value: "",
      value_type: "count",
      display_order: 0,
      is_visible: true,
    });
    setEditingMetric(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (metric: Metric) => {
    setEditingMetric(metric);
    setFormData({
      metric_key: metric.metric_key,
      display_label: metric.display_label,
      table_name: metric.table_name || "",
      custom_value: metric.custom_value || "",
      value_type: metric.value_type,
      display_order: metric.display_order,
      is_visible: metric.is_visible,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMetric) {
      updateMutation.mutate({ id: editingMetric.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const tableOptions = [
    { value: "profiles", label: "Profiles (Students)" },
    { value: "mentor_profiles", label: "Mentor Profiles" },
    { value: "partners", label: "Partners" },
    { value: "institutions", label: "Institutions" },
    { value: "roadmaps", label: "Roadmaps" },
    { value: "events", label: "Events" },
    { value: "programs", label: "Programs" },
    { value: "blogs", label: "Blogs" },
    { value: "resources", label: "Resources" },
  ];

  return (
    <AdminLayout title="Live Metrics Management">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Live Metrics Configuration
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Metric
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMetric ? "Edit Metric" : "Add New Metric"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metric_key">Metric Key (unique identifier)</Label>
                  <Input
                    id="metric_key"
                    value={formData.metric_key}
                    onChange={(e) => setFormData({ ...formData, metric_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="e.g., total_students"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_label">Display Label</Label>
                  <Input
                    id="display_label"
                    value={formData.display_label}
                    onChange={(e) => setFormData({ ...formData, display_label: e.target.value })}
                    placeholder="e.g., Students Onboarded"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value_type">Value Type</Label>
                  <Select
                    value={formData.value_type}
                    onValueChange={(value) => setFormData({ ...formData, value_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="count">Count from Table</SelectItem>
                      <SelectItem value="custom">Custom Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.value_type === "count" && (
                  <div className="space-y-2">
                    <Label htmlFor="table_name">Table to Count</Label>
                    <Select
                      value={formData.table_name}
                      onValueChange={(value) => setFormData({ ...formData, table_name: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select table" />
                      </SelectTrigger>
                      <SelectContent>
                        {tableOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.value_type === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="custom_value">Custom Value</Label>
                    <Input
                      id="custom_value"
                      value={formData.custom_value}
                      onChange={(e) => setFormData({ ...formData, custom_value: e.target.value })}
                      placeholder="e.g., 10,000+"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_visible"
                    checked={formData.is_visible}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                  />
                  <Label htmlFor="is_visible">Visible on Website</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingMetric ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Configure which metrics appear on the homepage. Counts are updated automatically in real-time.
          </p>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : metrics?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No metrics configured. Add your first metric.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics?.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell className="font-mono text-sm">{metric.metric_key}</TableCell>
                    <TableCell className="font-medium">{metric.display_label}</TableCell>
                    <TableCell>
                      {metric.value_type === "count" ? (
                        <Badge variant="outline">{metric.table_name}</Badge>
                      ) : (
                        <Badge variant="secondary">{metric.custom_value}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{metric.display_order}</TableCell>
                    <TableCell>
                      <Badge variant={metric.is_visible ? "default" : "secondary"}>
                        {metric.is_visible ? "Visible" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(metric)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(metric.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminMetrics;
