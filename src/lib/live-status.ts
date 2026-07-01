// Rimini: every day 18:00–05:00 (next day)
const RIMINI: string[] = ["18:00–05:00", "18:00–05:00", "18:00–05:00", "18:00–05:00", "18:00–05:00", "18:00–05:00", "18:00–05:00"];

// Santarcangelo Mon–Sun (Mon=0)
const SANTA: (string | null)[] = [
  "18:00–23:30", // Mon
  null,          // Tue chiuso
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

  return isOpenAt(RIMINI, curMin, todayIdx) || isOpenAt(SANTA, curMin, todayIdx);
}
