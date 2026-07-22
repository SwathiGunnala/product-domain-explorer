import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "pm_interview_questions",
  title: "PM interview questions",
  description:
    "Generate Product Manager interview questions tailored to a specific domain, grouped by topic (product sense, users, strategy, metrics, design, estimation).",
  inputSchema: {
    domain: z.string().min(1).describe("Domain name, e.g. 'Payments'."),
    products: z.array(z.string()).optional().describe("Optional notable products in the domain."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ domain, products }) => {
    const base = process.env.SUPABASE_URL;
    if (!base) return { content: [{ type: "text", text: "SUPABASE_URL not configured" }], isError: true };
    const resp = await fetch(`${base}/functions/v1/generate-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, products }),
    });
    const text = await resp.text();
    if (!resp.ok) return { content: [{ type: "text", text: `Failed (${resp.status}): ${text}` }], isError: true };
    try {
      const json = JSON.parse(text);
      return { content: [{ type: "text", text }], structuredContent: json };
    } catch {
      return { content: [{ type: "text", text }] };
    }
  },
});
