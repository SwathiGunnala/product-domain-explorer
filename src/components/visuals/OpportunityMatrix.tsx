import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";

interface Op { title: string; description: string; impact: number; feasibility: number; icon: string }

export const OpportunityMatrix = ({ items }: { items: Op[] }) => {
  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-gradient-subtle p-4 shadow-card md:aspect-[2/1]">
        {/* Axes */}
        <div className="absolute inset-x-4 top-1/2 h-px bg-border" />
        <div className="absolute inset-y-4 left-1/2 w-px bg-border" />
        {/* Quadrant labels */}
        <div className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">High Impact · Low Feasibility</div>
        <div className="absolute right-4 top-2 text-right text-[10px] font-bold uppercase tracking-wide text-cat-finance">★ Quick Wins</div>
        <div className="absolute bottom-2 left-4 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Low Impact · Low Feasibility</div>
        <div className="absolute bottom-2 right-4 text-right text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Low Impact · High Feasibility</div>
        {/* Axis titles */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-semibold uppercase text-muted-foreground">Impact →</div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase text-muted-foreground">Feasibility →</div>
        {/* Dots */}
        {items.map((op, i) => {
          const Icon = getIcon(op.icon);
          const x = ((op.feasibility - 1) / 4) * 80 + 10; // 10-90%
          const y = 90 - ((op.impact - 1) / 4) * 80; // inverted
          const isQuickWin = op.impact >= 4 && op.feasibility >= 4;
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
              title={op.title}
            >
              <div className={cn(
                "group relative flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-tile transition-smooth hover:scale-125",
                isQuickWin ? "border-cat-finance bg-cat-finance text-primary-foreground" : "border-primary bg-card text-primary",
              )}>
                <Icon className="h-4 w-4" />
                <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-[10px] font-medium opacity-0 shadow-tile transition-smooth group-hover:opacity-100">
                  {op.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* List */}
      <div className="grid gap-2 md:grid-cols-2">
        {items.map((op, i) => {
          const Icon = getIcon(op.icon);
          return (
            <div key={i} className="rounded-lg border bg-card p-3 shadow-card">
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <div className="font-display text-sm font-semibold">{op.title}</div>
                  <div className="text-xs text-muted-foreground">{op.description}</div>
                  <div className="mt-1.5 flex gap-3 text-[10px] uppercase tracking-wide">
                    <span className="text-muted-foreground">Impact: <span className="font-bold text-foreground">{op.impact}/5</span></span>
                    <span className="text-muted-foreground">Feasibility: <span className="font-bold text-foreground">{op.feasibility}/5</span></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
