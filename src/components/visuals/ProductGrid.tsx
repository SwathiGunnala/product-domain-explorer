import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";
import { ArrowRight, Package } from "lucide-react";

interface Product { name: string; company: string; tagline: string; category: string; icon: string }

const CAT_STYLES: Record<string, string> = {
  Incumbent: "bg-cat-finance-soft text-cat-finance border-cat-finance/30",
  Challenger: "bg-cat-health-soft text-cat-health border-cat-health/30",
  Infrastructure: "bg-cat-tech-soft text-cat-tech border-cat-tech/30",
  Niche: "bg-cat-commerce-soft text-cat-commerce border-cat-commerce/30",
};

interface Props { products: Product[]; onSelect: (p: Product) => void }

export const ProductGrid = ({ products, onSelect }: Props) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {products.map((p, i) => {
      const Icon = getIcon(p.icon || "Package");
      return (
        <button
          key={i}
          onClick={() => onSelect(p)}
          className="group flex flex-col items-start rounded-xl border bg-card p-4 text-left shadow-card transition-smooth hover:-translate-y-1 hover:shadow-tile-hover animate-fade-in"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="flex w-full items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <div className="mt-3 font-display text-base font-semibold">{p.name}</div>
          <div className="text-xs text-muted-foreground">{p.company}</div>
          <p className="mt-2 text-sm text-foreground/80 line-clamp-2">{p.tagline}</p>
          <div className={cn("mt-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", CAT_STYLES[p.category] || CAT_STYLES.Niche)}>
            <Package className="h-2.5 w-2.5" />
            {p.category}
          </div>
        </button>
      );
    })}
  </div>
);
