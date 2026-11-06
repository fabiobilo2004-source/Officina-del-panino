import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { AppDownloadSection } from "@/components/AppDownloadSection";
import { SANTA_FIERA } from "@/lib/live-status";

const CARD = "flex-shrink-0 snap-start w-[78%] sm:w-[340px] md:w-[360px] aspect-[1188/1508] border border-border/40 shadow-2xl overflow-hidden";

export function NewsSection() {
  const { lang } = useLang();
  const [appOpen, setAppOpen] = useState(false);

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
          {/* Il post della fiera sparisce da solo dal 12/11/2026 */}
          {SANTA_FIERA && (
            <img
              src="/images/news-fiera-san-martino.jpg"
              alt="L'Officina riapre — Fiera di San Martino, Santarcangelo di Romagna, 7-11 novembre 2026"
              loading="lazy"
              className={`${CARD} object-cover`}
            />
          )}

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
