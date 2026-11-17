// Funzione Vercel del pannello /admin sul sito online.
// Tutte le richieste /api/admin/* arrivano qui (vedi vercel.json).
import type { IncomingMessage, ServerResponse } from "http";
import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { handleAdmin, isAuthed } from "../server/admin-core.js";
import { githubStorage } from "../server/admin-github.js";

const REPO = "fabiobilo2004-source/Officina-del-panino";

type VercelRequest = IncomingMessage & { body?: unknown };

export type BlobAuth = { token?: string; oidcToken?: string; storeId?: string };

// Accesso allo spazio foto (Vercel Blob). Gli spazi collegati di recente usano OIDC: Vercel dà solo
// BLOB_STORE_ID e un token temporaneo in ogni richiesta. Quelli più vecchi una chiave *_READ_WRITE_TOKEN.
function blobAuth(req: IncomingMessage): BlobAuth | null {
  const storeId = process.env.BLOB_STORE_ID;
  const oidcToken = (req.headers["x-vercel-oidc-token"] as string | undefined) ?? process.env.VERCEL_OIDC_TOKEN;
  if (storeId && oidcToken) return { oidcToken, storeId };
  const token = process.env.BLOB_READ_WRITE_TOKEN
    ?? Object.entries(process.env).find(([k, v]) => k.endsWith("READ_WRITE_TOKEN") && v?.startsWith("vercel_blob_rw_"))?.[1];
  return token ? { token } : null;
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
  const blob = blobAuth(req);

  try {
    // Caricamento diretto di foto/video su Vercel Blob con un indirizzo firmato valido 15 minuti
    // (i file grandi vanno dal telefono allo spazio foto senza passare dalla funzione)
    if (route === "/blob" && req.method === "POST") {
      const body = req.body as HandleUploadPresignedBody;
      if (body?.type === "blob.generate-presigned-url" && !(secret && isAuthed(cookie, secret))) {
        return send(res, 401, { error: "Sessione scaduta: rientra da /admin" });
      }
      if (!blob) return send(res, 500, { error: "Spazio foto non collegato su Vercel (Storage → Blob)" });
      const result = await handleUploadPresigned({
        body,
        request: req,
        getSignedToken: async (pathname) => {
          const limits = {
            allowedContentTypes: pathname.startsWith("uploads/video/") ? ["video/*"] : ["image/*"],
            maximumSizeInBytes: 200 * 1024 * 1024,
          };
          const token = await issueSignedToken({
            ...blob,
            ...limits,
            pathname,
            operations: ["put"],
            validUntil: Date.now() + 15 * 60 * 1000,
          });
          return { token, urlOptions: { ...limits, addRandomSuffix: true } };
        },
      });
      return send(res, 200, result);
    }

    if (!process.env.GITHUB_TOKEN) return send(res, 500, { error: "Pannello non configurato: manca GITHUB_TOKEN" });
    const storage = githubStorage({
      token: process.env.GITHUB_TOKEN,
      repo: REPO,
      origin: `https://${host}`,
      blob,
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
