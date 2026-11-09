// Contenuti modificabili dal pannello /admin, salvati in src/content/site-edits.json.
// - items/images/videos/links: modifiche sopra la pagina. Ogni testo/immagine/video/link è
//   identificato da pagina + tag + testo (o src/href) originale + occorrenza, e le modifiche
//   vengono riapplicate al DOM ogni volta che React lo aggiorna.
// - news: le card della sezione Novità.
import initial from "@/content/site-edits.json";
import type { HoursData } from "@/lib/hours";

export type Breakpoint = "desktop" | "mobile";

export type ItemEdit = {
  texts?: string[];
  font?: string;
  weight?: number;
  color?: string;
  size?: Partial<Record<Breakpoint, number>>;
  move?: Partial<Record<Breakpoint, [number, number]>>;
};

export type NewsItem =
  | { id: string; type: "app" }
  | { id: string; type: "image"; src: string; alt?: string; title?: string; titleEn?: string; fit?: "cover" | "contain"; until?: string };

export type GalleryItem = { src: string; alt?: string };

export type SiteEditsData = {
  globals: { displayFont?: string; bodyFont?: string };
  items: Record<string, ItemEdit>;
  images: Record<string, string>;
  videos: Record<string, string>;
  links: Record<string, string>;
  news: NewsItem[];
  gallery?: GalleryItem[];
  /** Foto della sezione "Le Nostre Creazioni" in homepage */
  creations?: GalleryItem[];
  hours?: HoursData;
};

export const FONT_OPTIONS = [
  "Oswald", "Inter", "Rubik Dirt", "Anton", "Black Ops One", "Abril Fatface",
  "Bebas Neue", "Barlow Condensed", "Teko", "Fjalla One", "Big Shoulders Display", "Staatliches",
  "Saira Condensed", "Archivo Narrow", "Archivo Black", "Bungee", "Alfa Slab One", "Permanent Marker",
  "Rye", "Playfair Display", "Cinzel", "Righteous", "Caveat Brush",
  "DM Sans", "Manrope", "Work Sans", "Poppins", "Lato", "Nunito Sans", "Barlow", "Karla", "Montserrat", "Josefin Sans",
];

// Già caricati da index.css
const PRELOADED_FONTS = ["Rubik Dirt", "Anton", "Black Ops One", "Oswald", "Inter", "Abril Fatface"];
const SINGLE_WEIGHT_FONTS = ["Bebas Neue", "Anton", "Fjalla One", "Staatliches", "Archivo Black", "Bungee", "Alfa Slab One",
  "Permanent Marker", "Rye", "Righteous", "Caveat Brush", "Rubik Dirt", "Black Ops One", "Abril Fatface"];

const STYLE_PROPS = ["font-family", "font-size", "font-weight", "color", "translate"] as const;
const MOBILE_MAX = 767;

type Info = { nodes: Text[]; orig: string[]; applied: string[]; style: Record<string, string> | null };
type AttrInfo = { orig: string; applied: string };

export function normalize(d: Partial<SiteEditsData>): SiteEditsData {
  return {
    globals: { ...d.globals }, items: { ...d.items }, images: { ...d.images }, videos: { ...d.videos }, links: { ...d.links },
    news: [...(d.news ?? [])], gallery: d.gallery ? [...d.gallery] : undefined,
    creations: d.creations ? [...d.creations] : undefined, hours: d.hours,
  };
}

let data: SiteEditsData = normalize(initial as Partial<SiteEditsData>);
let adminMode = false;
const infos = new WeakMap<Element, Info>();
const srcInfos = new WeakMap<Element, AttrInfo>();
const hrefInfos = new WeakMap<Element, AttrInfo>();
let keyOf = new WeakMap<Element, string>();
let elementOf = new Map<string, HTMLElement>();
let linkKeyOf = new WeakMap<Element, string>();
const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;
let scheduled = false;
let lastBp: Breakpoint | null = null;
let fontLink: HTMLLinkElement | null = null;

export function currentBreakpoint(): Breakpoint {
  return window.innerWidth <= MOBILE_MAX ? "mobile" : "desktop";
}

export function getEdits(): SiteEditsData {
  return data;
}

// Annulla / ripeti: ogni modifica salva lo stato precedente. Le modifiche continue sulla stessa cosa
// (lettere mentre scrivi, movimenti mentre trascini: stesso `group`) contano come una sola.
const UNDO_MAX = 100;
const UNDO_GROUP_MS = 700;
let undoStack: SiteEditsData[] = [];
let redoStack: SiteEditsData[] = [];
let lastChange = 0;
let lastGroup: string | undefined;

/** `record: false` per caricamenti (bozza, versione pubblicata): non finiscono tra le modifiche annullabili */
export function setEdits(next: Partial<SiteEditsData>, { record = true, group }: { record?: boolean; group?: string } = {}) {
  if (record) {
    const now = Date.now();
    const sameStroke = !!group && group === lastGroup && now - lastChange <= UNDO_GROUP_MS;
    if (!sameStroke) {
      undoStack.push(data);
      if (undoStack.length > UNDO_MAX) undoStack.shift();
    }
    lastChange = now;
    lastGroup = group;
    redoStack = [];
  } else {
    undoStack = [];
    redoStack = [];
  }
  data = normalize(next);
  applyAll();
}

export function canUndo() {
  return undoStack.length > 0;
}

export function canRedo() {
  return redoStack.length > 0;
}

export function undo() {
  const prev = undoStack.pop();
  if (!prev) return;
  redoStack.push(data);
  data = prev;
  lastChange = 0;
  applyAll();
}

export function redo() {
  const next = redoStack.pop();
  if (!next) return;
  undoStack.push(data);
  data = next;
  lastChange = 0;
  applyAll();
}

export function isAdminMode() {
  return adminMode;
}

export function setAdminMode(on: boolean) {
  adminMode = on;
  listeners.forEach((l) => l());
}

export function getKey(el: Element): string | undefined {
  return keyOf.get(el);
}

export function getElement(key: string): HTMLElement | undefined {
  return elementOf.get(key);
}

export function keysWithin(root: Element): string[] {
  return [...elementOf].filter(([, el]) => root.contains(el)).map(([k]) => k);
}

export function getOriginalTexts(el: Element): string[] {
  return infos.get(el)?.orig ?? [];
}

export function getOriginalSrc(el: Element): string | undefined {
  return srcInfos.get(el)?.orig;
}

/** Chiave del link (<a>) che contiene l'elemento, se c'è */
export function getLinkKey(el: Element): string | undefined {
  const a = el.closest("a");
  return a ? linkKeyOf.get(a) : undefined;
}

export function getOriginalHref(el: Element): string | undefined {
  const a = el.closest("a");
  return a ? hrefInfos.get(a)?.orig : undefined;
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function directTexts(el: Element): Text[] {
  const out: Text[] = [];
  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && n.nodeValue && n.nodeValue.trim()) out.push(n as Text);
  });
  return out;
}

function intact(el: Element, info: Info) {
  return info.nodes.every((t, i) => t.parentNode === el && t.nodeValue === info.applied[i]);
}

function applyStyles(el: HTMLElement, info: Info, edit: ItemEdit | undefined, bp: Breakpoint) {
  const styles: Record<string, string> = {};
  if (edit?.font) styles["font-family"] = `'${edit.font}', sans-serif`;
  if (edit?.weight) styles["font-weight"] = String(edit.weight);
  if (edit?.color) styles["color"] = edit.color;
  const size = edit?.size?.[bp];
  if (size) styles["font-size"] = `${size}px`;
  const mv = edit?.move?.[bp];
  if (mv && (mv[0] || mv[1])) styles["translate"] = `${mv[0]}px ${mv[1]}px`;

  if (!info.style && !Object.keys(styles).length) return;
  if (!info.style) info.style = Object.fromEntries(STYLE_PROPS.map((p) => [p, el.style.getPropertyValue(p)]));
  for (const p of STYLE_PROPS) {
    const ours = styles[p];
    const value = ours ?? info.style[p];
    const priority = ours ? "important" : "";
    if (el.style.getPropertyValue(p) === value && el.style.getPropertyPriority(p) === priority) continue;
    if (value) el.style.setProperty(p, value, priority);
    else el.style.removeProperty(p);
  }
}

function applyItem(el: HTMLElement, info: Info, edit: ItemEdit | undefined, bp: Breakpoint) {
  const want = info.orig.map((o, i) => edit?.texts?.[i] ?? o);
  info.nodes.forEach((t, i) => { if (t.nodeValue !== want[i]) t.nodeValue = want[i]; });
  info.applied = want;
  applyStyles(el, info, edit, bp);
}

function applyGlobals() {
  const root = document.documentElement.style;
  const { displayFont, bodyFont } = data.globals;
  if (displayFont) root.setProperty("--app-font-display", `'${displayFont}', sans-serif`);
  else root.removeProperty("--app-font-display");
  if (bodyFont) root.setProperty("--app-font-sans", `'${bodyFont}', sans-serif`);
  else root.removeProperty("--app-font-sans");

  const used = new Set<string>();
  if (displayFont) used.add(displayFont);
  if (bodyFont) used.add(bodyFont);
  Object.values(data.items).forEach((e) => { if (e.font) used.add(e.font); });
  const toLoad = [...used].filter((f) => !PRELOADED_FONTS.includes(f)).sort();
  const href = toLoad.length
    ? `https://fonts.googleapis.com/css2?${toLoad.map((f) => `family=${f.replace(/ /g, "+")}${SINGLE_WEIGHT_FONTS.includes(f) ? "" : ":wght@300;400;500;600;700"}`).join("&")}&display=swap`
    : "";
  if (fontLink?.href === href) return;
  fontLink?.remove();
  fontLink = null;
  if (href) {
    fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = href;
    document.head.appendChild(fontLink);
  }
}

function pass() {
  scheduled = false;
  observer?.disconnect();
  const bp = currentBreakpoint();
  lastBp = bp;
  const counts = new Map<string, number>();
  const nextKeyOf = new WeakMap<Element, string>();
  const nextElementOf = new Map<string, HTMLElement>();
  const nextLinkKeyOf = new WeakMap<Element, string>();
  const occurrence = (base: string) => {
    const n = counts.get(base) ?? 0;
    counts.set(base, n + 1);
    return `${base}::${n}`;
  };
  const register = (el: HTMLElement, base: string) => {
    const key = occurrence(base);
    nextKeyOf.set(el, key);
    nextElementOf.set(key, el);
    return key;
  };
  // Sostituisce un attributo (src/href) se c'è una modifica, ricordando il valore originale
  const swapAttr = (el: HTMLElement, attr: string, store: WeakMap<Element, AttrInfo>, edits: Record<string, string>, key: (orig: string) => string) => {
    const current = el.getAttribute(attr) ?? "";
    let info = store.get(el);
    if (!info || current !== info.applied) {
      info = { orig: current, applied: current };
      store.set(el, info);
    }
    const k = key(info.orig);
    const want = edits[k] ?? info.orig;
    if (current !== want) el.setAttribute(attr, want);
    info.applied = want;
    return k;
  };
  const styleOnly = (el: HTMLElement, key: string) => {
    let styleInfo = infos.get(el);
    if (!styleInfo) {
      styleInfo = { nodes: [], orig: [], applied: [], style: null };
      infos.set(el, styleInfo);
    }
    applyStyles(el, styleInfo, data.items[key], bp);
  };

  for (const el of document.body.querySelectorAll<HTMLElement>("*")) {
    if (el.closest("script, style, noscript, svg, [data-admin-ui]")) continue;
    const scope = el.closest("nav, footer") ? "*" : window.location.pathname;

    if (el instanceof HTMLImageElement) {
      const key = swapAttr(el, "src", srcInfos, data.images, (orig) => register(el, `${scope}::img::${orig}`));
      styleOnly(el, key);
      continue;
    }

    if (el instanceof HTMLVideoElement) {
      const key = swapAttr(el, "src", srcInfos, data.videos, (orig) => register(el, `${scope}::video::${orig}`));
      // La copertina del video originale non va bene per quello nuovo
      if (data.videos[key]) el.removeAttribute("poster");
      styleOnly(el, key);
      continue;
    }

    // Destinazione dei link (<a>): chiave a parte
    if (el instanceof HTMLAnchorElement) {
      const k = swapAttr(el, "href", hrefInfos, data.links, (orig) => occurrence(`${scope}::link::${orig}`));
      nextLinkKeyOf.set(el, k);
    }

    let info = infos.get(el);
    if (!info || !intact(el, info)) {
      const nodes = directTexts(el);
      if (!nodes.length && !info) continue;
      info = { nodes, orig: nodes.map((n) => n.nodeValue!), applied: nodes.map((n) => n.nodeValue!), style: info?.style ?? null };
      infos.set(el, info);
    }
    if (!info.nodes.length) {
      applyItem(el, info, undefined, bp);
      continue;
    }
    const key = register(el, `${scope}::${el.tagName.toLowerCase()}::${info.orig.map((t) => t.trim()).join(" | ")}`);
    applyItem(el, info, data.items[key], bp);
  }

  keyOf = nextKeyOf;
  elementOf = nextElementOf;
  linkKeyOf = nextLinkKeyOf;
  observer?.observe(document.body, { childList: true, subtree: true, characterData: true });
  listeners.forEach((l) => l());
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(pass);
}

export function applyAll() {
  applyGlobals();
  pass();
}

// In localhost: se questo file cambia, ricarica la pagina invece di tenere due copie dello stato
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());

export function startSiteEdits() {
  if (observer) return;
  // Le modifiche dentro il pannello admin non contano: evita di rifare il giro a ogni suo render
  observer = new MutationObserver((records) => {
    if (records.some((r) => !(r.target instanceof Element ? r.target : r.target.parentElement)?.closest("[data-admin-ui]"))) schedule();
  });
  window.addEventListener("resize", () => { if (currentBreakpoint() !== lastBp) schedule(); });
  window.addEventListener("popstate", schedule);
  applyAll();
  // In localhost il JSON importato può essere vecchio: prende sempre l'ultima versione salvata
  if (import.meta.env.DEV) {
    // (se nel frattempo si è aperto il pannello admin, lui ha già caricato la bozza: non sovrascriverla)
    fetch("/api/admin/content").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && !adminMode) setEdits(d, { record: false }); }).catch(() => {});
  }
}
