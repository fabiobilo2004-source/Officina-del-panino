// Caricamento di foto e video dal pannello admin.
// Le foto vengono ridotte prima di partire (max 2000px, WebP), così il sito resta veloce.
// In localhost vanno in public/uploads; online direttamente su Vercel Blob.

const MAX_SIDE = 2000;

async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.82));
  if (!blob || blob.size >= file.size) return file;
  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type: "image/webp" });
}

function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "file";
  return `${base}${dot > 0 ? name.slice(dot).toLowerCase() : ""}`;
}

/** Carica il file e restituisce l'indirizzo da usare nel sito */
export async function uploadMedia(original: File, kind: "image" | "video"): Promise<string> {
  const file = kind === "image" ? await compressImage(original) : original;

  if (import.meta.env.DEV) {
    const res = await fetch(`/api/admin/upload?kind=${kind}`, {
      method: "POST",
      headers: { "x-filename": encodeURIComponent(file.name) },
      body: file,
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Caricamento non riuscito");
    return body.src;
  }

  const { upload } = await import("@vercel/blob/client");
  const blob = await upload(`uploads/${kind}/${safeName(file.name)}`, file, {
    access: "public",
    handleUploadUrl: "/api/admin/blob",
    multipart: file.size > 20 * 1024 * 1024,
    contentType: file.type || undefined,
  });
  return blob.url;
}
