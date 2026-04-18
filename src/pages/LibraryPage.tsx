import { Link } from "react-router-dom";
import { Bookmark, Library as LibraryIcon } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { DOMAINS } from "@/data/domains";
import { DomainTile } from "@/components/DomainTile";
import { useEffect, useState } from "react";

const LibraryPage = () => {
  const [saved, setSaved] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    setSaved(storage.getSavedDomains());
    setRecent(storage.getRecent());
  }, []);
  const savedList = saved.map(s => DOMAINS.find(d => d.slug === s)).filter(Boolean) as typeof DOMAINS;
  const recentList = recent.map(s => DOMAINS.find(d => d.slug === s)).filter(Boolean) as typeof DOMAINS;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-tile">
            <LibraryIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Your library</h1>
            <p className="text-sm text-muted-foreground">Saved & recently explored domains</p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
            <Bookmark className="h-4 w-4 text-primary" /> Saved
          </h2>
          {savedList.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center shadow-card">
              <p className="text-muted-foreground">No saved domains yet.</p>
              <Button asChild className="mt-3"><Link to="/">Explore domains</Link></Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {savedList.map(d => <DomainTile key={d.slug} domain={d} />)}
            </div>
          )}
        </section>

        {recentList.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-lg font-bold">Recently explored</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {recentList.map(d => <DomainTile key={d.slug} domain={d} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default LibraryPage;
