import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Bookmark, History } from "lucide-react";
import { CATEGORIES, DOMAINS, slugify } from "@/data/domains";
import { DomainTile } from "@/components/DomainTile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { getIcon } from "@/lib/iconMap";
import { SiteHeader } from "@/components/SiteHeader";

const Index = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    setRecent(storage.getRecent());
    setSaved(storage.getSavedDomains());
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return DOMAINS;
    const q = query.toLowerCase();
    return DOMAINS.filter(d => d.name.toLowerCase().includes(q) || d.tagline.toLowerCase().includes(q));
  }, [query]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const exact = DOMAINS.find(d => d.name.toLowerCase() === q.toLowerCase());
    navigate(`/domain/${exact ? exact.slug : slugify(q)}?name=${encodeURIComponent(q)}`);
  };

  const recentDomains = recent.map(s => DOMAINS.find(d => d.slug === s)).filter(Boolean) as typeof DOMAINS;
  const savedDomains = saved.map(s => DOMAINS.find(d => d.slug === s)).filter(Boolean) as typeof DOMAINS;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-[0.07]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="container py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium shadow-card">
              <Sparkles className="h-3 w-3 text-primary" />
              AI-generated, visual-first explainers
            </div>
            <h1 className="font-display text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Learn any <span className="bg-gradient-hero bg-clip-text text-transparent">industry</span> in one click
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
              Terminology, users, processes, architecture, products and PM interview prep — visualized for any domain you pick.
            </p>
            <form onSubmit={onSubmit} className="mx-auto mt-7 flex max-w-xl items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Try 'quantum computing' or pick below…"
                  className="h-12 rounded-xl border-2 pl-10 pr-3 text-base shadow-tile focus-visible:ring-primary"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 rounded-xl bg-gradient-hero px-5 shadow-tile">
                Explore
              </Button>
            </form>
          </div>
        </div>
      </section>

      <main className="container py-10">
        {/* Saved */}
        {savedDomains.length > 0 && (
          <section className="mb-10">
            <SectionHeader icon={<Bookmark className="h-4 w-4" />} title="Saved" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {savedDomains.map(d => <DomainTile key={d.slug} domain={d} size="sm" />)}
            </div>
          </section>
        )}

        {/* Recent */}
        {recentDomains.length > 0 && (
          <section className="mb-10">
            <SectionHeader icon={<History className="h-4 w-4" />} title="Recently explored" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {recentDomains.map(d => <DomainTile key={d.slug} domain={d} size="sm" />)}
            </div>
          </section>
        )}

        {/* Categories */}
        {query.trim() ? (
          <section>
            <SectionHeader title={`Results for "${query}"`} />
            {filtered.length === 0 ? (
              <div className="rounded-xl border bg-card p-8 text-center shadow-card">
                <p className="text-muted-foreground">No exact match. Hit <strong>Explore</strong> to generate it anyway.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filtered.map(d => <DomainTile key={d.slug} domain={d} />)}
              </div>
            )}
          </section>
        ) : (
          CATEGORIES.map(cat => {
            const list = DOMAINS.filter(d => d.category === cat.key);
            const CatIcon = getIcon(cat.icon);
            return (
              <section key={cat.key} className="mb-10">
                <SectionHeader icon={<CatIcon className="h-4 w-4" />} title={cat.label} />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {list.map(d => <DomainTile key={d.slug} domain={d} />)}
                </div>
              </section>
            );
          })
        )}
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-xs text-muted-foreground">
          Built for curious minds · Powered by Lovable AI
        </div>
      </footer>
    </div>
  );
};

const SectionHeader = ({ icon, title }: { icon?: React.ReactNode; title: string }) => (
  <div className="mb-4 flex items-center gap-2">
    {icon && (
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-muted-foreground">
        {icon}
      </div>
    )}
    <h2 className="font-display text-lg font-bold tracking-tight md:text-xl">{title}</h2>
  </div>
);

export default Index;
