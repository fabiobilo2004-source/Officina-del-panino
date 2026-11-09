import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { uploadMedia } from "@/components/admin/upload";

type LibraryImage = { src: string; uploaded: boolean };

// Finestra per scegliere un'immagine (o un video) già presente sul sito o caricarne uno nuovo.
export function ImagePicker({ current, onPick, onClose, kind = "image" }: { current?: string; onPick: (src: string) => void; onClose: () => void; kind?: "image" | "video" }) {
  const video = kind === "video";
  const [images, setImages] = useState<LibraryImage[] | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [canUpload, setCanUpload] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = () =>
    fetch(`/api/admin/media?kind=${kind}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Sessione scaduta: rientra da /admin"))))
      .then((d: { items: LibraryImage[]; uploads: boolean }) => { setImages(d.items); setCanUpload(d.uploads); })
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      onPick(await uploadMedia(file, kind));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  return createPortal(
    <div
      data-admin-ui
      className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      onClick={onClose}
    >
      <div className="w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[85vh] bg-[#111] text-white sm:border border-white/15 shadow-2xl flex flex-col text-[13px]" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center gap-3 p-4 border-b border-white/10">
          <p className="flex-1 font-semibold text-sm">{video ? "Scegli un video" : "Scegli un'immagine"}</p>
          <input
            ref={input}
            type="file"
            accept={video ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp,image/gif"}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
          />
          <button
            onClick={() => input.current?.click()}
            disabled={uploading || !canUpload}
            title={canUpload ? undefined : "Caricamento non attivo"}
            className="h-9 px-4 rounded bg-red-600 font-semibold hover:bg-red-500 disabled:opacity-50"
          >
            {uploading ? "Caricamento…" : <><span className="sm:hidden">{video ? "Carica video" : "Carica foto"}</span><span className="hidden sm:inline">Carica dal computer</span></>}
          </button>
          <button onClick={onClose} className="w-9 h-9 rounded hover:bg-white/10" aria-label="Chiudi">✕</button>
        </header>
        {error && <p className="px-4 pt-3 text-red-400">{error}</p>}
        <div className="flex-1 overflow-y-auto p-4">
          {!images ? (
            <p className="text-white/50">Caricamento…</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {images.map((img) => (
                <button
                  key={img.src}
                  onClick={() => onPick(img.src)}
                  className={`group relative aspect-square overflow-hidden rounded border-2 bg-black ${img.src === current ? "border-red-500" : "border-transparent hover:border-white/60"}`}
                  title={img.src.split("/").pop()}
                >
                  {video
                    ? <video src={`${img.src}#t=0.5`} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                    : <img src={img.src} alt="" loading="lazy" className="w-full h-full object-cover" />}
                  {video && <span className="absolute bottom-1 left-1 right-1 truncate px-1 rounded bg-black/70 text-[10px]">{img.src.split("/").pop()}</span>}
                  {img.uploaded && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px]">caricata</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
