import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GitCompare, Plus, X, Users, Target, Workflow, Network, Lightbulb, Package, Sparkles, Star, RefreshCw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { storage } from "@/lib/storage";
import { DOMAINS, getDomainBySlug, type DomainDef } from "@/data/domains";
import { CATEGORY_STYLES } from "@/lib/categoryStyles";
import { getIcon } from "@/lib/iconMap";
import { cn } from "@/lib/utils";

const MAX = 3;

interface DomainData {
  slug: string;
  domain: DomainDef | { slug: string; name: string; category: any; icon: string };
  data: any;
  loading: boolean;
}

const ComparePage = () => {
  const [picked, setPicked] = useState<string[]>([]);
  const [store, setStore] = useState<Record<string, DomainData>>({});

  // Hydrate from URL hash so shares preserve selection
  useEffect(() => {
    const h = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (h) {
      const slugs = h.split(",").filter(Boolean).slice(0, MAX);
      slugs.forEach(s => addDomain(s, true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (picked.length) {
      window.history.replaceState(null, "", `#${encodeURIComponent(picked.join(","))}`);
    } else {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [picked]);

  const addDomain = async (slug: string, silent = false) => {
    if (!slug) return;
    if (picked.includes(slug)) {
      if (!silent) toast.info("Already added");
      return;
    }
    if (picked.length >= MAX) {
      if (!silent) toast.error(`Up to ${MAX} industries`);
      return;
    }
    const known = getDomainBySlug(slug);
    const fallbackName = slug.replace(/-/g, " ").replace(/\b\w/g, m => m.toUpperCase());
    const meta = known || { slug, name: fallbackName, category: "tech" as const, icon: "Sparkles" };

    setPicked(prev => [...prev, slug]);
    const cached = storage.getDomain(slug);
    if (cached) {
      setStore(prev => ({ ...prev, [slug]: { slug, domain: meta, data: cached, loading: false } }));
      return;
    }
    setStore(prev => ({ ...prev, [slug]: { slug, domain: meta, data: null, loading: true } }));
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-domain", { body: { domain: meta.name } });
      if (error) throw error;
      if (result?.error) {
        toast.error(result.error);
        setStore(prev => ({ ...prev, [slug]: { ...prev[slug], loading: false } }));
        return;
      }
      storage.setDomain(slug, result);
      setStore(prev => ({ ...prev, [slug]: { slug, domain: meta, data: result, loading: false } }));
    } catch (e: any) {
      toast.error(e?.message || "Failed to load");
      setStore(prev => ({ ...prev, [slug]: { ...prev[slug], loading: false } }));
    }
  };

  const removeDomain = (slug: string) => {
    setPicked(prev => prev.filter(s => s !== slug));
  };

  const reset = () => {
    setPicked([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-[0.06]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="container py-8 md:py-12">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Home</Link>
          </Button>
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero shadow-tile">
                <GitCompare className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Compare industries</h1>
                <p className="mt-1 max-w-xl text-balance text-sm text-muted-foreground md:text-base">
                  Pick up to 3 domains. We'll line up users, jobs, process, architecture, opportunities and products — and badge the parts that are <span className="font-semibold text-foreground">unique</span> to one industry.
                </p>
              </div>
            </div>
            {picked.length > 0 && (
              <Button variant="outline" size="sm" onClick={reset}>
                <RefreshCw className="h-4 w-4" /> Reset
              </Button>
            )}
          </div>
        </div>
      </section>

      <main className="container space-y-6 py-8">
        {/* Picker row */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {Array.from({ length: MAX }).map((_, i) => {
            const slug = picked[i];
            const item = slug ? store[slug] : undefined;
            return (
              <div key={i}>
                {!slug ? (
                  <AddSlot index={i} onPick={addDomain} disabled={picked.length >= MAX} />
                ) : (
                  <PickedHeader item={item} onRemove={() => removeDomain(slug)} />
                )}
              </div>
            );
          })}
        </div>

        {picked.length === 0 && <EmptyState onPick={addDomain} />}

        {picked.length > 0 && (
          <CompareGrid picked={picked} store={store} />
        )}
      </main>
    </div>
  );
};

/* ---------- subcomponents ---------- */

const AddSlot = ({ index, onPick, disabled }: { index: number; onPick: (slug: string) => void; disabled: boolean }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? DOMAINS.filter(d => d.name.toLowerCase().includes(s) || d.tagline.toLowerCase().includes(s)) : DOMAINS;
  }, [q]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "flex h-[88px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-card/50 text-sm font-medium text-muted-foreground transition-smooth",
            "hover:border-primary hover:bg-card hover:text-foreground",
            disabled && "cursor-not-allowed opacity-40",
          )}
        >
          <Plus className="h-4 w-4" />
          Add industry {index + 1}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pick an industry</DialogTitle>
        </DialogHeader>
        <Input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search domains…" className="h-11" />
        <div className="-mx-2 max-h-[420px] overflow-y-auto px-2">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {filtered.map(d => {
              const Icon = getIcon(d.icon);
              const s = CATEGORY_STYLES[d.category];
              return (
                <button
                  key={d.slug}
                  onClick={() => { onPick(d.slug); setOpen(false); setQ(""); }}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-smooth hover:-translate-y-0.5 hover:shadow-tile",
                    s.border,
                  )}
                >
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1", s.bg, s.ring)}>
                    <Icon className={cn("h-4 w-4", s.text)} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{d.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{d.tagline}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PickedHeader = ({ item, onRemove }: { item?: DomainData; onRemove: () => void }) => {
  if (!item) return null;
  const Icon = getIcon((item.domain as any).icon);
  const styles = CATEGORY_STYLES[(item.domain as any).category as keyof typeof CATEGORY_STYLES];
  return (
    <div className={cn("relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-tile", styles.gradient, styles.border)}>
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1", styles.bg, styles.ring)}>
        <Icon className={cn("h-5 w-5", styles.text)} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-base font-bold">{item.domain.name}</div>
        <div className="truncate text-xs text-muted-foreground">
          {item.loading ? "Generating…" : (item.data?.tagline || "Ready")}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="rounded-md p-1.5 text-muted-foreground transition-smooth hover:bg-background/60 hover:text-foreground"
        aria-label="Remove"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const EmptyState = ({ onPick }: { onPick: (slug: string) => void }) => {
  const presets: Array<{ label: string; slugs: string[] }> = [
    { label: "Wealth vs Retail vs Mortgage", slugs: ["wealth-management", "retail", "mortgage"] },
    { label: "Banking vs Crypto vs Payments", slugs: ["banking", "crypto", "payments"] },
    { label: "Airlines vs Ride-sharing vs Logistics", slugs: ["airlines", "ride-sharing", "logistics"] },
    { label: "Healthcare vs Pharma vs Mental Health", slugs: ["healthcare", "pharma", "mental-health"] },
  ];
  return (
    <div className="rounded-2xl border bg-card p-8 text-center shadow-card">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <div className="font-display text-lg font-bold">Try a preset</div>
      <p className="mt-1 text-sm text-muted-foreground">Or use the slots above to pick your own.</p>
      <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
        {presets.map(p => (
          <button
            key={p.label}
            onClick={() => p.slugs.forEach(s => onPick(s))}
            className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-smooth hover:border-primary hover:text-primary"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ---------- Compare grid (the actual side-by-side) ---------- */

const SECTIONS = [
  { id: "users", title: "Users", subtitle: "Who's involved", icon: Users, key: "users", labelOf: (x: any) => x.role, sublabelOf: (x: any) => x.goal, iconOf: (x: any) => x.icon },
  { id: "jobs", title: "Jobs to be Done", subtitle: "Outcomes hired for", icon: Target, key: "jobs", labelOf: (x: any) => x.title, sublabelOf: (x: any) => `Pain: ${x.pain}`, iconOf: (x: any) => x.icon },
  { id: "process", title: "Process", subtitle: "Start to finish", icon: Workflow, key: "process", labelOf: (x: any) => x.title, sublabelOf: (x: any) => x.description, iconOf: (x: any) => x.icon },
  { id: "architecture", title: "Architecture nodes", subtitle: "Building blocks", icon: Network, key: "architecture", labelOf: (x: any) => x.label, sublabelOf: (x: any) => x.layer, iconOf: (x: any) => x.icon },
  { id: "opportunities", title: "Opportunities", subtitle: "Where the gaps are", icon: Lightbulb, key: "opportunities", labelOf: (x: any) => x.title, sublabelOf: (x: any) => x.description, iconOf: (x: any) => x.icon },
  { id: "products", title: "Notable products", subtitle: "Players in the space", icon: Package, key: "products", labelOf: (x: any) => x.name, sublabelOf: (x: any) => x.company, iconOf: (x: any) => x.icon },
] as const;

const CompareGrid = ({ picked, store }: { picked: string[]; store: Record<string, DomainData> }) => {
  return (
    <div className="space-y-5">
      {SECTIONS.map(sec => (
        <CompareSection key={sec.id} sec={sec} picked={picked} store={store} />
      ))}
    </div>
  );
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const extract = (data: any, key: string): Array<{ label: string; sub?: string; icon?: string }> => {
  if (!data) return [];
  const sec = (SECTIONS as readonly any[]).find(s => s.key === key)!;
  if (key === "architecture") {
    const layers: any[] = data?.architecture?.layers || [];
    return layers.flatMap(l => (l.nodes || []).map((n: any) => ({ label: n.label, sub: l.name, icon: n.icon })));
  }
  const arr: any[] = data?.[key] || [];
  return arr.map(x => ({ label: sec.labelOf(x), sub: sec.sublabelOf(x), icon: sec.iconOf(x) }));
};

const CompareSection = ({ sec, picked, store }: { sec: any; picked: string[]; store: Record<string, DomainData> }) => {
  const Icon = sec.icon;

  // Build label sets per column for unique detection
  const perColumn = picked.map(slug => extract(store[slug]?.data, sec.key));
  const sets = perColumn.map(items => new Set(items.map(i => norm(i.label))));

  const isUnique = (col: number, label: string) => {
    const k = norm(label);
    if (sets.length < 2) return false;
    return sets[col].has(k) && sets.every((s, i) => i === col || !s.has(k));
  };

  const isShared = (label: string) => {
    if (sets.length < 2) return false;
    const k = norm(label);
    return sets.every(s => s.has(k));
  };

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-display text-base font-bold leading-tight">{sec.title}</div>
          <div className="text-xs text-muted-foreground">{sec.subtitle}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
            <Sparkles className="h-3 w-3" /> Unique
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
            <Star className="h-3 w-3" /> Shared
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
        {picked.map((slug, col) => {
          const item = store[slug];
          const items = perColumn[col];
          const styles = item ? CATEGORY_STYLES[(item.domain as any).category as keyof typeof CATEGORY_STYLES] : null;
          return (
            <div key={slug} className="min-w-0 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", styles?.dot)} />
                <span className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item?.domain.name}
                </span>
              </div>
              {item?.loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                  No data
                </div>
              ) : (
                <ul className="space-y-2">
                  {items.map((it, idx) => {
                    const unique = isUnique(col, it.label);
                    const shared = !unique && isShared(it.label);
                    const ItIcon = it.icon ? getIcon(it.icon) : null;
                    return (
                      <li
                        key={idx}
                        className={cn(
                          "group flex items-start gap-2.5 rounded-xl border p-2.5 transition-smooth",
                          unique ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border bg-background hover:bg-muted/40",
                        )}
                      >
                        {ItIcon && (
                          <div className={cn(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                            unique ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                          )}>
                            <ItIcon className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-semibold leading-tight">{it.label}</span>
                            {unique && (
                              <Badge variant="default" className="h-4 gap-1 px-1.5 py-0 text-[9px]">
                                <Sparkles className="h-2.5 w-2.5" /> Unique
                              </Badge>
                            )}
                            {shared && (
                              <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[9px]">Shared</Badge>
                            )}
                          </div>
                          {it.sub && (
                            <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{it.sub}</div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ComparePage;
