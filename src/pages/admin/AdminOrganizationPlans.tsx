import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  plan_type: string;
  price: number;
  currency: string;
  billing_cycle: string;
  features: string[];
  max_events: number | null;
  max_resources: number | null;
  visibility_level: string;
  support_level: string;
  is_active: boolean;
  display_order: number;
}

interface MoU {
  id: string;
  title: string;
  description: string | null;
  document_url: string | null;
  target_type: string;
  is_active: boolean;
  display_order: number;
}

interface Inquiry {
  id: string;
  organization_type: string;
  organization_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  message: string | null;
  inquiry_status: string;
  notes: string | null;
  created_at: string;
}

const AdminOrganizationPlans = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [mous, setMous] = useState<MoU[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [mouDialogOpen, setMouDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingMou, setEditingMou] = useState<MoU | null>(null);

  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    plan_type: "school",
    price: 0,
    currency: "INR",
    billing_cycle: "monthly",
    features: "",
    max_events: "",
    max_resources: "",
    visibility_level: "basic",
    support_level: "standard",
    is_active: true,
    display_order: 0
  });

  const [mouForm, setMouForm] = useState({
    title: "",
    description: "",
    document_url: "",
    target_type: "school",
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [plansRes, mousRes, inquiriesRes] = await Promise.all([
        supabase.from("organization_plans").select("*").order("display_order"),
        supabase.from("mou_documents").select("*").order("display_order"),
        supabase.from("organization_inquiries").select("*").order("created_at", { ascending: false })
      ]);

      if (plansRes.data) setPlans(plansRes.data.map(p => ({ ...p, features: (p.features as string[]) || [] })));
      if (mousRes.data) setMous(mousRes.data);
      if (inquiriesRes.data) setInquiries(inquiriesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      const planData = {
        name: planForm.name,
        description: planForm.description || null,
        plan_type: planForm.plan_type,
        price: planForm.price,
        currency: planForm.currency,
        billing_cycle: planForm.billing_cycle,
        features: planForm.features.split('\n').filter(Boolean),
        max_events: planForm.max_events ? parseInt(planForm.max_events) : null,
        max_resources: planForm.max_resources ? parseInt(planForm.max_resources) : null,
        visibility_level: planForm.visibility_level,
        support_level: planForm.support_level,
        is_active: planForm.is_active,
        display_order: planForm.display_order
      };

      if (editingPlan) {
        const { error } = await supabase.from("organization_plans").update(planData).eq("id", editingPlan.id);
        if (error) throw error;
        toast({ title: "Plan updated successfully" });
      } else {
        const { error } = await supabase.from("organization_plans").insert(planData);
        if (error) throw error;
        toast({ title: "Plan created successfully" });
      }

      setPlanDialogOpen(false);
      resetPlanForm();
      fetchData();
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({ title: "Failed to save plan", variant: "destructive" });
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      const { error } = await supabase.from("organization_plans").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Plan deleted" });
      fetchData();
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleSaveMou = async () => {
    try {
      const mouData = {
        title: mouForm.title,
        description: mouForm.description || null,
        document_url: mouForm.document_url || null,
        target_type: mouForm.target_type,
        is_active: mouForm.is_active,
        display_order: mouForm.display_order
      };

      if (editingMou) {
        const { error } = await supabase.from("mou_documents").update(mouData).eq("id", editingMou.id);
        if (error) throw error;
        toast({ title: "MoU updated successfully" });
      } else {
        const { error } = await supabase.from("mou_documents").insert(mouData);
        if (error) throw error;
        toast({ title: "MoU created successfully" });
      }

      setMouDialogOpen(false);
      resetMouForm();
      fetchData();
    } catch (error) {
      console.error("Error saving MoU:", error);
      toast({ title: "Failed to save MoU", variant: "destructive" });
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("organization_inquiries").update({ inquiry_status: status }).eq("id", id);
      if (error) throw error;
      toast({ title: "Status updated" });
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const resetPlanForm = () => {
    setPlanForm({
      name: "", description: "", plan_type: "school", price: 0, currency: "INR",
      billing_cycle: "monthly", features: "", max_events: "", max_resources: "",
      visibility_level: "basic", support_level: "standard", is_active: true, display_order: 0
    });
    setEditingPlan(null);
  };

  const resetMouForm = () => {
    setMouForm({ title: "", description: "", document_url: "", target_type: "school", is_active: true, display_order: 0 });
    setEditingMou(null);
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description || "",
      plan_type: plan.plan_type,
      price: plan.price,
      currency: plan.currency,
      billing_cycle: plan.billing_cycle,
      features: plan.features.join('\n'),
      max_events: plan.max_events?.toString() || "",
      max_resources: plan.max_resources?.toString() || "",
      visibility_level: plan.visibility_level,
      support_level: plan.support_level,
      is_active: plan.is_active,
      display_order: plan.display_order
    });
    setPlanDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> New</Badge>;
      case 'contacted': return <Badge className="bg-sky-500/10 text-sky-500">Contacted</Badge>;
      case 'in_discussion': return <Badge className="bg-amber-500/10 text-amber-500">In Discussion</Badge>;
      case 'converted': return <Badge className="bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Converted</Badge>;
      case 'closed': return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" /> Closed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Organization Plans & MoUs">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Organization Plans & MoUs">
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Pricing Plans</TabsTrigger>
          <TabsTrigger value="mou">MoU Documents</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries ({inquiries.filter(i => i.inquiry_status === 'new').length})</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Pricing Plans</h2>
              <p className="text-muted-foreground">Manage plans for schools, colleges, and partners</p>
            </div>
            <Dialog open={planDialogOpen} onOpenChange={(open) => { setPlanDialogOpen(open); if (!open) resetPlanForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Add Plan</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Plan Name *</Label>
                      <Input value={planForm.name} onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Plan Type *</Label>
                      <Select value={planForm.plan_type} onValueChange={(v) => setPlanForm(prev => ({ ...prev, plan_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                          <SelectItem value="partner">Partner Company</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={planForm.description} onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input type="number" value={planForm.price} onChange={(e) => setPlanForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select value={planForm.currency} onValueChange={(v) => setPlanForm(prev => ({ ...prev, currency: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Billing Cycle</Label>
                      <Select value={planForm.billing_cycle} onValueChange={(v) => setPlanForm(prev => ({ ...prev, billing_cycle: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="one-time">One-time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Features (one per line)</Label>
                    <Textarea rows={4} value={planForm.features} onChange={(e) => setPlanForm(prev => ({ ...prev, features: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max Events</Label>
                      <Input type="number" value={planForm.max_events} onChange={(e) => setPlanForm(prev => ({ ...prev, max_events: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Resources</Label>
                      <Input type="number" value={planForm.max_resources} onChange={(e) => setPlanForm(prev => ({ ...prev, max_resources: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Label>Active</Label>
                    <Switch checked={planForm.is_active} onCheckedChange={(c) => setPlanForm(prev => ({ ...prev, is_active: c }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setPlanDialogOpen(false); resetPlanForm(); }}>Cancel</Button>
                  <Button onClick={handleSavePlan}>Save Plan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {["school", "college", "partner"].map(type => {
              const typePlans = plans.filter(p => p.plan_type === type);
              if (typePlans.length === 0) return null;
              return (
                <Card key={type}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 capitalize">
                      <Building2 className="w-4 h-4" /> {type} Plans
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Billing</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {typePlans.map(plan => (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">{plan.name}</TableCell>
                            <TableCell>{plan.currency} {plan.price}</TableCell>
                            <TableCell className="capitalize">{plan.billing_cycle}</TableCell>
                            <TableCell>
                              <Badge variant={plan.is_active ? "default" : "secondary"}>
                                {plan.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditPlan(plan)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* MoU Tab */}
        <TabsContent value="mou" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">MoU Documents</h2>
              <p className="text-muted-foreground">Manage MoU templates for organizations</p>
            </div>
            <Dialog open={mouDialogOpen} onOpenChange={(open) => { setMouDialogOpen(open); if (!open) resetMouForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Add MoU</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingMou ? "Edit MoU" : "Create MoU"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input value={mouForm.title} onChange={(e) => setMouForm(prev => ({ ...prev, title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Type *</Label>
                    <Select value={mouForm.target_type} onValueChange={(v) => setMouForm(prev => ({ ...prev, target_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="partner">Partner Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={mouForm.description} onChange={(e) => setMouForm(prev => ({ ...prev, description: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Document URL</Label>
                    <Input value={mouForm.document_url} onChange={(e) => setMouForm(prev => ({ ...prev, document_url: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div className="flex items-center gap-4">
                    <Label>Active</Label>
                    <Switch checked={mouForm.is_active} onCheckedChange={(c) => setMouForm(prev => ({ ...prev, is_active: c }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setMouDialogOpen(false); resetMouForm(); }}>Cancel</Button>
                  <Button onClick={handleSaveMou}>Save MoU</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mous.map(mou => (
                <TableRow key={mou.id}>
                  <TableCell className="font-medium">{mou.title}</TableCell>
                  <TableCell className="capitalize">{mou.target_type}</TableCell>
                  <TableCell>
                    {mou.document_url ? (
                      <a href={mou.document_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        View Document
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No document</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={mou.is_active ? "default" : "secondary"}>
                      {mou.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingMou(mou);
                        setMouForm({
                          title: mou.title,
                          description: mou.description || "",
                          document_url: mou.document_url || "",
                          target_type: mou.target_type,
                          is_active: mou.is_active,
                          display_order: mou.display_order
                        });
                        setMouDialogOpen(true);
                      }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={async () => {
                        if (!confirm("Delete this MoU?")) return;
                        await supabase.from("mou_documents").delete().eq("id", mou.id);
                        fetchData();
                      }}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Organization Inquiries</h2>
            <p className="text-muted-foreground">Track and manage onboarding requests</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map(inquiry => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{inquiry.organization_name}</p>
                      <p className="text-sm text-muted-foreground">{inquiry.contact_name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{inquiry.organization_type}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{inquiry.contact_email}</p>
                      {inquiry.contact_phone && <p className="text-muted-foreground">{inquiry.contact_phone}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(inquiry.inquiry_status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select value={inquiry.inquiry_status} onValueChange={(v) => handleUpdateInquiryStatus(inquiry.id, v)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="in_discussion">In Discussion</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminOrganizationPlans;
