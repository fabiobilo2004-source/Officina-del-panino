// Parole colorate dentro un testo, scritte così: "Il panino [rosso]più buono[/] di Rimini".
// I bottoni colore del pannello inseriscono i segni; il sito li trasforma in parole colorate.

/** Colori a disposizione nel pannello (il nome è quello che compare nel testo) */
export const RICH_COLORS: { name: string; label: string; css: string }[] = [
  { name: "rosso", label: "Rosso Officina", css: "hsl(var(--primary))" },
  { name: "giallo", label: "Giallo", css: "#f5c518" },
  { name: "arancione", label: "Arancione", css: "#ff7a1a" },
  { name: "verde", label: "Verde", css: "#4caf50" },
  { name: "bianco", label: "Bianco", css: "#ffffff" },
  { name: "nero", label: "Nero", css: "#111111" },
];

const TAG = /\[(#[0-9a-fA-F]{6}|[a-z]+)\]([\s\S]*?)\[\/\]/g;

function colorOf(name: string) {
  if (name.startsWith("#")) return name;
  return RICH_COLORS.find((c) => c.name === name)?.css;
}

export type RichPart = { text: string; color?: string };

/** Spezza il testo in pezzi normali e pezzi colorati */
export function parseRich(text: string): RichPart[] {
  const parts: RichPart[] = [];
  let last = 0;
  for (const m of text.matchAll(TAG)) {
    const color = colorOf(m[1]);
    if (!color) continue;
    if (m.index! > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ text: m[2], color });
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

export function hasRich(text: string | undefined) {
  return !!text && parseRich(text).some((p) => p.color);
}

/** Il testo senza i segni dei colori (per titoli delle immagini, riepiloghi…) */
export function plainText(text: string) {
  return parseRich(text).map((p) => p.text).join("");
}

/** Testo con eventuali parole colorate, per i componenti React */
export function Rich({ text }: { text?: string }) {
  if (!text) return null;
  const parts = parseRich(text);
  if (!parts.some((p) => p.color)) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => (p.color ? <span key={i} style={{ color: p.color }}>{p.text}</span> : p.text))}
    </>
  );
}

/** Stessa cosa ma come nodi DOM (per i testi del sito modificati sopra la pagina) */
export function richFragment(text: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  for (const p of parseRich(text)) {
    if (!p.color) {
      frag.append(document.createTextNode(p.text));
      continue;
    }
    const span = document.createElement("span");
    span.style.color = p.color;
    span.textContent = p.text;
    frag.append(span);
  }
  return frag;
}
