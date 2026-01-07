import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Shield, ShieldCheck, ShieldAlert, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface AdminPermission {
  id: string;
  user_id: string;
  admin_tier: 'super_admin' | 'admin' | 'moderator';
  permissions: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
}

const AdminAccessControl = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    admin_tier: "moderator" as 'super_admin' | 'admin' | 'moderator',
    is_active: true,
  });

  const { data: adminPermissions, isLoading } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_permissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      // Fetch user profiles for each admin
      const userIds = data.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);
      
      return data.map(p => ({
        ...p,
        profile: profiles?.find(pr => pr.user_id === p.user_id)
      })) as AdminPermission[];
    },
  });

  const { data: users } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .order("full_name");
      if (error) throw error;
      return data.map(p => ({ id: p.user_id, full_name: p.full_name, email: p.email })) as User[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("admin_permissions").insert([data]);
      if (error) throw error;
      // Also add admin role to user_roles
      await supabase.from("user_roles").upsert({ 
        user_id: data.user_id, 
        role: 'admin' 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] });
      toast({ title: "Success", description: "Admin permission created successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("admin_permissions")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] });
      toast({ title: "Success", description: "Permission updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_permissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] });
      toast({ title: "Success", description: "Admin permission removed successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      user_id: "",
      admin_tier: "moderator",
      is_active: true,
    });
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'super_admin': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'admin': return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      default: return <Shield className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      default: return 'secondary';
    }
  };

  // Filter out users who already have admin permissions
  const availableUsers = users?.filter(
    user => !adminPermissions?.some(p => p.user_id === user.id)
  );

  return (
    <AdminLayout title="Admin Access Control">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Hierarchy
            </CardTitle>
            <CardDescription>
              Manage admin permissions and access levels. Super Admins have full control.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-red-200 dark:border-red-900">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <span className="font-semibold">Super Admin</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Full platform control. Can add/remove admins, access all modules, and manage all settings.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 dark:border-blue-900">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold">Admin</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Can manage content, users, and most features. Cannot add other admins.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Moderator</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Limited access. Can review and approve content, manage basic settings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Admin Users</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Admin</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_id">Select User</Label>
                    <Select
                      value={formData.user_id}
                      onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email || user.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin_tier">Admin Tier</Label>
                    <Select
                      value={formData.admin_tier}
                      onValueChange={(value: 'super_admin' | 'admin' | 'moderator') => 
                        setFormData({ ...formData, admin_tier: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!formData.user_id}>
                      Add Admin
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : adminPermissions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No admin users configured.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminPermissions?.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {permission.profile?.full_name || "Unknown User"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {permission.profile?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTierBadgeVariant(permission.admin_tier) as any} className="flex items-center gap-1 w-fit">
                          {getTierIcon(permission.admin_tier)}
                          {permission.admin_tier.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={permission.is_active}
                          onCheckedChange={(checked) => 
                            updateMutation.mutate({ id: permission.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(permission.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(permission.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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
    </AdminLayout>
  );
};

export default AdminAccessControl;
