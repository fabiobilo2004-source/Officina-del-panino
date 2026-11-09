// Comandi admin sulle card della sezione Novità: aggiungi (+), sposta, cambia immagine, data di scadenza, elimina.
import { useState, type ReactNode } from "react";
import { getEdits, setEdits, type NewsItem } from "@/lib/site-edits";
import { ImagePicker } from "@/components/admin/ImagePicker";

function setNews(fn: (news: NewsItem[]) => NewsItem[]) {
  const cur = getEdits();
  setEdits({ ...cur, news: fn([...cur.news]) });
}

export default function NewsAdminTools({ index, expired }: { index: number; expired?: boolean }) {
  const [picker, setPicker] = useState(false);
  const [options, setOptions] = useState(false);

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
              setNews((n) => [...n, { id: `novita-${Date.now()}`, type: "image", src, fit: "cover" }]);
              setPicker(false);
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
