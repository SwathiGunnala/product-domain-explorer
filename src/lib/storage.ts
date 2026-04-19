// Local persistence keyed by domain/product slug.
const KEY_DOMAIN = (slug: string) => `de:domain:${slug}`;
const KEY_PRODUCT = (d: string, p: string) => `de:product:${d}:${p}`;
const KEY_QUESTIONS = (slug: string) => `de:questions:${slug}`;
const KEY_RECENT = "de:recent";
const KEY_SAVED_DOMAINS = "de:saved-domains";
const KEY_SAVED_QUESTIONS = "de:saved-questions";
const KEY_NOTES = (slug: string) => `de:notes:${slug}`;
const KEY_FLAGS = (slug: string) => `de:flags:${slug}`;
const KEY_NOTES_INDEX = "de:notes-index";
const KEY_FLAGS_INDEX = "de:flags-index";

export type LensKey = "overview" | "terminology" | "users" | "jobs" | "process" | "architecture" | "opportunities" | "products";
export type FlagKind = "users" | "jobs" | "opportunities" | "products" | "architecture" | "process";

export interface FlagEntry {
  id: string;       // stable, e.g. `${kind}:${normLabel}`
  kind: FlagKind;
  label: string;
  sub?: string;
  note?: string;
  ts: number;
}

function get<T>(k: string): T | null {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : null; } catch { return null; }
}
function set<T>(k: string, v: T) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export const storage = {
  getDomain: (slug: string) => get<any>(KEY_DOMAIN(slug)),
  setDomain: (slug: string, data: any) => set(KEY_DOMAIN(slug), data),
  getProduct: (d: string, p: string) => get<any>(KEY_PRODUCT(d, p)),
  setProduct: (d: string, p: string, data: any) => set(KEY_PRODUCT(d, p), data),
  getQuestions: (slug: string) => get<any>(KEY_QUESTIONS(slug)),
  setQuestions: (slug: string, data: any) => set(KEY_QUESTIONS(slug), data),

  getRecent: (): string[] => get<string[]>(KEY_RECENT) ?? [],
  pushRecent: (slug: string) => {
    const cur = (get<string[]>(KEY_RECENT) ?? []).filter(s => s !== slug);
    set(KEY_RECENT, [slug, ...cur].slice(0, 12));
  },

  getSavedDomains: (): string[] => get<string[]>(KEY_SAVED_DOMAINS) ?? [],
  toggleSavedDomain: (slug: string) => {
    const cur = get<string[]>(KEY_SAVED_DOMAINS) ?? [];
    const next = cur.includes(slug) ? cur.filter(s => s !== slug) : [slug, ...cur];
    set(KEY_SAVED_DOMAINS, next);
    return next.includes(slug);
  },

  getSavedQuestions: (): Array<{ id: string; domain: string; topic: string; difficulty: string; question: string }> =>
    get<any[]>(KEY_SAVED_QUESTIONS) ?? [],
  toggleSavedQuestion: (q: { id: string; domain: string; topic: string; difficulty: string; question: string }) => {
    const cur = get<any[]>(KEY_SAVED_QUESTIONS) ?? [];
    const exists = cur.some(x => x.id === q.id);
    const next = exists ? cur.filter(x => x.id !== q.id) : [q, ...cur];
    set(KEY_SAVED_QUESTIONS, next);
    return !exists;
  },
};
