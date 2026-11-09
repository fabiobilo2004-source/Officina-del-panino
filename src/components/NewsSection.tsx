import { Suspense, lazy, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { AppDownloadSection } from "@/components/AppDownloadSection";
import { romeDateISO } from "@/lib/live-status";
import { getEdits, isAdminMode, subscribe } from "@/lib/site-edits";

// Strumenti per aggiungere/spostare/eliminare card: caricati solo in modalità admin
const NewsAdminTools = lazy(() => import("@/components/admin/NewsAdminTools"));

const SLOT = "relative flex-shrink-0 snap-start w-[78%] sm:w-[340px] lg:w-[calc((100%-3rem)/3)] aspect-[1188/1508]";
const CARD = "w-full h-full border border-border/40 shadow-2xl overflow-hidden";

export function NewsSection() {
  const { lang } = useLang();
  const [appOpen, setAppOpen] = useState(false);
  const news = useSyncExternalStore(subscribe, () => getEdits().news);
  const admin = useSyncExternalStore(subscribe, isAdminMode);
  const today = romeDateISO(new Date());

  useEffect(() => {
    if (!appOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAppOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [appOpen]);

  return (
    <section className="py-16 md:py-24 px-6 bg-background border-b border-border/30">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 md:mb-14">
          <h2 className="text-4xl md:text-5xl font-display text-primary mb-2">{lang === "it" ? "Novità" : "News"}</h2>
          <div className="w-12 h-px bg-primary" />
        </div>

        <div
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {news.map((item, index) => {
            // Le card con una data di scadenza spariscono da sole il giorno dopo
            const expired = item.type === "image" && !!item.until && today > item.until;
            if (expired && !admin) return null;
            return (
              <div key={item.id} className={`${SLOT}${expired ? " opacity-40" : ""}`}>
                {item.type === "app" ? (
                  <button
                    onClick={() => setAppOpen(true)}
                    className={`${CARD} group relative bg-card text-left flex flex-col hover:border-primary transition-colors`}
                  >
                    <div aria-hidden className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/25 rounded-full blur-3xl" />
                    <div className="relative flex-1 flex items-start justify-center pt-8 overflow-hidden min-h-0">
                      <img
                        src="/images/app-screenshot.jpg"
                        alt=""
                        className="w-[55%] rounded-t-[1.6rem] shadow-2xl group-hover:-translate-y-2 transition-transform duration-300"
                      />
                    </div>
                    <div className="relative p-6 border-t border-border/40 bg-card">
                      <span className="text-primary text-[11px] font-display tracking-[0.25em] uppercase">
                        {lang === "it" ? "Nuova app" : "New app"}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-display text-foreground mt-1 mb-3 leading-tight">
                        {lang === "it" ? "Scarica la nostra app" : "Download our app"}
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-display uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                        {lang === "it" ? "Scopri di più" : "Learn more"}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </button>
                ) : item.title ? (
                  <div className={`${CARD} flex flex-col bg-[#272725]`}>
                    <p className="pt-5 px-4 text-center text-xl md:text-2xl font-display uppercase tracking-[0.2em] text-primary">
                      {lang === "en" && item.titleEn ? item.titleEn : item.title}
                    </p>
                    <img
                      src={item.src}
                      alt={item.alt ?? item.title}
                      loading="lazy"
                      className={`flex-1 min-h-0 w-full ${item.fit === "cover" ? "object-cover" : "object-contain"}`}
                    />
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt ?? ""}
                    loading="lazy"
                    className={`${CARD} ${item.fit === "contain" ? "object-contain bg-[#272725]" : "object-cover"}`}
                  />
                )}
                {admin && (
                  <Suspense fallback={null}>
                    <NewsAdminTools index={index} expired={expired} />
                  </Suspense>
                )}
              </div>
            );
          })}

          {admin && (
            <div className={SLOT}>
              <Suspense fallback={null}>
                <NewsAdminTools index={-1} />
              </Suspense>
            </div>
          )}
        </div>
      </div>

      {createPortal(<AnimatePresence>
        {appOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAppOpen(false)}
          >
            <motion.div
              className="relative max-w-6xl mx-auto my-6 md:my-12 px-3 md:px-6"
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setAppOpen(false)}
                aria-label={lang === "it" ? "Chiudi" : "Close"}
                className="absolute top-3 right-6 md:right-9 z-10 w-10 h-10 flex items-center justify-center bg-black/60 border border-white/20 text-white hover:border-primary hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
              <div className="border border-border/40 shadow-2xl">
                <AppDownloadSection />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </section>
  );
}
