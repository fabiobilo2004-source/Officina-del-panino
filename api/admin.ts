// Funzione Vercel del pannello /admin sul sito online.
// Tutte le richieste /api/admin/* arrivano qui (vedi vercel.json).
import type { IncomingMessage, ServerResponse } from "http";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { handleAdmin, isAuthed } from "../server/admin-core.js";
import { githubStorage } from "../server/admin-github.js";

const REPO = "fabiobilo2004-source/Officina-del-panino";

type VercelRequest = IncomingMessage & { body?: unknown };

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

  try {
    // Caricamento diretto di foto/video su Vercel Blob (i file grandi non passano dalla funzione)
    if (route === "/blob" && req.method === "POST") {
      const body = req.body as HandleUploadBody;
      if (body?.type === "blob.generate-client-token" && !(secret && isAuthed(cookie, secret))) {
        return send(res, 401, { error: "Sessione scaduta: rientra da /admin" });
      }
      const result = await handleUpload({
        body,
        request: req,
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
      blobToken: process.env.BLOB_READ_WRITE_TOKEN,
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
