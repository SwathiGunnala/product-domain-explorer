# Domain Explorer

> **AI-powered, visual-first industry learning for Product Managers**

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## 🎯 Why Domain Explorer Exists

As Product Managers, we're constantly thrown into new domains — payments, logistics, healthcare, AI platforms — and expected to ramp up fast. But industry knowledge is scattered across:
- Dense Wikipedia articles
- Scattered blog posts
- Internal wiki docs that are always outdated
- Books that take weeks to read

**The problem:** It takes days to weeks to build enough context to have meaningful conversations with stakeholders, customers, and engineers.

**Domain Explorer solves this** by generating a complete, visual industry primer in ~30 seconds. Think of it as a "product manager's cheat sheet" for any domain you need to understand, interview for, or build in.

---

## 📦 What It Does

Domain Explorer is a single-page application that generates comprehensive domain intelligence through AI. For any industry you explore, you get:

### 1. **Domain Overview**
- 4 stat tiles with key metrics (market size, maturity, key players, typical user)
- One-glance context before you dive deeper

### 2. **Visual Terminology Guide**
- Tag-cloud style term chips with icons
- Grouped by concept families (e.g., Money Flow, Security, Tech Rails for Payments)
- Hover for quick definitions, no jargon overwhelm

### 3. **User Segments (Personas)**
- Color-coded persona cards by transaction side (supply/demand/enabler/regulator)
- Role + goal at a glance
- Helps you map who you're building for

### 4. **Jobs to be Done**
- Numbered objective cards with outcome icons
- "Pain → Gain" mini visuals
- Understand what users actually need, not what they say

### 5. **End-to-End Process Flow**
- Horizontal stepper diagram (desktop) / vertical stack (mobile)
- Numbered steps with icons and descriptions
- See how value moves through the system

### 6. **System Architecture**
- Clean, layered block diagrams
- Color-coded: Frontend → Service → Data → External
- Labeled interaction flows (step-by-step, not spaghetti arrows)
- Understand the tech stack without a CS degree

### 7. **Opportunity Matrix**
- Impact × Feasibility quadrant
- Dots placed based on opportunity attractiveness
- Prioritize where to play

### 8. **Notable Products**
- Product cards with category indicators
- Real-world examples to benchmark against
- Click through for deep-dive analysis

### 9. **Product Deep Dives**
For any product, explore:
- Vision & positioning (hero quote card)
- Customer segments (segment ring + % breakdown)
- Revenue model (stream stack with rough share estimates)
- What's next (past → now → next timeline)

### 10. **PM Interview Prep**
- AI-generated questions by topic (strategy, metrics, execution, etc.)
- Difficulty dots (Easy / Medium / Hard)
- Save questions for later review

### 11. **Library & History**
- Save domains and questions
- Recently explored auto-tracked
- Return to any domain instantly

---

## 🏗️ Architecture

### Tech Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Component-based UI |
| **Styling** | Tailwind CSS v3 | Utility-first, design-system driven |
| **State** | TanStack Query | Server state + caching |
| **Routing** | React Router v6 | SPA navigation |
| **UI Components** | shadcn/ui | Accessible, composable primitives |
| **Backend** | Lovable Cloud (Supabase) | Auth, database, edge functions |
| **AI** | Lovable AI Gateway | Domain/product/question generation |
| **Icons** | Lucide React | Consistent iconography |

### Data Flow
```
User selects domain
       ↓
Edge Function (generate-domain) calls AI
       ↓
AI returns structured JSON (terminology, segments, process, etc.)
       ↓
React renders visual components from data
       ↓
LocalStorage persists for instant replay
```

### Visual Component System
All diagrams are **pure HTML + Tailwind + Lucide** — no chart libraries, no canvas, no heavy dependencies:

| Component | Use Case |
|-----------|----------|
| `StatTiles` | Overview metrics |
| `TermChipGrid` | Terminology glossary |
| `PersonaGrid` | User segments |
| `JtbdCardList` | Jobs to be done |
| `ProcessStepper` | End-to-end flow |
| `ArchitectureDiagram` | System layers |
| `OpportunityMatrix` | Priority quadrant |
| `ProductGrid` | Product examples |
| `RevenueStack` | Revenue breakdown |
| `SegmentRing` | Customer split |
| `Timeline` | Product roadmap |
| `DifficultyDots` | Interview difficulty |

---

## 🚀 How to Use It

### For Domain Research
1. **Start at the homepage** — pick from 30+ curated domains or search
2. **Explore any domain** — 7 visual sections load instantly
3. **Dive into products** — click any product card for deep analysis
4. **Save for later** — bookmark domains to your library

### For Interview Prep
1. Go to **Interview Prep** from any domain page
2. Browse questions by topic (Strategy, Metrics, Execution, etc.)
3. Check difficulty dots to calibrate prep time
4. Save questions you want to practice
5. Review saved questions in the Library

### For Sharing with PMs
- **URL:** `https://product-domain-explorer.lovable.app`
- Analytics track anonymous visitor sessions, pageviews, and top domains explored
- Add UTM tags (`?utm_source=name`) to distinguish reviewers

---

## 🎨 Design Philosophy

### Visual-First Learning
Every concept gets a visual treatment — humans process images 60,000x faster than text.

### Progressive Disclosure
- High-level overview first
- Expand into detail only when needed
- No walls of text on first load

### PM-Centric Language
- Terms are explained with product context
- Architecture is layered for business understanding
- Opportunities are framed as strategic choices

### Responsive & Fast
- Mobile-optimized layouts (stacked process steps, compact cards)
- Local caching for instant return visits
- Streaming AI responses for progressive render

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui primitives (button, card, etc.)
│   ├── visuals/            # Domain-specific visual components
│   ├── DomainTile.tsx      # Domain selection cards
│   ├── SectionCard.tsx     # Section containers
│   └── SiteHeader.tsx      # Navigation header
├── pages/
│   ├── Index.tsx           # Homepage with search
│   ├── DomainPage.tsx      # Domain explorer (7 sections)
│   ├── ProductPage.tsx     # Product deep-dive
│   ├── InterviewPage.tsx   # Question generator
│   ├── InterviewPrepPage.tsx # Prep dashboard
│   └── LibraryPage.tsx     # Saved domains/questions
├── data/
│   └── domains.ts          # 30+ domain definitions + categories
├── lib/
│   ├── storage.ts          # LocalStorage persistence
│   ├── iconMap.ts          # Icon name → Lucide mapping
│   └── categoryStyles.ts   # Category color tokens
└── hooks/
    └── use-mobile.tsx      # Responsive breakpoints

supabase/
└── functions/
    ├── generate-domain/    # AI domain generation
    ├── generate-product/   # AI product deep-dive
    └── generate-questions/ # AI interview questions
```

---

## 🛣️ Roadmap & Future Ideas

- [ ] **Compare mode** — side-by-side domain comparison
- [ ] **Export** — PDF or Notion export of domain summaries
- [ ] **Custom domains** — generate for any user-entered industry
- [ ] **Collaboration** — shared team libraries with comments
- [ ] **Interview practice** — AI mock interviewer with feedback
- [ ] **Trends** — track how domains evolve over time

---

## 🤝 Contributing

This project was built entirely in [Lovable](https://lovable.dev), a visual, AI-assisted development environment. To contribute:

1. Fork on GitHub
2. Import into your Lovable workspace
3. Make changes via AI prompts or direct code edits
4. Submit PRs back to the repo

---

## 📄 License

MIT License — feel free to use, fork, and adapt for your own PM toolset.

---

## 🙏 Acknowledgments

Built with love for the PM community. If Domain Explorer saves you even one day of research time, it's done its job.

**Questions or feedback?** Open an issue or reach out — always looking for ways to make industry learning faster and more visual.

---

> *"The best PMs are domain-agnostic learners. Domain Explorer makes that learning curve a little less steep."*
