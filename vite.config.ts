import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";
import type { Plugin } from "vite";
import { handleAdmin, isAuthed } from "./server/admin-core";
import { MEDIA_EXT, fsStorage } from "./server/admin-fs";

const ROOT = import.meta.dirname;
const SITE_EDITS = path.resolve(ROOT, "src/content/site-edits.json");
const DRAFT = path.resolve(ROOT, "src/content/site-edits.draft.json");
const HISTORY_DIR = path.resolve(ROOT, ".admin-history");
const MAX_UPLOAD = { image: 15 * 1024 * 1024, video: 200 * 1024 * 1024 };

function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > limit) { reject(new Error("File troppo grande")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown, cookies?: string[]) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  if (cookies?.length) res.setHeader("Set-Cookie", cookies);
  res.end(JSON.stringify(body));
}

// Pannello /admin in localhost: stessa logica del sito online (server/admin-core.ts),
// ma salva sui file del computer e carica le foto in public/uploads.
function siteEditsAdmin(): Plugin {
  return {
    name: "site-edits-admin",
    apply: "serve",
    configureServer(server) {
      const env = loadEnv(server.config.mode, ROOT, "");
      const config = { password: env.ADMIN_PASSWORD, secret: env.ADMIN_SECRET || crypto.randomBytes(32).toString("hex") };
      const storage = fsStorage(ROOT);

      server.middlewares.use("/api/admin", async (req, res) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const route = url.pathname.replace(/\/+$/, "") || "/";
        const cookie = req.headers.cookie ?? "";
        try {
          if (route === "/upload" && req.method === "POST") {
            if (!isAuthed(cookie, config.secret)) return send(res, 401, { error: "Sessione scaduta: rientra da /admin" });
            const kind = url.searchParams.get("kind") === "video" ? "video" : "image";
            const raw = decodeURIComponent(String(req.headers["x-filename"] ?? "file"));
            const ext = path.extname(raw).toLowerCase();
            if (!MEDIA_EXT[kind].test(ext)) return send(res, 400, { error: "Formato non supportato" });
            const base = path.basename(raw, path.extname(raw)).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || kind;
            const dir = path.resolve(ROOT, "public/uploads");
            fs.mkdirSync(dir, { recursive: true });
            let name = `${base}${ext}`;
            for (let i = 2; fs.existsSync(path.join(dir, name)); i++) name = `${base}-${i}${ext}`;
            fs.writeFileSync(path.join(dir, name), await readBody(req, MAX_UPLOAD[kind]));
            return send(res, 200, { src: `/uploads/${name}` });
          }
          const body = req.method === "GET"
            ? Object.fromEntries(url.searchParams)
            : JSON.parse((await readBody(req, 2_000_000)).toString() || "{}");
          const result = await handleAdmin(
            { method: req.method ?? "GET", route, cookie, body, secure: false },
            storage,
            config,
          );
          return send(res, result.status, result.json, result.cookies);
        } catch (e) {
          return send(res, 400, { error: e instanceof Error ? e.message : String(e) });
        }
      });
    },
  };
}

// Elenco di foto e video del sito, usato dal pannello admin online per sceglierli
function mediaManifest(): Plugin {
  return {
    name: "media-manifest",
    apply: "build",
    generateBundle() {
      const list = (dir: string, ext: RegExp) => {
        const abs = path.resolve(ROOT, "public", dir);
        return fs.existsSync(abs) ? fs.readdirSync(abs).filter((f) => ext.test(f)).sort().map((f) => `/${dir}/${f}`) : [];
      };
      this.emitFile({
        type: "asset",
        fileName: "media-manifest.json",
        source: JSON.stringify({ image: list("images", MEDIA_EXT.image), video: list("videos", MEDIA_EXT.video) }),
      });
    },
  };
}

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    siteEditsAdmin(),
    mediaManifest(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    host: "0.0.0.0",
    // Il pannello admin salva qui: niente ricarica della pagina a ogni salvataggio
    watch: { ignored: [SITE_EDITS, DRAFT, `${HISTORY_DIR}/**`] },
  },
});
