import { Suspense, lazy, useRef, useState, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { itemDesc, itemName, useMenuSection, type MenuSection } from "@/lib/menu";
import { isAdminMode, subscribe } from "@/lib/site-edits";

// Comandi per aggiungere/modificare/togliere voci: caricati solo in modalità admin
const MenuAdminTools = lazy(() => import("@/components/admin/MenuAdminTools"));

function BestSellerCard({
  item, imgSrc, direction, lang,
}: {
  item: { name: string; desc: string; descEn: string };
  imgSrc: string;
  direction: "left" | "right";
  lang: "it" | "en";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const x = useTransform(scrollYProgress, [0, 1], [direction === "left" ? -300 : 300, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  return (
    <div ref={ref} className="flex flex-col">
      <div className="relative h-64 flex items-center justify-center overflow-hidden" style={{ isolation: "isolate" }}>
        <motion.img
          src={imgSrc}
          alt={item.name}
          className="h-[220px] w-auto max-w-[220px] object-contain drop-shadow-2xl"
          style={{ x, opacity, willChange: "transform" }}
        />
      </div>
      <div className="pt-5 mt-2 border-t border-primary/50">
        <h3 className="font-display text-xl text-primary mb-2">{item.name}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {lang === "it" ? item.desc : item.descEn}
        </p>
      </div>
    </div>
  );
}

// Le altre sezioni del menu si modificano dal pannello admin (src/content/site-edits.json → menu)
const menuData = {
  bestSellers: [
    {
      name: "Chiave",
      desc: "I nostri straccetti di pollo impanati, patate alla piastra con provola affumicata, insalata e mayonese al pepe rosa",
      descEn: "Our breaded chicken strips, grilled potatoes with smoked provola, salad and pink pepper mayo",
    },
    {
      name: "Trapano",
      desc: "Doppio Cheese-steak di manzo, doppio formaggio fuso, insalata e patate alla piastra con provola affumicata",
      descEn: "Double beef cheese-steak, double melted cheese, salad and grilled potatoes with smoked provola",
    },
    {
      name: "Bullone",
      desc: "Hamburger di scottona 200 gr., bacon croccante, doppio cheddar, insalata, patate al forno e salsa burger",
      descEn: "200g scottona beef burger, crispy bacon, double cheddar, salad, baked potatoes and burger sauce",
    },
  ],

};

export default function Menu() {
  const { lang } = useLang();
  const admin = useSyncExternalStore(subscribe, isAdminMode);
  const menu = {
    proposte: useMenuSection("proposte"),
    veg: useMenuSection("veg"),
    build_carni: useMenuSection("build_carni"),
    build_formaggi: useMenuSection("build_formaggi"),
    build_contorni: useMenuSection("build_contorni"),
    build_salse: useMenuSection("build_salse"),
    sfizi: useMenuSection("sfizi"),
    patatine_base: useMenuSection("patatine_base"),
    patatine_formaggi: useMenuSection("patatine_formaggi"),
    patatine_carni: useMenuSection("patatine_carni"),
    insalate: useMenuSection("insalate"),
    birre: useMenuSection("birre"),
    vini: useMenuSection("vini"),
    bevande: useMenuSection("bevande"),
  };
  // ✎ ✕ ↑ ↓ su una voce, e "+ Aggiungi" in fondo a una sezione (solo admin)
  const tools = (section: MenuSection, index: number, chip?: boolean) => admin && (
    <Suspense fallback={null}>
      <MenuAdminTools section={section} index={index} chip={chip} />
    </Suspense>
  );
  const addButton = (section: MenuSection, chip?: boolean) => tools(section, -1, chip);

  const [isMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const paniniRef   = useRef<HTMLDivElement>(null);
  const sfiziRef    = useRef<HTMLDivElement>(null);
  const insalateRef = useRef<HTMLDivElement>(null);
  const drinksRef   = useRef<HTMLDivElement>(null);
  const { scrollYProgress: paniniProgress } = useScroll({ target: paniniRef, offset: ["start end", "center center"] });

  const s0x   = useTransform(paniniProgress, [0, 1], [-600, 0]);
  const s0rot = useTransform(paniniProgress, [0, 1], [-18, 0]);
  const s0op  = useTransform(paniniProgress, [0, 0.6], [0, 1]);
  const s1y   = useTransform(paniniProgress, [0, 1], [280, 0]);
  const s1rot = useTransform(paniniProgress, [0, 1], [12, 0]);
  const s1op  = useTransform(paniniProgress, [0.05, 0.65], [0, 1]);
  const s2x   = useTransform(paniniProgress, [0, 1], [600, 0]);
  const s2rot = useTransform(paniniProgress, [0, 1], [18, 0]);
  const s2op  = useTransform(paniniProgress, [0, 0.6], [0, 1]);

  const [tier, setTier] = useState<"basic" | "premium">("basic");
  const [selected, setSelected] = useState<{
    carni: Set<string>; formaggi: Set<string>; contorni: Set<string>; salse: Set<string>;
  }>({ carni: new Set(), formaggi: new Set(), contorni: new Set(), salse: new Set() });

  const limits = tier === "basic"
    ? { carni: 1, formaggi: 1, contorni: 1, salse: 1 }
    : { carni: 2, formaggi: 2, contorni: 2, salse: 2 };

  const toggle = (cat: keyof typeof selected, item: string) => {
    setSelected(prev => {
      const next = new Set(prev[cat]);
      if (next.has(item)) { next.delete(item); }
      else if (next.size < limits[cat]) { next.add(item); }
      return { ...prev, [cat]: next };
    });
  };

  const resetAll = () =>
    setSelected({ carni: new Set(), formaggi: new Set(), contorni: new Set(), salse: new Set() });

  const changeTier = (t: "basic" | "premium") => { setTier(t); resetAll(); };

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const y = ref.current.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const t = {
    title:          { it: "IL MENU",               en: "THE MENU" },
    sub:            { it: "Panini robusti per fame robusta.", en: "Serious sandwiches for serious hunger." },
    best_title:     { it: "I NOSTRI BEST SELLERS", en: "BEST SELLERS" },
    best_sub:       { it: "I più amati dai clienti", en: "Our customers' favourites" },
    proposte_title: { it: "LE NOSTRE PROPOSTE",    en: "OUR SANDWICHES" },
    proposte_sub:   { it: "Panini a 11€",           en: "Sandwiches at €11" },
    veg_title:      { it: "9€",                     en: "9€" },
    veg_note:       { it: "(Supplementi da 0,5 a 1,5€)", en: "(Extras from €0.50 to €1.50)" },
    build_title:    { it: "COMPONI IL TUO PANINO", en: "BUILD YOUR OWN" },
    build_sub:      { it: "Scegli il tuo formato, poi personalizza.", en: "Pick your size, then customise." },
    tier_basic:     { it: "BASE — 1+1+1+1",         en: "BASIC — 1+1+1+1" },
    tier_premium:   { it: "COMPLETO — 2+2+2+2",     en: "FULL — 2+2+2+2" },
    carni:          { it: "Carni",                  en: "Meats" },
    formaggi:       { it: "Formaggi",               en: "Cheeses" },
    contorni:       { it: "Contorni",               en: "Toppings" },
    salse:          { it: "Salse",                  en: "Sauces" },
    sfizi:          { it: "I NOSTRI SFIZI",         en: "FRIED SIDES" },
    patatine_title: { it: "COMPONI LE TUE PATATINE", en: "BUILD YOUR FRIES" },
    pat_base:       { it: "1. PATATE",              en: "1. POTATOES" },
    pat_cheese:     { it: "2. FORMAGGIO",           en: "2. CHEESE" },
    pat_meat:       { it: "3. CARNE",               en: "3. MEAT" },
    insalate:       { it: "LE NOSTRE INSALATE",     en: "SALADS" },
    birre:          { it: "BIRRE",                  en: "BEERS" },
    vini:           { it: "VINI",                   en: "WINES" },
    bevande:        { it: "BEVANDE / BIBITE",       en: "DRINKS" },
    all:            { it: "Tutti",                  en: "All" },
    at_limit:       { it: "Limite raggiunto",       en: "Limit reached" },
    reset:          { it: "AZZERA TUTTO",           en: "RESET ALL" },
    summary_title:  { it: "Il tuo panino",          en: "Your sandwich" },
    isNew:          { it: "NUOVO",                  en: "NEW" },
  };

  const tabs = [
    { label: "Panini",               ref: paniniRef },
    { label: t.sfizi[lang],          ref: sfiziRef },
    { label: t.insalate[lang],       ref: insalateRef },
    { label: `${t.birre[lang]} & ${t.vini[lang]}`, ref: drinksRef },
  ];

  return (
    <div className="menu-light w-full pt-32 pb-24 bg-background text-foreground min-h-screen">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-display text-primary mb-4">{t.title[lang]}</h1>
        </motion.div>

        {/* Sticky Tabs */}
        <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-sm py-4 mb-12 border-b border-border/50 flex overflow-x-auto gap-8 whitespace-nowrap">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-display tracking-widest text-sm uppercase pb-2 border-b-2 border-transparent hover:border-primary/50 transition-colors"
          >{t.all[lang]}</button>
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => scrollToRef(tab.ref)}
              className="font-display tracking-widest text-sm uppercase pb-2 border-b-2 border-transparent hover:border-primary/50 transition-colors">
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BEST SELLERS ── */}
        <div ref={paniniRef} className="mb-16 bg-white rounded-2xl p-6 md:p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="border-b border-primary pb-4 mb-4 flex justify-between items-end">
              <h2 className="text-3xl md:text-4xl font-display text-primary">{t.best_title[lang]}</h2>
              <span className="text-2xl font-display text-primary">11€</span>
            </div>
            <p className="text-muted-foreground mb-8 text-sm">{t.best_sub[lang]}</p>
          </motion.div>
          {isMobile ? (
            /* Mobile: ogni panino ha il proprio scroll tracking → entrano uno alla volta */
            <div className="flex flex-col gap-10">
              {menuData.bestSellers.map((item, i) => {
                const imgSrc = item.name === "Trapano" ? "/images/panino-trapano.webp"
                             : item.name === "Bullone" ? "/images/panino-bullone.webp"
                             : "/images/panino-chiave.webp";
                return (
                  <BestSellerCard
                    key={i}
                    item={item}
                    imgSrc={imgSrc}
                    direction={i % 2 === 0 ? "left" : "right"}
                    lang={lang}
                  />
                );
              })}
            </div>
          ) : (
            /* Desktop: animazione condivisa, tutti e 3 entrano insieme */
            <div className="grid md:grid-cols-3 gap-10">
              {menuData.bestSellers.map((item, i) => {
                const imgSrc = item.name === "Trapano" ? "/images/panino-trapano.webp"
                             : item.name === "Bullone" ? "/images/panino-bullone.webp"
                             : "/images/panino-chiave.webp";
                return (
                  <div key={i} className="flex flex-col">
                    <div className="relative h-64 flex items-center justify-center overflow-hidden" style={{ isolation: "isolate" }}>
                      <motion.img
                        src={imgSrc}
                        alt={item.name}
                        className="h-[220px] w-auto max-w-[220px] object-contain drop-shadow-2xl"
                        style={
                          i === 0 ? { x: s0x, rotate: s0rot, opacity: s0op, willChange: "transform" } :
                          i === 1 ? { y: s1y, rotate: s1rot, opacity: s1op, willChange: "transform" } :
                                    { x: s2x, rotate: s2rot, opacity: s2op, willChange: "transform" }
                        }
                      />
                    </div>
                    <div className="pt-5 mt-2 border-t border-primary/50">
                      <h3 className="font-display text-xl text-primary mb-2">{item.name}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {lang === "it" ? item.desc : item.descEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── PROPOSTE ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <div className="border-b-2 border-primary pb-4 mb-8 flex justify-between items-end">
            <h2 className="text-3xl md:text-4xl font-display text-primary">{t.proposte_title[lang]}</h2>
            <span className="text-2xl font-display text-primary">11€</span>
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            {menu.proposte.map((item, i) => (
              <motion.div key={item.id} whileHover={{ x: 5 }}
                className="group relative border-l-2 border-transparent hover:border-primary pl-4 transition-all">
                {tools("proposte", i)}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-xl group-hover:text-primary transition-colors">{itemName(item, lang)}</h3>
                  {item.isNew && (
                    <span className="text-[10px] font-display tracking-widest bg-primary text-primary-foreground px-2 py-0.5">
                      {t.isNew[lang]}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {itemDesc(item, lang)}
                </p>
              </motion.div>
            ))}
          </div>
          {addButton("proposte")}
        </motion.div>

        {/* ── VEG OPTIONS 9€ ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: '#9DC050' }}>
            <div className="flex justify-between items-end border-b border-black/15 pb-4 mb-6">
              <h2 className="text-3xl md:text-4xl font-display text-primary">{t.veg_title[lang]}</h2>
              <p className="text-sm text-gray-900 font-semibold">{t.veg_note[lang]}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {menu.veg.map((item, i) => (
                <div key={item.id} className="relative border-l-4 border-black/20 pl-4">
                  {tools("veg", i)}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-xl text-gray-900">{itemName(item, lang)}</h3>
                    {item.isNew && (
                      <span className="text-[10px] font-display tracking-widest bg-primary text-primary-foreground px-2 py-0.5">
                        {t.isNew[lang]}
                      </span>
                    )}
                    {item.badge && (
                      <span className="text-[10px] font-display tracking-widest border border-black/30 text-gray-900 px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed font-semibold">
                    {itemDesc(item, lang)}
                  </p>
                </div>
              ))}
            </div>
            {addButton("veg")}
          </div>
        </motion.div>

        {/* ── COMPONI IL TUO PANINO ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-20 relative">
          <div className="border-b-2 border-primary pb-5 mb-6">
            <h2 className="text-4xl md:text-6xl font-display text-primary">{t.build_title[lang]}</h2>
          </div>

          <p className="text-gray-700 mb-6 font-bold">{t.build_sub[lang]}</p>

          {/* Burger tier selector */}
          <div className="flex flex-row gap-4 mb-10 w-full">
            {([
              { key: "basic",   bgPos: "top center" },
              { key: "premium", bgPos: "bottom center" },
            ] as const).map(({ key, bgPos }) => (
              <motion.button
                key={key}
                onClick={() => changeTier(key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`w-full cursor-pointer rounded-2xl overflow-hidden transition-all ${
                  tier === key ? "ring-4 ring-primary shadow-xl" : "opacity-70 hover:opacity-90"
                }`}
                style={{
                  height: '210px',
                  backgroundImage: 'url(/images/burger-tiers.webp)',
                  backgroundSize: '100% 200%',
                  backgroundPosition: bgPos,
                  backgroundRepeat: 'no-repeat',
                }}
              />
            ))}
          </div>

          {/* Ingredient selectors */}
          {(() => {
            const catColors: Record<string, string> = {
              carni:    '#D4A46C',
              formaggi: '#F5E040',
              contorni: '#87CEEB',
              salse:    '#FFFFFF',
            };
            const catLight: Record<string, boolean> = {
              carni: false, formaggi: false, contorni: false, salse: false,
            };
            const cats: { key: keyof typeof selected; section: MenuSection; label: string; items: string[]; wide?: boolean }[] = [
              { key: "carni",    section: "build_carni",    label: t.carni[lang],    items: menu.build_carni.map((x) => itemName(x, lang)) },
              { key: "formaggi", section: "build_formaggi", label: t.formaggi[lang], items: menu.build_formaggi.map((x) => itemName(x, lang)) },
              { key: "contorni", section: "build_contorni", label: t.contorni[lang], items: menu.build_contorni.map((x) => itemName(x, lang)), wide: true },
              { key: "salse",    section: "build_salse",    label: t.salse[lang],    items: menu.build_salse.map((x) => itemName(x, lang)),    wide: true },
            ];
            const totalSelected = Object.values(selected).reduce((n, s) => n + s.size, 0);
            return (
              <>
                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                  {cats.map(({ key, section, label, items, wide }) => {
                    const count = selected[key].size;
                    const limit = limits[key];
                    const atLimit = count >= limit;
                    return (
                      <div key={key} className={`rounded-2xl p-5 ${wide ? "md:col-span-2" : ""}`} style={{ backgroundColor: catColors[key] }}>
                        <div className="flex items-baseline gap-3 mb-4">
                          <h3 className={`font-display text-2xl ${catLight[key] ? "text-white/90" : "text-gray-900"}`}>{label}</h3>
                          <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${atLimit ? "border-white text-white bg-white/20" : catLight[key] ? "border-white/30 text-white/60" : "border-black/20 text-gray-600"}`}>
                            {count}/{limit}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {items.map((item, idx) => {
                            const isSel = selected[key].has(item);
                            const isDis = atLimit && !isSel;
                            return (
                              <span key={idx} className="inline-flex items-center">
                              <button onClick={() => toggle(key, item)} disabled={isDis}
                                className={`px-3 py-2.5 md:py-1.5 rounded-full text-sm font-bold transition-all ${
                                  isSel  ? "bg-white text-gray-900 shadow-sm"
                                  : isDis ? "bg-white/15 border border-white/10 text-white/25 cursor-not-allowed"
                                  : catLight[key]
                                    ? "bg-white/20 border border-white/30 text-white hover:bg-white/35"
                                    : "bg-white/60 border border-black/15 text-gray-900 hover:bg-white/90"
                                }`}>
                                {item}
                              </button>
                              {tools(section, idx, true)}
                              </span>
                            );
                          })}
                          {addButton(section, true)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalSelected > 0 && (
                  <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">{t.summary_title[lang]}</p>
                      <p className="text-sm leading-relaxed">
                        {(["carni","formaggi","contorni","salse"] as const).flatMap(k => [...selected[k]]).join(" · ")}
                      </p>
                    </div>
                    <button onClick={resetAll}
                      className="flex-shrink-0 px-4 py-2 border border-border text-muted-foreground font-display text-xs tracking-widest hover:border-primary hover:text-primary transition-colors">
                      {t.reset[lang]}
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </motion.div>

        {/* ── SFIZI + PATATINE + INSALATE ── */}
        <div ref={sfiziRef} className="grid lg:grid-cols-2 gap-16 mb-20">

          {/* SFIZI */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl p-6">
            <h2 className="text-3xl font-display border-b border-gray-200 pb-4 mb-6 text-primary">{t.sfizi[lang]}</h2>
            <div className="space-y-4">
              {menu.sfizi.map((item, i) => (
                <div key={item.id} className="relative flex justify-between items-baseline">
                  {tools("sfizi", i)}
                  <span className="text-gray-900 font-bold">
                    {itemName(item, lang)}
                    {item.qty && <span className="text-gray-500 text-xs ml-1">({item.qty})</span>}
                  </span>
                  <div className="flex-1 border-b border-dotted border-gray-300 mx-4 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.price}</span>
                </div>
              ))}
            </div>
            {addButton("sfizi")}
          </motion.div>

          {/* PATATINE BUILDER */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl p-6" style={{ backgroundColor: '#87CEEB' }}>
            <div className="flex items-center gap-4 border-b border-black/15 pb-4 mb-6">
              <h2 className="text-3xl font-display flex-1 text-primary">{t.patatine_title[lang]}</h2>
              <motion.img
                src="/images/patatine.webp"
                alt="Patatine"
                className="h-20 w-auto object-contain drop-shadow-xl flex-shrink-0"
                initial={{ x: 80, rotate: 12, opacity: 0 }}
                whileInView={{ x: 0, rotate: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <div className="mb-4">
              <p className="text-xs font-display tracking-widest text-primary mb-2">{t.pat_base[lang]}</p>
              {menu.patatine_base.map((item, i) => (
                <div key={item.id} className="relative flex justify-between items-baseline mb-2">
                  {tools("patatine_base", i)}
                  <span className="text-gray-900 font-bold">{itemName(item, lang)}</span>
                  <div className="flex-1 border-b border-dotted border-black/20 mx-4 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.price}</span>
                </div>
              ))}
              {addButton("patatine_base")}
            </div>

            <div className="mb-4">
              <p className="text-xs font-display tracking-widest text-primary mb-2">{t.pat_cheese[lang]}</p>
              {menu.patatine_formaggi.map((item, i) => (
                <div key={item.id} className="relative flex justify-between items-baseline mb-2">
                  {tools("patatine_formaggi", i)}
                  <span className="text-gray-900 font-bold">{itemName(item, lang)}</span>
                  <div className="flex-1 border-b border-dotted border-black/20 mx-4 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.price}</span>
                </div>
              ))}
              {addButton("patatine_formaggi")}
            </div>

            <div>
              <p className="text-xs font-display tracking-widest text-primary mb-2">{t.pat_meat[lang]}</p>
              {menu.patatine_carni.map((item, i) => (
                <div key={item.id} className="relative flex justify-between items-baseline mb-2">
                  {tools("patatine_carni", i)}
                  <span className="text-gray-900 font-bold">{itemName(item, lang)}</span>
                  <div className="flex-1 border-b border-dotted border-black/20 mx-4 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.price}</span>
                </div>
              ))}
              {addButton("patatine_carni")}
            </div>
          </motion.div>
        </div>

        {/* ── INSALATE ── */}
        <motion.div ref={insalateRef} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <div className="border-b-2 border-primary pb-4 mb-6 flex justify-between items-end">
            <h2 className="text-3xl font-display text-primary">{t.insalate[lang]}</h2>
            <span className="text-2xl font-display text-primary">10€</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {menu.insalate.map((item, i) => (
              <div key={item.id} className="relative">
                {tools("insalate", i)}
                <h3 className="font-display text-xl text-primary mb-1">{itemName(item, lang)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{itemDesc(item, lang)}</p>
              </div>
            ))}
          </div>
          {addButton("insalate")}
        </motion.div>

        {/* ── BIRRE + VINI + BEVANDE ── */}
        <div ref={drinksRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-end gap-4 border-b border-border pb-4 mb-6">
              <h2 className="text-3xl font-display flex-1">{t.birre[lang]}</h2>
            </div>
            <div className="space-y-4">
              {menu.birre.map((item, i) => (
                <div key={item.id} className="relative flex justify-between items-baseline">
                  {tools("birre", i)}
                  <span className="text-muted-foreground text-sm">{itemName(item, lang)}</span>
                  <div className="flex-1 border-b border-dotted border-border mx-4 opacity-50 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.price}</span>
                </div>
              ))}
            </div>
            {addButton("birre")}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-end gap-4 border-b border-border pb-4 mb-6">
              <h2 className="text-3xl font-display flex-1">{t.vini[lang]}</h2>
            </div>
            <div className="space-y-4">
              {menu.vini.map((item, i) => (
                <div key={item.id} className="relative flex justify-between items-baseline">
                  {tools("vini", i)}
                  <span className="text-muted-foreground text-sm">{itemName(item, lang)}</span>
                  <div className="flex-1 border-b border-dotted border-border mx-4 opacity-50 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.price}</span>
                </div>
              ))}
            </div>
            {addButton("vini")}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-2 lg:col-span-1">
            <h2 className="text-3xl font-display border-b border-border pb-4 mb-6">{t.bevande[lang]}</h2>
            <div className="space-y-4">
              {menu.bevande.map((item, i) => (
                <div key={item.id} className="relative flex justify-between items-baseline">
                  {tools("bevande", i)}
                  <span className="text-muted-foreground text-sm">{itemName(item, lang)}</span>
                  <div className="flex-1 border-b border-dotted border-border mx-4 opacity-50 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.price}</span>
                </div>
              ))}
            </div>
            {addButton("bevande")}
          </motion.div>
        </div>

        {/* Download Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-20 mb-4"
        >
          <a
            href="/images/menu.webp"
            download="menu-officina-del-panino.jpg"
            className="inline-flex items-center gap-2 border border-primary text-primary font-display text-sm tracking-widest uppercase px-6 py-3 hover:bg-primary hover:text-white transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {lang === "it" ? "Scarica Menu" : "Download Menu"}
          </a>
        </motion.div>

      </div>
    </div>
  );
}
