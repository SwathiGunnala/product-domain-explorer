import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const tool = {
  type: "function",
  function: {
    name: "describe_product",
    description: "Return a structured deep-dive on a specific product/company.",
    parameters: {
      type: "object",
      properties: {
        vision: {
          type: "object",
          properties: {
            statement: { type: "string", description: "1-2 sentence vision statement." },
            why: { type: "string", description: "Why this matters." },
          },
          required: ["statement", "why"],
          additionalProperties: false,
        },
        segments: {
          type: "array", minItems: 2, maxItems: 5,
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              share: { type: "integer", minimum: 1, maximum: 100, description: "Approx % share of usage/revenue (estimates ok). All segments should sum to ~100." },
              need: { type: "string" },
              icon: { type: "string" },
            },
            required: ["name", "share", "need", "icon"],
            additionalProperties: false,
          },
        },
        revenue: {
          type: "object",
          properties: {
            scale: { type: "string", description: "Rough scale, e.g. '$10B annual revenue (2024)'" },
            streams: {
              type: "array", minItems: 2, maxItems: 5,
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "e.g. 'Subscription', 'Transaction fees'" },
                  share: { type: "integer", minimum: 1, maximum: 100 },
                  description: { type: "string" },
                  icon: { type: "string" },
                },
                required: ["name", "share", "description", "icon"],
                additionalProperties: false,
              },
            },
          },
          required: ["scale", "streams"],
          additionalProperties: false,
        },
        whatsNext: {
          type: "object",
          properties: {
            past: { type: "string", description: "Key recent achievement or pivot." },
            now: { type: "string", description: "Current strategic focus." },
            next: { type: "string", description: "What's coming / strategic bets." },
            threats: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
            opportunities: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
          },
          required: ["past", "now", "next", "threats", "opportunities"],
          additionalProperties: false,
        },
      },
      required: ["vision", "segments", "revenue", "whatsNext"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { product, company, domain } = await req.json();
    if (!product) throw new Error("Missing product");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are a product strategist. Produce VISUAL-FIRST deep-dives — terse copy only, every field is scannable. STRICT WORD LIMITS (hard caps):
- vision.statement: max 15 words
- vision.why: max 12 words
- segment.name: max 4 words; segment.need: max 8 words
- revenue.scale: max 8 words (e.g. "$10B annual (2024)")
- stream.name: max 3 words; stream.description: max 8 words
- whatsNext.past / now / next: max 12 words each
- threats / opportunities items: max 8 words each
No filler, no marketing fluff. Use rough public estimates; flag with "~" if approximate. Shares should sum to ~100.` },
          { role: "user", content: `Deep-dive on the product "${product}"${company ? ` by ${company}` : ""}${domain ? ` in the ${domain} domain` : ""}. Be specific.` },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "describe_product" } },
      }),
    });

    if (!resp.ok) {
      const status = resp.status;
      const t = await resp.text();
      console.error("AI gateway error:", status, t);
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Cloud → Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No tool call returned");
    const parsed = JSON.parse(args);
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-product error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
