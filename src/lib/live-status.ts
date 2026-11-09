// Data di oggi nel fuso di Roma (YYYY-MM-DD). Gli orari sono in src/lib/hours.ts.
export function romeDateISO(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(now);
}

export { isAnyLocationOpen } from "@/lib/hours";
