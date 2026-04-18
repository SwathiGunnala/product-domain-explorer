import { cn } from "@/lib/utils";

export const DifficultyDots = ({ difficulty }: { difficulty: string }) => {
  const map: Record<string, { count: number; color: string; bg: string; label: string }> = {
    Easy: { count: 1, color: "bg-easy", bg: "bg-easy/15 text-easy", label: "Easy" },
    Medium: { count: 2, color: "bg-medium", bg: "bg-medium/15 text-medium", label: "Medium" },
    Hard: { count: 3, color: "bg-hard", bg: "bg-hard/15 text-hard", label: "Hard" },
  };
  const cfg = map[difficulty] ?? map.Medium;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", cfg.bg)}>
      <span className="flex gap-0.5">
        {[1, 2, 3].map(i => (
          <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i <= cfg.count ? cfg.color : "bg-current opacity-20")} />
        ))}
      </span>
      {cfg.label}
    </span>
  );
};
