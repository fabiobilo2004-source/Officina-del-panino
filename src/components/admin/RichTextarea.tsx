// Casella di testo del pannello con la barretta dei colori: si selezionano alcune parole e si
// sceglie un colore. Sotto compare l'anteprima. I segni [colore]…[/] li gestisce src/lib/rich-text.tsx.
import { useRef, useState } from "react";
import { RICH_COLORS, Rich, hasRich, plainText } from "@/lib/rich-text";

export function RichTextarea({ value, onChange, rows = 3, placeholder, singleLine, autoFocus, className = "" }: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  /** Una riga sola (titoli) */
  singleLine?: boolean;
  autoFocus?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [hint, setHint] = useState(false);
  const [custom, setCustom] = useState("#ff4b1d");

  const colorSelection = (color: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    if (a === b) {
      setHint(true);
      el.focus();
      return;
    }
    setHint(false);
    let before = value.slice(0, a);
    let after = value.slice(b);
    // Parole già colorate e selezionate esattamente: si cambia solo il colore (niente segni doppi)
    const open = /\[(#[0-9a-fA-F]{6}|[a-z]+)\]$/.exec(before);
    if (open && after.startsWith("[/]")) {
      before = before.slice(0, open.index);
      after = after.slice(3);
    }
    const selected = plainText(value.slice(a, b));
    onChange(`${before}[${color}]${selected}[/]${after}`);
    requestAnimationFrame(() => {
      el.focus();
      const start = before.length + color.length + 2;
      el.setSelectionRange(start, start + selected.length);
    });
  };

  const clearColors = () => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    // Senza selezione toglie i colori da tutto il testo
    onChange(a === b ? plainText(value) : `${value.slice(0, a)}${plainText(value.slice(a, b))}${value.slice(b)}`);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1 mb-1.5">
        <span className="text-[11px] text-white/45 mr-1">Colora le parole selezionate:</span>
        {RICH_COLORS.map((c) => (
          <button
            key={c.name}
            type="button"
            title={c.label}
            aria-label={`Colora di ${c.label}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => colorSelection(c.name)}
            className="w-6 h-6 rounded-full border border-white/40 hover:scale-110 transition-transform"
            style={{ background: c.css }}
          />
        ))}
        <label title="Un altro colore" className="relative w-6 h-6 rounded-full border border-white/40 overflow-hidden cursor-pointer" style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}>
          <input
            type="color"
            value={custom}
            onChange={(e) => { setCustom(e.target.value); colorSelection(e.target.value); }}
            onMouseDown={() => ref.current && setHint(ref.current.selectionStart === ref.current.selectionEnd)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        {hasRich(value) && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearColors}
            className="ml-1 text-[11px] text-white/55 underline underline-offset-2 hover:text-white"
          >
            Togli colori
          </button>
        )}
      </div>
      <textarea
        ref={ref}
        value={value}
        rows={singleLine ? 1 : rows}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => { setHint(false); onChange(singleLine ? e.target.value.replace(/\n/g, " ") : e.target.value); }}
        className={`w-full bg-black border border-white/20 rounded px-3 py-2 text-white leading-relaxed focus:outline-none focus:border-red-500 ${singleLine ? "resize-none" : "resize-y"}`}
      />
      {hint && <p className="mt-1 text-[11px] text-amber-400">Prima seleziona con il dito o il mouse le parole da colorare.</p>}
      {hasRich(value) && (
        <div className="mt-2 rounded border border-white/10 bg-[#1c1917] px-3 py-2">
          <span className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Anteprima</span>
          <p className="whitespace-pre-line text-white/85"><Rich text={value} /></p>
        </div>
      )}
    </div>
  );
}
