import {
  Baby, Handshake, Leaf, Megaphone, Music, PawPrint, Recycle, Satellite, Ticket, TrainFront,
  AlertOctagon, AlertTriangle, Apple, ArrowRight, Banknote, BarChart3, BedDouble, Bell, BellRing, Bike, Bitcoin,
  Blocks, BookCopy, BookOpen, Bot, Box, Brain, Briefcase, Building, Building2, Calculator, Calendar, Car,
  CheckCircle2, CheckSquare, ChefHat, CircleMinus, CirclePlus, ClipboardList, Clock, Cloud, Code, Code2, Coffee,
  Coins, Compass, Cpu, CreditCard, Database, DollarSign, Dumbbell, Edit3, Eye, Factory, FileText, Filter,
  Fingerprint, Flag, Flame, FolderOpen, Gamepad2, Gavel, Gem, GitBranch, Globe, GraduationCap, HandCoins,
  HardHat, Heart, HeartPulse, HelpCircle, Hexagon, Home, Hospital, Info, Key, KeyRound, Landmark, Layers,
  Lightbulb, LineChart, Lock, LogIn, Mail, MessageCircle, MessageSquare, Monitor, MousePointerClick, Navigation,
  Network, Package, Percent, Phone, PieChart, Pill, Plane, PlayCircle, Plug, Puzzle, Receipt, RefreshCw, Rocket,
  Scale, ScanLine, School, Search, Send, Server, Settings, Shield, ShieldAlert, ShieldCheck, Ship, Shirt,
  ShoppingBag, ShoppingCart, Smartphone, Sparkles, Star, Stethoscope, Store, Tag, Target, TerminalSquare, ToyBrick,
  TrendingUp, Trophy, Truck, UploadCloud, User, Users, UtensilsCrossed, Wallet, Wand2, Warehouse, Waypoints, Wheat,
  Workflow, Wrench, Zap, type LucideIcon,
} from "lucide-react";

const Icons: Record<string, LucideIcon> = {
  Baby, Handshake, Leaf, Megaphone, Music, PawPrint, Recycle, Satellite, Ticket, TrainFront,
  AlertOctagon, AlertTriangle, Apple, ArrowRight, Banknote, BarChart3, BedDouble, Bell, BellRing, Bike, Bitcoin,
  Blocks, BookCopy, BookOpen, Bot, Box, Brain, Briefcase, Building, Building2, Calculator, Calendar, Car,
  CheckCircle2, CheckSquare, ChefHat, CircleMinus, CirclePlus, ClipboardList, Clock, Cloud, Code, Code2, Coffee,
  Coins, Compass, Cpu, CreditCard, Database, DollarSign, Dumbbell, Edit3, Eye, Factory, FileText, Filter,
  Fingerprint, Flag, Flame, FolderOpen, Gamepad2, Gavel, Gem, GitBranch, Globe, GraduationCap, HandCoins,
  HardHat, Heart, HeartPulse, HelpCircle, Hexagon, Home, Hospital, Info, Key, KeyRound, Landmark, Layers,
  Lightbulb, LineChart, Lock, LogIn, Mail, MessageCircle, MessageSquare, Monitor, MousePointerClick, Navigation,
  Network, Package, Percent, Phone, PieChart, Pill, Plane, PlayCircle, Plug, Puzzle, Receipt, RefreshCw, Rocket,
  Scale, ScanLine, School, Search, Send, Server, Settings, Shield, ShieldAlert, ShieldCheck, Ship, Shirt,
  ShoppingBag, ShoppingCart, Smartphone, Sparkles, Star, Stethoscope, Store, Tag, Target, TerminalSquare, ToyBrick,
  TrendingUp, Trophy, Truck, UploadCloud, User, Users, UtensilsCrossed, Wallet, Wand2, Warehouse, Waypoints, Wheat,
  Workflow, Wrench, Zap,
  Gateway: Network,
};

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
  if (!hint) return Sparkles;
  const cleaned = stripEmoji(hint);
  const seed = (cleaned || hint).toLowerCase();

  // Exact lucide name match first (e.g. "CreditCard", "TrainFront")
  if (cleaned && Icons[cleaned]) return Icons[cleaned];

  // Try direct PascalCase match
  if (cleaned) {
    const normalized = cleaned
      .replace(/[_\s-]+/g, "-")
      .split("-")
      .filter(Boolean)
      .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join("");
    const direct = Icons[normalized];
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
    const c = Icons[aliased];
    if (c) return c;
  }

  // Stable fallback per hint so different items get different icons
  const fb = hashPick(seed || "x", FALLBACK_POOL);
  return Icons[fb] || Sparkles;
}
