// Santarcangelo riapre per la Fiera di San Martino fino all'11/11/2026, poi torna chiusa.
const SANTA_OPEN_UNTIL = "2026-11-11";

function romeDateISO(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(now);
}

// Durante la fiera Santarcangelo è aperta anche il martedì.
export const SANTA_FIERA = romeDateISO(new Date()) <= SANTA_OPEN_UNTIL;
export const SANTA_TUESDAY = SANTA_FIERA ? "18:00–23:30" : null;

// ── Ferie / Holiday closures ── true = chiuso per ferie ──
export const FERIE = {
  rimini: false,
  get santarcangelo() {
    return romeDateISO(new Date()) > SANTA_OPEN_UNTIL;
  },
};

// Rimini Mon–Sun (Mon=0): 18:00–02:30, except Fri/Sat 18:00–05:00
const RIMINI: string[] = ["18:00–02:30", "18:00–02:30", "18:00–02:30", "18:00–02:30", "18:00–05:00", "18:00–05:00", "18:00–02:30"];

// Santarcangelo Mon–Sun (Mon=0)
const SANTA: (string | null)[] = [
  "18:00–23:30", // Mon
  SANTA_TUESDAY, // Tue: chiuso, aperto solo durante la fiera
  "18:00–23:30", // Wed
  "18:00–23:30", // Thu
  "18:00–02:30", // Fri
  "18:00–02:30", // Sat
  "18:00–23:30", // Sun
];

function parseRange(s: string | null): { open: number; close: number } | null {
  if (!s) return null;
  const m = s.match(/(\d+):(\d+)[–-](\d+):(\d+)/);
  if (!m) return null;
  const open = +m[1] * 60 + +m[2];
  let close = +m[3] * 60 + +m[4];
  if (close <= open) close += 1440;
  return { open, close };
}

function isOpenAt(schedule: (string | null)[], curMin: number, todayIdx: number): boolean {
  // Check yesterday (crosses midnight)
  const yest = (todayIdx - 1 + 7) % 7;
  const yr = parseRange(schedule[yest]);
  if (yr && yr.close > 1440 && curMin < yr.close - 1440) return true;
  // Check today
  const tr = parseRange(schedule[todayIdx]);
  if (tr && curMin >= tr.open) return true;
  return false;
}

export function isAnyLocationOpen(now: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Rome",
    hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false,
  }).formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === "hour")?.value ?? "0");
  const min  = parseInt(parts.find(p => p.type === "minute")?.value ?? "0");
  const wd   = parts.find(p => p.type === "weekday")?.value ?? "Mon";
  const wdMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const jsDay = wdMap[wd] ?? 1;
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon…6=Sun
  const curMin = hour * 60 + min;

  const riminiOpen = !FERIE.rimini && isOpenAt(RIMINI, curMin, todayIdx);
  const santaOpen  = !FERIE.santarcangelo && isOpenAt(SANTA, curMin, todayIdx);
  return riminiOpen || santaOpen;
}
