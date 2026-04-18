import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";

interface Stream { name: string; share: number; description: string; icon: string }

export const RevenueStack = ({ streams }: { streams: Stream[] }) => {
  const total = streams.reduce((a, s) => a + s.share, 0) || 1;
  const colors = ["bg-cat-finance", "bg-cat-mobility", "bg-cat-commerce", "bg-cat-play", "bg-cat-tech"];
  const softs = ["bg-cat-finance-soft", "bg-cat-mobility-soft", "bg-cat-commerce-soft", "bg-cat-play-soft", "bg-cat-tech-soft"];
  const texts = ["text-cat-finance", "text-cat-mobility", "text-cat-commerce", "text-cat-play", "text-cat-tech"];

  return (
    <div className="space-y-4">
      {/* Stacked bar */}
      <div className="flex h-10 w-full overflow-hidden rounded-lg border shadow-card">
        {streams.map((s, i) => (
          <div
            key={i}
            className={cn("flex items-center justify-center text-xs font-bold text-white transition-smooth hover:brightness-110", colors[i % colors.length])}
            style={{ width: `${(s.share / total) * 100}%` }}
            title={`${s.name}: ${s.share}%`}
          >
            {(s.share / total) * 100 > 10 ? `${Math.round((s.share / total) * 100)}%` : ""}
          </div>
        ))}
      </div>
      {/* Streams list */}
      <div className="space-y-2">
        {streams.map((s, i) => {
          const Icon = getIcon(s.icon);
          const pct = Math.round((s.share / total) * 100);
          return (
            <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-card">
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", softs[i % softs.length])}>
                <Icon className={cn("h-4 w-4", texts[i % texts.length])} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-display text-sm font-semibold">{s.name}</div>
                  <div className={cn("text-xs font-bold", texts[i % texts.length])}>{pct}%</div>
                </div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
