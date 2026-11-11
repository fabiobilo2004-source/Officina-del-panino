// Funzione Vercel del pannello /admin sul sito online.
// Tutte le richieste /api/admin/* arrivano qui (vedi vercel.json).
import type { IncomingMessage, ServerResponse } from "http";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { handleAdmin, isAuthed } from "../server/admin-core.js";
import { githubStorage } from "../server/admin-github.js";

const REPO = "fabiobilo2004-source/Officina-del-panino";

type VercelRequest = IncomingMessage & { body?: unknown };

// Chiave dello spazio foto (Vercel Blob). Di solito si chiama BLOB_READ_WRITE_TOKEN, ma se lo spazio
// è stato collegato con un prefisso ha un altro nome (es. OFFICINA_MEDIA_READ_WRITE_TOKEN)
function blobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  return Object.entries(process.env).find(([k, v]) => k.endsWith("READ_WRITE_TOKEN") && v?.startsWith("vercel_blob_rw_"))?.[1];
}

function send(res: ServerResponse, status: number, json: unknown, cookies?: string[]) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  if (cookies?.length) res.setHeader("Set-Cookie", cookies);
  res.end(JSON.stringify(json));
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  const host = req.headers.host ?? "";
  const url = new URL(req.url ?? "/", `https://${host}`);
  const route = "/" + (url.searchParams.get("route") ?? url.pathname.replace(/^\/api\/admin\/?/, "")).replace(/^\/+/, "");
  const cookie = req.headers.cookie ?? "";
  const secret = process.env.ADMIN_SECRET;
  const blob = blobToken();

  try {
    // Caricamento diretto di foto/video su Vercel Blob (i file grandi non passano dalla funzione)
    if (route === "/blob" && req.method === "POST") {
      const body = req.body as HandleUploadBody;
      if (body?.type === "blob.generate-client-token" && !(secret && isAuthed(cookie, secret))) {
        return send(res, 401, { error: "Sessione scaduta: rientra da /admin" });
      }
      if (!blob) return send(res, 500, { error: "Spazio foto non collegato su Vercel (Storage → Blob)" });
      const result = await handleUpload({
        body,
        request: req,
        token: blob,
        onBeforeGenerateToken: async (pathname) => ({
          allowedContentTypes: pathname.startsWith("uploads/video/") ? ["video/*"] : ["image/*"],
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: true,
        }),
      });
      return send(res, 200, result);
    }

    if (!process.env.GITHUB_TOKEN) return send(res, 500, { error: "Pannello non configurato: manca GITHUB_TOKEN" });
    const storage = githubStorage({
      token: process.env.GITHUB_TOKEN,
      repo: REPO,
      origin: `https://${host}`,
      blobToken: blob,
    });
    const query = Object.fromEntries([...url.searchParams].filter(([k]) => k !== "route"));
    const result = await handleAdmin(
      { method: req.method ?? "GET", route, cookie, body: req.method === "GET" ? query : req.body, secure: true },
      storage,
      { password: process.env.ADMIN_PASSWORD, secret },
    );
    return send(res, result.status, result.json, result.cookies);
  } catch (e) {
    return send(res, 500, { error: e instanceof Error ? e.message : String(e) });
  }
}
