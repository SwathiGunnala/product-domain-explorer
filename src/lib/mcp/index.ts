import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listDomains from "./tools/list-domains";
import explainDomain from "./tools/explain-domain";
import deepDiveProduct from "./tools/deep-dive-product";
import pmInterviewQuestions from "./tools/pm-interview-questions";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "domain-explorer-mcp",
  title: "Domain Explorer",
  version: "0.1.0",
  instructions:
    "Tools for exploring industries the way a Product Manager would. Use `list_domains` to see what's available, `explain_domain` for a visual-first breakdown (users, JTBD, process, architecture, opportunities, products), `deep_dive_product` for a specific product's vision/segments/revenue/what's-next, and `pm_interview_questions` for domain-tailored PM interview prep.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listDomains, explainDomain, deepDiveProduct, pmInterviewQuestions],
});
