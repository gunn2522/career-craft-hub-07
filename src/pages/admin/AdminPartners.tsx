import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DialogTrigger,
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
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye,
  EyeOff,
  Globe,
  Upload,
  Image,
} from "lucide-react";
import { format } from "date-fns";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  partner_type: string;
  description: string | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
}

const PARTNER_TYPES = [
  { value: "hiring", label: "Hiring Partner" },
  { value: "training", label: "Training Partner" },
  { value: "industry", label: "Industry Partner" },
];

const AdminPartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    partner_type: "industry",
    description: "",
    is_visible: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Failed to load partners");
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        logo_url: partner.logo_url || "",
        website_url: partner.website_url || "",
        partner_type: partner.partner_type,
        description: partner.description || "",
        is_visible: partner.is_visible,
        display_order: partner.display_order,
      });
    } else {
      setEditingPartner(null);
      setFormData({
        name: "",
        logo_url: "",
        website_url: "",
        partner_type: "industry",
        description: "",
        is_visible: true,
        display_order: partners.length,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Partner name is required");
      return;
    }

    try {
      if (editingPartner) {
        const { error } = await supabase
          .from("partners")
          .update(formData)
          .eq("id", editingPartner.id);

        if (error) throw error;
        toast.success("Partner updated successfully");
      } else {
        const { error } = await supabase
          .from("partners")
          .insert(formData);

        if (error) throw error;
        toast.success("Partner added successfully");
      }

      setIsDialogOpen(false);
      fetchPartners();
    } catch (error) {
      console.error("Error saving partner:", error);
      toast.error("Failed to save partner");
    }
  };

  const toggleVisibility = async (partner: Partner) => {
    try {
      const { error } = await supabase
        .from("partners")
        .update({ is_visible: !partner.is_visible })
        .eq("id", partner.id);

      if (error) throw error;
      toast.success(`Partner ${partner.is_visible ? "hidden" : "visible"} on website`);
      fetchPartners();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  const deletePartner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("partners")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Partner deleted successfully");
      fetchPartners();
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast.error("Failed to delete partner");
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      hiring: "bg-green-500",
      training: "bg-blue-500",
      industry: "bg-purple-500",
    };
    return (
      <Badge className={colors[type] || "bg-gray-500"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <AdminLayout title="Partner Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Partners</h2>
              <p className="text-sm text-muted-foreground">
                Manage partner companies and their logos
              </p>
            </div>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{partners.length}</p>
              <p className="text-sm text-muted-foreground">Total Partners</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {partners.filter(p => p.is_visible).length}
              </p>
              <p className="text-sm text-muted-foreground">Visible on Website</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {partners.filter(p => p.partner_type === "hiring").length}
              </p>
              <p className="text-sm text-muted-foreground">Hiring Partners</p>
            </CardContent>
          </Card>
        </div>

        {/* Partners Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Partners</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : partners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No partners added yet</p>
                <Button className="mt-4" onClick={() => openDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Partner
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Visible</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        {partner.logo_url ? (
                          <img
                            src={partner.logo_url}
                            alt={partner.name}
                            className="h-10 w-auto object-contain"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <Image className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          {partner.website_url && (
                            <a
                              href={partner.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary flex items-center gap-1 hover:underline"
                            >
                              <Globe className="w-3 h-3" />
                              Website
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(partner.partner_type)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={partner.is_visible}
                          onCheckedChange={() => toggleVisibility(partner)}
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(partner.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openDialog(partner)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deletePartner(partner.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPartner ? "Edit Partner" : "Add Partner"}
              </DialogTitle>
              <DialogDescription>
                {editingPartner
                  ? "Update partner information"
                  : "Add a new partner to display on the website"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Partner company name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Logo URL</label>
                <Input
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo_url && (
                  <div className="mt-2 p-2 border rounded">
                    <img
                      src={formData.logo_url}
                      alt="Preview"
                      className="h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Website URL</label>
                <Input
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Partner Type</label>
                <Select
                  value={formData.partner_type}
                  onValueChange={(value) => setFormData({ ...formData, partner_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTNER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the partnership"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Show on Website</label>
                <Switch
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingPartner ? "Update" : "Add"} Partner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminPartners;
