// Sezioni aggiunte dal titolare in homepage, con 5 modelli (vedi HomeLayout).
// In ogni punto della homepage c'è un <HomeBlocks after="…" />: mostra le sezioni aggiunte lì
// e, in modalità admin, il "+ Aggiungi una sezione qui".
import { Suspense, lazy, useSyncExternalStore, type ReactNode } from "react";
import { motion } from "framer-motion";
import { getEdits, isAdminMode, setEdits, subscribe, type CtaTarget, type HomeSection } from "@/lib/site-edits";
import { getSmartAppLink } from "@/lib/app-store";

const HomeBlockAdminTools = lazy(() => import("@/components/admin/HomeBlockAdminTools"));
const SectionGateAdmin = lazy(() => import("@/components/admin/SectionGateAdmin"));

/** I punti della homepage dove si possono aggiungere sezioni, dall'alto in basso */
export const HOME_SLOTS = [
  "hero", "novita", "creazioni", "numeri", "storia", "lavorazione", "estate",
  "pane", "instagram", "notte", "takeaway", "premi", "recensioni",
] as const;

const EMPTY: HomeSection[] = [];
const NONE: string[] = [];

/** Nascondi / rimuovi / rimetti una sezione fissa */
export function setSectionState(id: string, state: "visible" | "hidden" | "removed") {
  const cur = getEdits();
  const hidden = (cur.hiddenSections ?? []).filter((x) => x !== id);
  const removed = (cur.removedSections ?? []).filter((x) => x !== id);
  setEdits({
    ...cur,
    hiddenSections: state === "hidden" ? [...hidden, id] : hidden,
    removedSections: state === "removed" ? [...removed, id] : removed,
  });
}

/** Le sezioni fisse che si possono nascondere: ognuna viene subito dopo il punto indicato */
export const FIXED_SECTIONS: Partial<Record<(typeof HOME_SLOTS)[number], { id: string; label: string }>> = {
  hero: { id: "novita", label: "Novità" },
  novita: { id: "creazioni", label: "Le Nostre Creazioni" },
  creazioni: { id: "numeri", label: "Numeri (sedi, dal 2019, prezzi)" },
  numeri: { id: "storia", label: "La nostra storia" },
  storia: { id: "lavorazione", label: "Come prepariamo i panini" },
  lavorazione: { id: "estate", label: "Estate" },
  estate: { id: "pane", label: "Il pane giusto" },
  pane: { id: "instagram", label: "Instagram" },
  instagram: { id: "notte", label: "Dopo la discoteca" },
  notte: { id: "takeaway", label: "Take away / Ordina" },
  takeaway: { id: "premi", label: "Premi" },
  premi: { id: "recensioni", label: "Recensioni" },
};

/** Destinazioni del bottone "Invito": nome per il pannello e indirizzo */
export const CTA_TARGETS: { id: CtaTarget; label: string; href: () => string; external?: boolean }[] = [
  { id: "app", label: "Scarica l'app", href: getSmartAppLink, external: true },
  { id: "justeat", label: "Ordina su Just Eat", href: () => "https://www.justeat.it/restaurants-officina-del-panino-rimini-47923/menu", external: true },
  { id: "menu", label: "Pagina Menu", href: () => "/menu" },
  { id: "tel-rimini", label: "Chiama Rimini", href: () => "tel:+390541419757" },
  { id: "tel-santarcangelo", label: "Chiama Santarcangelo", href: () => "tel:+3905411840930" },
  { id: "instagram", label: "Instagram", href: () => "https://www.instagram.com/officinadelpanino.rimini/", external: true },
];

const fadeIn = (x = 0, y = 0) => ({
  initial: { opacity: 0, x, y },
  whileInView: { opacity: 1, x: 0, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7 },
});

function Paragraphs({ text, className }: { text?: string; className: string }) {
  if (!text) return null;
  return (
    <>
      {text.split(/\n\s*\n/).map((para, i) => (
        <p key={i} className={`${className} whitespace-pre-line`}>{para}</p>
      ))}
    </>
  );
}

function Block({ block }: { block: HomeSection }) {
  const layout = block.layout ?? "right";
  const title = (centered?: boolean) => block.title && (
    <>
      <h2 className="text-4xl md:text-5xl font-display text-primary mb-2 leading-tight">{block.title}</h2>
      <div className={`w-12 h-px bg-primary mb-8 ${centered ? "mx-auto" : ""}`} />
    </>
  );

  if (layout === "banner") {
    return (
      <section className="relative min-h-[420px] md:min-h-[520px] flex items-center justify-center overflow-hidden border-b border-border/30">
        {block.src && <img src={block.src} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
        <motion.div {...fadeIn(0, 30)} className="relative z-10 max-w-3xl px-6 py-20 text-center">
          {title(true)}
          <Paragraphs text={block.body} className="text-base md:text-xl text-white/85 mb-5 last:mb-0 leading-[1.8]" />
        </motion.div>
      </section>
    );
  }

  if (layout === "promo") {
    return (
      <section className="py-10 md:py-14 px-6 bg-primary text-primary-foreground">
        <motion.div {...fadeIn(0, 20)} className="max-w-4xl mx-auto text-center">
          {block.title && <p className="text-3xl md:text-5xl font-display uppercase tracking-wide leading-tight">{block.title}</p>}
          <Paragraphs text={block.body} className="mt-3 text-base md:text-lg text-white/90 leading-relaxed" />
        </motion.div>
      </section>
    );
  }

  if (layout === "cta") {
    const target = CTA_TARGETS.find((t) => t.id === block.button?.target);
    return (
      <section className="py-20 md:py-24 px-6 bg-card border-y border-border/30">
        <motion.div {...fadeIn(0, 30)} className="max-w-3xl mx-auto text-center">
          {title(true)}
          <Paragraphs text={block.body} className="text-base md:text-lg text-muted-foreground mb-4 last:mb-0 leading-[1.8]" />
          {block.button?.label && target && (
            <a
              href={target.href()}
              {...(target.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center justify-center mt-8 h-14 px-10 bg-primary text-primary-foreground font-display uppercase tracking-[0.2em] text-sm hover:bg-primary/90 transition-colors"
            >
              {block.button.label}
            </a>
          )}
        </motion.div>
      </section>
    );
  }

  if (layout === "gallery") {
    const images = (block.images ?? []).slice(0, 3);
    return (
      <section className="pt-14 pb-10 md:pt-24 md:pb-16 px-6 max-w-7xl mx-auto">
        {(block.title || block.body) && (
          <motion.div {...fadeIn(0, 30)} className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
            {title(true)}
            <Paragraphs text={block.body} className="text-base md:text-lg text-muted-foreground mb-4 last:mb-0 leading-[1.8] font-light" />
          </motion.div>
        )}
        <div className={`grid gap-4 md:gap-6 ${images.length === 1 ? "max-w-3xl mx-auto" : images.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          {images.map((src, i) => (
            <motion.img
              key={src + i}
              {...fadeIn(0, 30)}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              src={src}
              alt=""
              loading="lazy"
              className="w-full aspect-[4/5] object-cover shadow-2xl border border-border/30"
            />
          ))}
        </div>
      </section>
    );
  }

  if (layout === "quote") {
    return (
      <section className="py-20 md:py-28 px-6 bg-card border-y border-border/30">
        <motion.div {...fadeIn(0, 30)} className="max-w-4xl mx-auto text-center">
          <span aria-hidden className="block font-display text-7xl md:text-8xl text-primary leading-none mb-2">“</span>
          {block.title && (
            <p className="text-3xl md:text-5xl font-display uppercase tracking-wide text-foreground leading-tight mb-6">{block.title}</p>
          )}
          <Paragraphs text={block.body} className="text-base md:text-lg text-muted-foreground mb-4 last:mb-0 leading-[1.8]" />
        </motion.div>
      </section>
    );
  }

  if (layout === "center") {
    return (
      <section className="pt-14 pb-10 md:pt-24 md:pb-16 px-6 max-w-5xl mx-auto text-center">
        <motion.div {...fadeIn(0, 30)} className="max-w-3xl mx-auto">
          {title(true)}
          <Paragraphs text={block.body} className="text-base md:text-lg text-muted-foreground mb-6 last:mb-0 leading-[1.8] font-light" />
        </motion.div>
        {block.src && (
          <motion.img {...fadeIn(0, 40)} src={block.src} alt={block.title ?? ""} loading="lazy" className="mt-10 md:mt-14 w-full h-auto shadow-2xl border border-border/30" />
        )}
      </section>
    );
  }

  // "right" (testo + foto a destra, come La nostra storia), "left" (foto a sinistra), "video" (testo + video)
  const photoLeft = layout === "left";
  const media = layout === "video"
    ? block.video && (
      <video src={block.video} autoPlay muted loop playsInline className="w-full h-auto shadow-2xl border border-border/30 bg-black" />
    )
    : block.src && (
      <img src={block.src} alt={block.title ?? ""} loading="lazy" className="w-full h-auto shadow-2xl border border-border/30" />
    );
  return (
    <section className="pt-14 pb-10 md:pt-24 md:pb-16 px-6 max-w-7xl mx-auto">
      <div className={`grid gap-10 md:gap-16 items-center ${media ? "md:grid-cols-2" : "max-w-3xl"}`}>
        <motion.div {...fadeIn(photoLeft ? 40 : -40)} className={photoLeft ? "md:order-2" : ""}>
          {title()}
          <Paragraphs text={block.body} className="text-base md:text-lg text-muted-foreground mb-6 last:mb-0 leading-[1.8] font-light" />
        </motion.div>
        {media && (
          <motion.div {...fadeIn(photoLeft ? -40 : 40)} className={photoLeft ? "md:order-1" : ""}>
            {media}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export function HomeBlocks({ after }: { after: (typeof HOME_SLOTS)[number] }) {
  const all = useSyncExternalStore(subscribe, () => getEdits().homeSections) ?? EMPTY;
  const hiddenList = useSyncExternalStore(subscribe, () => getEdits().hiddenSections) ?? NONE;
  const removedList = useSyncExternalStore(subscribe, () => getEdits().removedSections) ?? NONE;
  const admin = useSyncExternalStore(subscribe, isAdminMode);
  const blocks = all.filter((b) => b.after === after);
  const next = FIXED_SECTIONS[after];
  const removed = !!next && removedList.includes(next.id);
  const hidden = !!next && (hiddenList.includes(next.id) || removed);
  if (!blocks.length && !admin && !hidden) return null;

  // La sezione fissa che segue questo punto: nascosta con una regola CSS sul suo elemento <section>,
  // che viene subito dopo il segnaposto (così la homepage non va modificata sezione per sezione)
  const gate = next && (
    <>
      {admin && !removed && (
        <Suspense fallback={null}>
          <SectionGateAdmin id={next.id} label={next.label} hidden={hidden} />
        </Suspense>
      )}
      {hidden && (
        <>
          <style>{`[data-hidden-section="${next.id}"] + section { display: none !important; }`}</style>
          <span hidden data-hidden-section={next.id} />
        </>
      )}
    </>
  );

  const withTools = (block: HomeSection, children: ReactNode) => (
    <div key={block.id} className="relative">
      {admin && (
        <Suspense fallback={null}>
          <HomeBlockAdminTools after={after} block={block} />
        </Suspense>
      )}
      {children}
    </div>
  );

  return (
    <>
      {blocks.map((block) => withTools(block, <Block block={block} />))}
      {admin && (
        <Suspense fallback={null}>
          <HomeBlockAdminTools after={after} />
        </Suspense>
      )}
      {gate}
    </>
  );
}
