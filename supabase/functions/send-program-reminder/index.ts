import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HTML escape function to prevent XSS/injection
const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// UUID validation regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Input validation
const validateInput = (data: any): { valid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }

  const { registration_id, send_all_pending } = data;

  // At least one must be provided
  if (!registration_id && send_all_pending !== true) {
    return { valid: false, error: "Either registration_id or send_all_pending must be provided" };
  }

  // Validate registration_id if provided
  if (registration_id !== undefined) {
    if (typeof registration_id !== 'string') {
      return { valid: false, error: "registration_id must be a string" };
    }
    if (!uuidRegex.test(registration_id)) {
      return { valid: false, error: "registration_id must be a valid UUID" };
    }
  }

  // Validate send_all_pending if provided
  if (send_all_pending !== undefined && typeof send_all_pending !== 'boolean') {
    return { valid: false, error: "send_all_pending must be a boolean" };
  }

  return { valid: true };
};

interface ReminderRequest {
  registration_id?: string;
  send_all_pending?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-program-reminder function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let data;
    try {
      data = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate input
    const validation = validateInput(data);
    if (!validation.valid) {
      console.log("Validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { registration_id, send_all_pending }: ReminderRequest = data;
    
    let registrations: any[] = [];

    if (send_all_pending) {
      // Get all pending registrations that haven't been reminded in the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: regData, error } = await supabase
        .from("program_registrations")
        .select(`
          *,
          programs!inner(name, duration, is_free, price, currency)
        `)
        .eq("payment_status", "pending")
        .or(`last_reminder_sent.is.null,last_reminder_sent.lt.${twentyFourHoursAgo}`)
        .lt("reminder_count", 3);

      if (error) throw error;
      registrations = regData || [];
    } else if (registration_id) {
      // Using parameterized query - registration_id is already validated as UUID
      const { data: regData, error } = await supabase
        .from("program_registrations")
        .select(`
          *,
          programs!inner(name, duration, is_free, price, currency)
        `)
        .eq("id", registration_id)
        .single();

      if (error) throw error;
      if (regData) registrations = [regData];
    }

    console.log(`Processing ${registrations.length} reminders`);

    const results = [];

    for (const reg of registrations) {
      const program = reg.programs;
      
      // Escape all user-provided data for HTML
      const safeName = escapeHtml(reg.full_name);
      const safeProgramName = escapeHtml(program.name);
      const safeDuration = escapeHtml(program.duration);
      
      const currencySymbol = program.currency === "INR" ? "₹" : "$";
      const priceText = program.is_free ? "Free" : `${currencySymbol}${(program.price || 0).toLocaleString()}`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .highlight { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
              .cta { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">⏰ Complete Your Registration!</h1>
              </div>
              <div class="content">
                <p>Hello <strong>${safeName}</strong>,</p>
                <p>We noticed you haven't completed your payment for the program. Don't miss out on this opportunity!</p>
                
                <div class="highlight">
                  <h3 style="margin-top: 0; color: #f59e0b;">Program Details</h3>
                  <p><strong>Program:</strong> ${safeProgramName}</p>
                  ${safeDuration ? `<p><strong>Duration:</strong> ${safeDuration}</p>` : ''}
                  <p><strong>Fee:</strong> ${escapeHtml(priceText)}</p>
                </div>
                
                <p><strong>Why Complete Your Registration?</strong></p>
                <ul>
                  <li>Secure your spot before it fills up</li>
                  <li>Get early access to program materials</li>
                  <li>Join our community of ambitious learners</li>
                </ul>
                
                <p>Our team is here to help if you have any questions about the payment process.</p>
                
                <p>Best regards,<br><strong>Career Craft Café Team</strong></p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Career Craft Café. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      try {
        const emailResponse = await resend.emails.send({
          from: "Career Craft Café <onboarding@resend.dev>",
          to: [reg.email],
          subject: `⏰ Reminder: Complete Your Registration for ${safeProgramName}`,
          html: emailHtml,
        });

        // Update the registration with reminder count and timestamp
        await supabase
          .from("program_registrations")
          .update({
            reminder_count: (reg.reminder_count || 0) + 1,
            last_reminder_sent: new Date().toISOString(),
          })
          .eq("id", reg.id);

        results.push({ id: reg.id, success: true, emailResponse });
        console.log(`Reminder sent to ${reg.email}`);
      } catch (emailError: any) {
        console.error(`Failed to send reminder to ${reg.email}:`, emailError);
        results.push({ id: reg.id, success: false, error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${registrations.length} reminders`,
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-program-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);