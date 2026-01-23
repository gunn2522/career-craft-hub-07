import { useState, useEffect } from "react";
import { InstitutionLayout } from "@/components/institution/InstitutionLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  FileSignature, 
  Download, 
  Send, 
  CheckCircle2, 
  Clock,
  FileText,
  Handshake,
  ExternalLink
} from "lucide-react";

interface MoUDocument {
  id: string;
  title: string;
  description: string | null;
  document_url: string | null;
  target_type: string;
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
  created_at: string;
}

const InstitutionMoU = () => {
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
    message: ""
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch MoU documents for institutions
      const { data: docsData } = await supabase
        .from("mou_documents")
        .select("*")
        .in("target_type", ["institution", "school", "college", "all"])
        .eq("is_active", true)
        .order("display_order");

      if (docsData) setDocuments(docsData);

      // Fetch user's inquiries
      if (user) {
        const { data: inquiriesData } = await supabase
          .from("organization_inquiries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (inquiriesData) setInquiries(inquiriesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please log in to submit an inquiry", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("organization_inquiries")
        .insert([{
          user_id: user.id,
          organization_type: "institution",
          organization_name: formData.organization_name,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone || null,
          message: formData.message || null,
          inquiry_status: "pending"
        }]);

      if (error) throw error;

      toast({ title: "Inquiry submitted successfully!", description: "We'll get back to you soon." });
      setFormData({
        organization_name: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        message: ""
      });
      fetchData();
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast({ title: "Failed to submit inquiry", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <InstitutionLayout title="MoU & Partnership">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout title="MoU & Partnership">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Handshake className="w-6 h-6 text-primary" />
            Partnership & MoU
          </h2>
          <p className="text-muted-foreground mt-1">
            Download MoU templates and initiate partnership discussions
          </p>
        </div>

        {/* MoU Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              MoU Templates
            </CardTitle>
            <CardDescription>
              Download the relevant MoU template for your institution type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No MoU templates available at the moment. Contact us for more information.
              </p>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileSignature className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{doc.title}</h4>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                        )}
                      </div>
                    </div>
                    {doc.document_url ? (
                      <Button asChild variant="outline" className="gap-2">
                        <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" /> Download
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Partnership Inquiry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Start Partnership Discussion
            </CardTitle>
            <CardDescription>
              Interested in partnering with Career Craft Cafe? Fill out this form and we'll get in touch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitInquiry} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organization_name">Institution Name *</Label>
                  <Input
                    id="organization_name"
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_name">Contact Person *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  placeholder="Tell us about your institution and how you'd like to collaborate..."
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous Inquiries */}
        {inquiries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{inquiry.organization_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Submitted on {new Date(inquiry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(inquiry.inquiry_status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </InstitutionLayout>
  );
};

export default InstitutionMoU;
