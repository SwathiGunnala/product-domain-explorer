# Add curated tiles for the missing domains

Expand the domain catalog from 36 to ~70 curated tiles so the gaps I listed become one-click selectable options, with icons, taglines, and category colors like the existing ones.

## New domains by category

**Finance & Money** — Lending & BNPL, Accounting & Tax, Payroll & HR Tech, Capital Markets, RegTech & Compliance, Merchant Solutions

**Mobility & Travel** — Travel Booking, Maritime & Shipping, Space, Public Transit

**Health & Life** — Elder Care, Childcare, Health Insurance Tech (payers), Medical Devices

**Tech & Industry** — Telecom, Semiconductors, Data Platforms, MarTech & AdTech, CRM & Sales Tech, Customer Support, ERP, Procurement & Supply Chain

**Commerce & Consumer** — Marketplaces, Subscription Boxes, Beauty, Pets, Home Services

**Learn & Play** — Sports, Music, Creator Economy, Dating, Ticketing & Events

**Real-world** — Government & GovTech, Legal Tech, Defense & Aerospace, Climate Tech, Mining & Materials, Water & Waste, Recruiting & Job Marketplaces, Non-profit

All of these slot into the seven existing categories, so the color system, filters, compare view, and MCP category filter keep working unchanged.

## Technical notes

- Single edit to `src/data/domains.ts`: append the new `DomainDef` entries with unique slugs, short taglines (max ~5 words), and existing category keys.
- Icons: each new tile uses a Lucide icon name already registered in `src/lib/iconMap.ts` (e.g. `HandCoins`, `Calculator`, `Briefcase`, `LineChart`, `Scale`, `Store`, `Ship`, `Rocket`, `Phone`, `Cpu`, `Database`, `Target`, `Users`, `MessageSquare`, `Package`, `Warehouse`, `Heart`, `Trophy`, `PlayCircle`, `Gavel`, `Globe`, `Wrench`). If a better-fitting icon isn't registered yet, add it to the import + `Icons` map in `iconMap.ts`.
- Content for each new tile is generated on demand by the existing `generate-domain` function — no schema, edge-function, or database change needed.
- `src/lib/mcp/tools/list-domains.ts` picks up the new entries automatically; the MCP function gets rebundled and redeployed so agents see the full list.
- Homepage grid and search already render from `DOMAINS`, so no page changes; I'll verify the grid still reads well at the larger count and keep category sections scannable.
