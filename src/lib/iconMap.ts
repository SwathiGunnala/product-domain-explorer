import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

// Map AI-suggested semantic hints (or any lucide name) → Lucide component.
// Falls back to a stable per-hint icon (not always Circle) so visuals stay distinct.
const FALLBACK_POOL = [
  "Sparkles", "Zap", "Star", "Flag", "Target", "Layers", "Box", "Tag",
  "Compass", "Gem", "Rocket", "Lightbulb", "Puzzle", "Hexagon",
];

function hashPick(seed: string, pool: string[]) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return pool[Math.abs(h) % pool.length];
}

// Strip emoji / pictographs for normalization
function stripEmoji(s: string) {
  try {
    return s.replace(/\p{Extended_Pictographic}/gu, "").trim();
  } catch {
    return s.trim();
  }
}

export function getIcon(hint?: string | null): LucideIcon {
  if (!hint) return Icons.Sparkles;
  const cleaned = stripEmoji(hint);
  const seed = (cleaned || hint).toLowerCase();

  // Try direct PascalCase match
  if (cleaned) {
    const normalized = cleaned
      .replace(/[_\s-]+/g, "-")
      .split("-")
      .filter(Boolean)
      .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join("");
    const direct = (Icons as unknown as Record<string, LucideIcon>)[normalized];
    if (direct) return direct;
  }

  // Common semantic hints (incl. emoji aliases)
  const aliases: Record<string, string> = {
    money: "DollarSign", cash: "Banknote", card: "CreditCard", wallet: "Wallet",
    bank: "Landmark", lock: "Lock", security: "ShieldCheck", shield: "Shield",
    user: "User", users: "Users", person: "User", people: "Users", consumer: "User",
    customer: "User", merchant: "Store", buyer: "ShoppingBag", seller: "Store",
    cart: "ShoppingCart", store: "Store", shop: "ShoppingBag",
    car: "Car", plane: "Plane", truck: "Truck", bike: "Bike", ship: "Ship",
    health: "HeartPulse", heart: "Heart", pill: "Pill", hospital: "Hospital", doctor: "Stethoscope",
    clock: "Clock", time: "Clock", calendar: "Calendar",
    chart: "BarChart3", graph: "LineChart", trending: "TrendingUp", analytics: "PieChart",
    code: "Code2", server: "Server", database: "Database", cloud: "Cloud", cpu: "Cpu",
    api: "Plug", network: "Network", globe: "Globe", world: "Globe",
    target: "Target", goal: "Flag", flag: "Flag", check: "CheckCircle2",
    warning: "AlertTriangle", info: "Info", question: "HelpCircle",
    settings: "Settings", gear: "Settings", tool: "Wrench",
    file: "FileText", doc: "FileText", document: "FileText", report: "ClipboardList",
    mail: "Mail", email: "Mail", phone: "Phone", message: "MessageSquare", chat: "MessageCircle",
    ai: "Sparkles", brain: "Brain", magic: "Wand2", bot: "Bot",
    box: "Package", package: "Package", layers: "Layers", stack: "Layers",
    arrow: "ArrowRight", refresh: "RefreshCw", search: "Search", filter: "Filter",
    home: "Home", building: "Building2", factory: "Factory", office: "Building",
    education: "GraduationCap", book: "BookOpen", school: "School",
    game: "Gamepad2", trophy: "Trophy", star: "Star",
    fire: "Flame", energy: "Zap", power: "Zap", bolt: "Zap",
    eye: "Eye", view: "Eye",
    rocket: "Rocket", launch: "Rocket",
    regulator: "Scale", law: "Scale", legal: "Gavel", police: "Shield",
    fraud: "ShieldAlert", risk: "AlertOctagon",
    credit: "CreditCard", invoice: "Receipt", receipt: "Receipt",
    workflow: "Workflow", process: "Workflow", flow: "GitBranch",
    mobile: "Smartphone", web: "Monitor", desktop: "Monitor", tablet: "Tablet",
    pos: "ScanLine", terminal: "TerminalSquare", scan: "ScanLine",
    token: "KeyRound", key: "Key", auth: "Fingerprint", login: "LogIn",
    notify: "Bell", notification: "Bell", alert: "BellRing",
    delivery: "Truck", warehouse: "Warehouse",
    food: "UtensilsCrossed", restaurant: "ChefHat", coffee: "Coffee",
    fintech: "Lightbulb", innovator: "Lightbulb",
  };
  const aliasKey = seed.replace(/[^a-z]/g, "");
  const aliased = aliases[aliasKey];
  if (aliased) {
    const c = (Icons as unknown as Record<string, LucideIcon>)[aliased];
    if (c) return c;
  }

  // Stable fallback per hint so different items get different icons
  const fb = hashPick(seed || "x", FALLBACK_POOL);
  return (Icons as unknown as Record<string, LucideIcon>)[fb] || Icons.Sparkles;
}
