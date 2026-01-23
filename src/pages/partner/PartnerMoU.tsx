import { useState, useEffect } from "react";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FileSignature, Download, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

interface MoUDocument {
  id: string;
  title: string;
  description: string | null;
  document_url: string | null;
}

interface Inquiry {
  id: string;
  organization_name: string;
  message: string | null;
  inquiry_status: string;
  created_at: string;
}

const PartnerMoU = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<MoUDocument[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    organization_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    message: "",
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: docs } = await supabase
        .from("mou_documents")
        .select("*")
        .in("target_type", ["partner", "company", "all"])
        .eq("is_active", true);
      setDocuments(docs || []);

      if (user) {
        const { data: inqs } = await supabase
          .from("organization_inquiries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setInquiries(inqs || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await supabase.from("organization_inquiries").insert({
        ...formData,
        user_id: user?.id,
        organization_type: "partner",
        inquiry_status: "pending",
      });

      toast({ title: "Success", description: "Your inquiry has been submitted!" });
      setFormData({ organization_name: "", contact_name: "", contact_email: "", contact_phone: "", message: "" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit inquiry", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <PartnerLayout title="MoU & Onboarding">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout title="MoU & Onboarding">
      <div className="space-y-6">
        {/* MoU Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5" />
              Partnership Documents
            </CardTitle>
            <CardDescription>Download MoU templates and partnership agreements</CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No documents available</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="font-medium">{doc.title}</h4>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                      </div>
                    </div>
                    {doc.document_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-1" />Download
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Submit Inquiry */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Partnership Inquiry</CardTitle>
              <CardDescription>Get in touch to start the onboarding process</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Company Name" value={formData.organization_name} onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })} required />
                <Input placeholder="Contact Person" value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} required />
                <Input type="email" placeholder="Email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} required />
                <Input placeholder="Phone (optional)" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} />
                <Textarea placeholder="Tell us about your partnership interests..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Inquiry Status */}
          <Card>
            <CardHeader>
              <CardTitle>Your Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              {inquiries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No inquiries submitted yet</p>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{inquiry.organization_name}</h4>
                        {getStatusBadge(inquiry.inquiry_status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{inquiry.message || "No message"}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PartnerMoU;
