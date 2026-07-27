import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bump when the schema or prompt changes so stale cached content is regenerated.
export const CONTENT_VERSION = 3;

// In-memory cache (per edge-instance). 24h TTL. Warm hits return in <100ms.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; body: string }>();
const cacheKey = (domain: string) => `v${CONTENT_VERSION}:${domain.trim().toLowerCase()}`;


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
            flow: {
              type: "array",
              description: "Ordered sequence of interactions showing how the system works step-by-step.",
              items: {
                type: "object",
                properties: {
                  step: { type: "integer", description: "1-based step number" },
                  from: { type: "string", description: "node id of the actor initiating this step" },
                  to: { type: "string", description: "node id of the receiver" },
                  action: { type: "string", description: "what happens at this step (verb phrase, max 6 words)" },
                  kind: { type: "string", description: "one of: forward, return" },
                },
                required: ["step", "from", "to", "action", "kind"],
              },
            },
          },
          required: ["layers", "flow"],
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
        playbook: {
          type: "object",
          description: "Common patterns a product leader should think about in this domain.",
          properties: {
            ux: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  detail: { type: "string" },
                  watchout: { type: "string" },
                  icon: { type: "string" },
                },
                required: ["title", "detail", "watchout", "icon"],
              },
            },
            gtm: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  detail: { type: "string" },
                  watchout: { type: "string" },
                  icon: { type: "string" },
                },
                required: ["title", "detail", "watchout", "icon"],
              },
            },
            challenges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  detail: { type: "string" },
                  watchout: { type: "string" },
                  icon: { type: "string" },
                },
                required: ["title", "detail", "watchout", "icon"],
              },
            },
          },
          required: ["ux", "gtm", "challenges"],
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
      required: ["tagline", "overview", "terminology", "users", "jobs", "process", "architecture", "opportunities", "playbook", "products"],
    },

  },
};

const SYSTEM_PROMPT = `You are an expert industry analyst. Produce VISUAL-FIRST explainers — extremely terse copy, every field is scannable.

ACCURACY RULES (CRITICAL):
- Reflect the CURRENT state of the industry as of the date given in the user message. Prefer the most recent verified reality over older textbook descriptions.
- Only name companies/products that exist TODAY under that name. Never list defunct, acquired-and-retired, or renamed entities (use the current name, e.g. the post-rebrand name).
- Every stat must be a real, publicly reported figure. Prefix estimates with "~" and include the year in the value or hint (e.g. "~$2.1T (2025)"). Never fabricate precise-looking numbers.
- Terminology, process steps and architecture must match how the domain actually operates now, including recent regulatory or technology shifts.
- If you are not confident a number or a name is correct, use a qualitative value instead of guessing.



ICON RULES (CRITICAL): Every "icon" field MUST be a valid Lucide React icon name in PascalCase (e.g. "CreditCard", "Wallet", "ShieldCheck", "Users", "Building2", "Truck", "Stethoscope", "Banknote", "Globe", "Lock", "Server", "Database", "Cpu", "Smartphone", "Store", "Factory", "Plane", "Car", "BarChart3", "Sparkles", "Zap", "Target", "Workflow", "Network", "Package", "FileText", "Mail", "MessageSquare", "Search", "Settings", "AlertTriangle", "TrendingUp", "DollarSign", "ShoppingCart", "Bot", "Brain", "Cloud", "Layers", "GitBranch", "Plug", "Key", "Eye", "HeartPulse"). NEVER use emojis. NEVER use kebab-case. NEVER invent names. Pick a real Lucide icon that semantically fits the entity. Each user/persona, job, process step, architecture node, opportunity, and product MUST have a meaningful, distinct Lucide icon.

STRICT WORD LIMITS (hard caps, no exceptions):
- tagline: max 8 words
- overview.summary: max 18 words
- stat.value: max 3 words (prefer numbers/units like "$2.1T", "180+ countries")
- stat.label: max 3 words
- stat.hint: max 8 words
- term.definition: max 10 words
- user.goal: max 8 words
- job.title: max 5 words; job.pain: max 10 words; job.gain: max 10 words
- process.title: max 4 words; process.description: max 10 words
- architecture node.label: max 3 words; flow.action: max 6 words (verb phrase like "Sends auth request")
- architecture.flow: 6-10 ordered steps representing one complete end-to-end interaction. Steps must reference real node ids. Use kind="return" for response/settlement/reporting steps that flow back.
- opportunity.title: max 5 words; opportunity.description: max 12 words
- playbook item title: max 5 words; detail: max 12 words; watchout: max 10 words
- product.tagline: max 10 words
No filler, no marketing fluff, no full sentences where a phrase works. Use real product/company names.
playbook = what a product leader must internalize for THIS domain: ux = interaction/design patterns that make or break adoption; gtm = how products in this domain actually reach and monetize buyers (channels, motions, pricing, partnerships); challenges = regulatory, technical, trust, unit-economics or org traps. Be domain-specific, never generic advice.
Counts: exactly 4 stats; 4-6 terminology groups (2-6 terms each); 4-8 users (side ∈ supply|demand|enabler|regulator); 4-6 jobs; 4-7 process steps; 3-4 architecture layers (2-4 nodes); 6-10 flow steps; 4-6 opportunities (impact & feasibility 1-5); playbook.ux/gtm/challenges 3-4 items each; 6-8 products (category ∈ Incumbent|Challenger|Infrastructure|Niche).`;


async function callGateway(domain: string, apiKey: string, model: string, priority: boolean) {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Today's date is ${new Date().toISOString().slice(0, 10)}. Generate a complete visual explainer for the "${domain}" domain, reflecting how it works and who leads it as of today. Be specific to this domain, not generic. Use real, currently-operating product/company names and recent, sourced figures with their year.` },
    ],
    tools: [tool],
    tool_choice: { type: "function", function: { name: "describe_domain" } },
  };
  if (priority) body.service_tier = "priority";

  return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { domain } = await req.json();
    if (!domain) throw new Error("Missing domain");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Cache hit — instant return.
    const key = cacheKey(domain);
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      return new Response(hit.body, { headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" } });
    }

    // Primary: gpt-5.4-mini w/ priority (fast, cheap, strong for tool calls).
    let resp = await callGateway(domain, LOVABLE_API_KEY, "openai/gpt-5.4-mini", true);

    // Fallback to Gemini 3.5 Flash on gateway failure (rate-limit / transient).
    if (!resp.ok && resp.status !== 402) {
      const t = await resp.text().catch(() => "");
      console.warn("Primary model failed, falling back:", resp.status, t.slice(0, 200));
      resp = await callGateway(domain, LOVABLE_API_KEY, "google/gemini-3.5-flash", false);
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
    parsed.generatedAt = new Date().toISOString();
    parsed.contentVersion = CONTENT_VERSION;
    const bodyStr = JSON.stringify(parsed);

    cache.set(key, { at: Date.now(), body: bodyStr });
    return new Response(bodyStr, { headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" } });
  } catch (e) {
    console.error("generate-domain error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
