import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Brain, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { DifficultyDots } from "@/components/visuals/DifficultyDots";
import { toast } from "sonner";

const InterviewPrepPage = () => {
  const [questions, setQuestions] = useState(() => storage.getSavedQuestions());

  useEffect(() => { setQuestions(storage.getSavedQuestions()); }, []);

  const grouped = useMemo(() => {
    const map: Record<string, typeof questions> = {};
    for (const q of questions) {
      if (!map[q.domain]) map[q.domain] = [];
      map[q.domain].push(q);
    }
    return map;
  }, [questions]);

  const remove = (q: typeof questions[number]) => {
    storage.toggleSavedQuestion(q);
    setQuestions(storage.getSavedQuestions());
    toast.success("Removed");
  };

  // Progress ring
  const total = questions.length;
  const reviewed = 0; // placeholder; could be wired to a per-question reviewed flag

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-tile">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Interview prep</h1>
              <p className="text-sm text-muted-foreground">{total} saved across {Object.keys(grouped).length} domain{Object.keys(grouped).length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {total > 0 && <ProgressRing value={reviewed} max={total} />}
        </div>

        {total === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center shadow-card">
            <Brain className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">No saved questions yet.</p>
            <p className="text-sm text-muted-foreground">Open any domain and tap the ★ on questions you like.</p>
            <Button asChild className="mt-4"><Link to="/">Explore domains</Link></Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([domain, qs]) => (
              <section key={domain}>
                <div className="mb-3 flex items-center gap-2 border-b-2 border-primary/30 pb-2">
                  <h2 className="font-display text-lg font-bold tracking-tight">{domain}</h2>
                  <span className="text-xs text-muted-foreground">· {qs.length} questions</span>
                </div>
                <div className="grid gap-2">
                  {qs.map((q, i) => (
                    <div key={q.id} className="rounded-xl border bg-card p-4 shadow-card">
                      <div className="flex items-start gap-3">
                        <div className="font-mono text-xs font-bold text-muted-foreground">{i + 1}</div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex items-center gap-2">
                            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{q.topic}</span>
                            <DifficultyDots difficulty={q.difficulty} />
                          </div>
                          <p className="text-sm font-medium">{q.question}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => remove(q)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const ProgressRing = ({ value, max }: { value: number; max: number }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="relative h-16 w-16">
      <div
        className="h-full w-full rounded-full"
        style={{ background: `conic-gradient(hsl(var(--primary)) ${pct * 3.6}deg, hsl(var(--muted)) 0deg)` }}
      />
      <div className="absolute inset-1.5 flex flex-col items-center justify-center rounded-full bg-card">
        <div className="font-display text-sm font-bold leading-none">{value}/{max}</div>
        <div className="text-[8px] uppercase tracking-wide text-muted-foreground">reviewed</div>
      </div>
    </div>
  );
};

export default InterviewPrepPage;
