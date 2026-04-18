import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";

interface Persona { role: string; side: "supply" | "demand" | "enabler" | "regulator"; goal: string; icon: string }

const SIDE_STYLES: Record<Persona["side"], { dot: string; bg: string; text: string; label: string }> = {
  supply: { dot: "bg-cat-finance", bg: "bg-cat-finance-soft", text: "text-cat-finance", label: "Supply" },
  demand: { dot: "bg-cat-mobility", bg: "bg-cat-mobility-soft", text: "text-cat-mobility", label: "Demand" },
  enabler: { dot: "bg-cat-tech", bg: "bg-cat-tech-soft", text: "text-cat-tech", label: "Enabler" },
  regulator: { dot: "bg-cat-real", bg: "bg-cat-real-soft", text: "text-cat-real", label: "Regulator" },
};

export const PersonaGrid = ({ personas }: { personas: Persona[] }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {personas.map((p, i) => {
      const Icon = getIcon(p.icon);
      const s = SIDE_STYLES[p.side];
      return (
        <div key={i} className="group rounded-xl border bg-card p-4 shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-tile animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="flex items-start gap-3">
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", s.bg)}>
              <Icon className={cn("h-5 w-5", s.text)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="font-display font-semibold truncate">{p.role}</div>
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", s.bg, s.text)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                  {s.label}
                </span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{p.goal}</div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
