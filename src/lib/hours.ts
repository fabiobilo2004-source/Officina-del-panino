// Orari delle due sedi: un'unica fonte per badge aperto/chiuso, homepage, contatti, footer e navbar.
// I dati stanno in src/content/site-edits.json (campo "hours") e si modificano dal pannello admin.
import { useSyncExternalStore } from "react";
import { getEdits, subscribe } from "@/lib/site-edits";

export type LocationKey = "rimini" | "santarcangelo";
export type DayHours = { open: string; close: string } | null;
/** Lunedì → Domenica */
export type Week = DayHours[];
/** Chiusura (es. ferie): dal giorno `from` incluso fino a `to` incluso, oppure senza fine */
export type Closure = { from: string; to?: string };
/** Periodo con orari diversi dal solito (es. fiera, estate) */
export type Special = { from: string; to: string; label?: string; week: Week };
export type LocationHours = { week: Week; closures: Closure[]; specials: Special[] };
export type HoursData = Record<LocationKey, LocationHours>;

export const LOCATIONS: LocationKey[] = ["rimini", "santarcangelo"];
export const DAY_NAMES = {
  it: ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
};
const SOON = 30; // minuti: "apre/chiude fra poco"

const EMPTY: LocationHours = { week: [null, null, null, null, null, null, null], closures: [], specials: [] };

export function getHours(): HoursData {
  const h = getEdits().hours as Partial<HoursData> | undefined;
  return { rimini: h?.rimini ?? EMPTY, santarcangelo: h?.santarcangelo ?? EMPTY };
}

/** Si aggiorna quando gli orari cambiano dal pannello admin */
export function useHours(): HoursData {
  useSyncExternalStore(subscribe, () => getEdits().hours);
  return getHours();
}

// ── Date nel fuso di Roma ──

function romeNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const hour = parseInt(get("hour")) % 24;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: hour * 60 + parseInt(get("minute")) };
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = lunedì … 6 = domenica */
export function weekdayOf(iso: string): number {
  return (new Date(`${iso}T12:00:00Z`).getUTCDay() + 6) % 7;
}

export function formatDate(iso: string, lang: "it" | "en") {
  const [, m, d] = iso.split("-");
  return lang === "it" ? `${+d}/${+m}` : `${+m}/${+d}`;
}

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function fmtMin(t: number) {
  const h = Math.floor((t % 1440) / 60), m = t % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function formatHours(d: DayHours, lang: "it" | "en") {
  if (!d) return lang === "it" ? "Chiuso" : "Closed";
  return `${d.open} – ${d.close}`;
}

// ── Calcoli ──

export function activeClosure(loc: LocationHours, iso: string): Closure | undefined {
  return loc.closures.find((c) => c.from <= iso && (!c.to || iso <= c.to));
}

export function activeSpecial(loc: LocationHours, iso: string): Special | undefined {
  return loc.specials.find((s) => s.from <= iso && iso <= s.to);
}

/** Orario previsto in quel giorno, senza contare le chiusure */
function plannedHours(loc: LocationHours, iso: string): DayHours {
  return (activeSpecial(loc, iso)?.week ?? loc.week)[weekdayOf(iso)] ?? null;
}

/** Orario effettivo in quel giorno (null se chiuso o in ferie) */
export function hoursOn(loc: LocationHours, iso: string): DayHours {
  return activeClosure(loc, iso) ? null : plannedHours(loc, iso);
}

function span(d: DayHours) {
  if (!d) return null;
  const open = toMin(d.open);
  let close = toMin(d.close);
  if (close <= open) close += 1440;
  return { open, close };
}

export type LiveStatus = {
  isOpen: boolean;
  soon: "opening" | "closing" | null;
  closure?: Closure;
  /** es. "Aperto · chiude alle 2:30", "Chiuso · apre domani alle 18:00" */
  text: string;
};

export function liveStatus(loc: LocationHours, now: Date, lang: "it" | "en"): LiveStatus {
  const { date, minutes } = romeNow(now);
  const it = lang === "it";

  // Ancora aperto dalla sera prima (orari dopo mezzanotte)
  const y = span(hoursOn(loc, addDays(date, -1)));
  if (y && y.close > 1440 && minutes < y.close - 1440) {
    const close = y.close - 1440;
    return { isOpen: true, soon: close - minutes <= SOON ? "closing" : null, text: it ? `Aperto · chiude alle ${fmtMin(close)}` : `Open · closes at ${fmtMin(close)}` };
  }

  const closure = activeClosure(loc, date);
  const today = span(hoursOn(loc, date));
  if (today && minutes >= today.open && minutes < today.close) {
    return { isOpen: true, soon: today.close - minutes <= SOON ? "closing" : null, text: it ? `Aperto · chiude alle ${fmtMin(today.close)}` : `Open · closes at ${fmtMin(today.close)}` };
  }
  if (today && minutes < today.open) {
    return { isOpen: false, soon: today.open - minutes <= SOON ? "opening" : null, text: it ? `Chiuso · apre alle ${fmtMin(today.open)}` : `Closed · opens at ${fmtMin(today.open)}` };
  }

  for (let i = 1; i <= 60; i++) {
    const day = addDays(date, i);
    const next = span(hoursOn(loc, day));
    if (!next) continue;
    const when = i === 1
      ? (it ? "domani" : "tomorrow")
      : i < 7
      ? DAY_NAMES[lang][weekdayOf(day)]
      : (it ? `il ${formatDate(day, lang)}` : `on ${formatDate(day, lang)}`);
    return { isOpen: false, soon: null, closure, text: it ? `Chiuso · apre ${when} alle ${fmtMin(next.open)}` : `Closed · opens ${when} at ${fmtMin(next.open)}` };
  }
  return { isOpen: false, soon: null, closure, text: it ? "Chiuso" : "Closed" };
}

/** Orari da mostrare lunedì → domenica: per ogni giorno vale il prossimo (oggi compreso), con eventuali periodi speciali */
export function weekToShow(loc: LocationHours, now: Date): DayHours[] {
  const { date } = romeNow(now);
  const today = weekdayOf(date);
  return Array.from({ length: 7 }, (_, i) => plannedHours(loc, addDays(date, (i - today + 7) % 7)));
}

export function todayIndex(now: Date) {
  return weekdayOf(romeNow(now).date);
}

export function isAnyLocationOpen(now: Date): boolean {
  const h = getHours();
  return LOCATIONS.some((l) => liveStatus(h[l], now, "it").isOpen);
}
