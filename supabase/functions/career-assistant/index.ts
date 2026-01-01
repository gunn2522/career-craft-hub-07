import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_MESSAGE_LENGTH = 10000;
const MAX_CONVERSATION_HISTORY = 50;
const MAX_TARGET_ROLE_LENGTH = 200;

// Validation helper
const validateInput = (data: any): { valid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }

  const { message, targetRole, conversationHistory } = data;

  // Validate message
  if (!message || typeof message !== 'string') {
    return { valid: false, error: "Message is required and must be a string" };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
  }
  if (message.trim().length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }

  // Validate targetRole if provided
  if (targetRole !== undefined) {
    if (typeof targetRole !== 'string') {
      return { valid: false, error: "Target role must be a string" };
    }
    if (targetRole.length > MAX_TARGET_ROLE_LENGTH) {
      return { valid: false, error: `Target role exceeds maximum length of ${MAX_TARGET_ROLE_LENGTH} characters` };
    }
  }

  // Validate conversationHistory if provided
  if (conversationHistory !== undefined) {
    if (!Array.isArray(conversationHistory)) {
      return { valid: false, error: "Conversation history must be an array" };
    }
    if (conversationHistory.length > MAX_CONVERSATION_HISTORY) {
      return { valid: false, error: `Conversation history exceeds maximum of ${MAX_CONVERSATION_HISTORY} messages` };
    }
    
    for (let i = 0; i < conversationHistory.length; i++) {
      const msg = conversationHistory[i];
      if (!msg || typeof msg !== 'object') {
        return { valid: false, error: `Invalid message at position ${i}` };
      }
      if (!['user', 'assistant'].includes(msg.role)) {
        return { valid: false, error: `Invalid role at position ${i}. Must be 'user' or 'assistant'` };
      }
      if (typeof msg.content !== 'string') {
        return { valid: false, error: `Invalid content at position ${i}. Must be a string` };
      }
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return { valid: false, error: `Message at position ${i} exceeds maximum length` };
      }
    }
  }

  return { valid: true };
};

// Sanitize text to remove potential prompt injection patterns
const sanitizeText = (text: string): string => {
  // Remove potential system prompt injection attempts
  return text
    .replace(/\[SYSTEM\]/gi, '')
    .replace(/\[INST\]/gi, '')
    .replace(/<<SYS>>/gi, '')
    .replace(/<\/SYS>>/gi, '')
    .trim();
};

serve(async (req) => {
  // Handle CORS preflight requests
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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input
    const validation = validateInput(data);
    if (!validation.valid) {
      console.log("Validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, targetRole, conversationHistory } = data;

    // Sanitize inputs
    const sanitizedMessage = sanitizeText(message);
    const sanitizedTargetRole = targetRole ? sanitizeText(targetRole) : undefined;
    const sanitizedHistory = (conversationHistory || []).map((msg: any) => ({
      role: msg.role,
      content: sanitizeText(msg.content)
    }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert AI Career Assistant for Career Craft Cafe, a career development platform. Your role is to help users navigate their career journey with practical, actionable advice.

${sanitizedTargetRole ? `The user is working towards becoming a ${sanitizedTargetRole}.` : ""}

Your expertise includes:
- Career planning and goal setting
- Interview preparation and techniques
- Resume and portfolio building
- Skill development recommendations
- Industry trends and insights
- Networking strategies
- Job search strategies
- Professional development

Guidelines:
- Be encouraging and supportive
- Provide specific, actionable advice
- Use examples when helpful
- Keep responses concise but comprehensive
- Ask clarifying questions when needed
- Reference the user's target role when relevant
- Stay professional and career-focused`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...sanitizedHistory,
      { role: "user", content: sanitizedMessage }
    ];

    console.log("Calling Lovable AI Gateway for career advice...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const responseData = await response.json();
    const aiResponse = responseData.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    console.log("Successfully received AI response");

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in career-assistant function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});