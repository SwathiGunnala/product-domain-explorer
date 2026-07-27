import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";

export interface PlaybookItem {
  title: string;
  detail: string;
  icon: string;
  watchout?: string;
}

export interface PlaybookData {
  ux?: PlaybookItem[];
  gtm?: PlaybookItem[];
  challenges?: PlaybookItem[];
}

const COLUMNS: { key: keyof PlaybookData; label: string; hint: string; icon: string; tone: string }[] = [
  { key: "ux", label: "UX patterns", hint: "How good products feel here", icon: "Layers", tone: "text-primary" },
  { key: "gtm", label: "GTM strategy", hint: "How they actually get sold", icon: "TrendingUp", tone: "text-accent-foreground" },
  { key: "challenges", label: "Challenges", hint: "What quietly kills roadmaps", icon: "AlertTriangle", tone: "text-destructive" },
];

export const PlaybookBoard = ({ data }: { data: PlaybookData }) => (
  <div className="grid gap-4 md:grid-cols-3">
    {COLUMNS.map((col) => {
      const items = data?.[col.key] ?? [];
      const ColIcon = getIcon(col.icon);
      return (
        <div key={col.key} className="rounded-xl border bg-muted/30 p-3">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card shadow-tile">
              <ColIcon className={cn("h-4 w-4", col.tone)} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">{col.label}</div>
              <div className="text-[11px] text-muted-foreground">{col.hint}</div>
            </div>
          </div>
          <ul className="space-y-2">
            {items.map((it, i) => {
              const Icon = getIcon(it.icon);
              return (
                <li key={i} className="rounded-lg border bg-card p-2.5 shadow-card">
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-snug">{it.title}</div>
                      <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{it.detail}</div>
                      {it.watchout && (
                        <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-destructive/80">
                          Watch out: <span className="normal-case text-muted-foreground">{it.watchout}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {items.length === 0 && (
              <li className="rounded-lg border border-dashed p-3 text-[11px] text-muted-foreground">
                Regenerate this domain to load the playbook.
              </li>
            )}
          </ul>
        </div>
      );
    })}
  </div>
);
