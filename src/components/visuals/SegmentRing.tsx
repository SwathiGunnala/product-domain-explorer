import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";

interface Segment { name: string; share: number; need: string; icon: string }

const COLORS = [
  "hsl(var(--cat-finance))",
  "hsl(var(--cat-mobility))",
  "hsl(var(--cat-tech))",
  "hsl(var(--cat-commerce))",
  "hsl(var(--cat-play))",
];

export const SegmentRing = ({ segments }: { segments: Segment[] }) => {
  const total = segments.reduce((a, s) => a + s.share, 0) || 1;
  let acc = 0;
  const stops = segments.map((s, i) => {
    const start = (acc / total) * 360;
    acc += s.share;
    const end = (acc / total) * 360;
    return `${COLORS[i % COLORS.length]} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <div className="grid items-center gap-6 md:grid-cols-[200px_1fr]">
      <div className="relative mx-auto h-44 w-44">
        <div
          className="h-full w-full rounded-full shadow-tile"
          style={{ background: `conic-gradient(${stops})` }}
        />
        <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-card shadow-card">
          <div className="font-display text-xl font-bold">{segments.length}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Segments</div>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((s, i) => {
          const Icon = getIcon(s.icon);
          const pct = Math.round((s.share / total) * 100);
          return (
            <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-card">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-display text-sm font-semibold">{s.name}</div>
                  <div className="text-xs font-bold tabular-nums">{pct}%</div>
                </div>
                <div className="text-xs text-muted-foreground">{s.need}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
