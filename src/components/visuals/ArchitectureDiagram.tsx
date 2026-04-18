import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";

interface Node { id: string; label: string; icon: string }
interface Layer { name: string; nodes: Node[] }
interface Edge { from: string; to: string; label: string }

const LAYER_COLORS = [
  { dot: "bg-cat-mobility", bg: "bg-cat-mobility-soft", text: "text-cat-mobility", border: "border-cat-mobility/40", stroke: "hsl(var(--cat-mobility))" },
  { dot: "bg-cat-tech", bg: "bg-cat-tech-soft", text: "text-cat-tech", border: "border-cat-tech/40", stroke: "hsl(var(--cat-tech))" },
  { dot: "bg-cat-finance", bg: "bg-cat-finance-soft", text: "text-cat-finance", border: "border-cat-finance/40", stroke: "hsl(var(--cat-finance))" },
  { dot: "bg-cat-commerce", bg: "bg-cat-commerce-soft", text: "text-cat-commerce", border: "border-cat-commerce/40", stroke: "hsl(var(--cat-commerce))" },
];

interface Rect { x: number; y: number; w: number; h: number; layer: number }

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
        x: r.left - cb.left,
        y: r.top - cb.top,
        w: r.width,
        h: r.height,
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

  // Compute a routed path between two node rects, avoiding overlap with the source/target
  const buildPath = (a: Rect, b: Rect) => {
    const ax = a.x + a.w / 2;
    const ay = a.y + a.h / 2;
    const bx = b.x + b.w / 2;
    const by = b.y + b.h / 2;
    const dx = bx - ax;
    const dy = by - ay;
    const sameLayer = a.layer === b.layer;

    // Pick anchor sides
    let sx: number, sy: number, tx: number, ty: number, c1x: number, c1y: number, c2x: number, c2y: number;
    if (sameLayer) {
      // side-to-side, bow outward (downward) to avoid overlap
      if (dx >= 0) {
        sx = a.x + a.w; sy = ay;
        tx = b.x; ty = by;
      } else {
        sx = a.x; sy = ay;
        tx = b.x + b.w; ty = by;
      }
      const midX = (sx + tx) / 2;
      const bow = Math.min(60, Math.abs(tx - sx) * 0.4 + 20);
      c1x = midX; c1y = sy + bow;
      c2x = midX; c2y = ty + bow;
    } else {
      // top-to-bottom (or vice versa)
      if (dy >= 0) {
        sx = ax; sy = a.y + a.h;
        tx = bx; ty = b.y;
      } else {
        sx = ax; sy = a.y;
        tx = bx; ty = b.y + b.h;
      }
      const midY = (sy + ty) / 2;
      c1x = sx; c1y = midY;
      c2x = tx; c2y = midY;
    }
    const path = `M ${sx},${sy} C ${c1x},${c1y} ${c2x},${c2y} ${tx},${ty}`;
    // Approximate midpoint for label (cubic at t=0.5)
    const mx = 0.125 * sx + 0.375 * c1x + 0.375 * c2x + 0.125 * tx;
    const my = 0.125 * sy + 0.375 * c1y + 0.375 * c2y + 0.125 * ty;
    return { path, mx, my };
  };

  const ready = Object.keys(rects).length > 0 && size.w > 0;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {layers.map((l, i) => {
          const c = LAYER_COLORS[i % LAYER_COLORS.length];
          return (
            <div key={i} className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", c.bg, c.text, c.border)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
              {l.name}
            </div>
          );
        })}
      </div>

      {/* Diagram canvas */}
      <div ref={containerRef} className="relative rounded-xl border bg-gradient-subtle p-4">
        {/* SVG arrow layer */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
        >
          <defs>
            {LAYER_COLORS.map((c, i) => (
              <marker key={i} id={`arrow-${i}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={c.stroke} />
              </marker>
            ))}
          </defs>
          {ready && edges.map((e, i) => {
            const a = rects[e.from];
            const b = rects[e.to];
            if (!a || !b) return null;
            const c = LAYER_COLORS[(a.layer) % LAYER_COLORS.length];
            const { path, mx, my } = buildPath(a, b);
            const labelW = Math.max(28, e.label.length * 6 + 12);
            return (
              <g key={i} className="animate-fade-in">
                <path
                  d={path}
                  fill="none"
                  stroke={c.stroke}
                  strokeWidth={1.75}
                  strokeOpacity={0.85}
                  strokeDasharray="4 3"
                  markerEnd={`url(#arrow-${a.layer % LAYER_COLORS.length})`}
                />
                {e.label && (
                  <g transform={`translate(${mx - labelW / 2}, ${my - 9})`}>
                    <rect
                      width={labelW}
                      height={18}
                      rx={9}
                      fill="hsl(var(--card))"
                      stroke={c.stroke}
                      strokeOpacity={0.4}
                    />
                    <text
                      x={labelW / 2}
                      y={12}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={600}
                      fill={c.stroke}
                    >
                      {e.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Layer boxes (above SVG via z-index) */}
        <div className="relative z-10 space-y-5">
          {layers.map((l, li) => {
            const c = LAYER_COLORS[li % LAYER_COLORS.length];
            return (
              <div key={li} className={cn("rounded-xl border-2 border-dashed bg-card/60 p-3 backdrop-blur-sm", c.border)}>
                <div className={cn("mb-3 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide", c.bg, c.text)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
                  {l.name}
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {l.nodes.map((n) => {
                    const Icon = getIcon(n.icon);
                    return (
                      <div
                        key={n.id}
                        ref={(el) => { nodeRefs.current[n.id] = el; }}
                        className={cn("flex items-center gap-2 rounded-lg border bg-card p-2.5 shadow-card", c.border)}
                      >
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", c.bg)}>
                          <Icon className={cn("h-4 w-4", c.text)} />
                        </div>
                        <div className="min-w-0 text-xs font-semibold leading-tight">{n.label}</div>
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
