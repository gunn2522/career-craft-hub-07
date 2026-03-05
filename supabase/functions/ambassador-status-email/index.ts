import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { applicationId, status, applicantName, applicantEmail } = await req.json();

    if (!applicationId || !status || !applicantEmail || !applicantName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize inputs
    const safeName = applicantName.replace(/<[^>]*>/g, "").slice(0, 100);
    const safeEmail = applicantEmail.replace(/<[^>]*>/g, "").slice(0, 255);
    const safeStatus = ["approved", "rejected", "reviewed"].includes(status) ? status : null;

    if (!safeStatus) {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If approved, assign 'ambassador' role to the applicant
    if (safeStatus === "approved") {
      // Get the user_id from the application
      const { data: appData } = await supabase
        .from("ambassador_applications")
        .select("user_id")
        .eq("id", applicationId)
        .single();

      if (appData?.user_id) {
        // Update user role to ambassador
        await supabase
          .from("user_roles")
          .update({ role: "ambassador" })
          .eq("user_id", appData.user_id);
      }
    }

    // Generate email content
    let subject = "";
    let htmlBody = "";

    if (safeStatus === "approved") {
      subject = "🎉 Congratulations! You're Selected as a C-Cell Crafter";
      htmlBody = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #FF6B35, #FF8F5E); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Welcome, Crafter!</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${safeName}</strong>,</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              We are thrilled to inform you that your application to become a <strong>C-Cell Crafter</strong> has been <span style="color: #22c55e; font-weight: bold;">APPROVED</span>! 🎊
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              You are now part of an exclusive group of student leaders who will bridge the gap between industry and academia at your college.
            </p>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px; color: #FF6B35;">Next Steps:</h3>
              <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
                <li>Log in to access your <strong>Ambassador Dashboard</strong></li>
                <li>Host your first campus event</li>
                <li>Build your community by inviting students</li>
                <li>Upload event media and track your impact</li>
              </ul>
            </div>
            <p style="font-size: 14px; color: #888; margin-top: 30px;">— The Career Craft Cafe Team</p>
          </div>
        </div>
      `;
    } else if (safeStatus === "rejected") {
      subject = "Update on Your C-Cell Crafter Application";
      htmlBody = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Application Update</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${safeName}</strong>,</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Thank you for your interest in the C-Cell Crafter Program. After careful review, we regret to inform you that we are unable to move forward with your application at this time.
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              This doesn't reflect on your potential — we encourage you to apply again in the next selection cycle.
            </p>
            <p style="font-size: 14px; color: #888; margin-top: 30px;">— The Career Craft Cafe Team</p>
          </div>
        </div>
      `;
    } else {
      subject = "Your C-Cell Crafter Application is Under Review";
      htmlBody = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #3b82f6, #60a5fa); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Application Under Review</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${safeName}</strong>,</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your C-Cell Crafter application is currently being reviewed by our team. We'll get back to you soon with a decision.
            </p>
            <p style="font-size: 14px; color: #888; margin-top: 30px;">— The Career Craft Cafe Team</p>
          </div>
        </div>
      `;
    }

    // Send email using Lovable AI
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (lovableApiKey) {
      try {
        const emailRes = await fetch("https://api.lovable.dev/v1/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            to: safeEmail,
            subject,
            html: htmlBody,
            purpose: "transactional",
          }),
        });

        if (!emailRes.ok) {
          const errText = await emailRes.text();
          console.error("Email send failed:", errText);
        } else {
          console.log(`Email sent to ${safeEmail} for status ${safeStatus}`);
        }
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }
    } else {
      console.warn("LOVABLE_API_KEY not configured, email not sent");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Status updated to ${safeStatus}. Email notification sent to ${safeEmail}.`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
