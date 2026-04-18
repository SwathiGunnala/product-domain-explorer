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
        tagline: { type: "string" },
        overview: {
          type: "object",
          properties: {
            summary: { type: "string" },
            stats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  value: { type: "string" },
                  hint: { type: "string" },
                  icon: { type: "string" },
                },
                required: ["label", "value", "hint", "icon"],
              },
            },
          },
          required: ["summary", "stats"],
        },
        terminology: {
          type: "array",
          items: {
            type: "object",
            properties: {
              group: { type: "string" },
              groupIcon: { type: "string" },
              terms: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    term: { type: "string" },
                    definition: { type: "string" },
                    icon: { type: "string" },
                  },
                  required: ["term", "definition", "icon"],
                },
              },
            },
            required: ["group", "groupIcon", "terms"],
          },
        },
        users: {
          type: "array",
          items: {
            type: "object",
            properties: {
              role: { type: "string" },
              side: { type: "string", description: "one of: supply, demand, enabler, regulator" },
              goal: { type: "string" },
              icon: { type: "string" },
            },
            required: ["role", "side", "goal", "icon"],
          },
        },
        jobs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              pain: { type: "string" },
              gain: { type: "string" },
              icon: { type: "string" },
            },
            required: ["title", "pain", "gain", "icon"],
          },
        },
        process: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              icon: { type: "string" },
            },
            required: ["title", "description", "icon"],
          },
        },
        architecture: {
          type: "object",
          properties: {
            layers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  nodes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        label: { type: "string" },
                        icon: { type: "string" },
                      },
                      required: ["id", "label", "icon"],
                    },
                  },
                },
                required: ["name", "nodes"],
              },
            },
            edges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string" },
                  to: { type: "string" },
                  label: { type: "string" },
                },
                required: ["from", "to", "label"],
              },
            },
          },
          required: ["layers", "edges"],
        },
        opportunities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              impact: { type: "integer" },
              feasibility: { type: "integer" },
              icon: { type: "string" },
            },
            required: ["title", "description", "impact", "feasibility", "icon"],
          },
        },
        products: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              company: { type: "string" },
              tagline: { type: "string" },
              category: { type: "string", description: "one of: Incumbent, Challenger, Infrastructure, Niche" },
              icon: { type: "string" },
            },
            required: ["name", "company", "tagline", "category", "icon"],
          },
        },
      },
      required: ["tagline", "overview", "terminology", "users", "jobs", "process", "architecture", "opportunities", "products"],
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
