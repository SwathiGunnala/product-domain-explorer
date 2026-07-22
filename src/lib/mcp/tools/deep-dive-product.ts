import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "deep_dive_product",
  title: "Deep-dive on a product",
  description:
    "Generate a structured product deep-dive: vision, customer segments, revenue streams, and what's next (past/now/next, threats & opportunities).",
  inputSchema: {
    product: z.string().min(1).describe("Product name, e.g. 'Stripe', 'Zocdoc'."),
    company: z.string().optional().describe("Company name if different from product."),
    domain: z.string().optional().describe("Industry domain the product belongs to."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ product, company, domain }) => {
    const base = process.env.SUPABASE_URL;
    if (!base) return { content: [{ type: "text", text: "SUPABASE_URL not configured" }], isError: true };
    const resp = await fetch(`${base}/functions/v1/generate-product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, company, domain }),
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
