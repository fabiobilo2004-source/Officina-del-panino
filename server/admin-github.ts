// Salvataggio del pannello admin sul sito online: GitHub.
// - Pubblicato: src/content/site-edits.json sul ramo main → Vercel ricostruisce il sito.
// - Bozza: src/content/site-edits.draft.json sul ramo admin-draft (Vercel non lo pubblica, vedi vercel.json).
// - Cronologia: i commit di site-edits.json su main.
// - Foto/video caricati: Vercel Blob (cartella uploads/).
import { list } from "@vercel/blob";
import type { AdminStorage, MediaItem, MediaKind } from "./admin-core.js";

const MAIN = "main";
const DRAFT_BRANCH = "admin-draft";
const PUBLISHED_PATH = "src/content/site-edits.json";
const DRAFT_PATH = "src/content/site-edits.draft.json";
const COMMITTER = { name: "Pannello admin", email: "admin@officinadelpanino.it" };

type GitFile = { text: string; sha: string };

export function githubStorage({ token, repo, origin, blobToken, api = "https://api.github.com" }: {
  token: string;
  repo: string;
  origin: string;
  blobToken?: string;
  api?: string;
}): AdminStorage {
  const gh = async (url: string, init: RequestInit = {}) => {
    const res = await fetch(`${api}/repos/${repo}${url}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    return res;
  };

  const getFile = async (filePath: string, ref: string): Promise<GitFile | null> => {
    const res = await gh(`/contents/${filePath}?ref=${encodeURIComponent(ref)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub: lettura non riuscita (${res.status})`);
    const json = (await res.json()) as { content: string; sha: string };
    return { text: Buffer.from(json.content, "base64").toString("utf8"), sha: json.sha };
  };

  const putFile = (filePath: string, branch: string, text: string, sha: string | undefined, message: string) =>
    gh(`/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({ message, content: Buffer.from(text, "utf8").toString("base64"), sha, branch, committer: COMMITTER }),
    });

  const ensureDraftBranch = async () => {
    const ref = await gh(`/git/ref/heads/${DRAFT_BRANCH}`);
    if (ref.ok) return;
    const main = await gh(`/git/ref/heads/${MAIN}`);
    if (!main.ok) throw new Error(`GitHub: ramo ${MAIN} non trovato (${main.status})`);
    const { object } = (await main.json()) as { object: { sha: string } };
    const created = await gh(`/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${DRAFT_BRANCH}`, sha: object.sha }) });
    if (!created.ok && created.status !== 422) throw new Error(`GitHub: impossibile creare la bozza (${created.status})`);
  };

  const deleteDraft = async () => {
    const current = await getFile(DRAFT_PATH, DRAFT_BRANCH).catch(() => null);
    if (!current) return;
    await gh(`/contents/${DRAFT_PATH}`, {
      method: "DELETE",
      body: JSON.stringify({ message: "Admin: bozza eliminata", sha: current.sha, branch: DRAFT_BRANCH, committer: COMMITTER }),
    });
  };

  return {
    uploadsEnabled: !!blobToken,

    async readPublished() {
      const file = await getFile(PUBLISHED_PATH, MAIN);
      if (!file) throw new Error("GitHub: contenuti del sito non trovati");
      return { text: file.text, version: file.sha };
    },
    async readDraft() {
      return (await getFile(DRAFT_PATH, DRAFT_BRANCH))?.text ?? null;
    },
    async writeDraft(text) {
      await ensureDraftBranch();
      const current = await getFile(DRAFT_PATH, DRAFT_BRANCH);
      const res = await putFile(DRAFT_PATH, DRAFT_BRANCH, text, current?.sha, "Admin: bozza salvata");
      if (!res.ok) throw new Error(`GitHub: salvataggio bozza non riuscito (${res.status})`);
    },
    deleteDraft,
    async publish(text, baseVersion, force) {
      const sha = force || !baseVersion ? (await getFile(PUBLISHED_PATH, MAIN))?.sha : baseVersion;
      const res = await putFile(PUBLISHED_PATH, MAIN, text, sha, "Admin: aggiornamento contenuti del sito");
      if (res.status === 409) return null;
      if (!res.ok) throw new Error(`GitHub: pubblicazione non riuscita (${res.status})`);
      const json = (await res.json()) as { content: { sha: string } };
      await deleteDraft().catch(() => {});
      return { version: json.content.sha };
    },
    async history() {
      const res = await gh(`/commits?sha=${MAIN}&path=${encodeURIComponent(PUBLISHED_PATH)}&per_page=30`);
      if (!res.ok) return [];
      const commits = (await res.json()) as { sha: string; commit: { message: string; committer: { date: string } } }[];
      return commits.map((c) => ({ id: c.sha, date: c.commit.committer.date, label: c.commit.message.split("\n")[0] }));
    },
    async readVersion(id) {
      if (!/^[0-9a-f]{7,40}$/i.test(id)) return null;
      return (await getFile(PUBLISHED_PATH, id))?.text ?? null;
    },
    async listMedia(kind: MediaKind) {
      const items: MediaItem[] = [];
      if (blobToken) {
        const { blobs } = await list({ prefix: `uploads/${kind}/`, token: blobToken }).catch(() => ({ blobs: [] as { url: string; uploadedAt: Date }[] }));
        blobs
          .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
          .forEach((b) => items.push({ src: b.url, uploaded: true }));
      }
      // Elenco dei file del sito, generato durante la build (vedi vite.config.ts)
      const manifest = await fetch(`${origin}/media-manifest.json`).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
      ((manifest as Record<string, string[]>)[kind] ?? []).forEach((src) => items.push({ src, uploaded: false }));
      return items;
    },
  };
}
