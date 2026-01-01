import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Trash2, Mail, Phone, Building2, Calendar, CheckCircle, XCircle, Clock, ShieldAlert } from "lucide-react";

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  college: string;
  year_of_study: string | null;
  why_ambassador: string | null;
  social_links: any;
  status: string | null;
  created_at: string;
}

const statusOptions = [
  { value: "pending", label: "Pending", color: "text-yellow-500" },
  { value: "reviewed", label: "Reviewed", color: "text-blue-500" },
  { value: "approved", label: "Approved", color: "text-green-500" },
  { value: "rejected", label: "Rejected", color: "text-red-500" },
];

// Sanitize display text to prevent XSS
const sanitizeText = (text: string | null): string => {
  if (!text) return "";
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

const AdminApplications = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Double-check admin status at application level before fetching sensitive data
    if (!authLoading) {
      if (!isAdmin) {
        setAccessDenied(true);
        setIsLoading(false);
        return;
      }
      fetchApplications();
    }
  }, [isAdmin, authLoading]);

  const fetchApplications = async () => {
    // Additional security: verify admin status before fetching PII
    if (!isAdmin) {
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("ambassador_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // RLS will block non-admins, handle gracefully
        if (error.code === "42501" || error.message.includes("permission denied")) {
          setAccessDenied(true);
          return;
        }
        throw error;
      }
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to fetch applications");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("ambassador_applications")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast.success("Status updated successfully");
      fetchApplications();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const { error } = await supabase
        .from("ambassador_applications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Application deleted successfully");
      fetchApplications();
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Show access denied message if not admin
  if (accessDenied) {
    return (
      <AdminLayout title="Ambassador Applications">
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
            <p className="text-lg font-medium text-destructive">Access Denied</p>
            <p className="text-muted-foreground mt-2">
              You don't have permission to view this sensitive data.
            </p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Ambassador Applications">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Review and manage campus ambassador applications
        </p>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {filter === "all"
                ? "No applications received yet"
                : `No ${filter} applications`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="glass-card">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(app.status)}
                    <CardTitle className="text-lg">{app.full_name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Building2 className="w-4 h-4" />
                    {app.college}
                    {app.year_of_study && ` • ${app.year_of_study}`}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(app.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3 text-sm">
                  <a
                    href={`mailto:${app.email}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {app.email}
                  </a>
                  {app.phone && (
                    <a
                      href={`tel:${app.phone}`}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="w-4 h-4" />
                      {app.phone}
                    </a>
                  )}
                </div>

                {app.why_ambassador && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Why they want to be an ambassador:
                    </p>
                    <p className="text-sm line-clamp-3">{app.why_ambassador}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Applied {formatDate(app.created_at)}
                  </div>
                  <Select
                    value={app.status || "pending"}
                    onValueChange={(value) => updateStatus(app.id, value)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminApplications;
