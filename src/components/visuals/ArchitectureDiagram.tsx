import { useEffect, useRef, useState } from "react";
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

interface NodePos { id: string; cx: number; cy: number; r: number; layer: number; node: Node }

const NODE_R = 32;          // visual circle radius
const NODE_HIT_R = 44;      // includes ring padding for arrow gap
const ROW_HEIGHT = 150;     // vertical spacing between nodes within a column
const COL_MIN_WIDTH = 170;
const TOP_PADDING = 56;     // room for layer header
const BOTTOM_PADDING = 24;
const SIDE_PADDING = 32;

export const ArchitectureDiagram = ({ layers, edges }: { layers: Layer[]; edges: Edge[] }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(() => {
      if (wrapperRef.current) setContainerW(wrapperRef.current.clientWidth);
    });
    ro.observe(wrapperRef.current);
    setContainerW(wrapperRef.current.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Layout: equal-height columns. Compute every node's (cx, cy) ourselves so columns can't overlap.
  const maxNodes = Math.max(1, ...layers.map(l => l.nodes.length));
  const canvasH = TOP_PADDING + BOTTOM_PADDING + maxNodes * ROW_HEIGHT;
  const canvasW = Math.max(containerW, layers.length * COL_MIN_WIDTH + SIDE_PADDING * 2);
  const colWidth = (canvasW - SIDE_PADDING * 2) / Math.max(1, layers.length);

  const positions: Record<string, NodePos> = {};
  layers.forEach((layer, li) => {
    const cx = SIDE_PADDING + colWidth * li + colWidth / 2;
    const n = layer.nodes.length;
    // Center the column's nodes vertically inside available rows
    const usableH = canvasH - TOP_PADDING - BOTTOM_PADDING;
    const step = n > 1 ? usableH / (n) : 0;
    const startY = n > 1 ? TOP_PADDING + step / 2 : TOP_PADDING + usableH / 2;
    layer.nodes.forEach((node, ni) => {
      const cy = n > 1 ? startY + step * ni : startY;
      positions[node.id] = { id: node.id, cx, cy, r: NODE_HIT_R, layer: li, node };
    });
  });

  // Path builder — returns multiple sample points so we can dodge labels along the curve
  const buildPath = (a: NodePos, b: NodePos, arcSign: number) => {
    const dx = b.cx - a.cx;
    const dy = b.cy - a.cy;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    const gap = 8;
    const sx = a.cx + ux * (a.r + 2);
    const sy = a.cy + uy * (a.r + 2);
    const tx = b.cx - ux * (b.r + gap);
    const ty = b.cy - uy * (b.r + gap);

    const mx = (sx + tx) / 2;
    const my = (sy + ty) / 2;
    const perpX = -uy;
    const perpY = ux;
    const magnitude = arcSign === 0 ? 0 : Math.min(160, dist * 0.28 + 30) * Math.abs(arcSign);
    const sign = arcSign >= 0 ? 1 : -1;
    const ccx = mx + perpX * magnitude * sign;
    const ccy = my + perpY * magnitude * sign;

    const path = `M ${sx},${sy} Q ${ccx},${ccy} ${tx},${ty}`;
    // Sample candidate label points along the curve (t = 0.35, 0.5, 0.65)
    const sample = (t: number) => {
      const it = 1 - t;
      const x = it * it * sx + 2 * it * t * ccx + t * t * tx;
      const y = it * it * sy + 2 * it * t * ccy + t * t * ty;
      return { x, y };
    };
    return { path, samples: [sample(0.35), sample(0.5), sample(0.65)] };
  };

  const getArcSign = (e: Edge, a: NodePos, b: NodePos) => {
    const layerSpan = Math.abs(b.layer - a.layer);
    if (e.kind === "return") return -1.3;
    if (layerSpan >= 2) return 0.9;
    if (layerSpan === 0) return 1.0;
    return 0;
  };

  // Build edges with their candidate label samples, then assign non-colliding label positions
  const edgeData = edges
    .map((e) => {
      const a = positions[e.from];
      const b = positions[e.to];
      if (!a || !b) return null;
      const arcSign = getArcSign(e, a, b);
      const { path, samples } = buildPath(a, b, arcSign);
      return { e, a, b, path, samples };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  // Greedy label placement: pick the sample that is farthest from already-placed labels and from any node center
  const placedLabels: { x: number; y: number; w: number; h: number }[] = [];
  const nodeCenters = Object.values(positions).map(p => ({ x: p.cx, y: p.cy }));

  const labelPositions: { lx: number; ly: number; w: number; h: number }[] = edgeData.map(({ e, samples }) => {
    const w = Math.max(28, (e.label?.length || 0) * 6.2 + 12);
    const h = 18;
    let best = samples[1];
    let bestScore = -Infinity;
    for (const s of samples) {
      // distance to nearest node
      let nodeMin = Infinity;
      for (const c of nodeCenters) {
        const d = Math.hypot(s.x - c.x, s.y - c.y);
        if (d < nodeMin) nodeMin = d;
      }
      // distance to nearest already-placed label
      let labelMin = Infinity;
      for (const p of placedLabels) {
        const dx = Math.max(0, Math.abs(s.x - p.x) - (w / 2 + p.w / 2));
        const dy = Math.max(0, Math.abs(s.y - p.y) - (h / 2 + p.h / 2));
        const d = Math.hypot(dx, dy);
        if (d < labelMin) labelMin = d;
      }
      // higher = better. Heavy penalty when overlapping nodes (< node radius)
      const nodePenalty = nodeMin < NODE_HIT_R + 6 ? -1000 + nodeMin : nodeMin;
      const labelPenalty = labelMin === 0 ? -500 : labelMin;
      const score = nodePenalty * 0.6 + labelPenalty * 0.4;
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }
    placedLabels.push({ x: best.x, y: best.y, w, h });
    return { lx: best.x, ly: best.y, w, h };
  });

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

      {/* Diagram canvas: SVG drives layout; absolutely-positioned divs sit on top of node circles */}
      <div ref={wrapperRef} className="relative overflow-x-auto rounded-xl border bg-gradient-subtle">
        <div className="relative" style={{ width: canvasW, height: canvasH }}>
          {/* Layer headers */}
          {layers.map((l, li) => {
            const c = LAYER_COLORS[li % LAYER_COLORS.length];
            const cx = SIDE_PADDING + colWidth * li + colWidth / 2;
            return (
              <div
                key={`h-${li}`}
                className={cn("absolute -translate-x-1/2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap", c.bg, c.text)}
                style={{ left: cx, top: 16 }}
              >
                {l.name}
              </div>
            );
          })}

          {/* SVG: edges + arrows + labels */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={canvasW}
            height={canvasH}
            viewBox={`0 0 ${canvasW} ${canvasH}`}
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
            {edgeData.map(({ e, a, path }, i) => {
              const c = LAYER_COLORS[a.layer % LAYER_COLORS.length];
              const isReturn = e.kind === "return";
              const markerId = `arch-arrow-${a.layer % LAYER_COLORS.length}`;
              const lp = labelPositions[i];
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
                    <g transform={`translate(${lp.lx}, ${lp.ly})`}>
                      <rect
                        x={-lp.w / 2}
                        y={-lp.h / 2}
                        width={lp.w}
                        height={lp.h}
                        rx={4}
                        fill="hsl(var(--card))"
                        fillOpacity={0.92}
                        stroke={c.stroke}
                        strokeOpacity={0.25}
                        strokeWidth={1}
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fontSize={10.5}
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

          {/* Nodes — absolutely positioned circles + labels */}
          {Object.values(positions).map(({ id, cx, cy, layer, node }) => {
            const c = LAYER_COLORS[layer % LAYER_COLORS.length];
            const Icon = getIcon(node.icon);
            return (
              <div
                key={id}
                className="absolute flex flex-col items-center"
                style={{ left: cx, top: cy, transform: "translate(-50%, -50%)" }}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full bg-card shadow-tile ring-4 transition-smooth hover:scale-105",
                    c.ring,
                  )}
                  style={{ width: NODE_R * 2, height: NODE_R * 2 }}
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", c.bg)}>
                    <Icon className={cn("h-5 w-5", c.text)} strokeWidth={2.2} />
                  </div>
                </div>
                <div
                  className="mt-1.5 text-center text-[11px] font-semibold leading-tight"
                  style={{ width: colWidth - 16, maxWidth: 140 }}
                >
                  {node.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
