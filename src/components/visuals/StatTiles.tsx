import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";
import type { CategoryKey } from "@/data/domains";
import { CATEGORY_STYLES } from "@/lib/categoryStyles";

interface Stat { label: string; value: string; hint: string; icon: string }

export const StatTiles = ({ stats, category }: { stats: Stat[]; category: CategoryKey }) => {
  const s = CATEGORY_STYLES[category];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((st, i) => {
        const Icon = getIcon(st.icon);
        return (
          <div key={i} className={cn("rounded-xl border p-4 bg-card shadow-card animate-fade-in", s.border)} style={{ animationDelay: `${i * 60}ms` }}>
            <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg", s.bg)}>
              <Icon className={cn("h-4 w-4", s.text)} strokeWidth={2.2} />
            </div>
            <div className="mt-3 font-display text-2xl font-bold leading-none">{st.value}</div>
            <div className="mt-1 text-xs font-medium text-foreground/80">{st.label}</div>
            <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{st.hint}</div>
          </div>
        );
      })}
    </div>
  );
};
