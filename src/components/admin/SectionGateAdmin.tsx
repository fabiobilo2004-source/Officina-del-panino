// ✕ per nascondere una sezione fissa della homepage; poi "Rimetti" o "Rimuovi del tutto".
import { setSectionState } from "@/components/HomeBlocks";

const UI = { fontFamily: "system-ui, -apple-system, sans-serif" };

export default function SectionGateAdmin({ id, label, hidden }: { id: string; label: string; hidden: boolean }) {
  if (hidden) {
    return (
      <div data-admin-ui style={UI} className="px-6 py-3 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 min-h-11 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 text-sm">
          <span className="flex-1 min-w-[12rem]">Sezione «{label}» nascosta ai visitatori</span>
          <button type="button" onClick={() => setSectionState(id, "visible")} className="shrink-0 h-8 px-3 rounded bg-amber-500 text-black font-semibold hover:bg-amber-400">
            Rimetti
          </button>
          <button
            type="button"
            onClick={() => setSectionState(id, "removed")}
            title="Toglie anche questa riga; si può rimettere dal pannello, in «Sezioni nascoste e rimosse»"
            className="shrink-0 h-8 px-3 rounded border border-amber-500/50 hover:bg-red-600 hover:border-red-600 hover:text-white"
          >
            Rimuovi del tutto
          </button>
        </div>
      </div>
    );
  }
  // Il bottone sta sopra l'angolo della sezione che segue (contenitore alto 0)
  return (
    <div data-admin-ui style={UI} className="relative h-0 z-30">
      <button
        type="button"
        onClick={() => setSectionState(id, "hidden")}
        title={`Nascondi la sezione «${label}»`}
        className="absolute top-3 left-3 h-9 px-3 rounded bg-black/80 text-white text-[13px] border border-white/25 backdrop-blur hover:bg-red-600 hover:border-red-600"
      >
        ✕ Nascondi «{label}»
      </button>
    </div>
  );
}
