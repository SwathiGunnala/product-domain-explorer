
## Goal
Cut perceived page-load latency to near-zero while keeping generation quality high and cost sane. Focus is the domain-generation call (dominant wait) plus a small frontend perf pass.

## Model strategy (cost + quality + speed)

Replace `google/gemini-2.5-flash` (prior gen, non-priority, ~6-15s non-streamed) with a two-tier setup:

- **Primary generator: `openai/gpt-5.4-mini` with `service_tier: "priority"`** (Fast mode ✓). Current-gen, strong for structured JSON via tool calling, priority tier gives lower latency, cheaper than `gpt-5.5`. Best quality/cost/speed balance for our tool-call schema.
- **Warm-preview generator (optional micro-call): `openai/gpt-5.4-nano`** for a fast tagline+overview so the page paints content in ~1s while the full payload streams.
- Fallback if a call errors: `google/gemini-3.5-flash` (current-gen, cheap).

Rationale (verified against `ai-models-chat`): `gpt-5.4-mini` is current-gen, priority-eligible, and materially faster than `gpt-5.5` at a fraction of the cost while still handling our tool schema cleanly. `gpt-5.5` is overkill for a structured extraction job.

## Latency plan

### 1. Stream generation end-to-end
- Edge function: switch to `stream: true`, forward the SSE chunks to the browser.
- Client: read the stream, incrementally parse the tool-call `arguments` JSON as it arrives (tolerant partial-JSON parser), and render each section (`tagline`, `overview`, `terminology`, …) the moment its branch is complete.
- Result: first meaningful paint in ~600-900ms instead of 6-15s; full page fills progressively.

### 2. Priority serving tier
- Add `service_tier: "priority"` on every chat completion (only on ✓ models — verified for `gpt-5.4-mini`, `gpt-5.4`, `gpt-5.5`). Do NOT set it on nano.

### 3. Prefetch + hover-warm
- On `DomainTile` hover/focus for >120ms, fire `generate-domain` in the background and prefetch the `DomainPage` route chunk. Click then hits a warm cache.
- Cache generation results in the edge function itself (in-memory Map keyed by lowercased domain name, TTL 24h) so a second visitor to "healthcare" gets sub-second response — no extra infra.

### 4. Frontend perf pass (small, high ROI)
- `index.html`: trim Google Fonts to only the 2 weights used above the fold, add `font-display=swap`, add `<link rel="preconnect">` to the Supabase functions origin.
- `iconMap.ts`: split — a small "core" set imported by `Index`/tiles, a lazy `iconMap.extended.ts` imported only by `DomainPage`.
- Purge unused deps (`recharts` if unused, unused Radix packages) after an `rg` audit.
- Route-prefetch on tile hover.

### 5. Skeleton → progressive
- Replace the current all-or-nothing skeleton with per-section skeletons that resolve as their stream branch lands, so the UI feels alive throughout.

## Files to change

- `supabase/functions/generate-domain/index.ts` — swap model to `openai/gpt-5.4-mini`, add `service_tier: "priority"`, enable streaming, add in-memory cache with 24h TTL, fallback path.
- `supabase/functions/generate-product/index.ts`, `supabase/functions/generate-questions/index.ts` — same model + priority (no streaming needed for questions unless we want; streaming is cheap).
- `src/pages/DomainPage.tsx` — consume the stream via `fetch` on the function URL (not `functions.invoke`, which buffers), incrementally parse, render sections as they arrive.
- `src/components/DomainTile.tsx` — hover-warm handler (prefetch chunk + fire-and-forget generation).
- `src/lib/iconMap.ts` → split into `iconMap.core.ts` + `iconMap.extended.ts`.
- `index.html` — font trim, preconnect.
- `package.json` — remove unused deps (after audit).

## Non-goals
No UI redesign, no schema changes, no auth, no persistence changes. Same JSON shape returned.

## Expected outcome
- Cold page paint: ~0.8-1.2s to first visible content (tagline + overview), full page in 3-5s.
- Warm (hover-preloaded) page: near-instant.
- Cached (2nd visitor): <500ms.
- Cost: lower than today — `gpt-5.4-mini` is materially cheaper than `gpt-5.5`, and edge caching removes repeat generations.

Approve and I'll implement in this order: (1) model swap + priority + streaming edge, (2) client streaming render, (3) hover-warm + cache, (4) frontend perf pass.
