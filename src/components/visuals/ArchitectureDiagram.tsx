import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface Node { id: string; label: string; icon: string }
interface Layer { name: string; nodes: Node[] }
interface FlowStep { step: number; from: string; to: string; action: string; kind?: "forward" | "return" }
interface Edge { from: string; to: string; label: string; kind?: "forward" | "return" }

const LAYER_COLORS = [
  { dot: "bg-cat-mobility", bg: "bg-cat-mobility-soft", text: "text-cat-mobility", border: "border-cat-mobility/40", ring: "ring-cat-mobility/30", stroke: "hsl(var(--cat-mobility))" },
  { dot: "bg-cat-tech", bg: "bg-cat-tech-soft", text: "text-cat-tech", border: "border-cat-tech/40", ring: "ring-cat-tech/30", stroke: "hsl(var(--cat-tech))" },
  { dot: "bg-cat-finance", bg: "bg-cat-finance-soft", text: "text-cat-finance", border: "border-cat-finance/40", ring: "ring-cat-finance/30", stroke: "hsl(var(--cat-finance))" },
  { dot: "bg-cat-commerce", bg: "bg-cat-commerce-soft", text: "text-cat-commerce", border: "border-cat-commerce/40", ring: "ring-cat-commerce/30", stroke: "hsl(var(--cat-commerce))" },
];

interface Props {
  layers: Layer[];
  flow?: FlowStep[];
  edges?: Edge[]; // backwards-compatible fallback
}

export const ArchitectureDiagram = ({ layers, flow, edges }: Props) => {
  // Build a node lookup with layer info
  const nodeMap: Record<string, { node: Node; layer: number }> = {};
  layers.forEach((l, li) => l.nodes.forEach(n => { nodeMap[n.id] = { node: n, layer: li }; }));

  // If flow is missing, derive a best-effort sequence from edges
  const steps: FlowStep[] = flow && flow.length
    ? [...flow].sort((a, b) => a.step - b.step)
    : (edges || []).map((e, i) => ({ step: i + 1, from: e.from, to: e.to, action: e.label, kind: e.kind }));

  if (!steps.length) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        No flow data available for this architecture.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Layer legend */}
      <div className="flex flex-wrap items-center gap-2">
        {layers.map((l, i) => {
          const c = LAYER_COLORS[i % LAYER_COLORS.length];
          return (
            <div
              key={i}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                c.bg, c.text, c.border,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
              {l.name}
            </div>
          );
        })}
      </div>

      {/* Top-down sequenced flow */}
      <div className="relative mx-auto max-w-3xl">
        {steps.map((s, idx) => {
          const fromInfo = nodeMap[s.from];
          const toInfo = nodeMap[s.to];
          if (!fromInfo || !toInfo) return null;

          const isReturn = s.kind === "return";
          const cFrom = LAYER_COLORS[fromInfo.layer % LAYER_COLORS.length];
          const cTo = LAYER_COLORS[toInfo.layer % LAYER_COLORS.length];
          const FromIcon = getIcon(fromInfo.node.icon);
          const ToIcon = getIcon(toInfo.node.icon);
          const isLast = idx === steps.length - 1;

          return (
            <div key={idx} className="relative">
              {/* Step card */}
              <div
                className="relative flex items-stretch gap-4 rounded-2xl border bg-card p-4 shadow-card animate-fade-in md:p-5"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Step number */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-base font-bold shadow-tile ring-2 ring-background",
                    isReturn ? "bg-muted text-muted-foreground" : "bg-gradient-hero text-primary-foreground",
                  )}
                >
                  {s.step}
                </div>

                {/* Action description + actors */}
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-semibold leading-tight md:text-base">
                    {s.action}
                  </div>

                  {/* From → To pills */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <ActorPill icon={FromIcon} label={fromInfo.node.label} layerName={layers[fromInfo.layer]?.name} c={cFrom} />
                    <span className="text-muted-foreground">
                      {isReturn ? "← responds to" : "→ sends to"}
                    </span>
                    <ActorPill icon={ToIcon} label={toInfo.node.label} layerName={layers[toInfo.layer]?.name} c={cTo} />
                  </div>
                </div>

                {/* Direction badge */}
                <div className="hidden shrink-0 items-center md:flex">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      isReturn
                        ? "border-muted-foreground/30 bg-muted text-muted-foreground"
                        : "border-primary/30 bg-primary/10 text-primary",
                    )}
                  >
                    {isReturn ? "Return" : "Forward"}
                  </span>
                </div>
              </div>

              {/* Connector arrow to next step */}
              {!isLast && (
                <div className="flex h-8 items-center justify-center">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 bg-background shadow-tile",
                      isReturn ? "border-muted-foreground/30" : "border-primary/40",
                    )}
                  >
                    {isReturn ? (
                      <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ActorPill = ({
  icon: Icon,
  label,
  layerName,
  c,
}: {
  icon: ReturnType<typeof getIcon>;
  label: string;
  layerName?: string;
  c: typeof LAYER_COLORS[number];
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-semibold",
      c.bg, c.text, c.border,
    )}
    title={layerName}
  >
    <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
    {label}
  </span>
);
