import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

// Email validation regex
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Input validation
const validateInput = (data: any): { valid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }

  const { to_email, to_name, program_name, is_free, payment_status } = data;

  // Required fields
  if (!to_email || typeof to_email !== 'string') {
    return { valid: false, error: "to_email is required and must be a string" };
  }
  if (!emailRegex.test(to_email)) {
    return { valid: false, error: "Invalid email format" };
  }
  if (to_email.length > 255) {
    return { valid: false, error: "Email exceeds maximum length" };
  }

  if (!to_name || typeof to_name !== 'string') {
    return { valid: false, error: "to_name is required and must be a string" };
  }
  if (to_name.length > 200) {
    return { valid: false, error: "Name exceeds maximum length of 200 characters" };
  }

  if (!program_name || typeof program_name !== 'string') {
    return { valid: false, error: "program_name is required and must be a string" };
  }
  if (program_name.length > 500) {
    return { valid: false, error: "Program name exceeds maximum length" };
  }

  if (typeof is_free !== 'boolean') {
    return { valid: false, error: "is_free must be a boolean" };
  }

  if (!payment_status || typeof payment_status !== 'string') {
    return { valid: false, error: "payment_status is required and must be a string" };
  }
  if (!['pending', 'completed', 'failed'].includes(payment_status)) {
    return { valid: false, error: "Invalid payment_status value" };
  }

  return { valid: true };
};

interface ConfirmationEmailRequest {
  to_email: string;
  to_name: string;
  program_name: string;
  program_duration: string | null;
  is_free: boolean;
  price: number | null;
  currency: string | null;
  payment_status: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-program-confirmation function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const {
      to_email,
      to_name,
      program_name,
      program_duration,
      is_free,
      price,
      currency,
      payment_status,
    }: ConfirmationEmailRequest = data;

    console.log("Sending confirmation email to:", to_email);

    // Escape all user-provided data for HTML
    const safeName = escapeHtml(to_name);
    const safeProgramName = escapeHtml(program_name);
    const safeDuration = escapeHtml(program_duration);

    const currencySymbol = currency === "INR" ? "₹" : "$";
    const priceText = is_free ? "Free" : `${currencySymbol}${(price || 0).toLocaleString()}`;
    const statusText = payment_status === "completed" 
      ? "Your payment has been confirmed!" 
      : is_free 
        ? "Your registration is confirmed!" 
        : "Your registration is pending payment confirmation.";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .highlight { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
            .status-completed { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 Thank You for Registering!</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${safeName}</strong>,</p>
              <p>We're thrilled to have you join us! ${escapeHtml(statusText)}</p>
              
              <div class="highlight">
                <h3 style="margin-top: 0; color: #6366f1;">Program Details</h3>
                <p><strong>Program:</strong> ${safeProgramName}</p>
                ${safeDuration ? `<p><strong>Duration:</strong> ${safeDuration}</p>` : ''}
                <p><strong>Fee:</strong> ${escapeHtml(priceText)}</p>
                <p class="status ${payment_status === 'completed' ? 'status-completed' : 'status-pending'}">
                  ${payment_status === 'completed' ? '✓ Payment Confirmed' : is_free ? '✓ Registration Complete' : '⏳ Awaiting Payment'}
                </p>
              </div>
              
              ${payment_status !== 'completed' && !is_free ? `
                <p><strong>Next Steps:</strong></p>
                <p>Please complete your payment to secure your spot. Our team will contact you shortly with payment details.</p>
              ` : `
                <p><strong>What's Next?</strong></p>
                <p>Our team will reach out to you soon with more details about the program, including the start date, schedule, and resources you'll need.</p>
              `}
              
              <p>If you have any questions, feel free to reach out to us.</p>
              
              <p>Best regards,<br><strong>Career Craft Café Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Career Craft Café. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Career Craft Café <onboarding@resend.dev>",
      to: [to_email],
      subject: `🎉 Registration Confirmed: ${safeProgramName}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
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