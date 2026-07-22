import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { DOMAINS, CATEGORIES } from "../../../data/domains";

export default defineTool({
  name: "list_domains",
  title: "List domains",
  description: "List every curated industry domain available in Domain Explorer, optionally filtered by category.",
  inputSchema: {
    category: z
      .enum(["finance", "mobility", "health", "tech", "commerce", "play", "real"])
      .optional()
      .describe("Optional category filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category }) => {
    const items = category ? DOMAINS.filter((d) => d.category === category) : DOMAINS;
    const payload = {
      categories: CATEGORIES,
      domains: items.map((d) => ({ slug: d.slug, name: d.name, tagline: d.tagline, category: d.category })),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
