import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "explain_domain",
  title: "Explain a domain",
  description:
    "Generate a structured visual explainer for an industry/domain: overview, terminology, users, jobs-to-be-done, process, architecture, opportunities, and notable products.",
  inputSchema: {
    domain: z.string().min(1).describe("Domain name, e.g. 'Payments', 'Healthcare', 'Robotics'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ domain }) => {
    const base = process.env.SUPABASE_URL;
    if (!base) return { content: [{ type: "text", text: "SUPABASE_URL not configured" }], isError: true };
    const resp = await fetch(`${base}/functions/v1/generate-domain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
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
