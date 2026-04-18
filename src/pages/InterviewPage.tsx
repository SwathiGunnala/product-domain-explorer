import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Star, Brain } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { storage } from "@/lib/storage";
import { getDomainBySlug } from "@/data/domains";
import { getIcon } from "@/lib/iconMap";
import { DifficultyDots } from "@/components/visuals/DifficultyDots";
import { cn } from "@/lib/utils";

const InterviewPage = () => {
  const { slug = "" } = useParams();
  const known = getDomainBySlug(slug);
  const displayName = known?.name || slug.replace(/-/g, " ").replace(/\b\w/g, m => m.toUpperCase());
  const cached = storage.getDomain(slug);
  const products = cached?.products?.map((p: any) => `${p.name} (${p.company})`) ?? [];

  const [data, setData] = useState<any | null>(() => storage.getQuestions(slug));
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(() => storage.getSavedQuestions().map(q => q.id));

  useEffect(() => {
    if (!data) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const generate = async (force = false) => {
    if (loading) return;
    if (!force && data) return;
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-questions", {
        body: { domain: displayName, products },
      });
      if (error) throw error;
      if (result?.error) { toast.error(result.error); return; }
      setData(result);
      storage.setQuestions(slug, result);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = (groupTopic: string, q: any) => {
    const id = `${slug}::${groupTopic}::${q.question}`;
    const isSaved = storage.toggleSavedQuestion({ id, domain: displayName, topic: groupTopic, difficulty: q.difficulty, question: q.question });
    setSavedIds(storage.getSavedQuestions().map(x => x.id));
    toast.success(isSaved ? "Saved to interview prep" : "Removed");
  };

  const totalQs = data?.groups?.reduce((a: number, g: any) => a + g.questions.length, 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b bg-gradient-subtle">
        <div className="container py-8">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link to={`/domain/${slug}`}><ArrowLeft className="h-4 w-4" /> Back to {displayName}</Link>
          </Button>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-tile">
                <Brain className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">PM interview prep</div>
                <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{displayName}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{totalQs > 0 ? `${totalQs} sample questions` : "Generating tailored questions…"}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => generate(true)} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              New set
            </Button>
          </div>
        </div>
      </section>

      <main className="container space-y-6 py-8">
        {loading && !data && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6 shadow-card">
                <Skeleton className="mb-3 h-6 w-48" />
                <Skeleton className="mb-2 h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        )}

        {data?.groups?.map((g: any, gi: number) => {
          const Icon = getIcon(g.icon);
          return (
            <section key={gi}>
              <div className="mb-3 flex items-center gap-2 border-b-2 border-primary/30 pb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="font-display text-lg font-bold tracking-tight">{g.topic}</h2>
                <span className="text-xs text-muted-foreground">· {g.questions.length} questions</span>
              </div>
              <div className="grid gap-3">
                {g.questions.map((q: any, qi: number) => {
                  const id = `${slug}::${g.topic}::${q.question}`;
                  const isSaved = savedIds.includes(id);
                  const num = `${gi + 1}.${qi + 1}`;
                  return (
                    <div key={qi} className="rounded-xl border bg-card p-4 shadow-card transition-smooth hover:shadow-tile animate-fade-in" style={{ animationDelay: `${qi * 40}ms` }}>
                      <div className="flex items-start gap-3">
                        <div className="font-mono text-xs font-bold text-muted-foreground">{num}</div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <DifficultyDots difficulty={q.difficulty} />
                          </div>
                          <p className="text-base font-medium leading-snug">{q.question}</p>
                          {q.hint && <p className="mt-2 text-xs italic text-muted-foreground">💡 {q.hint}</p>}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => toggleSave(g.topic, q)} className="shrink-0">
                          <Star className={cn("h-4 w-4", isSaved && "fill-medium text-medium")} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default InterviewPage;
