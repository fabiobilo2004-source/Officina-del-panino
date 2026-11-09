// Logica del pannello /admin condivisa tra localhost (server di Vite) e sito online (funzione Vercel).
// Cambia solo dove si salva: file sul computer in locale, GitHub online (vedi admin-fs.ts / admin-github.ts).
import crypto from "crypto";

export type MediaKind = "image" | "video";
export type MediaItem = { src: string; uploaded: boolean };
export type Version = { id: string; date: string; label: string };

export interface AdminStorage {
  /** Contenuti pubblicati (src/content/site-edits.json) e loro versione, per accorgersi se cambiano */
  readPublished(): Promise<{ text: string; version: string }>;
  readDraft(): Promise<string | null>;
  writeDraft(text: string): Promise<void>;
  deleteDraft(): Promise<void>;
  /** `null` = la versione pubblicata è cambiata nel frattempo */
  publish(text: string, baseVersion: string | undefined, force: boolean): Promise<{ version: string } | null>;
  history(): Promise<Version[]>;
  readVersion(id: string): Promise<string | null>;
  listMedia(kind: MediaKind): Promise<MediaItem[]>;
  uploadsEnabled: boolean;
}

export type AdminRequest = { method: string; route: string; cookie: string; body: unknown; secure: boolean };
export type AdminResponse = { status: number; json: unknown; cookies?: string[] };
export type AdminConfig = { password?: string; secret?: string };

const SESSION_DAYS = 7;

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function cookieValue(cookie: string, name: string) {
  return new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(cookie)?.[1];
}

/** Sessione firmata: "scadenza.firma", valida senza doverla salvare da nessuna parte */
export function isAuthed(cookie: string, secret: string) {
  const token = cookieValue(cookie, "admin_session");
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = Buffer.from(sign(exp, secret));
  const given = Buffer.from(sig);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

function sessionCookies(secure: boolean, secret: string | null) {
  const flags = `Path=/; SameSite=Strict${secure ? "; Secure" : ""}`;
  if (!secret) {
    return [`admin_session=; HttpOnly; ${flags}; Max-Age=0`, `admin_hint=; ${flags}; Max-Age=0`];
  }
  const maxAge = SESSION_DAYS * 24 * 3600;
  const exp = String(Date.now() + maxAge * 1000);
  return [
    `admin_session=${exp}.${sign(exp, secret)}; HttpOnly; ${flags}; Max-Age=${maxAge}`,
    // Leggibile dal sito: solo per sapere se caricare il pannello, non dà accesso a niente
    `admin_hint=1; ${flags}; Max-Age=${maxAge}`,
  ];
}

function safeEqual(a: string, b: string) {
  const x = crypto.createHash("sha256").update(a).digest();
  const y = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(x, y);
}

const ok = (json: unknown = { ok: true }): AdminResponse => ({ status: 200, json });
const fail = (status: number, error: string): AdminResponse => ({ status, json: { error } });

export async function handleAdmin(req: AdminRequest, storage: AdminStorage, config: AdminConfig): Promise<AdminResponse> {
  const { method, route } = req;
  const body = (req.body ?? {}) as Record<string, unknown>;

  // Contenuti pubblicati: li legge anche il sito in localhost per mostrare sempre l'ultima versione
  if (route === "/content" && method === "GET") {
    return ok(JSON.parse((await storage.readPublished()).text));
  }

  if (!config.password || !config.secret) {
    return fail(500, "Pannello non configurato: mancano ADMIN_PASSWORD o ADMIN_SECRET");
  }

  if (route === "/login" && method === "POST") {
    if (!safeEqual(String(body.password ?? ""), config.password)) {
      await new Promise((r) => setTimeout(r, 800));
      return fail(401, "Password sbagliata");
    }
    return { ...ok(), cookies: sessionCookies(req.secure, config.secret) };
  }
  if (route === "/logout" && method === "POST") {
    return { ...ok(), cookies: sessionCookies(req.secure, null) };
  }

  const authed = isAuthed(req.cookie, config.secret);
  if (route === "/me") return authed ? ok({ ok: true, uploads: storage.uploadsEnabled }) : fail(401, "Non sei entrato");
  if (!authed) return fail(401, "Sessione scaduta: rientra da /admin");

  // Bozza: quello che il titolare sta preparando, i visitatori non la vedono
  if (route === "/draft" && method === "GET") {
    const [published, draft] = await Promise.all([storage.readPublished(), storage.readDraft()]);
    const pub = JSON.parse(published.text);
    return ok({
      // Le sezioni aggiunte al sito dopo che la bozza è stata salvata si prendono dalla versione pubblicata
      draft: draft ? { ...pub, ...JSON.parse(draft) } : pub,
      published: pub,
      publishedHash: published.version,
      hasDraft: draft !== null,
    });
  }
  if (route === "/draft" && method === "POST") {
    await storage.writeDraft(JSON.stringify(body, null, 2) + "\n");
    return ok();
  }
  if (route === "/draft" && method === "DELETE") {
    await storage.deleteDraft();
    return ok();
  }

  if (route === "/publish" && method === "POST") {
    const result = await storage.publish(JSON.stringify(body.content, null, 2) + "\n", body.baseHash as string | undefined, !!body.force);
    if (!result) return fail(409, "Il sito è stato aggiornato da qualcun altro mentre lavoravi.");
    return ok({ ok: true, publishedHash: result.version });
  }

  if (route === "/history" && method === "GET") return ok(await storage.history());
  if (route === "/history/restore" && method === "POST") {
    const text = await storage.readVersion(String(body.id ?? ""));
    if (!text) return fail(404, "Versione non trovata");
    await storage.writeDraft(text);
    return ok();
  }

  if (route === "/media" && method === "GET") {
    return ok({ items: await storage.listMedia(body.kind === "video" ? "video" : "image"), uploads: storage.uploadsEnabled });
  }

  return fail(404, "Non trovato");
}
