// Finestra del pannello admin: conferma di pubblicazione con riepilogo delle modifiche.
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { SiteEditsData } from "@/lib/site-edits";

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function changedKeys(a: Record<string, unknown> = {}, b: Record<string, unknown> = {}) {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => !same(a[k], b[k]));
}

/** Testo originale leggibile da una chiave tipo "/::h2::Novità::0" */
function labelOf(key: string) {
  const [page, kind, original] = key.split("::");
  const where = page === "*" ? "menu/footer" : page === "/" ? "home" : page.replace("/", "");
  const text = original.length > 40 ? `${original.slice(0, 40)}…` : original;
  return { where, kind, text };
}

/** Elenco leggibile di cosa cambia passando da `published` a `draft` */
export function summarize(published: SiteEditsData, draft: SiteEditsData): string[] {
  const lines: string[] = [];
  const texts = changedKeys(published.items, draft.items);
  texts.slice(0, 6).forEach((k) => {
    const { where, kind, text } = labelOf(k);
    lines.push(kind === "img" || kind === "video" ? `Posizione di un elemento (${where})` : `Testo "${text}" (${where})`);
  });
  if (texts.length > 6) lines.push(`…e altri ${texts.length - 6} testi`);
  const images = changedKeys(published.images, draft.images).length;
  if (images) lines.push(images === 1 ? "1 foto" : `${images} foto`);
  const videos = changedKeys(published.videos, draft.videos).length;
  if (videos) lines.push(videos === 1 ? "1 video" : `${videos} video`);
  const links = changedKeys(published.links, draft.links).length;
  if (links) lines.push(links === 1 ? "1 link o numero di telefono" : `${links} link o numeri di telefono`);
  if (!same(published.news, draft.news)) lines.push("Sezione Novità");
  if (!same(published.gallery, draft.gallery)) lines.push("Foto della Galleria");
  if (!same(published.creations, draft.creations)) lines.push("Foto di Le Nostre Creazioni");
  if (!same(published.hours?.rimini, draft.hours?.rimini)) lines.push("Orari e chiusure di Rimini");
  if (!same(published.hours?.santarcangelo, draft.hours?.santarcangelo)) lines.push("Orari e chiusure di Santarcangelo");
  if (!same(published.globals, draft.globals)) lines.push("Font di tutto il sito");
  return lines;
}

function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      data-admin-ui
      className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[85dvh] bg-[#111] text-white border border-white/15 rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col text-[14px]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <p className="flex-1 font-semibold text-base">{title}</p>
          <button onClick={onClose} className="w-9 h-9 rounded hover:bg-white/10" aria-label="Chiudi">✕</button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex gap-2 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

export function PublishDialog({ lines, conflict, busy, onConfirm, onClose }: {
  lines: string[];
  conflict: boolean;
  busy: boolean;
  onConfirm: (force: boolean) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Pubblicare sul sito?"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="flex-1 h-11 rounded border border-white/20 hover:border-white/50">Annulla</button>
          <button
            onClick={() => onConfirm(conflict)}
            disabled={busy || lines.length === 0}
            className="flex-[2] h-11 rounded bg-green-600 font-semibold hover:bg-green-500 disabled:opacity-50"
          >
            {busy ? "Pubblicazione…" : conflict ? "Pubblica comunque" : "Pubblica"}
          </button>
        </>
      }
    >
      {conflict && (
        <p className="mb-4 p-3 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[13px]">
          Mentre lavoravi il sito è stato aggiornato da qualcun altro. Se pubblichi, le tue modifiche sostituiscono le sue negli stessi punti.
        </p>
      )}
      {lines.length === 0 ? (
        <p className="text-white/60">Non ci sono modifiche da pubblicare: il sito è già uguale alla bozza.</p>
      ) : (
        <>
          <p className="text-white/60 mb-3">Queste modifiche andranno online e le vedranno tutti:</p>
          <ul className="space-y-1.5">
            {lines.map((l, i) => (
              <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{l}</span></li>
            ))}
          </ul>
          {!import.meta.env.DEV && <p className="text-white/40 text-[12px] mt-4">Il sito si aggiorna in circa 1 minuto.</p>}
        </>
      )}
    </Modal>
  );
}
