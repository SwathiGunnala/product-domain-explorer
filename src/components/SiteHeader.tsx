import { Link, NavLink, useLocation } from "react-router-dom";
import { Compass, Library, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export const SiteHeader = () => {
  const loc = useLocation();
  const items = [
    { to: "/", label: "Explore", icon: Compass },
    { to: "/library", label: "Library", icon: Library },
    { to: "/interview-prep", label: "Interview Prep", icon: Brain },
  ];
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-hero shadow-tile">
            <Compass className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-base font-bold tracking-tight">Domain Explorer</span>
        </Link>
        <nav className="flex items-center gap-1">
          {items.map(it => {
            const Icon = it.icon;
            const active = loc.pathname === it.to || (it.to !== "/" && loc.pathname.startsWith(it.to));
            return (
              <NavLink
                key={it.to}
                to={it.to}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-smooth",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{it.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
