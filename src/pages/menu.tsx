import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useLang } from "@/context/LanguageContext";

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
      <div className="relative h-64 flex items-center justify-center" style={{ isolation: "isolate" }}>
        <motion.img
          src={imgSrc}
          alt={item.name}
          className="h-[250px] w-auto max-w-[250px] object-contain drop-shadow-2xl"
          style={{ x, opacity }}
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
  proposte: [
    {
      name: "Biella",
      isNew: true,
      desc: "Doppio Cheese-steak di manzo, doppio formaggio fuso, rucola, pomodorini e scaglie di Grana",
      descEn: "Double beef cheese-steak, double melted cheese, arugula, cherry tomatoes and Grana shavings",
    },
    {
      name: "Carrucola 2.0",
      isNew: false,
      desc: "Doppia Porchetta, doppia provola affumicata, funghi trifolati, patate al forno e maionese al tartufo",
      descEn: "Double porchetta, double smoked provola, sautéed mushrooms, baked potatoes and truffle mayo",
    },
    {
      name: "Martello",
      isNew: false,
      desc: "Doppia Porchetta, parmigiana di melanzane e patate alla piastra con provola affumicata",
      descEn: "Double porchetta, eggplant parmigiana and grilled potatoes with smoked provola",
    },
    {
      name: "Pistone",
      isNew: true,
      desc: "Il nostro hot dog con doppio wurstel fritto, doppio cheddar, bacon croccante, cipolla stufata e salsa BBQ",
      descEn: "Our hot dog with double fried wurstel, double cheddar, crispy bacon, stewed onion and BBQ sauce",
    },
    {
      name: "Trivella 2.0",
      isNew: false,
      desc: "Doppia salsiccia, doppia provola affumicata, melanzane a funghetto e mayonese al basilico",
      descEn: "Double sausage, double smoked provola, eggplant funghetto and basil mayo",
    },
    {
      name: "Incudine",
      isNew: false,
      desc: "Hamburger di scottona 200 gr., doppio cheddar, rucola, pomodorini e melanzane alla griglia",
      descEn: "200g scottona burger, double cheddar, arugula, cherry tomatoes and grilled eggplant",
    },
    {
      name: "Chiodo",
      isNew: true,
      desc: "Doppio Cheese-steak di manzo, doppio cheddar, insalata verde, cipolla stufata e pomodorini",
      descEn: "Double beef cheese-steak, double cheddar, green salad, stewed onion and cherry tomatoes",
    },
    {
      name: "Pinza 2.0",
      isNew: false,
      desc: "Doppio Cheese-steak di manzo, doppio formaggio fuso, peperoni in padella, funghi trifolati, cipolla stufata e mayonese al pepe rosa",
      descEn: "Double beef cheese-steak, double melted cheese, pan peppers, sautéed mushrooms, stewed onion and pink pepper mayo",
    },
    {
      name: "Cacciavite",
      isNew: false,
      desc: "Doppia Salsiccia, doppia provola affumicata, friarelli e patate al forno",
      descEn: "Double sausage, double smoked provola, broccoli rabe and baked potatoes",
    },
  ],
  vegOptions: [
    {
      name: "Candela",
      isNew: true,
      badge: "VEGETARIANO",
      desc: "Friarielli, funghi trifolati, doppia provola affumicata, patate al forno, maionese al basilico",
      descEn: "Broccoli rabe, sautéed mushrooms, double smoked provola, baked potatoes, basil mayo",
    },
    {
      name: "Perno",
      isNew: true,
      badge: "VEGAN",
      desc: "Peperoni in padella, cipolla stufata, melanzane a funghetto e rucola",
      descEn: "Pan peppers, stewed onion, eggplant funghetto and arugula",
    },
  ],
  buildYourOwn: {
    carni: {
      it: ["Bacon", "Cheese-steak di manzo", "Cheese-steak di pollo", "Hamburger di scottona", "Porchetta", "Salsiccia", "Straccetto di pollo", "Wurstel"],
      en: ["Bacon", "Beef cheese-steak", "Chicken cheese-steak", "Scottona beef burger", "Porchetta", "Sausage", "Chicken strips", "Wurstel"],
    },
    formaggi: {
      it: ["Cheddar", "Formaggio fuso", "Provola affumicata"],
      en: ["Cheddar", "Melted cheese", "Smoked provola"],
    },
    contorni: {
      it: ["Cipolla stufata", "Friarielli", "Funghi trifolati", "Insalata", "Melanzane a funghetto", "Melanzane alla griglia", "Parmigiana di melanzane", "Patate al forno", "Patate alla piastra con provola", "Patatine fritte", "Peperoni in padella", "Pomodorini", "Rucola"],
      en: ["Stewed onion", "Broccoli rabe", "Sautéed mushrooms", "Lettuce", "Eggplant funghetto", "Grilled eggplant", "Eggplant parmigiana", "Baked potatoes", "Grilled potatoes with provola", "French fries", "Pan peppers", "Cherry tomatoes", "Arugula"],
    },
    salse: {
      it: ["Ketchup", "Mayonese", "Mayonese al basilico", "Mayonese al pepe rosa", "Mayonese al tartufo", "Salsa BBQ", "Salsa burger", "Salsa curry", "Salsa piccante"],
      en: ["Ketchup", "Mayo", "Basil mayo", "Pink pepper mayo", "Truffle mayo", "BBQ sauce", "Burger sauce", "Curry sauce", "Hot sauce"],
    },
  },
  sfizi: [
    { name: "Alette di pollo", nameEn: "Chicken wings", qty: "5 pz.", price: "5€" },
    { name: "Onion rings",     nameEn: "Onion rings",    qty: "8 pz.", price: "5€" },
    { name: "Straccetti di pollo", nameEn: "Chicken strips", qty: "8 pz.", price: "6€" },
    { name: "Jalapenos",       nameEn: "Jalapeños",      qty: "",      price: "5,5€" },
  ],
  patatine: {
    base: [
      { name: "Patatine fritte", nameEn: "French fries", price: "5€" },
      { name: "Patate al forno", nameEn: "Baked potatoes", price: "6€" },
    ],
    formaggi: [
      { name: "Cheddar / Formaggio fuso", nameEn: "Cheddar / Melted cheese", extra: "+1€" },
      { name: "Provola affumicata", nameEn: "Smoked provola", extra: "+1,5€" },
    ],
    carni: [
      { name: "Wurstel", nameEn: "Wurstel", extra: "+1€" },
      { name: "Manzo / Porchetta / Salsiccia / Bacon", nameEn: "Beef / Porchetta / Sausage / Bacon", extra: "+1,5€" },
    ],
  },
  insalate: [
    {
      name: "Contadina",
      desc: "Lattuga, rucola, filetti di pollo, pomodorini, melanzane grigliate e doppia provola affumicata",
      descEn: "Lettuce, arugula, chicken fillets, cherry tomatoes, grilled eggplant and double smoked provola",
      price: "10€",
    },
    {
      name: "Cheesteak Salad",
      desc: "Lattuga, rucola, pomodorini, cheese-steak, bacon, doppio cheddar e scaglie di grana",
      descEn: "Lettuce, arugula, cherry tomatoes, cheese-steak, bacon, double cheddar and Grana shavings",
      price: "10€",
    },
  ],
  bevande: [
    { name: "Coca Cola in vetro",            price: "3€" },
    { name: "Coca Cola in lattina",          price: "2,5€" },
    { name: "Coca Cola Zero in lattina",     price: "2,5€" },
    { name: "Fanta in lattina",              price: "2,5€" },
    { name: "Sprite in lattina",             price: "2,5€" },
    { name: "Fuze Tea in lattina",           price: "2,5€" },
    { name: "Acqua Naturale / Frizzante 0.5L", price: "1,20€" },
  ],
  birre: [
    { name: "Moretti 33 CL",                 price: "3€" },
    { name: "Heineken 33 CL",                price: "3€" },
    { name: "Ichnusa non filtrata 33 CL",    price: "3,5€" },
    { name: "Messina 33 CL",                 price: "3,5€" },
    { name: "Moretti Rossa 33 CL",           price: "4€" },
    { name: "Erdinger 33 CL",               price: "5€" },
    { name: "Gradisca 50 CL",               price: "6€" },
  ],
  vini: [
    { name: "Ribolla Gialla 375 CL", price: "10€" },
    { name: "Sangiovese 375 CL",     price: "10€" },
  ],
};

export default function Menu() {
  const { lang } = useLang();

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
                const imgSrc = item.name === "Trapano" ? "/images/panino-trapano.png"
                             : item.name === "Bullone" ? "/images/panino-bullone.png"
                             : "/images/panino-chiave.png";
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
                const imgSrc = item.name === "Trapano" ? "/images/panino-trapano.png"
                             : item.name === "Bullone" ? "/images/panino-bullone.png"
                             : "/images/panino-chiave.png";
                return (
                  <div key={i} className="flex flex-col">
                    <div className="relative h-64 flex items-center justify-center" style={{ isolation: "isolate" }}>
                      <motion.img
                        src={imgSrc}
                        alt={item.name}
                        className="h-[250px] w-auto max-w-[250px] object-contain drop-shadow-2xl"
                        style={
                          i === 0 ? { x: s0x, rotate: s0rot, opacity: s0op } :
                          i === 1 ? { y: s1y, rotate: s1rot, opacity: s1op } :
                                    { x: s2x, rotate: s2rot, opacity: s2op }
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
            {menuData.proposte.map((item, i) => (
              <motion.div key={i} whileHover={{ x: 5 }}
                className="group border-l-2 border-transparent hover:border-primary pl-4 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-xl group-hover:text-primary transition-colors">{item.name}</h3>
                  {item.isNew && (
                    <span className="text-[10px] font-display tracking-widest bg-primary text-primary-foreground px-2 py-0.5">
                      {t.isNew[lang]}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {lang === "it" ? item.desc : item.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── VEG OPTIONS 9€ ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: '#9DC050' }}>
            <div className="flex justify-between items-end border-b border-black/15 pb-4 mb-6">
              <h2 className="text-3xl md:text-4xl font-display text-primary">{t.veg_title[lang]}</h2>
              <p className="text-sm text-gray-900 font-semibold">{t.veg_note[lang]}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {menuData.vegOptions.map((item, i) => (
                <div key={i} className="border-l-4 border-black/20 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-xl text-gray-900">{item.name}</h3>
                    {item.isNew && (
                      <span className="text-[10px] font-display tracking-widest bg-primary text-primary-foreground px-2 py-0.5">
                        {t.isNew[lang]}
                      </span>
                    )}
                    <span className="text-[10px] font-display tracking-widest border border-black/30 text-gray-900 px-2 py-0.5">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed font-semibold">
                    {lang === "it" ? item.desc : item.descEn}
                  </p>
                </div>
              ))}
            </div>
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
              {
                key: "basic",
                price: "10 €",
                label: { it: "BASE", en: "BASIC" },
                desc: { it: "1 carne · 1 formaggio · 1 contorno · 1 salsa", en: "1 meat · 1 cheese · 1 topping · 1 sauce" },
              },
              {
                key: "premium",
                price: "12.5 €",
                label: { it: "COMPLETO", en: "FULL" },
                desc: { it: "2 carni · 2 formaggi · 2 contorni · 2 salse", en: "2 meats · 2 cheeses · 2 toppings · 2 sauces" },
              },
            ] as const).map(({ key, price, label, desc }) => (
              <motion.button
                key={key}
                onClick={() => changeTier(key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`w-full cursor-pointer rounded-2xl overflow-hidden transition-all flex flex-col items-center justify-center gap-2 py-8 px-4 bg-card border-2 ${
                  tier === key ? "border-primary shadow-xl shadow-primary/20" : "border-border opacity-70 hover:opacity-90"
                }`}
              >
                <span className="font-display text-xs tracking-widest uppercase text-muted-foreground">{label[lang]}</span>
                <span className="font-display text-4xl font-bold text-primary">{price}</span>
                <div className="w-8 h-px bg-primary/40" />
                <span className="font-display text-xs text-foreground text-center leading-relaxed tracking-wide">{desc[lang]}</span>
              </motion.button>
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
            const cats: { key: keyof typeof selected; label: string; items: string[]; wide?: boolean }[] = [
              { key: "carni",    label: t.carni[lang],    items: menuData.buildYourOwn.carni[lang] },
              { key: "formaggi", label: t.formaggi[lang], items: menuData.buildYourOwn.formaggi[lang] },
              { key: "contorni", label: t.contorni[lang], items: menuData.buildYourOwn.contorni[lang], wide: true },
              { key: "salse",    label: t.salse[lang],    items: menuData.buildYourOwn.salse[lang],    wide: true },
            ];
            const totalSelected = Object.values(selected).reduce((n, s) => n + s.size, 0);
            return (
              <>
                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                  {cats.map(({ key, label, items, wide }) => {
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
                          {atLimit && <span className={`text-xs font-mono ${catLight[key] ? "text-white/80" : "text-gray-700"}`}>{t.at_limit[lang]}</span>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {items.map((item, idx) => {
                            const isSel = selected[key].has(item);
                            const isDis = atLimit && !isSel;
                            return (
                              <button key={idx} onClick={() => toggle(key, item)} disabled={isDis}
                                className={`px-3 py-2.5 md:py-1.5 rounded-full text-sm font-bold transition-all ${
                                  isSel  ? "bg-white text-gray-900 shadow-sm"
                                  : isDis ? "bg-white/15 border border-white/10 text-white/25 cursor-not-allowed"
                                  : catLight[key]
                                    ? "bg-white/20 border border-white/30 text-white hover:bg-white/35"
                                    : "bg-white/60 border border-black/15 text-gray-900 hover:bg-white/90"
                                }`}>
                                {item}
                              </button>
                            );
                          })}
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
              {menuData.sfizi.map((item, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <span className="text-gray-900 font-bold">
                    {lang === "it" ? item.name : item.nameEn}
                    {item.qty && <span className="text-gray-500 text-xs ml-1">({item.qty})</span>}
                  </span>
                  <div className="flex-1 border-b border-dotted border-gray-300 mx-4 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.price}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* PATATINE BUILDER */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl p-6" style={{ backgroundColor: '#87CEEB' }}>
            <div className="flex items-center gap-4 border-b border-black/15 pb-4 mb-6">
              <h2 className="text-3xl font-display flex-1 text-primary">{t.patatine_title[lang]}</h2>
              <motion.img
                src="/images/patatine.png"
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
              {menuData.patatine.base.map((item, i) => (
                <div key={i} className="flex justify-between items-baseline mb-2">
                  <span className="text-gray-900 font-bold">{lang === "it" ? item.name : item.nameEn}</span>
                  <div className="flex-1 border-b border-dotted border-black/20 mx-4 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <p className="text-xs font-display tracking-widest text-primary mb-2">{t.pat_cheese[lang]}</p>
              {menuData.patatine.formaggi.map((item, i) => (
                <div key={i} className="flex justify-between items-baseline mb-2">
                  <span className="text-gray-900 font-bold">{lang === "it" ? item.name : item.nameEn}</span>
                  <div className="flex-1 border-b border-dotted border-black/20 mx-4 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.extra}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-display tracking-widest text-primary mb-2">{t.pat_meat[lang]}</p>
              {menuData.patatine.carni.map((item, i) => (
                <div key={i} className="flex justify-between items-baseline mb-2">
                  <span className="text-gray-900 font-bold">{lang === "it" ? item.name : item.nameEn}</span>
                  <div className="flex-1 border-b border-dotted border-black/20 mx-4 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.extra}</span>
                </div>
              ))}
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
            {menuData.insalate.map((item, i) => (
              <div key={i}>
                <h3 className="font-display text-xl text-primary mb-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{lang === "it" ? item.desc : item.descEn}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── BIRRE + VINI + BEVANDE ── */}
        <div ref={drinksRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-end gap-4 border-b border-border pb-4 mb-6">
              <h2 className="text-3xl font-display flex-1">{t.birre[lang]}</h2>
            </div>
            <div className="space-y-4">
              {menuData.birre.map((item, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <span className="text-muted-foreground text-sm">{item.name}</span>
                  <div className="flex-1 border-b border-dotted border-border mx-4 opacity-50 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.price}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-end gap-4 border-b border-border pb-4 mb-6">
              <h2 className="text-3xl font-display flex-1">{t.vini[lang]}</h2>
            </div>
            <div className="space-y-4">
              {menuData.vini.map((item, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <span className="text-muted-foreground text-sm">{item.name}</span>
                  <div className="flex-1 border-b border-dotted border-border mx-4 opacity-50 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.price}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-2 lg:col-span-1">
            <h2 className="text-3xl font-display border-b border-border pb-4 mb-6">{t.bevande[lang]}</h2>
            <div className="space-y-4">
              {menuData.bevande.map((item, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <span className="text-muted-foreground text-sm">{item.name}</span>
                  <div className="flex-1 border-b border-dotted border-border mx-4 opacity-50 relative top-[-4px]" />
                  <span className="font-display text-primary">{item.price}</span>
                </div>
              ))}
            </div>
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
            href="/images/menu.jpg"
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
