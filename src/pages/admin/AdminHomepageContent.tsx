import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, GripVertical } from "lucide-react";

interface VisitorRole {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

interface HomepageSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown>;
  is_visible: boolean;
  display_order: number;
}

interface SiteMetric {
  id: string;
  metric_key: string;
  display_label: string;
  value_type: string;
  custom_value: string | null;
  table_name: string | null;
  display_order: number;
  is_visible: boolean;
}

const AdminHomepageContent = () => {
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [editingRole, setEditingRole] = useState<VisitorRole | null>(null);
  const [editingMetric, setEditingMetric] = useState<SiteMetric | null>(null);
  const [newRole, setNewRole] = useState({ name: '', display_name: '', description: '', icon: 'Users' });
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);

  // Fetch all visitor roles (including inactive for admin)
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-visitor-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visitor_roles')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as VisitorRole[];
    },
  });

  // Fetch all homepage sections
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['admin-homepage-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as HomepageSection[];
    },
  });

  // Fetch all metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-site-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_metrics')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as SiteMetric[];
    },
  });

  // Update section mutation
  const updateSection = useMutation({
    mutationFn: async (section: HomepageSection) => {
      const { error } = await supabase
        .from('homepage_sections')
        .update({
          title: section.title,
          subtitle: section.subtitle,
          is_visible: section.is_visible,
        })
        .eq('id', section.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      setEditingSection(null);
      toast.success('Section updated successfully');
    },
    onError: () => toast.error('Failed to update section'),
  });

  // Update role mutation
  const updateRole = useMutation({
    mutationFn: async (role: VisitorRole) => {
      const { error } = await supabase
        .from('visitor_roles')
        .update({
          display_name: role.display_name,
          description: role.description,
          icon: role.icon,
          is_active: role.is_active,
        })
        .eq('id', role.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-visitor-roles'] });
      queryClient.invalidateQueries({ queryKey: ['visitor-roles'] });
      setEditingRole(null);
      toast.success('Role updated successfully');
    },
    onError: () => toast.error('Failed to update role'),
  });

  // Create role mutation
  const createRole = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('visitor_roles')
        .insert({
          name: newRole.name.toLowerCase().replace(/\s+/g, '_'),
          display_name: newRole.display_name,
          description: newRole.description,
          icon: newRole.icon,
          display_order: (roles?.length || 0) + 1,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-visitor-roles'] });
      setNewRole({ name: '', display_name: '', description: '', icon: 'Users' });
      setShowNewRoleDialog(false);
      toast.success('Role created successfully');
    },
    onError: () => toast.error('Failed to create role'),
  });

  // Delete role mutation
  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('visitor_roles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-visitor-roles'] });
      toast.success('Role deleted successfully');
    },
    onError: () => toast.error('Failed to delete role'),
  });

  // Update metric mutation
  const updateMetric = useMutation({
    mutationFn: async (metric: SiteMetric) => {
      const { error } = await supabase
        .from('site_metrics')
        .update({
          display_label: metric.display_label,
          is_visible: metric.is_visible,
        })
        .eq('id', metric.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-site-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['site-metrics'] });
      setEditingMetric(null);
      toast.success('Metric updated successfully');
    },
    onError: () => toast.error('Failed to update metric'),
  });

  const iconOptions = ['GraduationCap', 'BookOpen', 'Users', 'Building2', 'Briefcase'];

  return (
    <AdminLayout title="Homepage Content">
      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sections">Page Sections</TabsTrigger>
          <TabsTrigger value="roles">Visitor Roles</TabsTrigger>
          <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Sections</CardTitle>
            </CardHeader>
            <CardContent>
              {sectionsLoading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Subtitle</TableHead>
                      <TableHead>Visible</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sections?.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium capitalize">
                          {section.section_key.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {editingSection?.id === section.id ? (
                            <Input
                              value={editingSection.title || ''}
                              onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                            />
                          ) : (
                            section.title
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {editingSection?.id === section.id ? (
                            <Textarea
                              value={editingSection.subtitle || ''}
                              onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                              rows={2}
                            />
                          ) : (
                            section.subtitle
                          )}
                        </TableCell>
                        <TableCell>
                          {editingSection?.id === section.id ? (
                            <Switch
                              checked={editingSection.is_visible}
                              onCheckedChange={(checked) => setEditingSection({ ...editingSection, is_visible: checked })}
                            />
                          ) : (
                            <Switch checked={section.is_visible} disabled />
                          )}
                        </TableCell>
                        <TableCell>
                          {editingSection?.id === section.id ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => updateSection.mutate(editingSection)}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingSection(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => setEditingSection(section)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Visitor Role Types</CardTitle>
              <Dialog open={showNewRoleDialog} onOpenChange={setShowNewRoleDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Visitor Role</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Display Name</Label>
                      <Input
                        value={newRole.display_name}
                        onChange={(e) => setNewRole({ ...newRole, display_name: e.target.value, name: e.target.value })}
                        placeholder="e.g., Working Professional"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newRole.description}
                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                        placeholder="Brief description of this role"
                      />
                    </div>
                    <div>
                      <Label>Icon</Label>
                      <select
                        className="w-full border rounded-md p-2"
                        value={newRole.icon}
                        onChange={(e) => setNewRole({ ...newRole, icon: e.target.value })}
                      >
                        {iconOptions.map((icon) => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    <Button onClick={() => createRole.mutate()} className="w-full">
                      Create Role
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {rolesLoading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles?.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="font-medium">
                          {editingRole?.id === role.id ? (
                            <Input
                              value={editingRole.display_name}
                              onChange={(e) => setEditingRole({ ...editingRole, display_name: e.target.value })}
                            />
                          ) : (
                            role.display_name
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {editingRole?.id === role.id ? (
                            <Textarea
                              value={editingRole.description || ''}
                              onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                              rows={2}
                            />
                          ) : (
                            <span className="truncate">{role.description}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRole?.id === role.id ? (
                            <select
                              className="border rounded-md p-1"
                              value={editingRole.icon || 'Users'}
                              onChange={(e) => setEditingRole({ ...editingRole, icon: e.target.value })}
                            >
                              {iconOptions.map((icon) => (
                                <option key={icon} value={icon}>{icon}</option>
                              ))}
                            </select>
                          ) : (
                            role.icon
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRole?.id === role.id ? (
                            <Switch
                              checked={editingRole.is_active}
                              onCheckedChange={(checked) => setEditingRole({ ...editingRole, is_active: checked })}
                            />
                          ) : (
                            <Switch checked={role.is_active} disabled />
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRole?.id === role.id ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => updateRole.mutate(editingRole)}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingRole(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingRole(role)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteRole.mutate(role.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Live Metrics (Auto-calculated)</CardTitle>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric Key</TableHead>
                      <TableHead>Display Label</TableHead>
                      <TableHead>Source Table</TableHead>
                      <TableHead>Visible</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics?.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell className="font-mono text-sm">
                          {metric.metric_key}
                        </TableCell>
                        <TableCell>
                          {editingMetric?.id === metric.id ? (
                            <Input
                              value={editingMetric.display_label}
                              onChange={(e) => setEditingMetric({ ...editingMetric, display_label: e.target.value })}
                            />
                          ) : (
                            metric.display_label
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {metric.table_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {editingMetric?.id === metric.id ? (
                            <Switch
                              checked={editingMetric.is_visible}
                              onCheckedChange={(checked) => setEditingMetric({ ...editingMetric, is_visible: checked })}
                            />
                          ) : (
                            <Switch checked={metric.is_visible} disabled />
                          )}
                        </TableCell>
                        <TableCell>
                          {editingMetric?.id === metric.id ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => updateMetric.mutate(editingMetric)}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingMetric(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => setEditingMetric(metric)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminHomepageContent;