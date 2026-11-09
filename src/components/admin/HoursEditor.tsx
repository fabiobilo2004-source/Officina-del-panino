// Finestra "Orari e chiusure" del pannello admin.
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { canUndo, getEdits, setEdits, undo } from "@/lib/site-edits";
import {
  DAY_NAMES, LOCATIONS, getHours, liveStatus, useHours,
  type Closure, type DayHours, type HoursData, type LocationHours, type LocationKey, type Special, type Week,
} from "@/lib/hours";
import { romeDateISO } from "@/lib/live-status";

const NAMES: Record<LocationKey, string> = { rimini: "Rimini", santarcangelo: "Santarcangelo" };
const DEFAULT_DAY = { open: "18:00", close: "23:30" };

function setLocation(key: LocationKey, fn: (l: LocationHours) => LocationHours) {
  const hours: HoursData = getHours();
  setEdits({ ...getEdits(), hours: { ...hours, [key]: fn(structuredClone(hours[key])) } });
}

export function HoursEditor({ onClose, onSave, dirty }: { onClose: () => void; onSave: () => void; dirty: boolean }) {
  const hours = useHours();
  const [tab, setTab] = useState<LocationKey>("rimini");
  const loc = hours[tab];
  const today = romeDateISO(new Date());
  const status = liveStatus(loc, new Date(), "it");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = (fn: (l: LocationHours) => LocationHours) => setLocation(tab, fn);

  return createPortal(
    <div
      data-admin-ui
      className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-[#111] text-white sm:border border-white/15 sm:rounded-xl shadow-2xl flex flex-col text-[14px] sm:text-[13px] max-sm:[&_input]:text-base"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 p-4 border-b border-white/10">
          <p className="flex-1 font-semibold text-base">Orari e chiusure</p>
          <button onClick={onClose} className="w-9 h-9 rounded hover:bg-white/10" aria-label="Chiudi">✕</button>
        </header>

        <div className="flex gap-2 px-4 pt-4">
          {LOCATIONS.map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`h-9 px-4 rounded-full font-semibold ${tab === k ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"}`}
            >
              {NAMES[k]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-7">
          <div className={`flex items-center gap-2 px-3 py-2 rounded border ${status.isOpen ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
            <span className={`w-2 h-2 rounded-full ${status.isOpen ? "bg-green-400" : "bg-red-400"}`} />
            Adesso il sito mostra: <strong>{status.text}</strong>
          </div>

          <Block title="Orari di tutte le settimane" hint="Se chiude dopo mezzanotte scrivi l'orario normale, es. 02:30.">
            <WeekGrid week={loc.week} onChange={(week) => update((l) => ({ ...l, week }))} />
          </Block>

          <Block title="Chiusure (ferie, giorni di chiusura)" hint="Nei giorni indicati il sito risulta chiuso. Senza data di fine resta chiuso finché non la togli.">
            {loc.closures.length === 0 && <p className="text-white/40">Nessuna chiusura.</p>}
            {loc.closures.map((c, i) => {
              const past = !!c.to && c.to < today;
              const set = (patch: Partial<Closure>) =>
                update((l) => ({ ...l, closures: l.closures.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
              return (
                <Card key={i} past={past} onRemove={() => update((l) => ({ ...l, closures: l.closures.filter((_, j) => j !== i) }))}>
                  <div className="grid grid-cols-2 gap-3">
                    <DateField label="Dal" value={c.from} onChange={(v) => set({ from: v || today })} />
                    <DateField label="Al (vuoto = senza fine)" value={c.to} onChange={(v) => set({ to: v || undefined })} />
                  </div>
                </Card>
              );
            })}
            <AddButton onClick={() => update((l) => ({ ...l, closures: [...l.closures, { from: today }] }))}>Aggiungi chiusura</AddButton>
          </Block>

          <Block title="Periodi con orari diversi" hint="Per eventi, fiere o stagioni: in queste date valgono questi orari al posto di quelli normali.">
            {loc.specials.length === 0 && <p className="text-white/40">Nessun periodo speciale.</p>}
            {loc.specials.map((sp, i) => {
              const set = (patch: Partial<Special>) =>
                update((l) => ({ ...l, specials: l.specials.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
              return (
                <Card key={i} past={sp.to < today} onRemove={() => update((l) => ({ ...l, specials: l.specials.filter((_, j) => j !== i) }))}>
                  <TextField label="Nome (solo per te)" placeholder="es. Fiera di San Martino" value={sp.label} onChange={(v) => set({ label: v || undefined })} />
                  <div className="grid grid-cols-2 gap-3">
                    <DateField label="Dal" value={sp.from} onChange={(v) => set({ from: v || today })} />
                    <DateField label="Al" value={sp.to} onChange={(v) => set({ to: v || sp.from })} />
                  </div>
                  <WeekGrid week={sp.week} onChange={(week) => set({ week })} />
                </Card>
              );
            })}
            <AddButton onClick={() => update((l) => ({ ...l, specials: [...l.specials, { from: today, to: today, week: structuredClone(l.week) }] }))}>
              Aggiungi periodo
            </AddButton>
          </Block>
        </div>

        <footer className="flex items-center gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="w-10 h-10 shrink-0 rounded border border-white/25 text-lg hover:border-white/60 disabled:opacity-30"
            title="Annulla l'ultima modifica"
            aria-label="Annulla l'ultima modifica"
          >
            ↶
          </button>
          <p className={`flex-1 text-[12px] ${dirty ? "text-amber-400" : "text-white/40"}`}>
            {dirty ? "Hai modifiche non salvate" : "Le modifiche si vedono subito sul sito qui dietro."}
          </p>
          <button onClick={onClose} className="h-10 px-4 rounded border border-white/20 hover:border-white/50">Chiudi</button>
          <button onClick={onSave} className="h-10 px-5 rounded bg-red-600 font-semibold hover:bg-red-500">Salva</button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function WeekGrid({ week, onChange }: { week: Week; onChange: (w: Week) => void }) {
  const setDay = (i: number, d: DayHours) => onChange(week.map((x, j) => (j === i ? d : x)));
  return (
    <div className="divide-y divide-white/10 border border-white/10 rounded">
      {DAY_NAMES.it.map((name, i) => {
        const d = week[i] ?? null;
        return (
          <div key={name} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
            <span className="w-24 font-medium">{name}</span>
            <button
              onClick={() => setDay(i, d ? null : { ...(week.find(Boolean) ?? DEFAULT_DAY) })}
              className={`w-20 h-8 rounded-full text-[12px] font-semibold ${d ? "bg-green-600/80" : "bg-white/10 text-white/50"}`}
            >
              {d ? "Aperto" : "Chiuso"}
            </button>
            {d ? (
              <div className="flex items-center gap-2">
                <TimeInput value={d.open} onChange={(v) => setDay(i, { ...d, open: v })} />
                <span className="text-white/40">→</span>
                <TimeInput value={d.close} onChange={(v) => setDay(i, { ...d, close: v })} />
              </div>
            ) : (
              <span className="text-white/30">—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Orari in formato 24 ore, ogni 15 minuti (il campo "time" del browser a volte mostra AM/PM)
const TIMES = Array.from({ length: 96 }, (_, i) => `${String(Math.floor(i / 4)).padStart(2, "0")}:${String((i % 4) * 15).padStart(2, "0")}`);

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 px-2 rounded bg-black border border-white/20 font-mono tabular-nums"
    >
      {!TIMES.includes(value) && <option value={value}>{value}</option>}
      {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

function DateField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className="block text-[11px] text-white/60 mb-1">{label}</span>
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-2 rounded bg-black border border-white/20 [color-scheme:dark]"
      />
    </div>
  );
}

function TextField({ label, value, placeholder, onChange }: { label: string; value?: string; placeholder?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className="block text-[11px] text-white/60 mb-1">{label}</span>
      <input
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-2 rounded bg-black border border-white/20"
      />
    </div>
  );
}

function Block({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <p className="font-semibold text-sm">{title}</p>
        {hint && <p className="text-white/45 text-[12px] mt-0.5">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Card({ past, onRemove, children }: { past?: boolean; onRemove: () => void; children: ReactNode }) {
  return (
    <div className={`relative p-3 pr-12 rounded border border-white/15 bg-white/[0.03] space-y-3 ${past ? "opacity-50" : ""}`}>
      {past && <span className="inline-block px-2 py-0.5 rounded bg-white/10 text-[11px]">Già passato</span>}
      {children}
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 w-8 h-8 rounded border border-white/20 hover:bg-red-600 hover:border-red-600"
        aria-label="Elimina"
        title="Elimina"
      >
        ✕
      </button>
    </div>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="w-full h-10 rounded border border-dashed border-white/25 text-white/70 hover:border-white/60 hover:text-white">
      + {children}
    </button>
  );
}
