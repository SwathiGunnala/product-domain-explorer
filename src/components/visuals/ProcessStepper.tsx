import { getIcon } from "@/lib/iconMap";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryKey } from "@/data/domains";
import { CATEGORY_STYLES } from "@/lib/categoryStyles";

interface Step { title: string; description: string; icon: string }

export const ProcessStepper = ({ steps, category }: { steps: Step[]; category: CategoryKey }) => {
  const s = CATEGORY_STYLES[category];
  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-stretch">
      {steps.map((st, i) => {
        const Icon = getIcon(st.icon);
        const last = i === steps.length - 1;
        return (
          <div key={i} className="flex flex-1 items-stretch gap-2 md:min-w-[180px]">
            <div className={cn("flex flex-1 flex-col rounded-xl border bg-card p-4 shadow-card animate-fade-in", s.border)} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-2">
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", s.bg, s.text)}>
                  {i + 1}
                </div>
                <Icon className={cn("h-4 w-4", s.text)} />
              </div>
              <div className="mt-2 font-display text-sm font-semibold">{st.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{st.description}</div>
            </div>
            {!last && (
              <div className="flex items-center justify-center text-muted-foreground">
                <ChevronRight className="hidden h-5 w-5 md:block" />
                <ChevronDown className="block h-5 w-5 md:hidden" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
