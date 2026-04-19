import { useMemo, useState } from "react";
import { Flag, Plus, X } from "lucide-react";
import { storage, type FlagKind } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface Item { label: string; sub?: string }

interface Props {
  slug: string;
  kind: FlagKind;
  items: Item[];
  emptyHint?: string;
}

const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const FlagPicker = ({ slug, kind, items, emptyHint }: Props) => {
  const [tick, setTick] = useState(0);
  const flagsBySlug = useMemo(() => storage.getFlags(slug), [slug, tick]);

  const isOn = (label: string) => {
    const id = `${kind}:${norm(label)}`;
    return flagsBySlug.some(f => f.id === id);
  };

  const toggle = (it: Item) => {
    const id = `${kind}:${norm(it.label)}`;
    storage.toggleFlag(slug, { id, kind, label: it.label, sub: it.sub });
    setTick(t => t + 1);
  };

  if (!items?.length) return null;

  const flagged = items.filter(i => isOn(i.label));
  const unflagged = items.filter(i => !isOn(i.label));

  return (
    <div className="mt-4 rounded-xl border border-dashed bg-muted/30 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Flag className="h-3.5 w-3.5 text-primary" />
        Flag patterns worth remembering
        {flagged.length > 0 && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            {flagged.length} flagged
          </span>
        )}
      </div>

      {flagged.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {flagged.map(it => (
            <button
              key={it.label}
              onClick={() => toggle(it)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-smooth hover:bg-primary/20"
            >
              <Flag className="h-3 w-3 fill-current" />
              {it.label}
              <X className="h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {unflagged.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unflagged.map(it => (
            <button
              key={it.label}
              onClick={() => toggle(it)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-smooth",
                "hover:border-primary/40 hover:text-foreground",
              )}
            >
              <Plus className="h-3 w-3" />
              {it.label}
            </button>
          ))}
        </div>
      )}

      {flagged.length === 0 && unflagged.length === 0 && (
        <div className="text-xs text-muted-foreground">{emptyHint || "Nothing to flag yet."}</div>
      )}
    </div>
  );
};
