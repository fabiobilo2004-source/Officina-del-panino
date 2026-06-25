import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown, X, ZoomIn, Phone, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LanguageContext";
import { SiTripadvisor, SiGoogle, SiJusteat } from "react-icons/si";

const riminiDays = [
  { key: "monday",    it: "Lunedì",    en: "Monday",    time: "18:00 – 05:00" },
  { key: "tuesday",   it: "Martedì",   en: "Tuesday",   time: "18:00 – 05:00" },
  { key: "wednesday", it: "Mercoledì", en: "Wednesday", time: "18:00 – 05:00" },
  { key: "thursday",  it: "Giovedì",   en: "Thursday",  time: "18:00 – 05:00" },
  { key: "friday",    it: "Venerdì",   en: "Friday",    time: "18:00 – 05:00" },
  { key: "saturday",  it: "Sabato",    en: "Saturday",  time: "18:00 – 05:00" },
  { key: "sunday",    it: "Domenica",  en: "Sunday",    time: "18:00 – 05:00" },
];

const santaDays = [
  { key: "monday",    it: "Lunedì",    en: "Monday",    time: "18:00 – 23:30" },
  { key: "tuesday",   it: "Martedì",   en: "Tuesday",   time: "Chiuso" },
  { key: "wednesday", it: "Mercoledì", en: "Wednesday", time: "18:00 – 23:30" },
  { key: "thursday",  it: "Giovedì",   en: "Thursday",  time: "18:00 – 23:30" },
  { key: "friday",    it: "Venerdì",   en: "Friday",    time: "18:00 – 02:30" },
  { key: "saturday",  it: "Sabato",    en: "Saturday",  time: "18:00 – 02:30" },
  { key: "sunday",    it: "Domenica",  en: "Sunday",    time: "18:00 – 23:30" },
];

function parseTime(s: string): { openMin: number; closeMin: number } | null {
  const m = s.match(/(\d+):(\d+)\s*[–-]\s*(\d+):(\d+)/);
  if (!m) return null;
  const openMin = parseInt(m[1]) * 60 + parseInt(m[2]);
  let closeMin  = parseInt(m[3]) * 60 + parseInt(m[4]);
  if (closeMin <= openMin) closeMin += 1440;
  return { openMin, closeMin };
}

function fmtMin(t: number) {
  const h = Math.floor((t % 1440) / 60), mn = t % 60;
  return `${h}:${mn.toString().padStart(2, "0")}`;
}

function getLiveStatus(days: { key: string; it: string; en: string; time: string }[], lang: "it" | "en", now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false,
  }).formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === "hour")?.value ?? "0");
  const min  = parseInt(parts.find(p => p.type === "minute")?.value ?? "0");
  const wd   = parts.find(p => p.type === "weekday")?.value ?? "Mon";
  const wdMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const jsDay    = wdMap[wd] ?? 1;
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const curMin   = hour * 60 + min;
  const yestIdx  = (todayIdx - 1 + 7) % 7;
  const yestR    = parseTime(days[yestIdx].time);
  if (yestR && yestR.closeMin > 1440) {
    const closeToday = yestR.closeMin - 1440;
    if (curMin < closeToday) return { isOpen: true, text: lang === "it" ? `Aperto · chiude alle ${fmtMin(closeToday)}` : `Open · closes at ${fmtMin(closeToday)}` };
  }
  const todayR = parseTime(days[todayIdx].time);
  if (todayR) {
    if (curMin >= todayR.openMin) return { isOpen: true, text: lang === "it" ? `Aperto · chiude alle ${fmtMin(todayR.closeMin)}` : `Open · closes at ${fmtMin(todayR.closeMin)}` };
    return { isOpen: false, text: lang === "it" ? `Chiuso · apre alle ${fmtMin(todayR.openMin)}` : `Closed · opens at ${fmtMin(todayR.openMin)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const ni = (todayIdx + i) % 7;
    const nr = parseTime(days[ni].time);
    if (nr) {
      const dn = lang === "it" ? days[ni].it : days[ni].en;
      return { isOpen: false, text: lang === "it" ? `Chiuso · apre ${dn} alle ${fmtMin(nr.openMin)}` : `Closed · opens ${dn} at ${fmtMin(nr.openMin)}` };
    }
  }
  return { isOpen: false, text: lang === "it" ? "Chiuso" : "Closed" };
}

const creazioniImages = [
  "/images/creazioni-spread.jpg",
  "/images/paniniinsalata.jpg",
  "/images/creazioni-vicini.jpg",
  "/images/creazioni-castello.png",
  "/images/panini-trio.jpg",
  "/images/sandwich1.jpg",
  "/images/panino-patate.jpg",
  "/images/panini-wings.jpg",
  "/images/sandwiches-bag.jpg",
  "/images/panino-pollo.webp",
  "/images/panino-rucola.webp",
  "/images/panino-verdure.webp",
  "/images/panino-melanzane.webp",
  "/images/panino-heinz.jpg",
  "/images/wings-cheesefries.jpg",
];

const reviewsList = [
  { name: "Joe El Khoury",      it: "Per i non italiani, se cercate fast food e volete mangiare qualcosa oltre a pizza e pasta, questo posto è la scelta migliore! Scegli il tuo panino dalla carne alle salse.", en: "For non italians, if you are looking for fast food and you want to eat something other than pizza and pasta, this place is your best choice! You design your own sandwich from the type of meat to the sauces." },
  { name: "Gabriele Ronchini",  it: "Hai una fame immensa e una voglia matta di panino? L'officina del panino è il posto giusto. Ha un sacco di panini da menu e puoi anche creare il tuo personalizzato! Si mangia davvero bene e ne esci sicuramente sazio. Arredato benissimo con elementi che ti buttano in un'atmosfera da vera officina. Consigliatissimo!", en: "Starving and craving a sandwich? Officina del Panino is the right place. Loads of options and you can even build your own! Food is genuinely great and you'll leave full. Beautifully decorated with a real workshop vibe. Highly recommended!" },
  { name: "Baviels",            it: "Bellissima esperienza, panino veramente squisito! Personale gentilissimo — siccome ho preso da asporto mi hanno aiutato nella scelta. Veramente pieni di condimenti e squisiti!", en: "Amazing experience, truly delicious sandwich! Very friendly staff — since I took it to go they helped me choose. Absolutely packed with toppings and delicious!" },
  { name: "Sara Bonvicini",     it: "Che panini ragazzi! Grandi, pieni, gustosissimi! Davvero una bella scoperta. L'interno è molto carino, l'idea di chiamare i panini come gli attrezzi di un'officina rende tutto più originale e simpatico.", en: "What sandwiches! Big, loaded, delicious! A real discovery. The interior is lovely — naming the sandwiches after workshop tools makes everything more original and fun." },
];

const tripReviewsList = [
  { name: "Aro2015",           it: "Sono andato una sera verso le 23, il panino è stato fatto con amore, prodotti freschi e di prima scelta. Vi adoro, i 10€ più ben spesi in vita mia 💖", en: "Went one evening around 11pm — the sandwich was made with love, fresh top-quality ingredients. I love you guys, the best €10 I've ever spent 💖" },
  { name: "Luisiana S.",       it: "Consigliato dall'hotel in cui alloggiavamo, panini ottimi ordinati alle 4 del mattino. Buonissimi e pienissimi. Ingredienti e pane top, mai mangiato niente di simile. Da provare assolutamente.", en: "Recommended by our hotel, ordered at 4am. Delicious and absolutely packed. Top-quality ingredients and bread, never eaten anything like it. An absolute must." },
  { name: "Luigi Pagliarullo", it: "Panini speciali, prodotti di qualità e servizio veloce. I ragazzi sono giovani e svegli, il prezzo è basso per il peso dei panini — con 1 ci sfami 2 persone. Locale a tema officina pulito e accogliente.", en: "Special sandwiches, quality products and fast service. The guys are young and sharp, the price is low for the size — one sandwich feeds two. Clean, welcoming workshop-themed venue." },
  { name: "matimati",          it: "Ottimo ottimo ottimo!!! Locale carinissimo, curato e accogliente!!! Personale gentile e cordiale! Panino STRATOSFERICO!!! Quello con la cheesesteak il mio preferito!!!", en: "Amazing amazing amazing!!! Super cute, well-kept and welcoming venue!!! Friendly and kind staff! The sandwich is OUT OF THIS WORLD!!! The cheesesteak one is my favourite!!!" },
  { name: "Veronica",          it: "Serata di partita e cosa fai? Non prendi due bei paninazzi da divorare davanti alla tv? E quelli dell'Officina del panino sono davvero super! Personalizzabili al 100%, ottimi e abbondanti. Consigliatissimo!", en: "Match night — what do you do? Grab two amazing sandwiches to devour in front of the TV! And Officina del Panino's are truly superb! 100% customisable, delicious and generous. Highly recommended!" },
];

function AnimatedCounter({ target, label }: { target: number | string, label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView && typeof target === "number") {
      let start = 0;
      const duration = 1500;
      const interval = 20;
      const steps = duration / interval;
      const increment = target / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, interval);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [isInView, target]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 px-1">
      <span className="font-display text-3xl sm:text-5xl md:text-6xl text-primary leading-none">
        {typeof target === "number" ? count : target}
      </span>
      <span className="text-muted-foreground font-display uppercase text-[9px] sm:text-xs md:text-sm tracking-[0.04em] md:tracking-widest text-center leading-tight">{label}</span>
    </div>
  );
}

function StoryImage() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const [colored, setColored] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const t = setTimeout(() => setColored(true), 1000);
    return () => clearTimeout(t);
  }, [isInView]);

  return (
    <div ref={ref} className="aspect-square overflow-hidden">
      <motion.img
        src="/images/storia-fondatori.jpg"
        alt="I fondatori di Officina del Panino Rimini"
        className="w-full h-[120%] -mt-[10%] object-cover transition-[filter] duration-1000"
        style={{ filter: colored ? "grayscale(0%)" : "grayscale(100%)", y: imgY }}
      />
    </div>
  );
}

export default function Home() {
  const { lang } = useLang();
  const { scrollY } = useScroll();
  const heroVideoY = useTransform(scrollY, [0, 700], [0, 110]);
  const heroContentY = useTransform(scrollY, [0, 700], [0, -60]);
  const heroContentOpacity = useTransform(scrollY, [0, 420], [1, 0]);
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  const tripReviewScrollRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const lavorazioneVideoRef = useRef<HTMLVideoElement>(null);

  const [now, setNow] = useState(new Date());
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [isMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [orderOpen, setOrderOpen] = useState(false);

  const handleJustEat = () => {
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (mobile) {
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      window.open(
        isIOS
          ? "https://apps.apple.com/it/app/just-eat-ordina-cibo-online/id566347057"
          : "https://play.google.com/store/apps/details?id=com.justeat.app.italy",
        "_blank"
      );
    } else {
      window.open("https://www.justeat.it/restaurants-officina-del-panino-rimini-47923/menu#pre-order", "_blank");
    }
  };
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Hero video: force play immediately
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.load();
    v.play().catch(() => {
      v.addEventListener("canplay", () => v.play().catch(() => {}), { once: true });
    });
  }, []);

  const [lavorazionePlaying, setLavorazionePlaying] = useState(false);
  const [lavorazioneMuted, setLavorazioneMuted] = useState(false);
  const estateVideoRef = useRef<HTMLVideoElement>(null);
  const [estatePlaying, setEstatePlaying] = useState(false);
  const [estateMuted, setEstateMuted] = useState(true);
  const handleEstatePlay = () => {
    const v = estateVideoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setEstatePlaying(true); }
    else { v.pause(); setEstatePlaying(false); }
  };

  const panegiustoVideoRef = useRef<HTMLVideoElement>(null);
  const [panegiustoPlaying, setPanegiustoPlaying] = useState(false);
  const [panegiustoMuted, setPanegiustoMuted] = useState(false);

  const handlePanegiustoPlay = () => {
    const v = panegiustoVideoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPanegiustoPlaying(true);
    } else {
      v.pause();
      setPanegiustoPlaying(false);
    }
  };

  const handleLavorazionePlay = () => {
    const v = lavorazioneVideoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setLavorazionePlaying(true);
    } else {
      v.pause();
      setLavorazionePlaying(false);
    }
  };
  const getCardW = (el: HTMLDivElement) => {
    const card = el.firstElementChild as HTMLElement | null;
    return (card?.offsetWidth ?? 288) + 16;
  };


  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")      setLightboxIdx(null);
      if (e.key === "ArrowRight")  setLightboxIdx((i) => i !== null ? (i + 1) % creazioniImages.length : null);
      if (e.key === "ArrowLeft")   setLightboxIdx((i) => i !== null ? (i - 1 + creazioniImages.length) % creazioniImages.length : null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxIdx]);


  const scrollReviews = (dir: "left" | "right") => {
    const el = reviewScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? getCardW(el) : -getCardW(el), behavior: "smooth" });
  };

  const scrollTripReviews = (dir: "left" | "right") => {
    const el = tripReviewScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? getCardW(el) : -getCardW(el), behavior: "smooth" });
  };

  const t = {
    hero_title_1: { it: "OFFICINA", en: "OFFICINA" },
    hero_title_2: { it: "DEL PANINO", en: "DEL PANINO" },
    hero_sub: { it: "La felicità ad ogni morso", en: "Happiness in every bite" },
    hero_menu: { it: "VEDI IL MENU", en: "VIEW MENU" },
    hero_order: { it: "ORDINA ORA", en: "ORDER NOW" },
    workshop_title: { it: "LA NOSTRA STORIA", en: "OUR STORY" },
    workshop_p1: { it: "L'Officina del Panino nasce dall'idea di due giovani imprenditori con la volontà di far conoscere la cultura gastronomica del proprio paese di origine: un piccolo paese del napoletano, noto per le sue specialità culinarie segnate da una forte influenza americana. Siamo una paninoteca take-away specializzata in panini alla brace, nel cuore di Rimini, alle spalle del Castel Sismondo.", en: "Officina del Panino was born from the idea of two young entrepreneurs with a passion for sharing the food culture of their hometown — a small village near Naples, renowned for its culinary traditions rooted in strong American influence. We are a take-away sandwich shop specialising in fire-grilled sandwiches, in the heart of Rimini, just behind Castel Sismondo." },
    workshop_p2: { it: "Fu proprio da uno di quei viaggi oltreoceano che nacque la voglia di importare la famosa Cheesesteak di Filadelfia — carne bovina trita con formaggio fuso — abbinata ai contorni tipici campani. Un prodotto innovativo che ha conquistato il palato di molti, diventando quasi un culto. Rimini è il nostro punto di partenza per far diffondere questa gustosa pietanza in tutto il territorio nazionale.", en: "It was during one of those trips across the Atlantic that the dream of bringing the legendary Philadelphia Cheesesteak to Italy was born — thinly sliced beef with melted cheese, paired with classic Campanian sides. A truly original take that has won over countless food lovers and become something of a cult. Rimini is our home base as we spread this flavour across Italy." },
    creations: { it: "LE NOSTRE CREAZIONI", en: "OUR CREATIONS" },
    creations_sub: { it: "12 proposte a 11€ · Monta il tuo da 10€", en: "12 sandwiches at €11 · Build your own from €10" },
    full_menu: { it: "MENU COMPLETO", en: "SEE FULL MENU" },
    reviews: { it: "COSA DICONO", en: "WHAT PEOPLE SAY" },
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[100dvh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={isMobile ? {} : { y: heroVideoY }}>
          <video
            ref={heroVideoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/hero-insegna.jpg"
            src="/videos/officina-video.mp4"
            className={`w-full h-full object-cover${isMobile ? "" : " scale-[1.35]"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/75" />
        </motion.div>

        <motion.div
          className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-[68px] md:mt-20"
          style={isMobile ? {} : { y: heroContentY, opacity: heroContentOpacity }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[2.75rem] md:text-7xl lg:text-8xl font-display text-white mb-3 md:mb-6 leading-tight"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
          >
            {t.hero_title_1[lang]}<br /><span className="text-primary">{t.hero_title_2[lang]}</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-2xl md:text-3xl text-white mb-5 md:mb-10 max-w-md mx-auto uppercase tracking-widest"
            style={{
              fontFamily: "'Abril Fatface', serif",
              textShadow: "2px 2px 0px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.8)",
            }}
          >
            {t.hero_sub[lang]}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center"
          >
            <Button size="lg" asChild className="rounded-none font-display uppercase tracking-[0.18em] text-sm h-11 md:h-14 px-8 md:px-10 w-full sm:w-auto" data-testid="hero-menu-btn">
              <Link href="/menu">{t.hero_menu[lang]}</Link>
            </Button>
            <div className="relative w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setOrderOpen(o => !o)}
                className="rounded-none font-display uppercase tracking-[0.18em] text-sm h-11 md:h-14 px-8 md:px-10 w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground flex items-center gap-2"
                data-testid="hero-contact-btn"
              >
                {t.hero_order[lang]}
                <ChevronDown size={14} className={`transition-transform duration-200 ${orderOpen ? "rotate-180" : ""}`} />
              </Button>
              {orderOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 flex flex-col border border-border bg-card shadow-xl">
                  <button
                    onClick={() => { setOrderOpen(false); handleJustEat(); }}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-orange-500 hover:text-white transition-colors text-sm font-display tracking-widest uppercase text-muted-foreground border-b border-border/40 w-full text-left"
                  >
                    <SiJusteat size={16} className="text-orange-500" />
                    Just Eat
                  </button>
                  <a
                    href="tel:+390541419757"
                    onClick={() => setOrderOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary hover:text-white transition-colors text-sm font-display tracking-widest uppercase text-muted-foreground border-b border-border/40"
                  >
                    <Phone size={14} />
                    Rimini — 0541 141 9757
                  </a>
                  <a
                    href="tel:+3905411840930"
                    onClick={() => setOrderOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary hover:text-white transition-colors text-sm font-display tracking-widest uppercase text-muted-foreground"
                  >
                    <Phone size={14} />
                    Santarcangelo — 0541 184 0930
                  </a>
                </div>
              )}
            </div>
          </motion.div>

          {/* Live status badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mt-4 md:mt-8"
          >
            {[
              { label: lang === "it" ? "OFFICINA DI RIMINI" : "OFFICINA DI RIMINI", days: riminiDays },
              { label: lang === "it" ? "OFFICINA DI SANTARCANGELO" : "OFFICINA DI SANTARCANGELO", days: santaDays },
            ].map(({ label, days }) => {
              const s = getLiveStatus(days, lang, now);
              const openWord = lang === "it" ? "APERTO" : "OPEN";
              const closedWord = lang === "it" ? "CHIUSO" : "CLOSED";
              const detail = s.text.includes("·") ? s.text.split("·").slice(1).join("·").trim() : "";
              return (
                <div key={label} className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-5 md:py-3 bg-black/60 backdrop-blur-sm border border-white/10">
                  <span className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0 ${s.isOpen ? "bg-green-400 animate-pulse" : "bg-red-500"}`} />
                  <div className="flex flex-col leading-tight text-left">
                    <span className="text-white/50 text-[9px] md:text-[10px] font-display tracking-[0.15em] uppercase">{label}</span>
                    <span className={`text-xs md:text-sm font-display tracking-[0.12em] ${s.isOpen ? "text-green-400" : "text-red-400"}`}>
                      {s.isOpen ? openWord : closedWord}
                      {detail ? <span className="text-white/40 font-mono text-[9px] md:text-[10px] ml-1.5 md:ml-2 normal-case tracking-normal">{detail}</span> : null}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-white/30 text-[9px] font-display tracking-[0.3em] uppercase">Scroll</span>
            <ChevronDown size={16} className="text-white/30" />
          </motion.div>
        </motion.div>
      </section>


      {/* Featured Items */}
      <section className="py-24 bg-card border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-primary mb-2">{t.creations[lang]}</h2>
            <div className="w-12 h-px bg-primary mx-auto" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {creazioniImages.map((src, i) => {
              return (
                <motion.div
                  key={src}
                  initial={{ y: 90, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.08 }}
                  transition={{ duration: 0.75, delay: i * 0.065, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.03 }}
                  className={`relative overflow-hidden bg-card cursor-pointer group ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}
                  style={{ aspectRatio: "1 / 1" }}
                  onClick={() => setLightboxIdx(i)}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <ZoomIn size={32} className="text-white drop-shadow-lg" />
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild variant="outline" className="rounded-none font-display uppercase tracking-[0.2em] text-sm h-14 px-10 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link href="/menu">{t.full_menu[lang]}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 border-y border-border/50 bg-background relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
          <span className="font-display text-[clamp(5rem,18vw,12rem)] font-bold text-primary/[0.04] tracking-widest leading-none whitespace-nowrap">OFFICINA</span>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative flex items-center justify-center">
          {[
            { value: "2",    label: lang === "it" ? "Sedi"     : "Locations" },
            { value: "2019", label: lang === "it" ? "Dal"      : "Since" },
            { value: "11€",  label: lang === "it" ? "Panini a" : "Sandwiches from" },
          ].map(({ value, label }, i, arr) => (
            <>
              <div key={value} className="flex-1 flex flex-col items-center gap-1">
                <span className="font-display text-[9px] sm:text-xs tracking-widest uppercase text-muted-foreground">
                  {label}
                </span>
                <span className="font-display text-4xl sm:text-5xl md:text-6xl text-primary leading-none">
                  {value}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div key={`div-${i}`} className="h-14 w-px bg-border/40 mx-2 sm:mx-4" />
              )}
            </>
          ))}
        </div>
      </section>

      {/* Story / Vibe Section */}
      <section className="pt-14 pb-10 md:pt-24 md:pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-display text-primary mb-2 leading-tight">{t.workshop_title[lang]}</h2>
            <div className="w-12 h-px bg-primary mb-8" />
            <p className="text-base md:text-lg text-muted-foreground mb-6 leading-[1.8] font-light">
              {t.workshop_p1[lang]}
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-[1.8] font-light">
              {t.workshop_p2[lang]}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <StoryImage />
          </motion.div>
        </div>
      </section>

      {/* ── Take Away Section ── */}
      <section className="py-20 md:py-28 bg-card border-y border-border/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">

            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden"
            >
              <img
                src="/images/takeaway-box.jpg"
                alt="Take Away Officina del Panino"
                loading="lazy"
                className="w-full object-cover"
                style={{ aspectRatio: "3/4", objectPosition: "center" }}
              />
            </motion.div>

            {/* Text + CTA */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-8"
            >
              <div>
                <p className="font-display text-sm tracking-widest uppercase text-muted-foreground mb-2">
                  TAKE AWAY
                </p>
                <h2 className="text-4xl md:text-5xl font-display text-primary mb-2">
                  {lang === "it" ? "ORDINA ORA" : "ORDER NOW"}
                </h2>
                <div className="w-12 h-px bg-primary mb-5" />
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {lang === "it"
                    ? "Ordina comodamente da Just Eat oppure chiamaci direttamente — i nostri panini ti aspettano."
                    : "Order easily on Just Eat or call us directly — our sandwiches are waiting for you."}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href="https://www.justeat.it/restaurants-officina-del-panino-rimini-47923/menu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-6 py-4 bg-orange-500 text-white font-display uppercase tracking-widest text-sm hover:bg-orange-600 transition-colors"
                >
                  <SiJusteat size={20} />
                  {lang === "it" ? "Ordina su Just Eat" : "Order on Just Eat"}
                </a>
                <a
                  href="tel:+390541419757"
                  className="flex items-center gap-4 px-6 py-4 border border-border bg-background font-display uppercase tracking-widest text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <span className="text-primary">☎</span>
                  Rimini — 0541 141 9757
                </a>
                <a
                  href="tel:+3905411840930"
                  className="flex items-center gap-4 px-6 py-4 border border-border bg-background font-display uppercase tracking-widest text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <span className="text-primary">☎</span>
                  Santarcangelo — 0541 184 0930
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Come prepariamo i tuoi panini — Video Section */}
      <section className="py-24 bg-background border-b border-border/30">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Testo sinistra */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-center md:text-left"
          >
            <h2 className="text-4xl md:text-5xl font-display text-primary mb-4">
              {lang === "it" ? "COME PREPARIAMO I TUOI PANINI" : "HOW WE MAKE YOUR SANDWICH"}
            </h2>
            <div className="w-12 h-px bg-primary md:mx-0 mx-auto" />
          </motion.div>
          {/* Video destra */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative overflow-hidden border border-border/40 w-full max-w-[280px] md:max-w-[340px] flex-shrink-0"
            style={{ aspectRatio: "9/16" }}
          >
            <video
              ref={lavorazioneVideoRef}
              playsInline
              preload="auto"
              muted
              src="/videos/lavorazione-web.mp4"
              className="w-full h-full object-cover"
              onEnded={() => setLavorazionePlaying(false)}
            />
            <button
              onClick={handleLavorazionePlay}
              className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-200 ${lavorazionePlaying ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
            >
              {lavorazionePlaying
                ? <Pause size={48} className="text-white drop-shadow-lg" fill="white" />
                : <Play size={48} className="text-white drop-shadow-lg ml-1" fill="white" />
              }
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Estate Section ── */}
      <section className="py-24 bg-card border-b border-border/30">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-center md:text-left"
          >
            <p className="font-display text-sm tracking-widest uppercase text-muted-foreground mb-3">
              {lang === "it" ? "OFFICINA DEL PANINO" : "OFFICINA DEL PANINO"}
            </p>
            <h2 className="text-4xl md:text-5xl font-display leading-tight mb-4">
              <span className="text-foreground">{lang === "it" ? "Panini fatti" : "Sandwiches done"} </span>
              <span className="text-primary">{lang === "it" ? "come si deve," : "right,"}</span>
              <br />
              <span className="text-foreground">{lang === "it" ? "fino all'ultimo ordine" : "until the last order"} </span>
              <span className="text-primary">{lang === "it" ? "della notte." : "of the night."}</span>
            </h2>
            <div className="w-12 h-px bg-primary md:mx-0 mx-auto" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden border border-border/40 w-full max-w-[280px] md:max-w-[340px] flex-shrink-0"
            style={{ aspectRatio: "9/16" }}
          >
            <video
              ref={estateVideoRef}
              src="/videos/estate.mp4"
              preload="auto"
              playsInline
              muted={estateMuted}
              loop
              onEnded={() => setEstatePlaying(false)}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              onClick={handleEstatePlay}
            />
            <button
              onClick={handleEstatePlay}
              className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-200 ${estatePlaying ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
            >
              <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
                {estatePlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
              </div>
            </button>
            <button
              onClick={() => setEstateMuted(m => !m)}
              className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              {estateMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Pane Giusto Section ── */}
      <section className="py-24 bg-background border-b border-border/30">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Text — sinistra su desktop */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-center md:text-left"
          >
            <p className="font-display text-sm tracking-widest uppercase text-muted-foreground mb-2">
              {lang === "it" ? "IL NOSTRO PANE" : "OUR BREAD"}
            </p>
            <h2 className="text-4xl md:text-5xl font-display text-foreground leading-tight mb-1">
              {lang === "it"
                ? <>Il pane giusto fa la differenza. 🍞🔥</>
                : <>The right bread makes all the difference. 🍞🔥</>}
            </h2>
            <h3 className="text-2xl md:text-3xl font-display text-primary mb-4">
              {lang === "it" ? "E noi lo sappiamo bene." : "And we know it well."}
            </h3>
            <div className="w-12 h-px bg-primary md:mx-0 mx-auto" />
          </motion.div>
          {/* Video verticale — destra su desktop */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative overflow-hidden border border-border/40 w-full max-w-[280px] md:max-w-[340px] flex-shrink-0"
            style={{ aspectRatio: "9/16" }}
          >
            <video
              ref={panegiustoVideoRef}
              src="/videos/panegiusto.mp4"
              preload="auto"
              playsInline
              muted={panegiustoMuted}
              className="w-full h-full object-cover"
              onEnded={() => setPanegiustoPlaying(false)}
            />
            <button
              onClick={handlePanegiustoPlay}
              className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-200 ${panegiustoPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
            >
              {panegiustoPlaying
                ? <Pause size={56} className="text-white drop-shadow-lg" fill="white" />
                : <Play size={56} className="text-white drop-shadow-lg ml-1" fill="white" />
              }
            </button>
            <button
              onClick={() => setPanegiustoMuted(m => !m)}
              className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              {panegiustoMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Award Section ── */}
      <section className="py-20 md:py-28 bg-background border-b border-border/30 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.p
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-4xl lg:text-5xl font-display text-foreground leading-tight text-center md:text-left"
          >
            {lang === "it"
              ? <>Riconoscimenti</>
              : <>Awards</>
            }
          </motion.p>
          {/* Just Eat Award photo */}
          <motion.img
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            src="/images/just-eat-award-2024.jpg"
            alt="Just Eat Awards 2024 – Miglior Hamburgeria e Paninoteca"
            loading="lazy"
            className="w-full max-w-sm mx-auto rounded-sm object-cover"
            style={{ aspectRatio: "1/1", objectPosition: "center top" }}
          />
        </div>
        {/* Existing awards image */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="max-w-sm mx-auto px-6 mt-12"
        >
          <img
            src="/images/miglior-paninoteca.jpg"
            alt="Miglior Paninoteca d'Italia 2022 2023 2024"
            loading="lazy"
            className="w-full object-cover"
            style={{ aspectRatio: "1/1", objectPosition: "center top" }}
          />
        </motion.div>
      </section>

      {/* ── Late Night Section ── */}
      <section className="py-0 bg-background border-b border-border/30 overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[480px]">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center px-8 md:px-16 py-16 md:py-20 bg-card"
          >
            <div className="w-8 h-px bg-primary mb-6" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display text-white leading-tight mb-6">
              {lang === "it"
                ? <>IL POSTO PERFETTO<br /><span className="text-primary">DOPO LA DISCOTECA</span></>
                : <>THE PERFECT SPOT<br /><span className="text-primary">AFTER THE CLUB</span></>}
            </h2>
            <p className="text-white/60 text-base md:text-lg leading-[1.85] font-light max-w-md">
              {lang === "it"
                ? "Panini caldi e veloci per chi ha fame a fine serata. Siamo fra gli unici a Rimini aperti fino alle 5 del mattino, pronti a salvare la tua notte con gusto."
                : "Hot and fast sandwiches for when hunger hits at the end of the night. We're among the few in Rimini open until 5am, ready to save your night with great taste."}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="font-display text-primary text-sm tracking-[0.2em] uppercase">
                {lang === "it" ? "Aperto fino alle 5:00" : "Open until 5am"}
              </span>
            </div>
          </motion.div>

          {/* Image side — sostituisci /images/notte.jpg con la tua immagine */}
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="relative min-h-[320px] md:min-h-0 overflow-hidden"
          >
            <img
              src="/images/panini-logo.png"
              alt="Due panini davanti al logo Officina del Panino"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0704]/60 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>


      {/* Reviews — titolo unico + due carousel */}
      <section className="py-14 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Titolo sezione */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display text-primary mb-2">{t.reviews[lang]}</h2>
          <div className="w-12 h-px bg-primary mx-auto" />
        </div>

        {/* Google */}
        <div className="mb-16">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <img src="/images/google-logo.png" alt="Google" className="w-7 h-7 object-contain" />
                <span className="text-2xl md:text-3xl font-display text-foreground">Google</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => i < 4
                  ? <span key={i} className="text-yellow-400 text-sm">★</span>
                  : <span key={i} className="relative inline-block text-sm leading-none">
                      <span className="text-yellow-400/30">★</span>
                      <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                        <span className="text-yellow-400">★</span>
                      </span>
                    </span>
                )}
                <span className="ml-2 text-muted-foreground text-xs font-mono tracking-wider">4.6</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scrollReviews("left")} className="w-10 h-10 border border-border bg-card hover:border-primary hover:text-primary text-muted-foreground flex items-center justify-center transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => scrollReviews("right")} className="w-10 h-10 border border-border bg-card hover:border-primary hover:text-primary text-muted-foreground flex items-center justify-center transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div ref={reviewScrollRef} className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {reviewsList.map((review, i) => (
              <motion.div
                key={i}
                className="bg-card border border-border p-6 flex flex-col gap-3 flex-shrink-0 w-[80vw] sm:w-72"
                whileHover={{ y: -5, borderColor: "rgba(192,57,43,0.35)", boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">"{lang === "it" ? review.it : review.en}"</p>
                <p className="font-display text-sm text-foreground tracking-wide border-t border-border/50 pt-3 mt-1">— {review.name}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <a href="https://www.google.com/search?sa=X&sca_esv=cad9ccf7e46fcafa&sxsrf=ANbL-n7Szwe97uBfWHO7XX8Y4hEeD-2cag:1781785239964&q=Officina+Del+Panino+-+Rimini+Reviews&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxIxNDGxsDQ3NDO1NLEwNjcxNzI2tNjAyPiKUcU_LS0zOTMvUcElNUchIDEvMy9fQVchKDM3My9TISi1LDO1vHgRK1HKAJCvlhlpAAAA&rldimm=14489716594837472318&tbm=lcl&hl=en-IT&ved=2ahUKEwjw4qyi45CVAxWYxQIHHTBjAOwQ9fQKegQIUhAG&biw=1470&bih=774&dpr=2#lkt=LocalPoiReviews" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-400 transition-colors font-display tracking-wider uppercase">
              <SiGoogle size={14} />
              {lang === "it" ? "Leggi tutte le recensioni su Google" : "Read all reviews on Google"}
            </a>
          </div>
        </div>

        {/* Divisore */}
        <div className="w-full h-px bg-border/50 mb-16" />

        {/* TripAdvisor */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <SiTripadvisor size={24} className="text-green-500" />
                <span className="text-2xl md:text-3xl font-display text-foreground">TripAdvisor</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => i < 4
                  ? <span key={i} className="text-green-400 text-sm">★</span>
                  : <span key={i} className="relative inline-block text-sm leading-none">
                      <span className="text-green-400/30">★</span>
                      <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                        <span className="text-green-400">★</span>
                      </span>
                    </span>
                )}
                <span className="ml-2 text-muted-foreground text-xs font-mono tracking-wider">4.4</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scrollTripReviews("left")} className="w-10 h-10 border border-border bg-card hover:border-green-500 hover:text-green-500 text-muted-foreground flex items-center justify-center transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => scrollTripReviews("right")} className="w-10 h-10 border border-border bg-card hover:border-green-500 hover:text-green-500 text-muted-foreground flex items-center justify-center transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div ref={tripReviewScrollRef} className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {tripReviewsList.map((review, i) => (
              <motion.div
                key={i}
                className="bg-card border border-border p-6 flex flex-col gap-3 flex-shrink-0 w-[80vw] sm:w-72"
                whileHover={{ y: -5, borderColor: "rgba(192,57,43,0.35)", boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-green-400 text-sm">★</span>)}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">"{lang === "it" ? review.it : review.en}"</p>
                <p className="font-display text-sm text-foreground tracking-wide border-t border-border/50 pt-3 mt-1">— {review.name}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <a href="https://www.tripadvisor.it/Restaurant_Review-g187807-d19138912-Reviews-Officina_Del_Panino-Rimini_Province_of_Rimini_Emilia_Romagna.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors font-display tracking-wider uppercase">
              <SiTripadvisor size={16} />
              {lang === "it" ? "Leggi tutte le recensioni su TripAdvisor" : "Read all reviews on TripAdvisor"}
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/92 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 rounded-full p-2 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
          >
            <X size={26} />
          </button>

          {/* Prev */}
          <button
            className="absolute left-3 md:left-8 text-white/60 hover:text-white bg-black/40 rounded-full p-3 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i !== null ? (i - 1 + creazioniImages.length) % creazioniImages.length : null); }}
          >
            <ChevronLeft size={32} />
          </button>

          {/* Image */}
          <motion.img
            key={lightboxIdx}
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            src={creazioniImages[lightboxIdx]}
            alt=""
            className="max-w-full max-h-[88vh] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          <button
            className="absolute right-3 md:right-8 text-white/60 hover:text-white bg-black/40 rounded-full p-3 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i !== null ? (i + 1) % creazioniImages.length : null); }}
          >
            <ChevronRight size={32} />
          </button>

          {/* Counter */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono tracking-widest">
            {lightboxIdx + 1} / {creazioniImages.length}
          </p>
        </motion.div>
      )}
    </div>
  );
}
