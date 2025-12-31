import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, Mail, Send, Users } from "lucide-react";

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  payment_status: string;
  payment_amount: number | null;
  reminder_count: number;
  created_at: string;
  programs: { name: string; is_free: boolean; currency: string | null };
}

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchRegistrations(); }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("program_registrations")
        .select("*, programs(name, is_free, currency)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally { setIsLoading(false); }
  };

  const markAsPaid = async (id: string) => {
    try {
      const { error } = await supabase.from("program_registrations").update({ payment_status: "completed" }).eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Payment marked as completed" });
      fetchRegistrations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const sendReminder = async (id: string) => {
    try {
      await supabase.functions.invoke("send-program-reminder", { body: { registration_id: id } });
      toast({ title: "Reminder Sent", description: "Email reminder sent successfully" });
      fetchRegistrations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to send reminder", variant: "destructive" });
    }
  };

  const sendAllReminders = async () => {
    try {
      const { data } = await supabase.functions.invoke("send-program-reminder", { body: { send_all_pending: true } });
      toast({ title: "Reminders Sent", description: `Processed ${data?.results?.length || 0} reminders` });
      fetchRegistrations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to send reminders", variant: "destructive" });
    }
  };

  const pending = registrations.filter(r => r.payment_status === "pending");
  const completed = registrations.filter(r => r.payment_status === "completed");

  return (
    <AdminLayout title="Program Registrations">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500">
            <Clock className="w-4 h-4" /><span>{pending.length} Pending</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-500">
            <CheckCircle2 className="w-4 h-4" /><span>{completed.length} Completed</span>
          </div>
        </div>
        <Button onClick={sendAllReminders} variant="outline"><Send className="w-4 h-4 mr-2" />Send All Reminders</Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : registrations.length === 0 ? (
        <Card className="p-12 text-center"><Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h3 className="text-xl font-semibold">No registrations yet</h3></Card>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <Card key={reg.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{reg.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{reg.email} • {reg.programs?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(reg.created_at).toLocaleDateString()} • Reminders: {reg.reminder_count}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${reg.payment_status === "completed" ? "bg-green-500/20 text-green-500" : "bg-amber-500/20 text-amber-500"}`}>
                    {reg.programs?.is_free ? "Free" : `₹${reg.payment_amount}`} - {reg.payment_status}
                  </span>
                  {reg.payment_status === "pending" && !reg.programs?.is_free && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => sendReminder(reg.id)}><Mail className="w-4 h-4" /></Button>
                      <Button size="sm" onClick={() => markAsPaid(reg.id)}><CheckCircle2 className="w-4 h-4 mr-1" />Mark Paid</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRegistrations;