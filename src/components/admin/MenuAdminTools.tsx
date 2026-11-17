// Comandi admin sulle voci del menu: aggiungi (+), modifica (✎), sposta (↑ ↓), togli (✕).
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { getEdits, setEdits, type MenuItem } from "@/lib/site-edits";
import { MENU_SECTIONS, type MenuField, type MenuSection } from "@/lib/menu";

function setSection(section: MenuSection, fn: (items: MenuItem[]) => MenuItem[]) {
  const cur = getEdits();
  setEdits({ ...cur, menu: { ...cur.menu, [section]: fn([...(cur.menu?.[section] ?? [])]) } });
}

const UI = { fontFamily: "system-ui, -apple-system, sans-serif" };

export default function MenuAdminTools({ section, index, chip }: { section: MenuSection; index: number; chip?: boolean }) {
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [open, setOpen] = useState(false);
  const items = getEdits().menu?.[section] ?? [];
  const config = MENU_SECTIONS[section];

  const form = editing && (
    <ItemForm
      title={editing.id ? `Modifica · ${config.label}` : `Aggiungi · ${config.label}`}
      fields={config.fields}
      item={editing}
      onClose={() => setEditing(null)}
      onSave={(next) => {
        if (!editing.id) setSection(section, (list) => [...list, { ...next, id: `${section}-${Date.now()}` }]);
        else setSection(section, (list) => list.map((x) => (x.id === editing.id ? { ...x, ...next } : x)));
        setEditing(null);
      }}
    />
  );

  if (index < 0) {
    return (
      <span data-admin-ui style={UI} className={chip ? "inline-flex" : "block mt-4"}>
        <button
          type="button"
          onClick={() => setEditing({ id: "", name: "" })}
          className={chip
            ? "px-3 py-1.5 rounded-full text-sm font-bold border-2 border-dashed border-black/30 text-gray-800 hover:border-red-600 hover:text-red-700"
            : "w-full h-11 rounded-lg border-2 border-dashed border-current/30 opacity-70 hover:opacity-100 hover:border-red-600 hover:text-red-600 font-semibold text-sm"}
        >
          + Aggiungi
        </button>
        {form}
      </span>
    );
  }

  const item = items[index];
  if (!item) return null;
  const move = (dir: -1 | 1) =>
    setSection(section, (list) => {
      const j = index + dir;
      if (j < 0 || j >= list.length) return list;
      [list[index], list[j]] = [list[j], list[index]];
      return list;
    });
  const remove = () => setSection(section, (list) => list.filter((_, i) => i !== index));

  if (chip) {
    return (
      <span data-admin-ui style={UI} className="inline-flex gap-0.5 ml-1 align-middle">
        <Tool small onClick={() => setEditing(item)} title="Modifica">✎</Tool>
        <Tool small onClick={remove} title="Togli" danger>✕</Tool>
        {form}
      </span>
    );
  }

  // Un solo bottoncino "⋯" a sinistra della voce, così prezzi e testi restano visibili
  return (
    <span data-admin-ui style={UI} className="absolute -left-6 top-0 z-20 flex items-center gap-1">
      <Tool small onClick={() => setOpen(!open)} title="Modifica questa voce">⋯</Tool>
      {open && (
        <span className="flex gap-1 p-1 rounded-lg bg-black/90 shadow-xl">
          <Tool onClick={() => { move(-1); setOpen(false); }} disabled={index === 0} title="Sposta su">↑</Tool>
          <Tool onClick={() => { move(1); setOpen(false); }} disabled={index === items.length - 1} title="Sposta giù">↓</Tool>
          <Tool onClick={() => { setEditing(item); setOpen(false); }} title="Modifica">✎</Tool>
          <Tool onClick={() => { remove(); setOpen(false); }} title="Togli" danger>✕</Tool>
        </span>
      )}
      {form}
    </span>
  );
}

const LABELS: Record<MenuField, string> = {
  name: "Nome",
  desc: "Descrizione / ingredienti",
  price: "Prezzo",
  qty: "Quantità (facoltativa)",
  isNew: "Etichetta NUOVO",
  badge: "Etichetta (es. VEGETARIANO, VEGAN)",
};

const PLACEHOLDERS: Partial<Record<MenuField, string>> = {
  name: "es. Bullone",
  desc: "es. Hamburger di scottona, bacon croccante, doppio cheddar…",
  price: "es. 3€",
  qty: "es. 5 pz.",
  badge: "es. VEGETARIANO",
};

function ItemForm({ title, fields, item, onSave, onClose }: {
  title: string;
  fields: MenuField[];
  item: MenuItem;
  onSave: (next: MenuItem) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<MenuItem>(item);
  const set = (patch: Partial<MenuItem>) => setDraft((d) => ({ ...d, ...patch }));
  const text = (f: "name" | "desc" | "price" | "qty" | "badge") => (draft[f] ?? "") as string;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () => {
    if (!draft.name.trim()) return;
    // Se cambia il testo italiano, la vecchia traduzione inglese non vale più
    const next: MenuItem = { ...draft, name: draft.name.trim() };
    if (next.name !== item.name) delete next.nameEn;
    if ((next.desc ?? "") !== (item.desc ?? "")) delete next.descEn;
    (["desc", "price", "qty", "badge"] as const).forEach((f) => {
      const v = next[f]?.trim();
      if (v) next[f] = v; else delete next[f];
    });
    if (!next.isNew) delete next.isNew;
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
        className="w-full sm:max-w-md bg-[#111] text-white border border-white/15 rounded-t-2xl sm:rounded-xl shadow-2xl text-[14px] max-sm:[&_input]:text-base max-sm:[&_textarea]:text-base"
      >
        <header className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <p className="flex-1 font-semibold">{title}</p>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded hover:bg-white/10" aria-label="Chiudi">✕</button>
        </header>
        <div className="px-5 py-4 space-y-4">
          {fields.map((f) =>
            f === "isNew" ? (
              <label key={f} className="flex items-center gap-3">
                <input type="checkbox" checked={!!draft.isNew} onChange={(e) => set({ isNew: e.target.checked })} className="w-5 h-5 accent-red-600" />
                <span>{LABELS[f]}</span>
              </label>
            ) : (
              <label key={f} className="block">
                <span className="block text-[12px] text-white/60 mb-1">{LABELS[f]}</span>
                {f === "desc" ? (
                  <textarea
                    value={text(f)}
                    onChange={(e) => set({ [f]: e.target.value })}
                    placeholder={PLACEHOLDERS[f]}
                    rows={3}
                    className="w-full bg-black border border-white/20 rounded p-2 focus:outline-none focus:border-red-500"
                  />
                ) : (
                  <input
                    value={text(f)}
                    onChange={(e) => set({ [f]: e.target.value })}
                    placeholder={PLACEHOLDERS[f]}
                    autoFocus={f === "name"}
                    className="w-full h-10 bg-black border border-white/20 rounded px-3 focus:outline-none focus:border-red-500"
                  />
                )}
              </label>
            ),
          )}
        </div>
        <footer className="flex gap-2 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded border border-white/20 hover:border-white/50">Annulla</button>
          <button type="submit" disabled={!draft.name.trim()} className="flex-[2] h-11 rounded bg-red-600 font-semibold hover:bg-red-500 disabled:opacity-40">
            {item.id ? "Salva modifica" : "Aggiungi"}
          </button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}

function Tool({ onClick, title, disabled, danger, small, children }: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
  small?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`${small ? "w-6 h-6 text-[11px]" : "w-8 h-8 text-[13px]"} rounded bg-black/80 text-white border border-white/25 disabled:opacity-30 ${danger ? "hover:bg-red-600 hover:border-red-600" : "hover:border-white/70"}`}
    >
      {children}
    </button>
  );
}
