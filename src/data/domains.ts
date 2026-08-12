export type CategoryKey = "finance" | "mobility" | "health" | "tech" | "commerce" | "play" | "real";

export interface DomainDef {
  slug: string;
  name: string;
  tagline: string;
  icon: string; // lucide icon name (PascalCase)
  category: CategoryKey;
}

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: "finance", label: "Finance & Money", icon: "Coins" },
  { key: "mobility", label: "Mobility & Travel", icon: "Plane" },
  { key: "health", label: "Health & Life", icon: "HeartPulse" },
  { key: "tech", label: "Tech & Industry", icon: "Cpu" },
  { key: "commerce", label: "Commerce & Consumer", icon: "ShoppingBag" },
  { key: "play", label: "Learn & Play", icon: "Gamepad2" },
  { key: "real", label: "Real-world", icon: "Building2" },
];

export const DOMAINS: DomainDef[] = [
  // Finance
  { slug: "payments", name: "Payments", tagline: "Money moving between parties", icon: "CreditCard", category: "finance" },
  { slug: "banking", name: "Banking", tagline: "Accounts, deposits & lending", icon: "Landmark", category: "finance" },
  { slug: "mortgage", name: "Mortgage", tagline: "Home loans & origination", icon: "Home", category: "finance" },
  { slug: "insurance", name: "Insurance", tagline: "Risk pooling & claims", icon: "ShieldCheck", category: "finance" },
  { slug: "wealth-management", name: "Wealth Management", tagline: "Investing & advisory", icon: "TrendingUp", category: "finance" },
  { slug: "crypto", name: "Crypto", tagline: "On-chain assets & DeFi", icon: "Bitcoin", category: "finance" },

  // Mobility
  { slug: "automobiles", name: "Automobiles", tagline: "Cars, EVs & dealers", icon: "Car", category: "mobility" },
  { slug: "airlines", name: "Airlines", tagline: "Air travel & ticketing", icon: "Plane", category: "mobility" },
  { slug: "ride-sharing", name: "Ride-sharing", tagline: "On-demand mobility", icon: "Navigation", category: "mobility" },
  { slug: "logistics", name: "Logistics", tagline: "Freight & last-mile", icon: "Truck", category: "mobility" },
  { slug: "hospitality", name: "Hospitality", tagline: "Hotels & stays", icon: "BedDouble", category: "mobility" },

  // Health
  { slug: "healthcare", name: "Healthcare", tagline: "Providers, patients & payers", icon: "HeartPulse", category: "health" },
  { slug: "pharma", name: "Pharma", tagline: "Drug discovery & supply", icon: "Pill", category: "health" },
  { slug: "fitness", name: "Fitness", tagline: "Training & wearables", icon: "Dumbbell", category: "health" },
  { slug: "mental-health", name: "Mental Health", tagline: "Therapy & wellbeing", icon: "Brain", category: "health" },

  // Tech
  { slug: "robotics", name: "Robotics", tagline: "Autonomous machines", icon: "Bot", category: "tech" },
  { slug: "ai-platforms", name: "AI Platforms", tagline: "Models & infrastructure", icon: "Sparkles", category: "tech" },
  { slug: "cybersecurity", name: "Cybersecurity", tagline: "Defense & detection", icon: "Shield", category: "tech" },
  { slug: "devtools", name: "DevTools", tagline: "Build, ship, run", icon: "Code2", category: "tech" },
  { slug: "cloud-infrastructure", name: "Cloud Infrastructure", tagline: "Compute, storage, network", icon: "Cloud", category: "tech" },

  // Commerce
  { slug: "retail", name: "Retail", tagline: "Stores & merchandising", icon: "ShoppingBag", category: "commerce" },
  { slug: "ecommerce", name: "E-commerce", tagline: "Online storefronts", icon: "ShoppingCart", category: "commerce" },
  { slug: "grocery", name: "Grocery", tagline: "Food retail & delivery", icon: "Apple", category: "commerce" },
  { slug: "food-delivery", name: "Food Delivery", tagline: "Restaurants on-demand", icon: "UtensilsCrossed", category: "commerce" },
  { slug: "fashion", name: "Fashion", tagline: "Apparel & trends", icon: "Shirt", category: "commerce" },

  // Play & Learn
  { slug: "education", name: "Education", tagline: "Learning at every age", icon: "GraduationCap", category: "play" },
  { slug: "gaming", name: "Gaming", tagline: "Games, engines & studios", icon: "Gamepad2", category: "play" },
  { slug: "toys", name: "Toys", tagline: "Play & development", icon: "ToyBrick", category: "play" },
  { slug: "legos", name: "Legos", tagline: "Building blocks & sets", icon: "Blocks", category: "play" },
  { slug: "streaming", name: "Streaming", tagline: "Video, audio & live", icon: "PlayCircle", category: "play" },
  { slug: "social-media", name: "Social Media", tagline: "Networks & creators", icon: "MessageCircle", category: "play" },

  // Real-world
  { slug: "real-estate", name: "Real Estate", tagline: "Property & rentals", icon: "Building", category: "real" },
  { slug: "energy", name: "Energy", tagline: "Power & utilities", icon: "Zap", category: "real" },
  { slug: "agriculture", name: "Agriculture", tagline: "Farms & food supply", icon: "Wheat", category: "real" },
  { slug: "manufacturing", name: "Manufacturing", tagline: "Factories & supply", icon: "Factory", category: "real" },
  { slug: "construction", name: "Construction", tagline: "Building the world", icon: "HardHat", category: "real" },

  // Finance (expanded)
  { slug: "lending-bnpl", name: "Lending & BNPL", tagline: "Credit at checkout", icon: "HandCoins", category: "finance" },
  { slug: "accounting-tax", name: "Accounting & Tax", tagline: "Books, filings & compliance", icon: "Calculator", category: "finance" },
  { slug: "payroll-hr-tech", name: "Payroll & HR Tech", tagline: "Pay, benefits & people ops", icon: "Briefcase", category: "finance" },
  { slug: "capital-markets", name: "Capital Markets", tagline: "Trading & market infrastructure", icon: "LineChart", category: "finance" },
  { slug: "regtech-compliance", name: "RegTech & Compliance", tagline: "KYC, AML & reporting", icon: "Scale", category: "finance" },
  { slug: "merchant-solutions", name: "Merchant Solutions", tagline: "Acquiring & POS", icon: "Store", category: "finance" },

  // Mobility (expanded)
  { slug: "travel-booking", name: "Travel Booking", tagline: "OTAs & trip planning", icon: "Compass", category: "mobility" },
  { slug: "maritime-shipping", name: "Maritime & Shipping", tagline: "Ports & ocean freight", icon: "Ship", category: "mobility" },
  { slug: "space", name: "Space", tagline: "Launch, satellites & orbit", icon: "Satellite", category: "mobility" },
  { slug: "public-transit", name: "Public Transit", tagline: "Rail, bus & fares", icon: "TrainFront", category: "mobility" },

  // Health (expanded)
  { slug: "elder-care", name: "Elder Care", tagline: "Aging & long-term care", icon: "Heart", category: "health" },
  { slug: "childcare", name: "Childcare", tagline: "Daycare & family support", icon: "Baby", category: "health" },
  { slug: "health-insurance-tech", name: "Health Insurance Tech", tagline: "Payers, claims & benefits", icon: "ShieldCheck", category: "health" },
  { slug: "medical-devices", name: "Medical Devices", tagline: "Diagnostics & equipment", icon: "Stethoscope", category: "health" },

  // Tech (expanded)
  { slug: "telecom", name: "Telecom", tagline: "Networks & connectivity", icon: "Phone", category: "tech" },
  { slug: "semiconductors", name: "Semiconductors", tagline: "Chips, fabs & design", icon: "Cpu", category: "tech" },
  { slug: "data-platforms", name: "Data Platforms", tagline: "Pipelines, lakes & BI", icon: "Database", category: "tech" },
  { slug: "martech-adtech", name: "MarTech & AdTech", tagline: "Ads, campaigns & attribution", icon: "Megaphone", category: "tech" },
  { slug: "crm-sales-tech", name: "CRM & Sales Tech", tagline: "Pipeline & revenue teams", icon: "Target", category: "tech" },
  { slug: "customer-support", name: "Customer Support", tagline: "Tickets, chat & deflection", icon: "MessageSquare", category: "tech" },
  { slug: "erp", name: "ERP", tagline: "Core business systems", icon: "Layers", category: "tech" },
  { slug: "procurement-supply-chain", name: "Procurement & Supply Chain", tagline: "Sourcing & fulfilment software", icon: "Warehouse", category: "tech" },

  // Commerce (expanded)
  { slug: "marketplaces", name: "Marketplaces", tagline: "Two-sided liquidity", icon: "Waypoints", category: "commerce" },
  { slug: "subscription-boxes", name: "Subscription Boxes", tagline: "Recurring physical goods", icon: "Package", category: "commerce" },
  { slug: "beauty", name: "Beauty", tagline: "Cosmetics & personal care", icon: "Gem", category: "commerce" },
  { slug: "pets", name: "Pets", tagline: "Food, vets & care", icon: "PawPrint", category: "commerce" },
  { slug: "home-services", name: "Home Services", tagline: "Repairs & on-demand pros", icon: "Wrench", category: "commerce" },

  // Learn & Play (expanded)
  { slug: "sports", name: "Sports", tagline: "Leagues, fans & betting", icon: "Trophy", category: "play" },
  { slug: "music", name: "Music", tagline: "Artists, labels & streams", icon: "Music", category: "play" },
  { slug: "creator-economy", name: "Creator Economy", tagline: "Creators & monetization", icon: "Sparkles", category: "play" },
  { slug: "dating", name: "Dating", tagline: "Matching & relationships", icon: "Heart", category: "play" },
  { slug: "ticketing-events", name: "Ticketing & Events", tagline: "Live events & access", icon: "Ticket", category: "play" },

  // Real-world (expanded)
  { slug: "govtech", name: "Government & GovTech", tagline: "Public services & digital ID", icon: "Landmark", category: "real" },
  { slug: "legal-tech", name: "Legal Tech", tagline: "Contracts, courts & counsel", icon: "Gavel", category: "real" },
  { slug: "defense-aerospace", name: "Defense & Aerospace", tagline: "Programs & national security", icon: "Shield", category: "real" },
  { slug: "climate-tech", name: "Climate Tech", tagline: "Decarbonization & credits", icon: "Leaf", category: "real" },
  { slug: "mining-materials", name: "Mining & Materials", tagline: "Extraction & raw inputs", icon: "Hexagon", category: "real" },
  { slug: "water-waste", name: "Water & Waste", tagline: "Utilities & recycling", icon: "Recycle", category: "real" },
  { slug: "recruiting-jobs", name: "Recruiting & Jobs", tagline: "Hiring & job marketplaces", icon: "Handshake", category: "real" },
  { slug: "non-profit", name: "Non-profit", tagline: "Donors, programs & impact", icon: "Globe", category: "real" },
];

export const getDomainBySlug = (slug: string) => DOMAINS.find(d => d.slug === slug);
export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
