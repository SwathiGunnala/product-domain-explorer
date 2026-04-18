import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

// Map AI-suggested semantic hints (or any lucide name) → Lucide component.
// Falls back to Circle if the hint isn't found.
export function getIcon(hint?: string | null): LucideIcon {
  if (!hint) return Icons.Circle;
  // Try direct PascalCase match
  const normalized = hint
    .trim()
    .replace(/[_\s-]+/g, "-")
    .split("-")
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  const direct = (Icons as unknown as Record<string, LucideIcon>)[normalized];
  if (direct) return direct;

  // Common semantic hints
  const aliases: Record<string, string> = {
    money: "DollarSign", cash: "Banknote", card: "CreditCard", wallet: "Wallet",
    bank: "Landmark", lock: "Lock", security: "Shield", shield: "Shield",
    user: "User", users: "Users", person: "User", people: "Users",
    cart: "ShoppingCart", store: "Store", shop: "ShoppingBag",
    car: "Car", plane: "Plane", truck: "Truck", bike: "Bike",
    health: "HeartPulse", heart: "Heart", pill: "Pill", hospital: "Hospital",
    clock: "Clock", time: "Clock", calendar: "Calendar",
    chart: "BarChart3", graph: "LineChart", trending: "TrendingUp",
    code: "Code2", server: "Server", database: "Database", cloud: "Cloud",
    api: "Plug", network: "Network", globe: "Globe",
    target: "Target", goal: "Flag", flag: "Flag", check: "CheckCircle2",
    warning: "AlertTriangle", info: "Info", question: "HelpCircle",
    settings: "Settings", gear: "Settings", tool: "Wrench",
    file: "FileText", doc: "FileText", document: "FileText",
    mail: "Mail", email: "Mail", phone: "Phone", message: "MessageSquare",
    ai: "Sparkles", brain: "Brain", magic: "Wand2",
    box: "Package", package: "Package", layers: "Layers",
    arrow: "ArrowRight", refresh: "RefreshCw", search: "Search",
    home: "Home", building: "Building", factory: "Factory",
    education: "GraduationCap", book: "BookOpen", school: "School",
    game: "Gamepad2", trophy: "Trophy", star: "Star",
    fire: "Flame", energy: "Zap", power: "Zap", bolt: "Zap",
    eye: "Eye", view: "Eye",
    rocket: "Rocket", launch: "Rocket",
  };
  const aliasKey = hint.toLowerCase().replace(/[^a-z]/g, "");
  const aliased = aliases[aliasKey];
  if (aliased) {
    const c = (Icons as unknown as Record<string, LucideIcon>)[aliased];
    if (c) return c;
  }
  return Icons.Circle;
}
