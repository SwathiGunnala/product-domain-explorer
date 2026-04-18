import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";

interface Node { id: string; label: string; icon: string }
interface Layer { name: string; nodes: Node[] }
interface Edge { from: string; to: string; label: string }

const LAYER_COLORS = [
  { dot: "bg-cat-mobility", bg: "bg-cat-mobility-soft", text: "text-cat-mobility", border: "border-cat-mobility/30" },
  { dot: "bg-cat-tech", bg: "bg-cat-tech-soft", text: "text-cat-tech", border: "border-cat-tech/30" },
  { dot: "bg-cat-finance", bg: "bg-cat-finance-soft", text: "text-cat-finance", border: "border-cat-finance/30" },
  { dot: "bg-cat-commerce", bg: "bg-cat-commerce-soft", text: "text-cat-commerce", border: "border-cat-commerce/30" },
];

export const ArchitectureDiagram = ({ layers, edges }: { layers: Layer[]; edges: Edge[] }) => {
  const nodeLayer: Record<string, number> = {};
  layers.forEach((l, li) => l.nodes.forEach(n => { nodeLayer[n.id] = li; }));

  return (
    <div className="space-y-6">
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

      {/* Stacked layers */}
      <div className="space-y-4">
        {layers.map((l, li) => {
          const c = LAYER_COLORS[li % LAYER_COLORS.length];
          return (
            <div key={li} className={cn("rounded-xl border-2 border-dashed bg-gradient-subtle p-4", c.border)}>
              <div className={cn("mb-3 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide", c.bg, c.text)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
                {l.name}
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {l.nodes.map((n, ni) => {
                  const Icon = getIcon(n.icon);
                  return (
                    <div key={ni} className={cn("flex items-center gap-2 rounded-lg border bg-card p-2.5 shadow-card", c.border)}>
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

      {/* Edges */}
      {edges.length > 0 && (
        <div>
          <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Flow</h5>
          <div className="grid gap-2 sm:grid-cols-2">
            {edges.map((e, i) => {
              const fromLayer = nodeLayer[e.from] ?? 0;
              const toLayer = nodeLayer[e.to] ?? 0;
              const cf = LAYER_COLORS[fromLayer % LAYER_COLORS.length];
              const ct = LAYER_COLORS[toLayer % LAYER_COLORS.length];
              return (
                <div key={i} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs shadow-card">
                  <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px]", cf.bg, cf.text)}>{e.from}</span>
                  <span className="text-muted-foreground">→ {e.label} →</span>
                  <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px]", ct.bg, ct.text)}>{e.to}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
