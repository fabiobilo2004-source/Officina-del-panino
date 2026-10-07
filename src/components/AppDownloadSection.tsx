import { motion } from "framer-motion";
import { Zap, Sliders, Gift, CreditCard, Download, UserPlus, ShoppingBag, Smartphone, BookOpen, Repeat2 } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { AppStoreButtons } from "@/components/AppStoreButtons";

export function AppDownloadSection() {
  const { lang } = useLang();

  const features = [
    {
      icon: Zap,
      title: { it: "Salta la fila", en: "Skip the line" },
      text: {
        it: "Ordina mentre sei ancora in ufficio o a casa. Arriva, ritira e goditi il tuo pasto senza attese.",
        en: "Order while you're still at the office or at home. Arrive, pick up and enjoy — no waiting.",
      },
    },
    {
      icon: Sliders,
      title: { it: "Personalizzazione totale", en: "Full customization" },
      text: {
        it: "Togli, aggiungi, componi il panino perfetto. Ogni dettaglio del tuo ordine è nelle tue mani.",
        en: "Remove, add, build the perfect sandwich. Every detail of your order is in your hands.",
      },
    },
    {
      icon: BookOpen,
      title: { it: "Menù sempre aggiornato", en: "Always up to date" },
      text: {
        it: "Sfoglia il menù completo con tutte le novità, le specialità stagionali e gli eventi a tema.",
        en: "Browse the full menu with every new addition, seasonal specials and themed events.",
      },
    },
    {
      icon: Repeat2,
      title: { it: "Riordino in un lampo", en: "Instant reorder" },
      text: {
        it: "Salva i tuoi preferiti e rifai lo stesso ordine in pochi secondi, senza ricominciare da capo.",
        en: "Save your favorites and repeat the same order in seconds, no need to start over.",
      },
    },
    {
      icon: Gift,
      title: { it: "Offerte esclusive", en: "Exclusive offers" },
      text: {
        it: "Sconti dedicati, promozioni lampo e un programma fedeltà che ti premia ad ogni ordine.",
        en: "Dedicated discounts, flash promos and a loyalty program that rewards every order.",
      },
    },
    {
      icon: CreditCard,
      title: { it: "Pagamenti sicuri", en: "Secure payments" },
      text: {
        it: "Paga in modo rapido e protetto, direttamente dall'app, senza pensieri.",
        en: "Pay quickly and safely, right from the app, worry-free.",
      },
    },
  ];

  const steps = [
    { icon: Download,    title: { it: "Scarica l'app",   en: "Download the app" } },
    { icon: UserPlus,    title: { it: "Registrati",       en: "Sign up" } },
    { icon: ShoppingBag, title: { it: "Scegli e ordina",  en: "Choose & order" } },
    { icon: Smartphone,  title: { it: "Ritira e gusta",   en: "Pick up & enjoy" } },
  ];

  return (
    <section className="py-20 md:py-28 px-6 bg-card border-b border-border/30 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
        <span className="font-display text-[clamp(5rem,18vw,12rem)] font-bold text-primary/[0.04] tracking-widest leading-none whitespace-nowrap">APP</span>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Hero row: text + phone mockup */}
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            <span className="text-primary text-xs md:text-sm font-display tracking-[0.25em] uppercase">
              {lang === "it" ? "Novità" : "New"}
            </span>
            <h2 className="text-3xl md:text-5xl font-display text-foreground mt-2 mb-5 leading-tight">
              {lang === "it" ? "Scarica la nostra nuova app" : "Download our new app"}
            </h2>
            <div className="w-12 h-px bg-primary mx-auto lg:mx-0 mb-6" />
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
              {lang === "it"
                ? "Il modo più comodo e veloce per gustare le tue specialità preferite. Nata dall'idea di offrirti un servizio sempre più efficiente e personalizzato, pensato per chi ama la qualità e la velocità."
                : "The most convenient and fastest way to enjoy your favorite specialties. Born from the idea of offering you an even more efficient, personalized service — made for those who love quality and speed."}
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
              {lang === "it"
                ? "Il tempo è prezioso, soprattutto in pausa pranzo: ottimizza ogni minuto senza rinunciare al gusto inconfondibile di Officina del Panino."
                : "Time is precious, especially on your lunch break: make every minute count without giving up Officina del Panino's unmistakable flavor."}
            </p>
            <div className="hidden lg:flex justify-start">
              <AppStoreButtons variant="outline" layout="row" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative flex justify-center"
          >
            <div aria-hidden className="absolute w-64 h-64 md:w-80 md:h-80 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative w-56 md:w-72 rounded-[2.5rem] overflow-hidden drop-shadow-2xl">
              <img
                src="/images/app-screenshot.jpg"
                alt={lang === "it" ? "Schermata dell'app Officina del Panino" : "Officina del Panino app screenshot"}
                className="w-full h-auto scale-[1.015] block"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="flex lg:hidden justify-center mt-10 mb-20 md:mb-28"
        >
          <AppStoreButtons variant="outline" />
        </motion.div>

        <div className="hidden lg:block mb-20 lg:mb-28" />

        {/* Feature grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-20 md:mb-24">
          {features.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title.it}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
              className="flex flex-col items-center text-center gap-3 p-5 md:p-6 rounded-lg bg-background/50 border border-border/40 hover:border-primary/40 transition-colors"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Icon size={26} className="text-primary" />
              </div>
              <h3 className="font-display text-sm md:text-base uppercase tracking-wider text-foreground">
                {title[lang]}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                {text[lang]}
              </p>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="text-center font-display text-lg md:text-2xl uppercase tracking-widest text-foreground mb-10">
            {lang === "it" ? "Come funziona" : "How it works"}
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-6 sm:gap-0 max-w-4xl mx-auto">
            {steps.map(({ icon: Icon, title }, i) => (
              <div key={title.it} className="flex sm:flex-1 items-center">
                <div className="flex flex-col items-center text-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-sm">
                    {i + 1}
                  </div>
                  <Icon size={20} className="text-primary/70" />
                  <p className="font-display text-xs md:text-sm uppercase tracking-wider text-foreground max-w-[9rem]">
                    {title[lang]}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block flex-1 h-px bg-primary/20 mx-2 mb-8" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
