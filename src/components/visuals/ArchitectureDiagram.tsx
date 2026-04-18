import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";

interface Node { id: string; label: string; icon: string }
interface Layer { name: string; nodes: Node[] }
interface Edge { from: string; to: string; label: string; kind?: "forward" | "return" }

const LAYER_COLORS = [
  { dot: "bg-cat-mobility", bg: "bg-cat-mobility-soft", text: "text-cat-mobility", border: "border-cat-mobility/40", ring: "ring-cat-mobility/30", stroke: "hsl(var(--cat-mobility))" },
  { dot: "bg-cat-tech", bg: "bg-cat-tech-soft", text: "text-cat-tech", border: "border-cat-tech/40", ring: "ring-cat-tech/30", stroke: "hsl(var(--cat-tech))" },
  { dot: "bg-cat-finance", bg: "bg-cat-finance-soft", text: "text-cat-finance", border: "border-cat-finance/40", ring: "ring-cat-finance/30", stroke: "hsl(var(--cat-finance))" },
  { dot: "bg-cat-commerce", bg: "bg-cat-commerce-soft", text: "text-cat-commerce", border: "border-cat-commerce/40", ring: "ring-cat-commerce/30", stroke: "hsl(var(--cat-commerce))" },
];

interface Rect { cx: number; cy: number; r: number; layer: number }

export const ArchitectureDiagram = ({ layers, edges }: { layers: Layer[]; edges: Edge[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [rects, setRects] = useState<Record<string, Rect>>({});
  const [size, setSize] = useState({ w: 0, h: 0 });

  const nodeLayer: Record<string, number> = {};
  layers.forEach((l, li) => l.nodes.forEach(n => { nodeLayer[n.id] = li; }));

  const measure = () => {
    const container = containerRef.current;
    if (!container) return;
    const cb = container.getBoundingClientRect();
    const next: Record<string, Rect> = {};
    Object.entries(nodeRefs.current).forEach(([id, el]) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      next[id] = {
        cx: r.left - cb.left + r.width / 2,
        cy: r.top - cb.top + r.height / 2,
        r: Math.min(r.width, r.height) / 2,
        layer: nodeLayer[id] ?? 0,
      };
    });
    setRects(next);
    setSize({ w: cb.width, h: cb.height });
  };

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(containerRef.current);
    Object.values(nodeRefs.current).forEach(el => el && ro.observe(el));
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers]);

  // Build a horizontal arc/line path between two circles, ending at the circle's edge (not center)
  // arcSign: -1 = bow upward (above), +1 = bow downward (below), 0 = straight curve
  const buildPath = (a: Rect, b: Rect, arcSign: number) => {
    const dx = b.cx - a.cx;
    const dy = b.cy - a.cy;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    // Start/end on circle boundary with small gap for arrowhead
    const gap = 8;
    const sx = a.cx + ux * (a.r + 2);
    const sy = a.cy + uy * (a.r + 2);
    const tx = b.cx - ux * (b.r + gap);
    const ty = b.cy - uy * (b.r + gap);

    // Control point perpendicular to direction
    const mx = (sx + tx) / 2;
    const my = (sy + ty) / 2;
    const perpX = -uy;
    const perpY = ux;
    // Arc magnitude scales with distance; bigger for "return" (long arcs over the top)
    const magnitude = arcSign === 0 ? 0 : Math.min(140, dist * 0.25 + 30) * Math.abs(arcSign);
    const sign = arcSign >= 0 ? 1 : -1;
    const cx = mx + perpX * magnitude * sign;
    const cy = my + perpY * magnitude * sign;

    const path = `M ${sx},${sy} Q ${cx},${cy} ${tx},${ty}`;
    // Quadratic midpoint at t=0.5
    const lx = 0.25 * sx + 0.5 * cx + 0.25 * tx;
    const ly = 0.25 * sy + 0.5 * cy + 0.25 * ty;
    return { path, lx, ly };
  };

  const ready = Object.keys(rects).length > 0 && size.w > 0;

  // Decide arc direction per edge to reduce overlap:
  // - return edges always bow upward (over the top) — like the reference's "Settlement details in a batch"
  // - forward edges between adjacent layers: straight
  // - forward edges skipping layers: bow downward
  const getArcSign = (e: Edge, a: Rect, b: Rect) => {
    const layerSpan = Math.abs(b.layer - a.layer);
    if (e.kind === "return") return -1.2;
    if (layerSpan >= 2) return 0.8;
    return 0;
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2">
        {layers.map((l, i) => {
          const c = LAYER_COLORS[i % LAYER_COLORS.length];
          return (
            <div key={i} className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", c.bg, c.text, c.border)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
              {l.name}
            </div>
          );
        })}
        <div className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="currentColor" strokeWidth="1.5" /></svg>
            Forward
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
            Return
          </span>
        </div>
      </div>

      {/* Diagram canvas — horizontal columns, one per layer */}
      <div ref={containerRef} className="relative overflow-x-auto rounded-xl border bg-gradient-subtle p-6 md:p-10">
        {/* SVG arrow layer */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
        >
          <defs>
            {LAYER_COLORS.map((c, i) => (
              <marker
                key={i}
                id={`arch-arrow-${i}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={c.stroke} />
              </marker>
            ))}
          </defs>
          {ready && edges.map((e, i) => {
            const a = rects[e.from];
            const b = rects[e.to];
            if (!a || !b) return null;
            const c = LAYER_COLORS[a.layer % LAYER_COLORS.length];
            const arcSign = getArcSign(e, a, b);
            const { path, lx, ly } = buildPath(a, b, arcSign);
            const isReturn = e.kind === "return";
            const markerId = `arch-arrow-${a.layer % LAYER_COLORS.length}`;
            const labelW = Math.max(28, (e.label?.length || 0) * 6.2 + 10);
            return (
              <g key={i} className="animate-fade-in">
                <path
                  d={path}
                  fill="none"
                  stroke={c.stroke}
                  strokeWidth={1.75}
                  strokeOpacity={isReturn ? 0.75 : 0.9}
                  strokeDasharray={isReturn ? "5 4" : undefined}
                  markerEnd={`url(#${markerId})`}
                />
                {e.label && (
                  <g transform={`translate(${lx}, ${ly})`}>
                    {/* subtle background plate so label stays legible over gradient */}
                    <rect
                      x={-labelW / 2}
                      y={-9}
                      width={labelW}
                      height={18}
                      rx={4}
                      fill="hsl(var(--card))"
                      fillOpacity={0.85}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fontSize={10.5}
                      fontWeight={600}
                      fill={c.stroke}
                      style={{ letterSpacing: "0.01em" }}
                    >
                      {e.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Node columns (above SVG) */}
        <div
          className="relative z-10 grid items-center gap-x-8 gap-y-6 md:gap-x-14"
          style={{ gridTemplateColumns: `repeat(${layers.length}, minmax(120px, 1fr))` }}
        >
          {layers.map((l, li) => {
            const c = LAYER_COLORS[li % LAYER_COLORS.length];
            return (
              <div key={li} className="flex flex-col items-center gap-6">
                {/* Layer name header */}
                <div className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", c.bg, c.text)}>
                  {l.name}
                </div>
                {/* Circular nodes stacked */}
                <div className="flex w-full flex-col items-center gap-7">
                  {l.nodes.map((n) => {
                    const Icon = getIcon(n.icon);
                    return (
                      <div key={n.id} className="flex flex-col items-center gap-2">
                        <div
                          ref={(el) => { nodeRefs.current[n.id] = el; }}
                          className={cn(
                            "flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-tile ring-4 transition-smooth hover:scale-105 md:h-20 md:w-20",
                            c.ring,
                          )}
                        >
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-full md:h-12 md:w-12", c.bg)}>
                            <Icon className={cn("h-5 w-5 md:h-6 md:w-6", c.text)} strokeWidth={2.2} />
                          </div>
                        </div>
                        <div className="max-w-[110px] text-center text-xs font-semibold leading-tight">
                          {n.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
