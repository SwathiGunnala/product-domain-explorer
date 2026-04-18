import { getIcon } from "@/lib/iconMap";
import { ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryKey } from "@/data/domains";
import { CATEGORY_STYLES } from "@/lib/categoryStyles";

interface Step { title: string; description: string; icon: string }

export const ProcessStepper = ({ steps, category }: { steps: Step[]; category: CategoryKey }) => {
  const s = CATEGORY_STYLES[category];
  return (
    <div className="relative">
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-stretch">
        {steps.map((st, i) => {
          const Icon = getIcon(st.icon);
          const last = i === steps.length - 1;
          return (
            <div key={i} className="flex flex-1 items-stretch gap-2 md:min-w-[180px]">
              {/* Node box */}
              <div
                className={cn(
                  "relative flex flex-1 flex-col rounded-2xl border-2 bg-card p-4 shadow-tile transition-smooth hover:-translate-y-0.5 animate-fade-in",
                  s.border,
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Step number badge */}
                <div className={cn(
                  "absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shadow-tile ring-2 ring-background",
                  s.bg, s.text,
                )}>
                  {i + 1}
                </div>
                <div className={cn("mb-2 flex h-10 w-10 items-center justify-center rounded-xl", s.bg)}>
                  <Icon className={cn("h-5 w-5", s.text)} strokeWidth={2.2} />
                </div>
                <div className="font-display text-sm font-semibold leading-tight">{st.title}</div>
                <div className="mt-1 text-xs leading-snug text-muted-foreground">{st.description}</div>
              </div>

              {/* Arrow connector */}
              {!last && (
                <div className="flex items-center justify-center">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-card",
                    s.border,
                  )}>
                    <ArrowRight className={cn("hidden h-4 w-4 md:block", s.text)} />
                    <ArrowDown className={cn("block h-4 w-4 md:hidden", s.text)} />
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
