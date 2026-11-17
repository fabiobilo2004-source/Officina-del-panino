// Comandi admin sulle card della sezione Novità: aggiungi (+), sposta, cambia immagine, data di scadenza, elimina.
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { getEdits, setEdits, type NewsItem } from "@/lib/site-edits";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { RichTextarea } from "@/components/admin/RichTextarea";

function setNews(fn: (news: NewsItem[]) => NewsItem[]) {
  const cur = getEdits();
  setEdits({ ...cur, news: fn([...cur.news]) });
}

export default function NewsAdminTools({ index, expired }: { index: number; expired?: boolean }) {
  const [picker, setPicker] = useState(false);
  const [options, setOptions] = useState(false);
  const [article, setArticle] = useState(false);
  // Novità appena aggiunta: dopo l'immagine si propone subito di scrivere l'articolo
  const [newId, setNewId] = useState<string | null>(null);

  if (index < 0) {
    return (
      <div data-admin-ui className="w-full h-full" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <button
          onClick={() => setPicker(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/25 text-white/60 hover:border-red-500 hover:text-white transition-colors"
        >
          <span className="text-6xl leading-none font-light">+</span>
          <span className="text-sm">Aggiungi una novità</span>
        </button>
        {picker && (
          <ImagePicker
            onClose={() => setPicker(false)}
            onPick={(src) => {
              const id = `novita-${Date.now()}`;
              setNews((n) => [...n, { id, type: "image", src, fit: "cover" }]);
              setPicker(false);
              setNewId(id);
            }}
          />
        )}
        {newId && (
          <ArticleForm
            title=""
            body=""
            skipLabel="Solo immagine"
            onClose={() => setNewId(null)}
            onSave={(postTitle, postBody) => {
              if (postTitle || postBody) {
                setNews((n) => n.map((it) => (it.id === newId && it.type === "image"
                  ? { ...it, postTitle: postTitle || undefined, postBody: postBody || undefined }
                  : it)));
              }
              setNewId(null);
            }}
          />
        )}
      </div>
    );
  }

  const news = getEdits().news;
  const item = news[index];
  if (!item) return null;

  const move = (dir: -1 | 1) =>
    setNews((n) => {
      const j = index + dir;
      if (j < 0 || j >= n.length) return n;
      [n[index], n[j]] = [n[j], n[index]];
      return n;
    });

  const patch = (p: Partial<Extract<NewsItem, { type: "image" }>>) =>
    setNews((n) => n.map((it, i) => (i === index && it.type === "image" ? { ...it, ...p } : it)));

  const remove = () => {
    if (window.confirm("Eliminare questa novità?")) setNews((n) => n.filter((_, i) => i !== index));
  };

  return (
    <div data-admin-ui style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {expired && (
        <span className="absolute top-2 left-2 px-2 py-1 rounded bg-amber-500 text-black text-[11px] font-semibold">
          Scaduta: non si vede sul sito
        </span>
      )}
      <div className="absolute top-2 right-2 flex gap-1 text-white text-[13px]">
        <Tool onClick={() => move(-1)} disabled={index === 0} title="Sposta a sinistra">←</Tool>
        <Tool onClick={() => move(1)} disabled={index === news.length - 1} title="Sposta a destra">→</Tool>
        {item.type === "image" && (
          <>
            <Tool onClick={() => setPicker(true)} title="Cambia immagine">🖼</Tool>
            <Tool onClick={() => setArticle(true)} title="Scrivi l'articolo">📝</Tool>
            <Tool onClick={() => setOptions(!options)} title="Visibile fino al…">📅</Tool>
          </>
        )}
        <Tool onClick={remove} title="Elimina" danger>✕</Tool>
      </div>

      {options && item.type === "image" && (
        <div className="absolute top-12 right-2 left-2 z-10 p-3 rounded bg-[#111]/95 border border-white/20 text-white text-[12px] space-y-3 shadow-2xl">
          <label className="block">
            <span className="block text-white/60 mb-1">Visibile fino al (vuoto = sempre)</span>
            <div className="flex gap-2">
              <input
                type="date"
                value={item.until ?? ""}
                onChange={(e) => patch({ until: e.target.value || undefined })}
                className="flex-1 h-8 px-2 rounded bg-black border border-white/20 [color-scheme:dark]"
              />
              {item.until && <Tool onClick={() => patch({ until: undefined })} title="Togli scadenza">↺</Tool>}
            </div>
          </label>
          <button onClick={() => setOptions(false)} className="w-full h-8 rounded bg-white/10 hover:bg-white/20">Chiudi</button>
        </div>
      )}

      {article && item.type === "image" && (
        <ArticleForm
          title={item.postTitle ?? ""}
          body={item.postBody ?? ""}
          onClose={() => setArticle(false)}
          onSave={(postTitle, postBody) => {
            patch({ postTitle: postTitle || undefined, postBody: postBody || undefined });
            setArticle(false);
          }}
        />
      )}

      {picker && item.type === "image" && (
        <ImagePicker
          current={item.src}
          onClose={() => setPicker(false)}
          onPick={(src) => { patch({ src }); setPicker(false); }}
        />
      )}
    </div>
  );
}

function Tool({ onClick, title, disabled, danger, children }: { onClick: () => void; title: string; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`w-9 h-9 sm:w-8 sm:h-8 rounded bg-black/80 border border-white/25 backdrop-blur disabled:opacity-30 ${danger ? "hover:bg-red-600 hover:border-red-600" : "hover:border-white/70"}`}
    >
      {children}
    </button>
  );
}

// Titolo e testo dell'articolo che si apre toccando la card della novità
function ArticleForm({ title, body, skipLabel, onSave, onClose }: {
  title: string;
  body: string;
  /** Testo del bottone secondario (di base "Annulla") */
  skipLabel?: string;
  onSave: (title: string, body: string) => void;
  onClose: () => void;
}) {
  const [t, setT] = useState(title);
  const [b, setB] = useState(body);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      data-admin-ui
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); onSave(t.trim(), b.trim()); }}
        className="w-full sm:max-w-lg max-h-[90dvh] flex flex-col bg-[#111] text-white border border-white/15 rounded-t-2xl sm:rounded-xl shadow-2xl text-[14px] max-sm:[&_input]:text-base max-sm:[&_textarea]:text-base"
      >
        <header className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <p className="flex-1 font-semibold">Articolo della novità</p>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded hover:bg-white/10" aria-label="Chiudi">✕</button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-white/50 text-[12px]">
            Se scrivi un articolo, sulla card compare "Leggi →" e toccandola si apre l'immagine grande con il tuo testo.
            Lascia tutto vuoto per avere solo l'immagine.
          </p>
          <label className="block">
            <span className="block text-[12px] text-white/60 mb-1">Titolo</span>
            <RichTextarea value={t} onChange={setT} singleLine autoFocus placeholder="es. Arriva il nuovo panino Biella" />
          </label>
          <label className="block">
            <span className="block text-[12px] text-white/60 mb-1">Testo (vai a capo due volte per un nuovo paragrafo)</span>
            <RichTextarea value={b} onChange={setB} rows={8} placeholder="Racconta la novità…" />
          </label>
        </div>
        <footer className="flex gap-2 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded border border-white/20 hover:border-white/50">{skipLabel ?? "Annulla"}</button>
          <button type="submit" className="flex-[2] h-11 rounded bg-red-600 font-semibold hover:bg-red-500">Fatto</button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}
