import type { CategoryKey } from "@/data/domains";

export const CATEGORY_STYLES: Record<CategoryKey, {
  text: string; bg: string; border: string; ring: string; gradient: string; dot: string;
}> = {
  finance: {
    text: "text-cat-finance",
    bg: "bg-cat-finance-soft",
    border: "border-cat-finance/20",
    ring: "ring-cat-finance/30",
    gradient: "from-cat-finance-soft to-cat-finance/10",
    dot: "bg-cat-finance",
  },
  mobility: {
    text: "text-cat-mobility",
    bg: "bg-cat-mobility-soft",
    border: "border-cat-mobility/20",
    ring: "ring-cat-mobility/30",
    gradient: "from-cat-mobility-soft to-cat-mobility/10",
    dot: "bg-cat-mobility",
  },
  health: {
    text: "text-cat-health",
    bg: "bg-cat-health-soft",
    border: "border-cat-health/20",
    ring: "ring-cat-health/30",
    gradient: "from-cat-health-soft to-cat-health/10",
    dot: "bg-cat-health",
  },
  tech: {
    text: "text-cat-tech",
    bg: "bg-cat-tech-soft",
    border: "border-cat-tech/20",
    ring: "ring-cat-tech/30",
    gradient: "from-cat-tech-soft to-cat-tech/10",
    dot: "bg-cat-tech",
  },
  commerce: {
    text: "text-cat-commerce",
    bg: "bg-cat-commerce-soft",
    border: "border-cat-commerce/20",
    ring: "ring-cat-commerce/30",
    gradient: "from-cat-commerce-soft to-cat-commerce/10",
    dot: "bg-cat-commerce",
  },
  play: {
    text: "text-cat-play",
    bg: "bg-cat-play-soft",
    border: "border-cat-play/20",
    ring: "ring-cat-play/30",
    gradient: "from-cat-play-soft to-cat-play/10",
    dot: "bg-cat-play",
  },
  real: {
    text: "text-cat-real",
    bg: "bg-cat-real-soft",
    border: "border-cat-real/20",
    ring: "ring-cat-real/30",
    gradient: "from-cat-real-soft to-cat-real/10",
    dot: "bg-cat-real",
  },
};
