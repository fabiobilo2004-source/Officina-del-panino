// Pannello admin: si apre dopo il login su /admin (per ora solo in localhost).
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  FONT_OPTIONS, applyAll, canRedo, canUndo, currentBreakpoint, normalize, getEdits, redo, undo, getElement, getKey, getOriginalSrc, getOriginalTexts,
  setAdminMode, setEdits, subscribe, type ItemEdit, type SiteEditsData,
} from "@/lib/site-edits";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { HoursEditor } from "@/components/admin/HoursEditor";
import { PublishDialog, summarize } from "@/components/admin/PublishDialogs";

const API = "/api/admin";
const WEIGHTS = [300, 400, 500, 600, 700, 800, 900];
const PANEL_W = 320;
const MARGIN = 16;
const POS_KEY = "admin-panel-pos";

type Pos = { x: number; y: number };

function clampPos(p: Pos, height = 120): Pos {
  return {
    x: Math.min(Math.max(MARGIN, p.x), window.innerWidth - PANEL_W - MARGIN),
    y: Math.min(Math.max(MARGIN, p.y), window.innerHeight - Math.min(height, 120)),
  };
}

function initialPos(): Pos {
  try {
    const saved = JSON.parse(localStorage.getItem(POS_KEY) ?? "null");
    if (saved && typeof saved.x === "number") return clampPos(saved);
  } catch { /* posizione predefinita */ }
  return clampPos({ x: window.innerWidth - PANEL_W - MARGIN, y: 90 });
}

type Box = { top: number; left: number; width: number; height: number };

function boxOf(el: Element | undefined | null): Box | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

// Il testo o l'immagine modificabile sotto il puntatore, anche se coperto da sfumature o livelli decorativi
function findKeyedAt(x: number, y: number): HTMLElement | null {
  for (const hit of document.elementsFromPoint(x, y)) {
    if (hit.closest("[data-admin-ui]")) return null;
    let el: Element | null = hit;
    while (el && el !== document.body) {
      if (getKey(el)) return el as HTMLElement;
      el = el.parentElement;
    }
  }
  return null;
}

function clean(edit: ItemEdit): ItemEdit | undefined {
  const e: ItemEdit = { ...edit };
  if (e.texts && e.texts.every((t) => t == null)) delete e.texts;
  (["size", "move"] as const).forEach((k) => {
    const v = e[k] as Record<string, unknown> | undefined;
    if (v && !Object.values(v).some((x) => x !== undefined)) delete e[k];
  });
  (Object.keys(e) as (keyof ItemEdit)[]).forEach((k) => { if (e[k] === undefined) delete e[k]; });
  return Object.keys(e).length ? e : undefined;
}

export default function AdminPanel() {
  const [open, setOpen] = useState(true);
  const [pos, setPos] = useState<Pos>(initialPos);
  // Sul telefono parte ridotto a una barra: si apre quando tocchi un testo
  const [minimized, setMinimized] = useState(() => currentBreakpoint() === "mobile");
  const panelRef = useRef<HTMLElement>(null);
  const panelDrag = useRef<{ dx: number; dy: number } | null>(null);
  const [edits, setLocal] = useState<SiteEditsData>(getEdits());
  const [selected, setSelected] = useState<string | null>(null);
  const [hoverBox, setHoverBox] = useState<Box | null>(null);
  const [selBox, setSelBox] = useState<Box | null>(null);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(getEdits()));
  const [picker, setPicker] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  // Versione pubblicata (quella che vedono i visitatori) e suo codice, per accorgersi se cambia nel frattempo
  const [published, setPublished] = useState<SiteEditsData | null>(null);
  const [publishedHash, setPublishedHash] = useState("");
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishConflict, setPublishConflict] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState("");
  const [, force] = useState(0);
  const drag = useRef<{ x: number; y: number; start: [number, number] } | null>(null);
  const lastPointer = useRef<string>("mouse");
  const bp = currentBreakpoint();
  // Sul telefono il pannello diventa un riquadro che sale dal basso
  const phone = bp === "mobile";

  // Carica la bozza (o, se non c'è, la versione pubblicata): il titolare vede sempre il sito con le sue modifiche
  const loadDraft = useCallback(async () => {
    const res = await fetch(`${API}/draft`);
    if (!res.ok) return;
    const d: { draft: SiteEditsData; published: SiteEditsData; publishedHash: string } = await res.json();
    setEdits(d.draft, { record: false });
    setLocal(getEdits());
    setSavedJson(JSON.stringify(getEdits()));
    setPublished(normalize(d.published));
    setPublishedHash(d.publishedHash);
  }, []);

  useEffect(() => { loadDraft().catch(() => {}); }, [loadDraft]);

  useEffect(() => subscribe(() => { setLocal(getEdits()); force((n) => n + 1); }), []);

  // Le card delle Novità mostrano i comandi (+, sposta, elimina) solo mentre il pannello è aperto
  useEffect(() => {
    setAdminMode(open);
    return () => setAdminMode(false);
  }, [open]);

  // Finestra del pannello: si trascina dalla barra in alto e resta dove la lasci
  useEffect(() => {
    try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch { /* non importante */ }
  }, [pos]);

  useEffect(() => {
    const onResize = () => setPos((p) => clampPos(p, panelRef.current?.offsetHeight));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const startPanelDrag = (e: ReactPointerEvent) => {
    if ((e.target as Element).closest("button")) return;
    panelDrag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    const move = (ev: PointerEvent) => {
      if (!panelDrag.current) return;
      setPos(clampPos({ x: ev.clientX - panelDrag.current.dx, y: ev.clientY - panelDrag.current.dy }, panelRef.current?.offsetHeight));
    };
    const up = () => {
      panelDrag.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const otherSide = () =>
    setPos((p) => clampPos({ x: p.x + PANEL_W / 2 > window.innerWidth / 2 ? MARGIN : window.innerWidth - PANEL_W - MARGIN, y: p.y }, panelRef.current?.offsetHeight));

  // Se il testo selezionato finisce sotto il pannello: su computer il pannello va dall'altro lato,
  // sul telefono la pagina scorre per mostrarlo sopra il pannello
  useEffect(() => {
    if (!selected || !panelRef.current) return;
    const target = getElement(selected)?.getBoundingClientRect();
    const panel = panelRef.current.getBoundingClientRect();
    if (!target) return;
    if (phone) {
      const top = 80;
      const bottom = panel.top - 12;
      if (target.top < top || target.bottom > bottom) {
        window.scrollBy({ top: target.top - top - Math.max(0, (bottom - top - target.height) / 3), behavior: "smooth" });
      }
      return;
    }
    const covers = (left: number) =>
      target.left < left + panel.width && target.right > left && target.top < panel.bottom && target.bottom > panel.top;
    // Si sposta solo se dall'altro lato non copre il testo (i titoli larghi coprirebbe comunque)
    const otherLeft = panel.left + panel.width / 2 > window.innerWidth / 2 ? MARGIN : window.innerWidth - PANEL_W - MARGIN;
    if (covers(panel.left) && !covers(otherLeft)) otherSide();
  }, [selected]);

  const dirty = JSON.stringify(edits) !== savedJson;
  const changes = published ? summarize(published, edits) : [];
  const unpublished = changes.length > 0;

  const update = useCallback((next: SiteEditsData, group?: string) => {
    setEdits(next, { group });
    setLocal(getEdits());
    setStatus("");
    setJustSaved(false);
  }, []);

  const updateItems = useCallback((keys: string[], fn: (e: ItemEdit) => ItemEdit, group?: string) => {
    const cur = getEdits();
    const items = { ...cur.items };
    for (const key of keys) {
      const next = clean(fn({ ...(items[key] ?? {}) }));
      if (next) items[key] = next; else delete items[key];
    }
    update({ ...cur, items }, group);
  }, [update]);

  // `group`: modifiche continue (scrittura, trascinamento, cursore) che ↶ annulla in un colpo solo
  const updateItem = useCallback(
    (key: string, fn: (e: ItemEdit) => ItemEdit, group?: string) => updateItems([key], fn, group && `${group}:${key}`),
    [updateItems],
  );

  // Salva la bozza: non va online finché non si preme Pubblica
  const save = async () => {
    setStatus("Salvataggio…");
    const snapshot = JSON.stringify(getEdits());
    const res = await fetch(`${API}/draft`, { method: "POST", headers: { "Content-Type": "application/json" }, body: snapshot });
    if (res.ok) {
      setSavedJson(snapshot);
      setStatus("");
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      return true;
    }
    setStatus(res.status === 401 ? "Sessione scaduta: rientra da /admin e salva di nuovo" : "Errore nel salvataggio: riprova");
    return false;
  };

  const publish = async (force: boolean) => {
    setPublishing(true);
    if (dirty && !(await save())) { setPublishing(false); return; }
    const res = await fetch(`${API}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: getEdits(), baseHash: publishedHash, force }),
    });
    setPublishing(false);
    if (res.status === 409) { setPublishConflict(true); return; }
    if (!res.ok) { setStatus(res.status === 401 ? "Sessione scaduta: rientra da /admin" : "Pubblicazione non riuscita: riprova"); setPublishOpen(false); return; }
    const body = await res.json();
    setPublished(getEdits());
    setSavedJson(JSON.stringify(getEdits()));
    setPublishedHash(body.publishedHash);
    setPublishOpen(false);
    setPublishConflict(false);
    setStatus(import.meta.env.DEV ? "Pubblicato ✓ Il sito è aggiornato." : "Pubblicato ✓ Il sito si aggiorna in circa 1 minuto.");
  };

  // Butta via la bozza e torna a quello che c'è sul sito
  const discardDraft = async () => {
    if (!window.confirm("Eliminare tutte le modifiche non pubblicate e tornare al sito attuale?")) return;
    await fetch(`${API}/draft`, { method: "DELETE" });
    await loadDraft();
    setStatus("Modifiche non pubblicate eliminate: ora vedi il sito pubblicato");
  };


  // Riquadri di evidenziazione che seguono scroll/resize
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const tick = () => {
      setSelBox(selected ? boxOf(getElement(selected)) : null);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [open, selected]);

  // Modalità modifica: hover, click per selezionare, trascina per spostare
  useEffect(() => {
    if (!open) { setHoverBox(null); return; }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (drag.current && selected) {
        const dx = Math.round(e.clientX - drag.current.x);
        const dy = Math.round(e.clientY - drag.current.y);
        const [sx, sy] = drag.current.start;
        updateItem(selected, (it) => ({ ...it, move: { ...it.move, [bp]: [sx + dx, sy + dy] } }), "move");
        return;
      }
      setHoverBox(boxOf(findKeyedAt(e.clientX, e.clientY)));
    };
    const onDown = (e: PointerEvent) => {
      lastPointer.current = e.pointerType;
      if (e.pointerType !== "mouse") return;
      // Clic sul pannello o sui suoi comandi: non cambia la selezione
      if (e.target instanceof Element && e.target.closest("[data-admin-ui]")) return;
      const el = findKeyedAt(e.clientX, e.clientY);
      // Clic in un punto vuoto della pagina: deseleziona.
      // Foto e video di sfondo occupano tanto spazio: se c'è già qualcosa selezionato, il primo clic deseleziona soltanto
      const isMedia = el instanceof HTMLImageElement || el instanceof HTMLVideoElement;
      if (!el || (isMedia && selected && getKey(el) !== selected)) { setSelected(null); return; }
      e.preventDefault();
      e.stopPropagation();
      const key = getKey(el)!;
      if (key === selected) {
        drag.current = { x: e.clientX, y: e.clientY, start: getEdits().items[key]?.move?.[bp] ?? [0, 0] };
      } else {
        setSelected(key);
      }
    };
    const onUp = () => { drag.current = null; };
    const block = (e: MouseEvent) => {
      if (e.target instanceof Element && !e.target.closest("[data-admin-ui]")) {
        e.preventDefault();
        e.stopPropagation();
        if (lastPointer.current !== "mouse") {
          const el = findKeyedAt(e.clientX, e.clientY);
          const isMedia = el instanceof HTMLImageElement || el instanceof HTMLVideoElement;
          const next = !el || (isMedia && selected && getKey(el) !== selected) ? null : getKey(el)!;
          setSelected(next);
          if (next) setMinimized(false);
        }
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
      // Cmd/Ctrl+Z annulla, Cmd/Ctrl+Shift+Z (o Ctrl+Y) ripete; dentro un campo di testo vale l'annulla del campo
      const typing = e.target instanceof Element && e.target.closest("input, textarea, select");
      if (typing || !(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); redo(); }
    };
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("pointerup", onUp, true);
    document.addEventListener("click", block, true);
    document.addEventListener("keydown", onKey);
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", block, true);
      document.removeEventListener("keydown", onKey);
      document.body.style.userSelect = "";
    };
  }, [open, selected, bp, updateItem]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const el = selected ? getElement(selected) : undefined;
  const item = selected ? edits.items[selected] ?? {} : {};
  const orig = el ? getOriginalTexts(el) : [];
  const isImage = el instanceof HTMLImageElement;
  const isVideo = el instanceof HTMLVideoElement;
  const mediaField = isVideo ? "videos" : "images";
  const mediaSrc = selected && (isImage || isVideo) ? edits[mediaField][selected] ?? getOriginalSrc(el!) : undefined;
  const editedCount = new Set([...Object.keys(edits.items), ...Object.keys(edits.images), ...Object.keys(edits.videos), ...Object.keys(edits.links)]).size;
  const computed = el ? getComputedStyle(el) : null;
  const move = item.move?.[bp] ?? [0, 0];

  const setMedia = (src: string | undefined) => {
    const cur = getEdits();
    const map = { ...cur[mediaField] };
    if (src && src !== getOriginalSrc(el!)) map[selected!] = src; else delete map[selected!];
    update({ ...cur, [mediaField]: map });
  };

  const logout = async () => {
    if (dirty && !window.confirm("Hai modifiche non salvate. Uscire lo stesso?")) return;
    await fetch(`${API}/logout`, { method: "POST" });
    // Fuori dall'admin si vede di nuovo il sito pubblicato
    if (published) setEdits(published, { record: false });
    window.dispatchEvent(new Event("admin-auth"));
  };

  const setMove = (x: number, y: number) =>
    updateItem(selected!, (it) => ({ ...it, move: { ...it.move, [bp]: x || y ? [x, y] : undefined } }));

  const moveControls = el && (
    <Field label={`Posizione su ${bp === "desktop" ? "computer" : "mobile"} ${phone ? "" : " (trascinalo, o usa le frecce)"}`}>
      <div className="flex items-center gap-2">
        <span className="text-white/60 w-24">X {move[0]} · Y {move[1]}</span>
        <SmallBtn onClick={() => setMove(move[0] - 4, move[1])}>←</SmallBtn>
        <SmallBtn onClick={() => setMove(move[0], move[1] - 4)}>↑</SmallBtn>
        <SmallBtn onClick={() => setMove(move[0], move[1] + 4)}>↓</SmallBtn>
        <SmallBtn onClick={() => setMove(move[0] + 4, move[1])}>→</SmallBtn>
        {(move[0] || move[1]) ? <SmallBtn onClick={() => setMove(0, 0)}>↺</SmallBtn> : null}
      </div>
    </Field>
  );

  return (
    <div data-admin-ui style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {open && hoverBox && <Outline box={hoverBox} color="rgba(96,165,250,0.9)" />}
      {open && selBox && <Outline box={selBox} color="#ef4444" thick />}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-[300] px-4 h-11 bg-white text-black text-sm font-semibold shadow-2xl rounded-full"
        >
          ✎ Modifica il sito
        </button>
      )}

      {open && (
        <aside
          ref={panelRef}
          style={phone ? undefined : { left: pos.x, top: pos.y, width: PANEL_W, maxHeight: `calc(100vh - ${pos.y + MARGIN}px)` }}
          className={`fixed z-[300] bg-[#111]/95 backdrop-blur text-white border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden ${
            phone
              ? "left-0 right-0 bottom-0 max-h-[55dvh] rounded-t-2xl border-b-0 text-[15px] pb-[env(safe-area-inset-bottom)] [&_input]:text-base [&_textarea]:text-base [&_select]:text-base"
              : "rounded-xl text-[13px]"
          }`}
        >
          {phone && (
            <button
              onClick={() => setMinimized(!minimized)}
              className="w-full pt-2 pb-1 flex justify-center"
              aria-label={minimized ? "Espandi il pannello" : "Riduci il pannello"}
            >
              <span className="w-10 h-1 rounded-full bg-white/30" />
            </button>
          )}
          <header
            onPointerDown={phone ? undefined : startPanelDrag}
            className={`px-3 py-2.5 flex items-center gap-1 select-none ${phone ? "" : "cursor-grab active:cursor-grabbing"} ${minimized ? "" : "border-b border-white/10"}`}
            title={phone ? undefined : "Trascina per spostare il pannello"}
          >
            {!phone && <span className="text-white/30 mr-1" aria-hidden>⋮⋮</span>}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">Pannello admin</p>
              <p className="text-white/50 text-[11px] truncate">
                {dirty
                  ? <span className="text-amber-400">Modifiche non salvate</span>
                  : unpublished
                  ? <span className="text-sky-300">Da pubblicare</span>
                  : <>Vista {bp === "desktop" ? "computer" : "mobile"} · tutto pubblicato</>}
              </p>
            </div>
            {(minimized || phone) && canUndo() && (
              <button onClick={undo} className={`${phone ? "w-10 h-10 text-lg" : "w-7 h-7"} rounded hover:bg-white/10`} title="Annulla l'ultima modifica" aria-label="Annulla l'ultima modifica">↶</button>
            )}
            {(minimized || phone) && dirty && (
              <button onClick={save} className={`rounded bg-red-600 font-semibold hover:bg-red-500 ${phone ? "h-10 px-4" : "h-7 px-2.5 text-[12px]"}`}>Salva</button>
            )}
            {!phone && <button onClick={otherSide} className="w-7 h-7 rounded hover:bg-white/10" title="Sposta dall'altro lato" aria-label="Sposta dall'altro lato">⇆</button>}
            <button onClick={() => setMinimized(!minimized)} className={`${phone ? "w-10 h-10" : "w-7 h-7"} rounded hover:bg-white/10`} title={minimized ? "Espandi" : "Riduci"} aria-label={minimized ? "Espandi" : "Riduci"}>{phone ? (minimized ? "▴" : "▾") : minimized ? "▢" : "–"}</button>
            <button onClick={() => { setOpen(false); setSelected(null); }} className={`${phone ? "w-10 h-10" : "w-7 h-7"} rounded hover:bg-white/10`} title="Chiudi" aria-label="Chiudi">✕</button>
          </header>
          {!minimized && <>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <button
              onClick={() => setHoursOpen(true)}
              className="w-full h-10 rounded bg-white/10 hover:bg-white/20 font-semibold flex items-center justify-center gap-2"
            >
              🕒 Orari e chiusure
            </button>

            <Section title={isVideo ? "Video selezionato" : isImage ? "Immagine selezionata" : "Testo selezionato"}>
              {!el ? (
                <p className="text-white/50 leading-relaxed">
                  {phone
                    ? "Tocca un testo o un'immagine nella pagina per selezionarlo, poi modificalo qui sotto."
                    : "Clicca un testo o un'immagine nella pagina per selezionarlo. Poi trascinalo per spostarlo, oppure modificalo qui sotto."}
                </p>
              ) : isImage || isVideo ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded overflow-hidden border border-white/15">
                    {isVideo
                      ? <video key={mediaSrc} src={mediaSrc} muted autoPlay loop playsInline className="w-full h-full object-contain" />
                      : <img src={mediaSrc} alt="" className="w-full h-full object-contain" />}
                  </div>
                  <button onClick={() => setPicker(true)} className="w-full h-10 rounded bg-white text-black font-semibold hover:bg-white/90">
                    {isVideo ? "Sostituisci video" : "Sostituisci immagine"}
                  </button>
                  {edits[mediaField][selected!] && (
                    <button onClick={() => setMedia(undefined)} className="w-full h-9 border border-white/20 rounded hover:border-white/60">
                      {isVideo ? "Rimetti il video originale" : "Rimetti l'immagine originale"}
                    </button>
                  )}
                  {moveControls}
                  {picker && (
                    <ImagePicker
                      kind={isVideo ? "video" : "image"}
                      current={mediaSrc}
                      onClose={() => setPicker(false)}
                      onPick={(src) => { setMedia(src); setPicker(false); }}
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {orig.map((o, i) => (
                    <Field key={i} label={orig.length > 1 ? `Testo ${i + 1}` : "Testo"}>
                      <textarea
                        value={item.texts?.[i] ?? o}
                        rows={Math.min(6, Math.max(2, Math.ceil(o.length / 34)))}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateItem(selected!, (it) => {
                            const texts = orig.map((_, j) => it.texts?.[j]);
                            texts[i] = v === o ? undefined : v;
                            return { ...it, texts: texts as string[] };
                          }, `text${i}`);
                        }}
                        className="w-full bg-black border border-white/20 rounded p-2 text-white resize-y focus:outline-none focus:border-red-500"
                      />
                    </Field>
                  ))}

                  <Field label="Font di questo testo">
                    <FontSelect value={item.font} onChange={(f) => updateItem(selected!, (it) => ({ ...it, font: f }))} />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Spessore">
                      <select
                        value={item.weight ?? ""}
                        onChange={(e) => updateItem(selected!, (it) => ({ ...it, weight: e.target.value ? +e.target.value : undefined }))}
                        className="w-full h-9 bg-black border border-white/20 rounded px-2"
                      >
                        <option value="">Originale ({computed?.fontWeight})</option>
                        {WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </Field>
                    <Field label="Colore">
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={item.color ?? rgbToHex(computed?.color)}
                          onChange={(e) => updateItem(selected!, (it) => ({ ...it, color: e.target.value }), "color")}
                          className="h-9 w-12 bg-transparent border border-white/20 rounded"
                        />
                        {item.color && <SmallBtn onClick={() => updateItem(selected!, (it) => ({ ...it, color: undefined }))}>↺</SmallBtn>}
                      </div>
                    </Field>
                  </div>

                  <Field label={`Grandezza su ${bp === "desktop" ? "computer" : "mobile"}: ${Math.round(parseFloat(computed?.fontSize ?? "16"))}px`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={8}
                        max={140}
                        value={item.size?.[bp] ?? Math.round(parseFloat(computed?.fontSize ?? "16"))}
                        onChange={(e) => updateItem(selected!, (it) => ({ ...it, size: { ...it.size, [bp]: +e.target.value } }), "size")}
                        className="flex-1 accent-red-500"
                      />
                      {item.size?.[bp] && <SmallBtn onClick={() => updateItem(selected!, (it) => ({ ...it, size: { ...it.size, [bp]: undefined } }))}>↺</SmallBtn>}
                    </div>
                  </Field>

                  {moveControls}

                  <button
                    onClick={() => updateItem(selected!, () => ({}))}
                    className="w-full h-9 border border-white/20 rounded hover:border-red-500 hover:text-red-400"
                  >
                    Ripristina questo testo com'era
                  </button>
                </div>
              )}
            </Section>

          </div>

          <footer className="p-4 border-t border-white/10 space-y-2">
            {status && <p className="text-[12px] text-white/60">{status}</p>}
            {dirty ? (
              <p className="text-[12px] text-amber-400">Modifiche non salvate</p>
            ) : unpublished ? (
              <p className="text-[12px] text-sky-300">Salvato: i visitatori lo vedranno quando pubblichi</p>
            ) : (
              <p className="text-[12px] text-white/40">Il sito è aggiornato</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={!canUndo()}
                className="w-10 h-10 shrink-0 rounded border border-white/25 text-lg hover:border-white/60 disabled:opacity-30"
                title="Annulla l'ultima modifica (Cmd/Ctrl+Z)"
                aria-label="Annulla l'ultima modifica"
              >
                ↶
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                className="w-10 h-10 shrink-0 rounded border border-white/25 text-lg hover:border-white/60 disabled:opacity-30"
                title="Ripeti (Cmd/Ctrl+Shift+Z)"
                aria-label="Ripeti"
              >
                ↷
              </button>
              <button
                onClick={(e) => { e.currentTarget.blur(); save(); }}
                className={`flex-1 h-10 rounded font-semibold transition-colors border ${justSaved ? "bg-green-600 border-green-600" : "border-white/25 hover:border-white/60"}`}
              >
                {justSaved ? "Salvato ✓" : "Salva"}
              </button>
              <button
                onClick={() => { setPublishConflict(false); setPublishOpen(true); }}
                disabled={!unpublished}
                className="flex-1 h-10 rounded font-semibold bg-green-600 hover:bg-green-500 disabled:bg-white/10 disabled:text-white/40"
              >
                Pubblica
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/50">
              {unpublished && <button onClick={discardDraft} className="hover:text-white underline underline-offset-2">Torna al sito pubblicato</button>}
              <button onClick={logout} className="ml-auto hover:text-white underline underline-offset-2">Esci</button>
            </div>
          </footer>
          </>}
        </aside>
      )}

      {hoursOpen && <HoursEditor dirty={dirty} onSave={save} onClose={() => setHoursOpen(false)} />}
      {publishOpen && (
        <PublishDialog
          lines={changes}
          conflict={publishConflict}
          busy={publishing}
          onConfirm={publish}
          onClose={() => setPublishOpen(false)}
        />
      )}
    </div>
  );
}

function Outline({ box, color, thick }: { box: Box; color: string; thick?: boolean }) {
  return (
    <div
      className="fixed z-[290] pointer-events-none"
      style={{ top: box.top - 3, left: box.left - 3, width: box.width + 6, height: box.height + 6, border: `${thick ? 2 : 1}px ${thick ? "solid" : "dashed"} ${color}`, cursor: "move" }}
    />
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] uppercase tracking-[0.15em] text-white/50 mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="block text-[11px] text-white/60 mb-1">{label}</span>
      {children}
    </div>
  );
}

function SmallBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="w-8 h-8 shrink-0 rounded border border-white/20 hover:border-white/60">
      {children}
    </button>
  );
}

function FontSelect({ value, onChange }: { value?: string; onChange: (f: string | undefined) => void }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      className="w-full h-9 bg-black border border-white/20 rounded px-2"
    >
      <option value="">Originale</option>
      {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
    </select>
  );
}

function rgbToHex(rgb?: string) {
  const m = rgb?.match(/\d+/g);
  if (!m) return "#ffffff";
  return "#" + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, "0")).join("");
}

// Riapplica tutto quando il pannello viene ricaricato da HMR
applyAll();
