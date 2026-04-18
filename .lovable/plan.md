
## Domain Explorer v4 — visual-first explanations throughout

Adding rich visual explainers so concepts stick faster. Everything from v1–v3 stays; this update layers in diagrams, flows, and visual metaphors across every section.

### Where visuals get added

**1. Domain page sections — each gets a visual companion**

- **Overview** → a labeled "at-a-glance" infographic: 4 highlight stat tiles (e.g., market size, key players, typical user, maturity stage) with icons
- **Terminology** → a tag-cloud / chip grid where each term has its own small icon and color, grouped by concept family (e.g., in Payments: Money flow, Security, Parties, Tech rails)
- **User segments** → a persona card grid: avatar icon, role name, 1-line goal, color-coded by side of the transaction (e.g., supply / demand / enabler / regulator)
- **Jobs to be done** → numbered objective cards with an outcome icon and a "pain → gain" mini visual
- **End-to-end process** → a horizontal stepper diagram (numbered nodes connected by arrows), each step with an icon, title, and 1-line description; on mobile it stacks vertically
- **Architecture** → a block diagram rendered with HTML/CSS (boxes + connecting lines), showing components and labeled arrows for how they communicate; legend with color-coded layers (frontend / service / data / external)
- **Opportunities** → quadrant matrix (Impact × Feasibility) with opportunity dots placed on it, plus a list view below
- **Notable products** → already visual; product cards keep their icon + category dot

**2. Product deep-dive — visual sections**

- **Vision** → a single hero quote-style card with a target icon
- **Customer segments** → segment ring/donut split (visual % share if AI provides estimates) + persona chips
- **Revenue model** → revenue stream stack: horizontal bars labeled by stream (subscription, transaction fee, ads, etc.) with rough share if known
- **What's next** → timeline strip: Past → Now → Next, with milestone dots

**3. Interview prep — visual touches**

- Topic group headers with icon + colored underline
- Difficulty shown as 1/2/3 filled dots (Easy/Medium/Hard) instead of plain text
- Progress ring on the Interview Prep page: "X of Y questions reviewed"

### How the visuals are built

- All diagrams are **pure HTML + Tailwind + Lucide icons** (no chart library needed for v1) — keeps it fast, themeable, and AI-driveable
- AI returns structured data per section (e.g., process = array of `{title, description, icon}`; architecture = array of `{nodes, edges}`) via tool-calling, and React components render the visuals from that data
- A small set of reusable **visual primitives** in `src/components/visuals/`:
  - `StatTiles`, `TermChipGrid`, `PersonaGrid`, `JtbdCardList`, `ProcessStepper`, `ArchitectureDiagram`, `OpportunityMatrix`, `RevenueStack`, `Timeline`, `DifficultyDots`
- Each primitive is responsive and uses the category accent color from v3

### Iconography mapping (AI-suggested → Lucide)

The AI returns a semantic icon hint per item (e.g., `"shield"`, `"wallet"`, `"clock"`); a small `iconMap` in code maps it to a Lucide component, with a safe fallback (`Circle`). This keeps icons consistent and avoids broken imports.

### What stays the same
- v1: 7 core sections, AI streaming, local persistence, Library page
- v2: expanded domain catalog, clickable products with deep-dives, PM interview question prompt
- v3: domain icons, category colors, gradient tiles, icon-led section headers
