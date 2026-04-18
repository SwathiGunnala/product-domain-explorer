import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, Users, DollarSign, Rocket, RefreshCw, AlertTriangle, Sparkles, Quote } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { storage } from "@/lib/storage";
import { SegmentRing } from "@/components/visuals/SegmentRing";
import { RevenueStack } from "@/components/visuals/RevenueStack";
import { Timeline } from "@/components/visuals/Timeline";
import { cn } from "@/lib/utils";

const ProductPage = () => {
  const { slug = "", productName = "" } = useParams();
  const [params] = useSearchParams();
  const company = params.get("company") || "";
  const decodedName = decodeURIComponent(productName);

  const cacheKey = `${decodedName}__${company}`;
  const [data, setData] = useState<any | null>(() => storage.getProduct(slug, cacheKey));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, productName]);

  const generate = async (force = false) => {
    if (loading) return;
    if (!force && data) return;
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-product", {
        body: { product: decodedName, company, domain: slug.replace(/-/g, " ") },
      });
      if (error) throw error;
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setData(result);
      storage.setProduct(slug, cacheKey, result);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to generate. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-hero text-primary-foreground">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="container py-8 md:py-10">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-primary-foreground/90 hover:bg-white/10 hover:text-primary-foreground">
            <Link to={`/domain/${slug}`}><ArrowLeft className="h-4 w-4" /> Back to domain</Link>
          </Button>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide opacity-80">Product deep-dive</div>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-5xl">{decodedName}</h1>
              {company && <div className="mt-1 text-base opacity-90">by {company}</div>}
            </div>
            <Button variant="secondary" size="sm" onClick={() => generate(true)} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Regenerate
            </Button>
          </div>
        </div>
      </section>

      <main className="container space-y-5 py-8">
        {loading && !data && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
            {/* Vision hero card */}
            <SectionCard icon={<Eye className="h-4 w-4" />} title="Product vision" subtitle="The why and the long-term bet">
              <div className="rounded-xl border bg-gradient-subtle p-6">
                <Quote className="h-8 w-8 text-primary/30" />
                <p className="mt-2 font-display text-xl font-semibold leading-snug md:text-2xl">"{data.vision.statement}"</p>
                <p className="mt-3 text-sm text-muted-foreground">{data.vision.why}</p>
              </div>
            </SectionCard>

            <SectionCard icon={<Users className="h-4 w-4" />} title="Customer segments" subtitle="Who it serves and their primary need">
              <SegmentRing segments={data.segments} />
            </SectionCard>

            <SectionCard icon={<DollarSign className="h-4 w-4" />} title="Revenue model" subtitle={data.revenue.scale}>
              <RevenueStack streams={data.revenue.streams} />
            </SectionCard>

            <SectionCard icon={<Rocket className="h-4 w-4" />} title="What's next" subtitle="Past → Now → Next">
              <div className="space-y-5">
                <Timeline past={data.whatsNext.past} now={data.whatsNext.now} next={data.whatsNext.next} />
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wide">Threats</span>
                    </div>
                    <ul className="space-y-1.5">
                      {data.whatsNext.threats.map((t: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive" />{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-cat-finance/20 bg-cat-finance-soft p-4">
                    <div className="mb-2 flex items-center gap-2 text-cat-finance">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wide">Opportunities</span>
                    </div>
                    <ul className="space-y-1.5">
                      {data.whatsNext.opportunities.map((t: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cat-finance" />{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </SectionCard>
          </>
        )}
      </main>
    </div>
  );
};

export default ProductPage;
