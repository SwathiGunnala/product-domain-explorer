import { Link } from "react-router-dom";
import { getIcon } from "@/lib/iconMap";
import { CATEGORY_STYLES } from "@/lib/categoryStyles";
import type { DomainDef } from "@/data/domains";
import { cn } from "@/lib/utils";

interface Props { domain: DomainDef; size?: "md" | "sm" }

export const DomainTile = ({ domain, size = "md" }: Props) => {
  const Icon = getIcon(domain.icon);
  const s = CATEGORY_STYLES[domain.category];
  const isSm = size === "sm";

  return (
    <Link
      to={`/domain/${domain.slug}`}
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
