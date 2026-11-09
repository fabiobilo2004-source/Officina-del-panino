// Salvataggio del pannello admin in localhost: file sul computer.
import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { AdminStorage, MediaKind } from "./admin-core.js";

export const MEDIA_EXT: Record<MediaKind, RegExp> = {
  image: /\.(jpe?g|png|webp|gif|avif)$/i,
  video: /\.(mp4|webm|mov)$/i,
};
const MEDIA_DIRS: Record<MediaKind, string[]> = { image: ["images", "uploads"], video: ["videos", "uploads"] };
const HISTORY_MAX = 50;

export function fsStorage(root: string): AdminStorage {
  const published = path.resolve(root, "src/content/site-edits.json");
  const draft = path.resolve(root, "src/content/site-edits.draft.json");
  const historyDir = path.resolve(root, ".admin-history");
  const hashOf = (text: string) => crypto.createHash("sha1").update(text).digest("hex").slice(0, 12);

  return {
    uploadsEnabled: true,

    async readPublished() {
      const text = fs.readFileSync(published, "utf8");
      return { text, version: hashOf(text) };
    },
    async readDraft() {
      return fs.existsSync(draft) ? fs.readFileSync(draft, "utf8") : null;
    },
    async writeDraft(text) {
      fs.writeFileSync(draft, text);
    },
    async deleteDraft() {
      if (fs.existsSync(draft)) fs.unlinkSync(draft);
    },
    async publish(text, baseVersion, force) {
      const before = fs.readFileSync(published, "utf8");
      if (!force && baseVersion && baseVersion !== hashOf(before)) return null;
      fs.writeFileSync(published, text);
      if (fs.existsSync(draft)) fs.unlinkSync(draft);
      // Ogni pubblicazione resta in cronologia (la prima volta anche la versione di partenza)
      fs.mkdirSync(historyDir, { recursive: true });
      const stamp = (d: Date) => `${d.toISOString().replace(/[:.]/g, "-")}.json`;
      if (!fs.readdirSync(historyDir).some((f) => f.endsWith(".json"))) {
        fs.writeFileSync(path.join(historyDir, stamp(new Date(Date.now() - 1000))), before);
      }
      fs.writeFileSync(path.join(historyDir, stamp(new Date())), text);
      const files = fs.readdirSync(historyDir).filter((f) => f.endsWith(".json")).sort();
      files.slice(0, Math.max(0, files.length - HISTORY_MAX)).forEach((f) => fs.unlinkSync(path.join(historyDir, f)));
      return { version: hashOf(text) };
    },
    async history() {
      if (!fs.existsSync(historyDir)) return [];
      return fs.readdirSync(historyDir).filter((f) => f.endsWith(".json")).sort().reverse().map((f) => ({
        id: f,
        date: f.replace(/\.json$/, "").replace(/T(\d\d)-(\d\d)-(\d\d)-(\d+)Z$/, "T$1:$2:$3.$4Z"),
        label: "Pubblicazione",
      }));
    },
    async readVersion(id) {
      const file = path.join(historyDir, path.basename(id));
      return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
    },
    async listMedia(kind) {
      const list = MEDIA_DIRS[kind].flatMap((dir) => {
        const abs = path.resolve(root, "public", dir);
        if (!fs.existsSync(abs)) return [];
        return fs.readdirSync(abs)
          .filter((f) => MEDIA_EXT[kind].test(f))
          .map((f) => ({ src: `/${dir}/${f}`, uploaded: dir === "uploads", time: fs.statSync(path.join(abs, f)).mtimeMs }));
      });
      list.sort((a, b) => Number(b.uploaded) - Number(a.uploaded) || b.time - a.time);
      return list.map(({ src, uploaded }) => ({ src, uploaded }));
    },
  };
}
