import { Link } from "react-router-dom";
import { getIcon } from "@/lib/iconMap";
import { CATEGORY_STYLES } from "@/lib/categoryStyles";
import type { DomainDef } from "@/data/domains";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";

interface Props { domain: DomainDef; size?: "md" | "sm" }

// Fire-and-forget warm: prefetch the DomainPage chunk + kick the edge cache.
// Guarded per-slug so hover storms don't spam the gateway.
const warmed = new Set<string>();
let hoverTimer: number | undefined;

function warm(domain: DomainDef) {
  if (warmed.has(domain.slug)) return;
  warmed.add(domain.slug);
  // Prefetch route chunk.
  import("@/pages/DomainPage").catch(() => {});
  // Skip generation if we already have it cached client-side.
  if (storage.getDomain(domain.slug)) return;
  // Fire the edge function so its 24h in-memory cache warms up.
  supabase.functions.invoke("generate-domain", { body: { domain: domain.name } })
    .then(({ data }) => { if (data && !(data as any).error) storage.setDomain(domain.slug, data); })
    .catch(() => { warmed.delete(domain.slug); });
}

export const DomainTile = ({ domain, size = "md" }: Props) => {
  const Icon = getIcon(domain.icon);
  const s = CATEGORY_STYLES[domain.category];
  const isSm = size === "sm";

  const onEnter = () => {
    window.clearTimeout(hoverTimer);
    hoverTimer = window.setTimeout(() => warm(domain), 120);
  };
  const onLeave = () => window.clearTimeout(hoverTimer);

  return (
    <Link
      to={`/domain/${domain.slug}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onTouchStart={onEnter}
      className={cn(
        "group relative flex flex-col items-start justify-between overflow-hidden rounded-2xl border bg-card shadow-tile transition-smooth",
        "hover:-translate-y-1 hover:shadow-tile-hover",
        s.border,
        isSm ? "p-4 min-h-[120px]" : "p-5 min-h-[160px]",
      )}
    >
      <div className={cn("absolute inset-0 -z-10 bg-gradient-to-br opacity-60 transition-smooth group-hover:opacity-100", s.gradient)} />
      <div className={cn(
        "flex items-center justify-center rounded-xl ring-1 transition-smooth group-hover:scale-110",
        s.bg, s.ring,
        isSm ? "h-10 w-10" : "h-12 w-12",
      )}>
        <Icon className={cn(s.text, isSm ? "h-5 w-5" : "h-6 w-6")} strokeWidth={2.2} />
      </div>
      <div className="mt-4">
        <div className={cn("font-display font-semibold leading-tight text-foreground", isSm ? "text-sm" : "text-base")}>
          {domain.name}
        </div>
        {!isSm && (
          <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{domain.tagline}</div>
        )}
      </div>
    </Link>
  );
};
