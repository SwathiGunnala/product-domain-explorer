import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const tool = {
  type: "function",
  function: {
    name: "generate_questions",
    description: "Return PM interview questions tailored to a domain.",
    parameters: {
      type: "object",
      properties: {
        groups: {
          type: "array", minItems: 5, maxItems: 6,
          items: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                enum: ["Product sense", "User & segments", "Strategy", "Metrics", "Design / improve", "Estimation"],
              },
              icon: { type: "string" },
              questions: {
                type: "array", minItems: 2, maxItems: 3,
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
                    hint: { type: "string", description: "Optional 1-line framing hint" },
                  },
                  required: ["question", "difficulty", "hint"],
                  additionalProperties: false,
                },
              },
            },
            required: ["topic", "icon", "questions"],
            additionalProperties: false,
          },
        },
      },
      required: ["groups"],
      additionalProperties: false,
    },
  },
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; body: string }>();

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { domain, products } = await req.json();
    if (!domain) throw new Error("Missing domain");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const productList = Array.isArray(products) && products.length ? `Notable products in this domain: ${products.join(", ")}.` : "";
    const key = `v2:${(domain || "").toLowerCase()}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      return new Response(hit.body, { headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" } });
    }

    const buildBody = (model: string, priority: boolean) => {
      const b: Record<string, unknown> = {
        model,
        messages: [
          { role: "system", content: "You generate realistic Product Manager interview questions. Tailor them tightly to the domain. Mix difficulties. Reference only real, currently-operating products and companies under their current names, and reflect the industry's present-day dynamics, regulation and technology. Never reference defunct or renamed products as if current." },
          { role: "user", content: `Today's date is ${new Date().toISOString().slice(0, 10)}. Generate PM interview questions for the "${domain}" domain, grounded in how it works today. ${productList}` },

        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "generate_questions" } },
      };
      if (priority) b.service_tier = "priority";
      return b;
    };
    const call = (model: string, priority: boolean) => fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildBody(model, priority)),
    });

    let resp = await call("openai/gpt-5.4-mini", true);
    if (!resp.ok && resp.status !== 402) {
      const t = await resp.text().catch(() => "");
      console.warn("Primary model failed, falling back:", resp.status, t.slice(0, 200));
      resp = await call("google/gemini-3.5-flash", false);
    }

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
    const bodyStr = JSON.stringify(parsed);
    cache.set(key, { at: Date.now(), body: bodyStr });
    return new Response(bodyStr, { headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" } });
  } catch (e) {
    console.error("generate-questions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
