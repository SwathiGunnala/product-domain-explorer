import { getIcon } from "@/lib/iconMap";
import { ArrowDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Job { title: string; pain: string; gain: string; icon: string }

export const JtbdCardList = ({ jobs }: { jobs: Job[] }) => (
  <div className="space-y-3">
    {jobs.map((j, i) => {
      const Icon = getIcon(j.icon);
      return (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-card animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-hero text-sm font-bold text-primary-foreground shadow-tile">
                {i + 1}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <h4 className="font-display font-semibold">{j.title}</h4>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-destructive">Pain</div>
                  <div className="mt-1 text-sm">{j.pain}</div>
                </div>
                <ArrowRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
                <ArrowDown className="block h-5 w-5 self-center justify-self-center text-muted-foreground sm:hidden" />
                <div className={cn("rounded-lg border border-cat-finance/20 bg-cat-finance-soft p-3")}>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-cat-finance">Gain</div>
                  <div className="mt-1 text-sm">{j.gain}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
