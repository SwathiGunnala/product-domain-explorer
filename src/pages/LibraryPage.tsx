import { Link } from "react-router-dom";
import { Bookmark, NotebookPen, Flag, Sparkles, ArrowRight, Clock, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { storage, type FlagEntry, type LensKey } from "@/lib/storage";
import { DOMAINS, getDomainBySlug } from "@/data/domains";
import { CATEGORY_STYLES } from "@/lib/categoryStyles";
import { getIcon } from "@/lib/iconMap";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const LENS_LABELS: Record<LensKey, string> = {
  overview: "Overview",
  terminology: "Terminology",
  users: "Users",
  jobs: "Jobs",
  process: "Process",
  architecture: "Architecture",
  opportunities: "Opportunities",
  products: "Products",
  playbook: "Playbook",
};

const KIND_LABELS: Record<FlagEntry["kind"], string> = {
  users: "Users",
  jobs: "Jobs",
  process: "Process",
  architecture: "Architecture",
  opportunities: "Opportunities",
  products: "Products",
  playbook: "Playbook",

};

interface DomainNotebook {
  slug: string;
  name: string;
  category: string;
  icon: string;
  notes: Array<{ lens: LensKey; text: string }>;
  flags: FlagEntry[];
  saved: boolean;
}

const LibraryPage = () => {
  const [saved, setSaved] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [notesIdx, setNotesIdx] = useState<string[]>([]);
  const [flagsIdx, setFlagsIdx] = useState<string[]>([]);
  const [tick] = useState(0);

  useEffect(() => {
    setSaved(storage.getSavedDomains());
    setRecent(storage.getRecent());
    setNotesIdx(storage.getNotesIndex());
    setFlagsIdx(storage.getFlagsIndex());
  }, [tick]);

  // Build per-domain notebooks (anything with notes OR flags OR saved)
  const notebooks: DomainNotebook[] = useMemo(() => {
    const slugs = Array.from(new Set([...notesIdx, ...flagsIdx, ...saved]));
    return slugs.map(slug => {
      const known = getDomainBySlug(slug);
      const fallbackName = slug.replace(/-/g, " ").replace(/\b\w/g, m => m.toUpperCase());
      const notesObj = storage.getNotes(slug);
      const notes = (Object.keys(notesObj) as LensKey[])
        .filter(k => (notesObj[k] || "").trim())
        .map(k => ({ lens: k, text: notesObj[k] as string }));
      const flags = storage.getFlags(slug);
      return {
        slug,
        name: known?.name || fallbackName,
        category: known?.category || "tech",
        icon: known?.icon || "Sparkles",
        notes,
        flags,
        saved: saved.includes(slug),
      };
    }).sort((a, b) => (b.notes.length + b.flags.length) - (a.notes.length + a.flags.length));
  }, [notesIdx, flagsIdx, saved]);

  const totalNotes = notebooks.reduce((n, nb) => n + nb.notes.length, 0);
  const totalFlags = notebooks.reduce((n, nb) => n + nb.flags.length, 0);
  const recentList = recent.map(s => DOMAINS.find(d => d.slug === s)).filter(Boolean) as typeof DOMAINS;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero — paper feel */}
      <section className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0 -z-10 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "100% 28px",
          }}
        />
        <div className="container py-10 md:py-14">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-tile">
                <BookOpen className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Your notebook</div>
                <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">Thinking, in your own words</h1>
                <p className="mt-2 max-w-xl text-balance text-sm text-muted-foreground md:text-base">
                  Notes, flagged patterns, and the domains you keep coming back to — collected in one place so you can build a point of view.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Stat icon={<NotebookPen className="h-3.5 w-3.5" />} label={`${totalNotes} note${totalNotes === 1 ? "" : "s"}`} />
              <Stat icon={<Flag className="h-3.5 w-3.5" />} label={`${totalFlags} flag${totalFlags === 1 ? "" : "s"}`} />
              <Stat icon={<Bookmark className="h-3.5 w-3.5" />} label={`${saved.length} saved`} />
            </div>
          </div>
        </div>
      </section>

      <main className="container space-y-10 py-10">
        {/* Empty state */}
        {notebooks.length === 0 && (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="font-display text-lg font-bold">Your notebook is empty</div>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Open any domain, jot a thought under a lens, or flag a pattern — it'll show up here.
            </p>
            <Button asChild className="mt-4"><Link to="/">Pick a domain <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        )}

        {/* Notebooks */}
        {notebooks.length > 0 && (
          <section className="space-y-4">
            <SectionHeading
              title="Your domains"
              hint={`${notebooks.length} ${notebooks.length === 1 ? "entry" : "entries"} — most thought-through first`}
            />
            <div className="space-y-4">
              {notebooks.map(nb => <NotebookCard key={nb.slug} nb={nb} />)}
            </div>
          </section>
        )}

        {/* Recently explored — quieter */}
        {recentList.length > 0 && (
          <section className="space-y-3">
            <SectionHeading title="Recently explored" icon={<Clock className="h-4 w-4" />} />
            <div className="flex flex-wrap gap-2">
              {recentList.map(d => {
                const Icon = getIcon(d.icon);
                const s = CATEGORY_STYLES[d.category];
                return (
                  <Link
                    key={d.slug}
                    to={`/domain/${d.slug}`}
                    className={cn(
                      "group inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold transition-smooth hover:-translate-y-0.5 hover:shadow-tile",
                      s.border,
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", s.text)} />
                    {d.name}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

const Stat = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-card">
    <span className="text-primary">{icon}</span>
    {label}
  </div>
);

const SectionHeading = ({ title, hint, icon }: { title: string; hint?: string; icon?: React.ReactNode }) => (
  <div className="flex items-end justify-between gap-3 border-b pb-2">
    <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
      {icon}
      {title}
    </h2>
    {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
  </div>
);

const NotebookCard = ({ nb }: { nb: DomainNotebook }) => {
  const Icon = getIcon(nb.icon);
  const styles = CATEGORY_STYLES[nb.category as keyof typeof CATEGORY_STYLES];

  // Group flags by kind
  const flagsByKind = nb.flags.reduce<Record<string, FlagEntry[]>>((acc, f) => {
    (acc[f.kind] = acc[f.kind] || []).push(f);
    return acc;
  }, {});

  return (
    <article className="group overflow-hidden rounded-2xl border bg-card shadow-card transition-smooth hover:shadow-tile">
      {/* Header */}
      <header className={cn("flex items-center gap-3 border-b bg-gradient-to-br p-4", styles.gradient)}>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1", styles.bg, styles.ring)}>
          <Icon className={cn("h-5 w-5", styles.text)} strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <Link to={`/domain/${nb.slug}`} className="block truncate font-display text-base font-bold hover:underline">
            {nb.name}
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            {nb.saved && <span className="inline-flex items-center gap-1"><Bookmark className="h-3 w-3 fill-current text-primary" /> Saved</span>}
            {nb.notes.length > 0 && <span className="inline-flex items-center gap-1"><NotebookPen className="h-3 w-3" /> {nb.notes.length} note{nb.notes.length === 1 ? "" : "s"}</span>}
            {nb.flags.length > 0 && <span className="inline-flex items-center gap-1"><Flag className="h-3 w-3" /> {nb.flags.length} flag{nb.flags.length === 1 ? "" : "s"}</span>}
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild className="shrink-0">
          <Link to={`/domain/${nb.slug}`}>Open <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </header>

      {/* Body */}
      <div className="grid gap-0 md:grid-cols-2 md:divide-x">
        {/* Notes column */}
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <NotebookPen className="h-3.5 w-3.5 text-primary" /> Notes
          </div>
          {nb.notes.length === 0 ? (
            <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              No notes yet. <Link to={`/domain/${nb.slug}`} className="font-semibold text-primary hover:underline">Write one →</Link>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {nb.notes.map(n => (
                <li key={n.lens} className="rounded-lg border-l-2 border-primary/40 bg-muted/30 py-1.5 pl-3 pr-2">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-primary">{LENS_LABELS[n.lens]}</div>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {n.text.length > 280 ? n.text.slice(0, 280) + "…" : n.text}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Flags column */}
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Flag className="h-3.5 w-3.5 text-primary" /> Flagged patterns
          </div>
          {nb.flags.length === 0 ? (
            <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              Nothing flagged yet. <Link to={`/domain/${nb.slug}`} className="font-semibold text-primary hover:underline">Mark a pattern →</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(flagsByKind).map(([kind, list]) => (
                <div key={kind}>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {KIND_LABELS[kind as FlagEntry["kind"]]}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map(f => (
                      <span
                        key={f.id}
                        title={f.sub}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-xs font-medium text-foreground"
                      >
                        <Flag className="h-2.5 w-2.5 fill-current text-primary" />
                        {f.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default LibraryPage;
