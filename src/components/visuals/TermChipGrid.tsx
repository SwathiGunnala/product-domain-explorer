import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";
import type { CategoryKey } from "@/data/domains";
import { CATEGORY_STYLES } from "@/lib/categoryStyles";

interface TermGroup { group: string; groupIcon: string; terms: { term: string; definition: string; icon: string }[] }

export const TermChipGrid = ({ groups, category }: { groups: TermGroup[]; category: CategoryKey }) => {
  const s = CATEGORY_STYLES[category];
  return (
    <div className="space-y-5">
      {groups.map((g, gi) => {
        const GIcon = getIcon(g.groupIcon);
        return (
          <div key={gi}>
            <div className="mb-2 flex items-center gap-2">
              <div className={cn("inline-flex h-6 w-6 items-center justify-center rounded-md", s.bg)}>
                <GIcon className={cn("h-3.5 w-3.5", s.text)} />
              </div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">{g.group}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {g.terms.map((t, ti) => {
                const TIcon = getIcon(t.icon);
                return (
                  <div key={ti} className={cn("group relative flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-tile", s.border)}>
                    <TIcon className={cn("h-4 w-4 shrink-0", s.text)} />
                    <div>
                      <div className="text-sm font-semibold leading-tight">{t.term}</div>
                      <div className="text-[11px] text-muted-foreground">{t.definition}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
