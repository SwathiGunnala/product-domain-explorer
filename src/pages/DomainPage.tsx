import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Tags, Users, Target, Workflow, Network, Lightbulb, Package, RefreshCw, Bookmark, Brain, ChevronRight, Compass } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { storage } from "@/lib/storage";
import { DOMAINS, getDomainBySlug, type CategoryKey } from "@/data/domains";
import { CATEGORY_STYLES } from "@/lib/categoryStyles";
import { getIcon } from "@/lib/iconMap";
import { StatTiles } from "@/components/visuals/StatTiles";
import { TermChipGrid } from "@/components/visuals/TermChipGrid";
import { PersonaGrid } from "@/components/visuals/PersonaGrid";
import { JtbdCardList } from "@/components/visuals/JtbdCardList";
import { ProcessStepper } from "@/components/visuals/ProcessStepper";
import { ArchitectureDiagram } from "@/components/visuals/ArchitectureDiagram";
import { OpportunityMatrix } from "@/components/visuals/OpportunityMatrix";
import { ProductGrid } from "@/components/visuals/ProductGrid";
import { PlaybookBoard } from "@/components/visuals/PlaybookBoard";

import { LensNotes } from "@/components/LensNotes";
import { FlagPicker } from "@/components/FlagPicker";
import { cn } from "@/lib/utils";

const DomainPage = () => {
  const { slug = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const known = getDomainBySlug(slug);
  const customName = params.get("name") || undefined;

  const displayName = known?.name || customName || slug.replace(/-/g, " ").replace(/\b\w/g, m => m.toUpperCase());
  const category: CategoryKey = known?.category || "tech";
  const iconHint = known?.icon || "Sparkles";
  const HeaderIcon = getIcon(iconHint);
  const styles = CATEGORY_STYLES[category];

  const [data, setData] = useState<any | null>(() => storage.getDomain(slug));
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const cached = storage.getDomain(slug);
    setData(cached);
    setSaved(storage.getSavedDomains().includes(slug));
    storage.pushRecent(slug);
    if (!cached) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const generate = async (force = false) => {
    if (loading) return;
    if (!force && data) return;
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-domain", { body: { domain: displayName } });
      if (error) throw error;
      if (result?.error) {
        const status = (error as any)?.context?.status;
        if (status === 429 || /rate limit/i.test(result.error)) {
          toast.error("Rate limit reached. Please try again in a moment.");
        } else if (status === 402 || /credit/i.test(result.error)) {
          toast.error("AI credits exhausted. Add credits in Cloud → Settings → Workspace → Usage.");
        } else {
          toast.error(result.error);
        }
        return;
      }
      setData(result);
      storage.setDomain(slug, result);
      storage.markDomainWarmed(slug);
    } catch (e: any) {
      console.error(e);
      const msg = e?.context?.body ? JSON.parse(e.context.body || "{}").error : e?.message;
      toast.error(msg || "Failed to generate. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = () => {
    const isSaved = storage.toggleSavedDomain(slug);
    setSaved(isSaved);
    toast.success(isSaved ? "Saved to library" : "Removed from library");
  };

  const sections = useMemo(() => [
    { id: "overview", title: "Overview", subtitle: "The big picture", icon: <BookOpen className="h-4 w-4" /> },
    { id: "terminology", title: "Terminology", subtitle: "The vocabulary you need", icon: <Tags className="h-4 w-4" /> },
    { id: "users", title: "Users & Segments", subtitle: "Who's involved & what they want", icon: <Users className="h-4 w-4" /> },
    { id: "jobs", title: "Jobs to be Done", subtitle: "The outcomes users hire it for", icon: <Target className="h-4 w-4" /> },
    { id: "process", title: "End-to-end Process", subtitle: "How it flows from start to finish", icon: <Workflow className="h-4 w-4" /> },
    { id: "architecture", title: "Architecture", subtitle: "Components and how they communicate", icon: <Network className="h-4 w-4" /> },
    { id: "opportunities", title: "Opportunities", subtitle: "Where the gaps are", icon: <Lightbulb className="h-4 w-4" /> },
    { id: "products", title: "Notable Products", subtitle: "Click any product for a deep-dive", icon: <Package className="h-4 w-4" /> },
  ], []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className={cn("relative overflow-hidden border-b bg-gradient-to-br", styles.gradient)}>
        <div className="container py-8 md:py-12">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> All domains</Link>
          </Button>
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl shadow-tile ring-1", styles.bg, styles.ring)}>
                <HeaderIcon className={cn("h-8 w-8", styles.text)} strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">{displayName}</h1>
                <p className="mt-1 max-w-xl text-balance text-sm text-muted-foreground md:text-base">
                  {data?.tagline || known?.tagline || "Generating a visual explainer…"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={toggleSave}>
                <Bookmark className={cn("h-4 w-4", saved && "fill-current text-primary")} />
                {saved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => generate(true)} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Regenerate
              </Button>
            </div>
          </div>

          {/* Section nav */}
          <div className="mt-6 flex flex-wrap gap-1.5">
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="inline-flex items-center gap-1.5 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium backdrop-blur transition-smooth hover:bg-card">
                {s.icon}<span>{s.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <main className="container space-y-5 py-8">
        {loading && !data && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6 shadow-card">
                <Skeleton className="mb-3 h-6 w-40" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {data && (
          <>
            <SectionCard id="overview" icon={<BookOpen className="h-4 w-4" />} title="Overview" subtitle={data.overview?.summary}>
              <StatTiles stats={data.overview.stats} category={category} />
              <LensNotes slug={slug} lens="overview" placeholder="Why does this domain matter? What surprised you?" />
            </SectionCard>

            <SectionCard id="terminology" icon={<Tags className="h-4 w-4" />} title="Terminology" subtitle="Key vocabulary">
              <TermChipGrid groups={data.terminology} category={category} />
              <LensNotes slug={slug} lens="terminology" placeholder="Terms to memorize, jargon that confused you, mental models…" />
            </SectionCard>

            <SectionCard id="users" icon={<Users className="h-4 w-4" />} title="Users" subtitle="Who's involved">
              <PersonaGrid personas={data.users} />
              <FlagPicker
                slug={slug}
                kind="users"
                items={(data.users || []).map((u: any) => ({ label: u.role, sub: u.goal }))}
                emptyHint="Mark personas you find non-obvious or under-served."
              />
              <LensNotes slug={slug} lens="users" placeholder="Which user is most under-served? Where does power sit?" />
            </SectionCard>

            <SectionCard id="jobs" icon={<Target className="h-4 w-4" />} title="Jobs to be Done" subtitle="Pain → Gain">
              <JtbdCardList jobs={data.jobs} />
              <FlagPicker
                slug={slug}
                kind="jobs"
                items={(data.jobs || []).map((j: any) => ({ label: j.title, sub: `Pain: ${j.pain}` }))}
                emptyHint="Mark jobs you'd want to dig into in interviews."
              />
              <LensNotes slug={slug} lens="jobs" placeholder="Which job is most painful? Which is faked vs solved?" />
            </SectionCard>

            <SectionCard id="process" icon={<Workflow className="h-4 w-4" />} title="Process" subtitle="Start to finish">
              <ProcessStepper steps={data.process} category={category} />
              <FlagPicker
                slug={slug}
                kind="process"
                items={(data.process || []).map((s: any) => ({ label: s.title, sub: s.description }))}
                emptyHint="Flag steps where friction or drop-off lives."
              />
              <LensNotes slug={slug} lens="process" placeholder="Where does friction live? Which step would you remove?" />
            </SectionCard>

            <SectionCard id="architecture" icon={<Network className="h-4 w-4" />} title="Architecture" subtitle="Step-by-step interaction flow">
              <ArchitectureDiagram
                layers={data.architecture.layers}
                flow={(data.architecture as any).flow}
                edges={(data.architecture as any).edges}
              />
              <FlagPicker
                slug={slug}
                kind="architecture"
                items={(data.architecture?.layers || []).flatMap((l: any) =>
                  (l.nodes || []).map((n: any) => ({ label: n.label, sub: l.name }))
                )}
                emptyHint="Flag components that look like leverage points."
              />
              <LensNotes slug={slug} lens="architecture" placeholder="Which layer owns the moat? Where is the integration risk?" />
            </SectionCard>

            <SectionCard id="opportunities" icon={<Lightbulb className="h-4 w-4" />} title="Opportunities" subtitle="Impact × Feasibility">
              <OpportunityMatrix items={data.opportunities} />
              <FlagPicker
                slug={slug}
                kind="opportunities"
                items={(data.opportunities || []).map((o: any) => ({ label: o.title, sub: o.description }))}
                emptyHint="Flag bets you'd actually pursue."
              />
              <LensNotes slug={slug} lens="opportunities" placeholder="Your top 3 bets — and what would have to be true?" />
            </SectionCard>

            <SectionCard id="playbook" icon={<Compass className="h-4 w-4" />} title="Product Leader Playbook" subtitle="UX · GTM · Challenges">
              <PlaybookBoard data={data.playbook || {}} />
              <FlagPicker
                slug={slug}
                kind="playbook"
                items={[
                  ...((data.playbook?.ux || []).map((i: any) => ({ label: i.title, sub: `UX · ${i.detail}` }))),
                  ...((data.playbook?.gtm || []).map((i: any) => ({ label: i.title, sub: `GTM · ${i.detail}` }))),
                  ...((data.playbook?.challenges || []).map((i: any) => ({ label: i.title, sub: `Risk · ${i.detail}` }))),
                ]}
                emptyHint="Flag the patterns and risks you want to carry into your roadmap."
              />
              <LensNotes slug={slug} lens="playbook" placeholder="What would you do differently as the PM here?" />
            </SectionCard>

            <SectionCard id="products" icon={<Package className="h-4 w-4" />} title="Notable Products" subtitle="Tap for deep-dive">
              <ProductGrid
                products={data.products}
                onSelect={(p) => navigate(`/domain/${slug}/product/${encodeURIComponent(p.name)}?company=${encodeURIComponent(p.company)}`)}
              />
              <FlagPicker
                slug={slug}
                kind="products"
                items={(data.products || []).map((p: any) => ({ label: p.name, sub: p.company }))}
                emptyHint="Flag products to study deeper."
              />
              <LensNotes slug={slug} lens="products" placeholder="Who's winning and why? What's the wedge?" />
            </SectionCard>


            {/* Interview prompt */}
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-hero p-6 text-primary-foreground shadow-tile">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold">Test your product thinking</div>
                    <p className="mt-1 max-w-md text-sm opacity-90">Generate sample PM interview questions tailored to {displayName}.</p>
                  </div>
                </div>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate(`/domain/${slug}/interview`)}
                  className="rounded-xl"
                >
                  Generate questions <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DomainPage;
