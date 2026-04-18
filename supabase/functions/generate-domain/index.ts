import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const tool = {
  type: "function",
  function: {
    name: "describe_domain",
    description: "Return a structured visual explainer for an industry/domain.",
    parameters: {
      type: "object",
      properties: {
        tagline: { type: "string", description: "1-line poetic tagline for the domain." },
        overview: {
          type: "object",
          properties: {
            summary: { type: "string", description: "2-3 sentence plain-English overview." },
            stats: {
              type: "array",
              minItems: 4, maxItems: 4,
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  value: { type: "string", description: "Short value/figure (e.g. '$2.5T', '~5B users')" },
                  hint: { type: "string", description: "1 line context" },
                  icon: { type: "string", description: "Lucide icon hint (e.g. 'Globe', 'Users', 'TrendingUp')" },
                },
                required: ["label", "value", "hint", "icon"],
                additionalProperties: false,
              },
            },
          },
          required: ["summary", "stats"],
          additionalProperties: false,
        },
        terminology: {
          type: "array", minItems: 4, maxItems: 6,
          items: {
            type: "object",
            properties: {
              group: { type: "string" },
              groupIcon: { type: "string" },
              terms: {
                type: "array", minItems: 2, maxItems: 6,
                items: {
                  type: "object",
                  properties: {
                    term: { type: "string" },
                    definition: { type: "string" },
                    icon: { type: "string" },
                  },
                  required: ["term", "definition", "icon"],
                  additionalProperties: false,
                },
              },
            },
            required: ["group", "groupIcon", "terms"],
            additionalProperties: false,
          },
        },
        users: {
          type: "array", minItems: 4, maxItems: 8,
          items: {
            type: "object",
            properties: {
              role: { type: "string" },
              side: { type: "string", enum: ["supply", "demand", "enabler", "regulator"] },
              goal: { type: "string" },
              icon: { type: "string" },
            },
            required: ["role", "side", "goal", "icon"],
            additionalProperties: false,
          },
        },
        jobs: {
          type: "array", minItems: 4, maxItems: 6,
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "When I'm doing X..." },
              pain: { type: "string" },
              gain: { type: "string" },
              icon: { type: "string" },
            },
            required: ["title", "pain", "gain", "icon"],
            additionalProperties: false,
          },
        },
        process: {
          type: "array", minItems: 4, maxItems: 7,
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              icon: { type: "string" },
            },
            required: ["title", "description", "icon"],
            additionalProperties: false,
          },
        },
        architecture: {
          type: "object",
          properties: {
            layers: {
              type: "array", minItems: 3, maxItems: 4,
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "e.g. 'Frontend', 'Service', 'Data', 'External'" },
                  nodes: {
                    type: "array", minItems: 2, maxItems: 5,
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "kebab id, unique" },
                        label: { type: "string" },
                        icon: { type: "string" },
                      },
                      required: ["id", "label", "icon"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["name", "nodes"],
                additionalProperties: false,
              },
            },
            edges: {
              type: "array", minItems: 3, maxItems: 10,
              items: {
                type: "object",
                properties: {
                  from: { type: "string" },
                  to: { type: "string" },
                  label: { type: "string", description: "what flows" },
                },
                required: ["from", "to", "label"],
                additionalProperties: false,
              },
            },
          },
          required: ["layers", "edges"],
          additionalProperties: false,
        },
        opportunities: {
          type: "array", minItems: 4, maxItems: 6,
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              impact: { type: "integer", minimum: 1, maximum: 5 },
              feasibility: { type: "integer", minimum: 1, maximum: 5 },
              icon: { type: "string" },
            },
            required: ["title", "description", "impact", "feasibility", "icon"],
            additionalProperties: false,
          },
        },
        products: {
          type: "array", minItems: 6, maxItems: 8,
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              company: { type: "string" },
              tagline: { type: "string", description: "1-line description" },
              category: { type: "string", enum: ["Incumbent", "Challenger", "Infrastructure", "Niche"] },
              icon: { type: "string" },
            },
            required: ["name", "company", "tagline", "category", "icon"],
            additionalProperties: false,
          },
        },
      },
      required: ["tagline", "overview", "terminology", "users", "jobs", "process", "architecture", "opportunities", "products"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { domain } = await req.json();
    if (!domain) throw new Error("Missing domain");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert industry analyst and product strategist. Produce concise, visual, accurate explainers for any business/tech domain. Use specific, real-world examples. Keep prose tight." },
          { role: "user", content: `Generate a complete visual explainer for the "${domain}" domain. Be specific to this domain, not generic. Use real product/company names where appropriate.` },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "describe_domain" } },
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
    console.error("generate-domain error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
