import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  Building2,
  Search,
  Eye,
  Pencil,
  Trash2,
  Ban,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  user_type: string | null;
  institution: string | null;
  status: string | null;
  profile_completed: boolean | null;
  created_at: string;
  role: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedTab]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role || "user",
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role/tab
    if (selectedTab !== "all") {
      if (selectedTab === "students") {
        filtered = filtered.filter(u => u.role === "user");
      } else if (selectedTab === "mentors") {
        filtered = filtered.filter(u => u.role === "mentor");
      } else if (selectedTab === "partners") {
        filtered = filtered.filter(u => u.role === "partner");
      }
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.full_name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.institution?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success(`User status updated to ${status}`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const updateUserRole = async (userId: string, newRole: "admin" | "mentor" | "moderator" | "partner" | "user") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      // Delete profile (cascade will handle related data)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      admin: "default",
      mentor: "secondary",
      partner: "outline",
      user: "outline",
    };
    return <Badge variant={variants[role] || "outline"}>{role}</Badge>;
  };

  const getStatusBadge = (status: string | null) => {
    if (!status || status === "active") {
      return <Badge variant="default" className="bg-green-500">Active</Badge>;
    }
    if (status === "pending") {
      return <Badge variant="secondary">Pending</Badge>;
    }
    if (status === "blocked") {
      return <Badge variant="destructive">Blocked</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const counts = {
    all: users.length,
    students: users.filter(u => u.role === "user").length,
    mentors: users.filter(u => u.role === "mentor").length,
    partners: users.filter(u => u.role === "partner").length,
  };

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{counts.all}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <GraduationCap className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{counts.students}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{counts.mentors}</p>
                <p className="text-sm text-muted-foreground">Mentors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <Building2 className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{counts.partners}</p>
                <p className="text-sm text-muted-foreground">Partners</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList>
                  <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                  <TabsTrigger value="students">Students ({counts.students})</TabsTrigger>
                  <TabsTrigger value="mentors">Mentors ({counts.mentors})</TabsTrigger>
                  <TabsTrigger value="partners">Partners ({counts.partners})</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.full_name || "No name"}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <Badge variant={user.profile_completed ? "default" : "secondary"}>
                            {user.profile_completed ? "Complete" : "Incomplete"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {user.status === "active" ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => updateUserStatus(user.user_id, "blocked")}
                              >
                                <Ban className="w-4 h-4 text-orange-500" />
                              </Button>
                            ) : (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => updateUserStatus(user.user_id, "active")}
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteUser(user.user_id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                      {selectedUser.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold">{selectedUser.full_name || "No name"}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{selectedUser.status || "active"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">User Type</p>
                    <p className="font-medium capitalize">{selectedUser.user_type?.replace("_", " ") || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Institution</p>
                    <p className="font-medium">{selectedUser.institution || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profile Completed</p>
                    <p className="font-medium">{selectedUser.profile_completed ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">{format(new Date(selectedUser.created_at), "PPP")}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user role and status</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    defaultValue={selectedUser.role}
                    onValueChange={(value: "admin" | "mentor" | "moderator" | "partner" | "user") => updateUserRole(selectedUser.user_id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Student</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    defaultValue={selectedUser.status || "active"}
                    onValueChange={(value) => updateUserStatus(selectedUser.user_id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
