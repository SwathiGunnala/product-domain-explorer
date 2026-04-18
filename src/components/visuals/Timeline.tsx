import { Clock, Activity, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { past: string; now: string; next: string }

export const Timeline = ({ past, now, next }: Props) => {
  const items = [
    { label: "Past", text: past, Icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
    { label: "Now", text: now, Icon: Activity, color: "text-primary", bg: "bg-primary/10" },
    { label: "Next", text: next, Icon: Rocket, color: "text-cat-play", bg: "bg-cat-play-soft" },
  ];
  return (
    <div className="relative grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="absolute left-4 top-4 hidden h-px w-[calc(100%-2rem)] bg-gradient-to-r from-muted via-primary to-cat-play md:block" style={{ top: "1.25rem" }} />
      {items.map((it, i) => (
        <div key={i} className="relative">
          <div className={cn("relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-background shadow-tile", it.bg)}>
            <it.Icon className={cn("h-4 w-4", it.color)} />
          </div>
          <div className="mt-3 rounded-xl border bg-card p-4 shadow-card">
            <div className={cn("text-[10px] font-bold uppercase tracking-wide", it.color)}>{it.label}</div>
            <div className="mt-1 text-sm">{it.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
