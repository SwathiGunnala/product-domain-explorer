import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props { id?: string; icon: ReactNode; title: string; subtitle?: string; children: ReactNode; className?: string }

export const SectionCard = ({ id, icon, title, subtitle, children, className }: Props) => (
  <section id={id} className={cn("rounded-2xl border bg-card p-5 shadow-card md:p-6", className)}>
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-tile">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);
