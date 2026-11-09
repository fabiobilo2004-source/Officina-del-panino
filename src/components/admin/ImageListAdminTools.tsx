// Comandi admin su una lista di foto (Galleria, Le Nostre Creazioni): aggiungi (+), sposta, cambia foto, elimina.
import { useState, type ReactNode } from "react";
import { getEdits, setEdits, type GalleryItem } from "@/lib/site-edits";
import { ImagePicker } from "@/components/admin/ImagePicker";

type Field = "gallery" | "creations";

export default function ImageListAdminTools({ field, index }: { field: Field; index: number }) {
  const [picker, setPicker] = useState(false);
  const gallery = getEdits()[field] ?? [];
  const setGallery = (fn: (g: GalleryItem[]) => GalleryItem[]) => {
    const cur = getEdits();
    setEdits({ ...cur, [field]: fn([...(cur[field] ?? [])]) });
  };

  if (index < 0) {
    return (
      <div data-admin-ui className="w-full h-full" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <button
          onClick={() => setPicker(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/25 text-white/60 hover:border-red-500 hover:text-white transition-colors"
        >
          <span className="text-6xl leading-none font-light">+</span>
          <span className="text-sm">Aggiungi una foto</span>
        </button>
        {picker && (
          <ImagePicker
            onClose={() => setPicker(false)}
            onPick={(src) => { setGallery((g) => [...g, { src }]); setPicker(false); }}
          />
        )}
      </div>
    );
  }

  const item = gallery[index];
  if (!item) return null;

  const move = (dir: -1 | 1) =>
    setGallery((g) => {
      const j = index + dir;
      if (j < 0 || j >= g.length) return g;
      [g[index], g[j]] = [g[j], g[index]];
      return g;
    });

  return (
    <div data-admin-ui className="absolute top-2 right-2 flex gap-1 text-white text-[13px]" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Tool onClick={() => move(-1)} disabled={index === 0} title="Sposta indietro">←</Tool>
      <Tool onClick={() => move(1)} disabled={index === gallery.length - 1} title="Sposta avanti">→</Tool>
      <Tool onClick={() => setPicker(true)} title="Cambia foto">🖼</Tool>
      <Tool onClick={() => { if (window.confirm("Eliminare questa foto?")) setGallery((g) => g.filter((_, i) => i !== index)); }} title="Elimina" danger>✕</Tool>
      {picker && (
        <ImagePicker
          current={item.src}
          onClose={() => setPicker(false)}
          onPick={(src) => { setGallery((g) => g.map((x, i) => (i === index ? { src } : x))); setPicker(false); }}
        />
      )}
    </div>
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
      className={`w-9 h-9 sm:w-8 sm:h-8 rounded bg-black/80 border border-white/25 backdrop-blur disabled:opacity-30 ${danger ? "hover:bg-red-600 hover:border-red-600" : "hover:border-white/70"}`}
    >
      {children}
    </button>
  );
}
