// Comandi admin per le sezioni aggiunte in homepage: "+ Aggiungi una sezione qui", e su ogni
// sezione ↑ ↓ (sposta, anche oltre le sezioni fisse), ✎ (modifica), ✕ (togli).
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { getEdits, setEdits, type CtaTarget, type HomeLayout, type HomeSection } from "@/lib/site-edits";
import { CTA_TARGETS, HOME_SLOTS } from "@/components/HomeBlocks";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { RichTextarea } from "@/components/admin/RichTextarea";

const UI = { fontFamily: "system-ui, -apple-system, sans-serif" };

function setSections(fn: (list: HomeSection[]) => HomeSection[]) {
  const cur = getEdits();
  setEdits({ ...cur, homeSections: fn([...(cur.homeSections ?? [])]) });
}

export default function HomeBlockAdminTools({ after, block }: { after: string; block?: HomeSection }) {
  const [editing, setEditing] = useState<HomeSection | null>(null);

  const form = editing && (
    <SectionForm
      section={editing}
      onClose={() => setEditing(null)}
      onSave={(next) => {
        if (!block) setSections((list) => [...list, { ...next, id: `sezione-${Date.now()}`, after }]);
        else setSections((list) => list.map((x) => (x.id === block.id ? { ...x, ...next } : x)));
        setEditing(null);
      }}
    />
  );

  if (!block) {
    return (
      <div data-admin-ui style={UI} className="px-6 py-3 max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => setEditing({ id: "", after, layout: "right" })}
          className="w-full h-10 rounded-lg border-2 border-dashed border-white/20 text-white/50 text-sm font-semibold hover:border-red-500 hover:text-white transition-colors"
        >
          + Aggiungi una sezione qui
        </button>
        {form}
      </div>
    );
  }

  const all = getEdits().homeSections ?? [];
  const sameSlot = all.filter((b) => b.after === after);
  const pos = sameSlot.findIndex((b) => b.id === block.id);
  const slot = HOME_SLOTS.indexOf(after as (typeof HOME_SLOTS)[number]);
  const canUp = pos > 0 || slot > 0;
  const canDown = pos < sameSlot.length - 1 || slot < HOME_SLOTS.length - 1;

  // Prima si scambia con la sezione aggiunta vicina; se non c'è, si passa oltre la sezione fissa
  const move = (dir: -1 | 1) =>
    setSections((list) => {
      const neighbour = sameSlot[pos + dir];
      const i = list.findIndex((b) => b.id === block.id);
      if (neighbour) {
        const j = list.findIndex((b) => b.id === neighbour.id);
        [list[i], list[j]] = [list[j], list[i]];
        return list;
      }
      const target = HOME_SLOTS[slot + dir];
      if (!target) return list;
      const [moved] = list.splice(i, 1);
      const inTarget = list.map((b, k) => (b.after === target ? k : -1)).filter((k) => k >= 0);
      const at = dir < 0 ? (inTarget.length ? inTarget[inTarget.length - 1] + 1 : list.length) : (inTarget.length ? inTarget[0] : list.length);
      list.splice(at, 0, { ...moved, after: target });
      return list;
    });

  return (
    <div data-admin-ui style={UI} className="absolute top-3 right-3 z-20 flex gap-1">
      <Tool onClick={() => move(-1)} disabled={!canUp} title="Sposta su">↑</Tool>
      <Tool onClick={() => move(1)} disabled={!canDown} title="Sposta giù">↓</Tool>
      <Tool onClick={() => setEditing(block)} title="Modifica">✎</Tool>
      <Tool onClick={() => setSections((list) => list.filter((b) => b.id !== block.id))} title="Togli la sezione" danger>✕</Tool>
      {form}
    </div>
  );
}

// Disegnini dei modelli: grigio = testo, rosso = foto
const LAYOUTS: { id: HomeLayout; label: string; preview: ReactNode }[] = [
  {
    id: "right",
    label: "Testo + foto a destra",
    preview: <><Lines className="w-1/2" /><Photo className="w-1/2 h-full" /></>,
  },
  {
    id: "left",
    label: "Foto a sinistra + testo",
    preview: <><Photo className="w-1/2 h-full" /><Lines className="w-1/2" /></>,
  },
  {
    id: "banner",
    label: "Banner con foto grande",
    preview: <span className="relative w-full h-full flex items-center justify-center"><Photo className="absolute inset-0 opacity-70" /><Lines className="relative w-2/3 items-center" /></span>,
  },
  {
    id: "center",
    label: "Centrato, foto sotto",
    preview: <span className="w-full h-full flex flex-col items-center gap-1"><Lines className="w-2/3 items-center" /><Photo className="w-full flex-1" /></span>,
  },
  {
    id: "quote",
    label: "Frase in evidenza",
    preview: <span className="w-full h-full flex flex-col items-center justify-center gap-1"><span className="text-red-500 text-lg leading-none">“</span><span className="h-1.5 w-3/4 rounded bg-white/70" /><span className="h-1.5 w-1/2 rounded bg-white/70" /></span>,
  },
  {
    id: "gallery",
    label: "Galleria (fino a 3 foto)",
    preview: <span className="w-full h-full flex flex-col gap-1"><span className="h-1.5 w-1/2 mx-auto rounded bg-white/70" /><span className="flex-1 flex gap-1"><Photo className="flex-1" /><Photo className="flex-1" /><Photo className="flex-1" /></span></span>,
  },
  {
    id: "cta",
    label: "Invito con bottone",
    preview: <span className="w-full h-full flex flex-col items-center justify-center gap-1"><span className="h-1.5 w-2/3 rounded bg-white/70" /><span className="h-1 w-3/4 rounded bg-white/30" /><span className="h-2.5 w-1/3 rounded-sm bg-red-500 mt-0.5" /></span>,
  },
  {
    id: "promo",
    label: "Fascia promo rossa",
    preview: <span className="w-full h-full flex items-center"><span className="w-full h-2/3 rounded-sm bg-red-600 flex flex-col items-center justify-center gap-1"><span className="h-1.5 w-2/3 rounded bg-white/90" /><span className="h-1 w-1/2 rounded bg-white/50" /></span></span>,
  },
  {
    id: "video",
    label: "Testo + video",
    preview: <><Lines className="w-1/2" /><span className="w-1/2 h-full rounded-sm bg-red-500/60 flex items-center justify-center text-[10px] text-white">▶</span></>,
  },
];

function Lines({ className }: { className: string }) {
  return (
    <span className={`flex flex-col justify-center gap-1 p-1 ${className}`}>
      <span className="h-1.5 w-3/4 rounded bg-white/70" />
      <span className="h-1 w-full rounded bg-white/30" />
      <span className="h-1 w-5/6 rounded bg-white/30" />
    </span>
  );
}

function Photo({ className }: { className: string }) {
  return <span className={`block rounded-sm bg-red-500/60 ${className}`} />;
}

function SectionForm({ section, onSave, onClose }: {
  section: HomeSection;
  onSave: (next: HomeSection) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<HomeSection>({ layout: "right", ...section });
  // Quale galleria è aperta: foto singola, una foto in più per la galleria, o il video
  const [picker, setPicker] = useState<null | "photo" | "gallery" | "video">(null);
  const set = (patch: Partial<HomeSection>) => setDraft((d) => ({ ...d, ...patch }));
  const layout = draft.layout ?? "right";
  const needsPhoto = layout === "banner";
  const usesPhoto = ["right", "left", "banner", "center"].includes(layout);
  const images = draft.images ?? [];
  const empty = !draft.title?.trim() && !draft.body?.trim();
  // Cosa manca per poter salvare, in base al modello
  const missing =
    layout === "gallery" && !images.length ? "Aggiungi almeno una foto alla galleria."
    : layout === "video" && !draft.video ? "Scegli o carica un video."
    : layout === "cta" && !draft.button?.label?.trim() ? "Scrivi il testo del bottone."
    : empty && layout !== "gallery" ? "Scrivi almeno il titolo o il testo."
    : "";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !picker) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, picker]);

  const save = () => {
    if (missing) return;
    const next: HomeSection = { ...draft, title: draft.title?.trim() || undefined, body: draft.body?.trim() || undefined };
    // Si tiene solo quello che il modello scelto usa
    if (!usesPhoto) delete next.src;
    if (layout !== "gallery") delete next.images;
    if (layout !== "video") delete next.video;
    if (layout !== "cta") delete next.button;
    onSave(next);
  };

  return createPortal(
    <div
      data-admin-ui
      style={UI}
      className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); save(); }}
        className="w-full sm:max-w-xl max-h-[92dvh] flex flex-col bg-[#111] text-white border border-white/15 rounded-t-2xl sm:rounded-xl shadow-2xl text-[14px] max-sm:[&_input]:text-base max-sm:[&_textarea]:text-base"
      >
        <header className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <p className="flex-1 font-semibold">{section.id ? "Modifica la sezione" : "Nuova sezione"}</p>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded hover:bg-white/10" aria-label="Chiudi">✕</button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <span className="block text-[12px] text-white/60 mb-2">Modello</span>
            <div className="grid grid-cols-3 gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => set({ layout: l.id })}
                  className={`flex flex-col gap-1.5 p-1.5 rounded-lg border-2 text-left ${layout === l.id ? "border-red-500 bg-red-600/10" : "border-white/15 hover:border-white/40"}`}
                >
                  <span className="flex gap-1 h-12 w-full rounded bg-white/5 p-1">{l.preview}</span>
                  <span className="text-[11px] leading-tight">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="block text-[12px] text-white/60 mb-1">{layout === "quote" || layout === "promo" ? "Frase" : "Titolo"}</span>
            <RichTextarea
              value={draft.title ?? ""}
              onChange={(v) => set({ title: v })}
              singleLine
              placeholder={layout === "quote" ? "es. Il panino che salva la tua notte" : layout === "promo" ? "es. Martedì 2x1 su tutti i panini" : "es. Il nostro pane"}
            />
          </label>

          <label className="block">
            <span className="block text-[12px] text-white/60 mb-1">Testo (vai a capo due volte per un nuovo paragrafo)</span>
            <RichTextarea value={draft.body ?? ""} onChange={(v) => set({ body: v })} rows={6} placeholder="Racconta…" />
          </label>

          {usesPhoto && (
            <div>
              <span className="block text-[12px] text-white/60 mb-1">Foto{needsPhoto ? "" : " (facoltativa)"}</span>
              <div className="flex items-center gap-3">
                {draft.src && <img src={draft.src} alt="" className="w-20 h-20 object-cover rounded border border-white/15" />}
                <button type="button" onClick={() => setPicker("photo")} className="h-10 px-4 rounded bg-white text-black font-semibold hover:bg-white/90">
                  {draft.src ? "Cambia foto" : "Scegli foto"}
                </button>
                {draft.src && (
                  <button type="button" onClick={() => set({ src: undefined })} className="text-[12px] text-white/60 underline underline-offset-2 hover:text-white">
                    Togli foto
                  </button>
                )}
              </div>
              {needsPhoto && !draft.src && <p className="mt-2 text-[12px] text-amber-400">Il banner ha bisogno di una foto di sfondo.</p>}
            </div>
          )}

          {layout === "gallery" && (
            <div>
              <span className="block text-[12px] text-white/60 mb-1">Foto della galleria ({images.length}/3)</span>
              <div className="flex flex-wrap items-center gap-3">
                {images.map((src, i) => (
                  <span key={src + i} className="relative">
                    <img src={src} alt="" className="w-20 h-20 object-cover rounded border border-white/15" />
                    <button
                      type="button"
                      onClick={() => set({ images: images.filter((_, j) => j !== i) })}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black border border-white/30 text-[11px] hover:bg-red-600"
                      aria-label="Togli questa foto"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {images.length < 3 && (
                  <button type="button" onClick={() => setPicker("gallery")} className="w-20 h-20 rounded border-2 border-dashed border-white/25 text-2xl text-white/60 hover:border-red-500 hover:text-white">
                    +
                  </button>
                )}
              </div>
            </div>
          )}

          {layout === "video" && (
            <div>
              <span className="block text-[12px] text-white/60 mb-1">Video</span>
              <div className="flex items-center gap-3">
                {draft.video && <video src={draft.video} muted autoPlay loop playsInline className="w-28 h-20 object-cover rounded border border-white/15 bg-black" />}
                <button type="button" onClick={() => setPicker("video")} className="h-10 px-4 rounded bg-white text-black font-semibold hover:bg-white/90">
                  {draft.video ? "Cambia video" : "Scegli video"}
                </button>
              </div>
            </div>
          )}

          {layout === "cta" && (
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-[12px] text-white/60 mb-1">Testo del bottone</span>
                <input
                  value={draft.button?.label ?? ""}
                  onChange={(e) => set({ button: { target: draft.button?.target ?? "app", label: e.target.value } })}
                  placeholder="es. Scarica l'app"
                  className="w-full h-10 bg-black border border-white/20 rounded px-3 focus:outline-none focus:border-red-500"
                />
              </label>
              <label className="block">
                <span className="block text-[12px] text-white/60 mb-1">Dove porta</span>
                <select
                  value={draft.button?.target ?? "app"}
                  onChange={(e) => set({ button: { label: draft.button?.label ?? "", target: e.target.value as CtaTarget } })}
                  className="w-full h-10 bg-black border border-white/20 rounded px-2"
                >
                  {CTA_TARGETS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </label>
            </div>
          )}

          {missing && !empty && <p className="text-[12px] text-amber-400">{missing}</p>}
        </div>

        <footer className="flex gap-2 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded border border-white/20 hover:border-white/50">Annulla</button>
          <button type="submit" disabled={!!missing} className="flex-[2] h-11 rounded bg-red-600 font-semibold hover:bg-red-500 disabled:opacity-40">
            {section.id ? "Salva modifica" : "Aggiungi la sezione"}
          </button>
        </footer>
      </form>
      {picker && (
        // Gli eventi della galleria non devono arrivare allo sfondo di questa finestra (che la chiuderebbe)
        <div onClick={(e) => e.stopPropagation()}>
          <ImagePicker
            kind={picker === "video" ? "video" : "image"}
            current={picker === "video" ? draft.video : picker === "photo" ? draft.src : undefined}
            onClose={() => setPicker(null)}
            onPick={(src) => {
              if (picker === "photo") set({ src });
              else if (picker === "video") set({ video: src });
              else set({ images: [...images, src].slice(0, 3) });
              setPicker(null);
            }}
          />
        </div>
      )}
    </div>,
    document.body,
  );
}

function Tool({ onClick, title, disabled, danger, children }: { onClick: () => void; title: string; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`w-9 h-9 rounded bg-black/80 text-white border border-white/25 backdrop-blur disabled:opacity-30 ${danger ? "hover:bg-red-600 hover:border-red-600" : "hover:border-white/70"}`}
    >
      {children}
    </button>
  );
}
