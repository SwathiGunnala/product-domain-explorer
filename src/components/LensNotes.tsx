import { useEffect, useRef, useState } from "react";
import { NotebookPen, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { storage, type LensKey } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface Props {
  slug: string;
  lens: LensKey;
  placeholder?: string;
}

export const LensNotes = ({ slug, lens, placeholder }: Props) => {
  const [value, setValue] = useState<string>("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const all = storage.getNotes(slug);
    setValue(all[lens] ?? "");
  }, [slug, lens]);

  const onChange = (v: string) => {
    setValue(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      storage.setNote(slug, lens, v);
      setSavedAt(Date.now());
    }, 400);
  };

  return (
    <div className="mt-4 rounded-xl border border-dashed bg-muted/30 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <NotebookPen className="h-3.5 w-3.5 text-primary" />
        Your notes
        <span className={cn(
          "ml-auto inline-flex items-center gap-1 text-[10px] font-medium transition-opacity",
          savedAt ? "opacity-70" : "opacity-0",
        )}>
          <Check className="h-3 w-3" /> Saved
        </span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Patterns, questions, hot takes — anything you want to remember about this lens…"}
        rows={3}
        className="resize-y border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
      />
    </div>
  );
};
