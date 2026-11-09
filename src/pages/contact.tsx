import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Clock, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { SiInstagram, SiFacebook, SiJusteat, SiTiktok } from "react-icons/si";
import { useLang } from "@/context/LanguageContext";
import { DAY_NAMES, formatHours, liveStatus, todayIndex, useHours, weekToShow } from "@/lib/hours";

type LocationKey = "rimini" | "santarcangelo";

const locations = {
  rimini: {
    nameIt: "Rimini",
    nameEn: "Rimini",
    addressIt: "Via Circonvallazione Occidentale, Rimini",
    addressEn: "Via Circonvallazione Occidentale, Rimini, Italy",
    mapsUrl: "https://www.google.com/maps/place/Officina+Del+Panino+-+Rimini/@44.0592474,12.5601417,17z/data=!3m1!4b1!4m6!3m5!1s0x132cc3400c5cc94b:0xc915d079235ec43e!8m2!3d44.0592474!4d12.5627166!16s%2Fg%2F11h_wy233j",
    phone: "0541 141 9757",
    tel: "tel:+390541419757",
    photo: "/images/storefront.webp",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2856.123!2d12.565!3d44.059!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132cba!2sVia+Circonvallazione+Occidentale+70+Rimini!5e0!3m2!1sen!2sit!4v1",
  },
  santarcangelo: {
    nameIt: "Santarcangelo",
    nameEn: "Santarcangelo",
    addressIt: "P.za Guglielmo Marconi, 10, 47822 Santarcangelo di Romagna",
    addressEn: "P.za Guglielmo Marconi, 10, 47822 Santarcangelo di Romagna, Italy",
    mapsUrl: "https://www.google.com/maps/place/Officina+Del+Panino+-+Santarcangelo/@44.0623582,12.4425889,17z/data=!3m1!4b1!4m6!3m5!1s0x132cc10031ca2e5b:0x6025f48f4bc5a6ea!8m2!3d44.0623582!4d12.4451638!16s%2Fg%2F11yp4jgy2k",
    phone: "0541 184 0930",
    tel: "tel:+3905411840930",
    photo: "/images/santarcangelo.webp",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11412.0!2d12.4488!3d44.0645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132cb6a3e4e!2sPiazza+Guglielmo+Marconi+10+Santarcangelo+di+Romagna!5e0!3m2!1sen!2sit!4v1",
  },
};


export default function Contact() {
  const { lang } = useLang();
  const [activeLocation, setActiveLocation] = useState<LocationKey>("rimini");
  const [direction, setDirection] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [videoMuted, setVideoMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const baseLikes = activeLocation === "rimini" ? 36000 : 47000;
  const [likeCount, setLikeCount] = useState(baseLikes);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setVideoPlaying(true);
    } else {
      v.pause();
      setVideoPlaying(false);
    }
  };

  useEffect(() => {
    setVideoPlaying(false);
    setLiked(false);
    setLikeCount(activeLocation === "rimini" ? 36000 : 47000);
  }, [activeLocation]);

  const handleLike = () => {
    setLiked(prev => {
      setLikeCount(c => prev ? c - 1 : c + 1);
      return !prev;
    });
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
  };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);


  const switchLocation = (key: LocationKey) => {
    const keys: LocationKey[] = ["rimini", "santarcangelo"];
    const from = keys.indexOf(activeLocation);
    const to = keys.indexOf(key);
    setDirection(to > from ? 1 : -1);
    setActiveLocation(key);
  };

  const todayMapped = todayIndex(now);
  const hours = useHours();

  const loc = locations[activeLocation];
  const isRimini = activeLocation === "rimini";

  const t = {
    location: { it: "POSIZIONE",  en: "LOCATION" },
    phone:    { it: "TELEFONO",   en: "PHONE" },
    hours:    { it: "ORARI",      en: "HOURS" },
    today:    { it: "(Oggi)",     en: "(Today)" },
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="w-full pt-28 pb-24 min-h-screen">

      {/* Location Tabs */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center mb-10">
          {(["rimini", "santarcangelo"] as LocationKey[]).map((key) => {
            const l = locations[key];
            const isActive = activeLocation === key;
            return (
              <button
                key={key}
                onClick={() => switchLocation(key)}
                data-testid={`location-tab-${key}`}
                className={`relative px-8 py-3 font-display uppercase tracking-widest text-sm transition-all ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "it" ? l.nameIt : l.nameEn}
                {isActive && (
                  <motion.div
                    layoutId="location-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliding location content */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeLocation}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {/* Photo — full width */}
            <div className="relative w-full h-[420px] md:h-[520px] overflow-hidden mb-12">
              <img
                src={loc.photo}
                alt={lang === "it" ? loc.nameIt : loc.nameEn}
                className="w-full h-full object-cover"
                style={isRimini ? { objectPosition: "center 25%" } : { objectPosition: "center" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 md:left-16">
                <h2
                  className="font-display text-5xl md:text-7xl text-white"
                  style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
                >
                  {lang === "it" ? loc.nameIt : loc.nameEn}
                </h2>
              </div>
            </div>

            {/* Info & Map */}
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                {/* Info column */}
                <div className="space-y-12">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="text-primary w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl mb-2 text-foreground">{t.location[lang]}</h3>
                      <a
                        href={loc.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground text-lg hover:text-primary transition-colors underline underline-offset-4"
                      >
                        {lang === "it" ? loc.addressIt : loc.addressEn}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="text-primary w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl mb-2 text-foreground">{t.phone[lang]}</h3>
                      <a
                        href={loc.tel}
                        className="text-muted-foreground text-lg hover:text-primary transition-colors"
                      >
                        {loc.phone}
                      </a>
                      <div className="mt-4">
                        <a
                          href={loc.tel}
                          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display uppercase tracking-widest text-sm px-6 py-3 hover:bg-primary/90 transition-colors"
                        >
                          📞 {lang === "it" ? "Chiama Ora" : "Call Now"}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="text-primary w-6 h-6" />
                    </div>
                    <div className="w-full">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h3 className="font-display text-2xl text-foreground">{t.hours[lang]}</h3>
                        {isRimini && (
                          <span className="text-xs font-display tracking-wider uppercase px-2 py-0.5 bg-primary/10 text-primary border border-primary/30">
                            {lang === "it" ? "🌙 Aperto di notte" : "🌙 Open late night"}
                          </span>
                        )}
                      </div>
                      {(() => {
                        const status = liveStatus(hours[activeLocation], now, lang);
                        const isOpen = status.isOpen;
                        const badgeText = status.text;
                        return (
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 mb-5 text-xs font-display tracking-wider uppercase border ${
                            isOpen
                              ? "border-green-500/40 bg-green-500/10 text-green-400"
                              : "border-red-500/40 bg-red-500/10 text-red-400"
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                            {badgeText}
                          </div>
                        );
                      })()}
                      <div className="space-y-3">
                        {weekToShow(hours[activeLocation], now).map((day, i) => {
                          const isToday = todayMapped === i;
                          const isClosed = !day;
                          // In evidenza i giorni aperti dopo mezzanotte
                          const highlight = !!day && day.close < day.open;
                          return (
                            <div
                              key={i}
                              className={`flex justify-between border-b pb-2 pl-2 transition-colors ${
                                isToday
                                  ? "border-primary/50 border-l-2 border-l-primary bg-primary/5"
                                  : "border-border border-l-2 border-l-transparent"
                              }`}
                            >
                              <span className={`${isToday ? "text-foreground font-bold" : highlight ? "text-foreground font-semibold" : isClosed ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                                {DAY_NAMES[lang][i]}
                                {isToday && (
                                  <span className="ml-2 text-xs text-primary font-bold uppercase tracking-wider">
                                    {t.today[lang]}
                                  </span>
                                )}
                              </span>
                              <span className={`font-mono ${isClosed ? "text-muted-foreground/50 italic" : highlight || isToday ? "text-primary font-semibold" : "text-primary/80"}`}>
                                {formatHours(day, lang)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map column + TikTok frame */}
                <div className="flex flex-col gap-8">
                  <div className="relative h-[500px] bg-card border border-border overflow-hidden">
                    <iframe
                      src={loc.mapSrc}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      sandbox="allow-scripts allow-same-origin"
                      data-testid="contact-map"
                      title={`Google Maps – Officina del Panino ${lang === "it" ? loc.nameIt : loc.nameEn}`}
                    />
                  </div>
                  <div className="flex justify-center">
                    <div className="relative w-[260px] rounded-[40px] overflow-hidden bg-black border-[3px] border-[#2a2a2a]" style={{ aspectRatio: "9/19.5", boxShadow: "0 24px 60px rgba(0,0,0,0.7)" }}>

                      {/* Video */}
                      {isRimini ? (
                        <video
                          ref={videoRef}
                          playsInline preload="metadata"
                          muted
                          poster="/images/storefront.webp"
                          src="/videos/rimini.mp4"
                          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                          onClick={handlePlay}
                          onEnded={() => setVideoPlaying(false)}
                          onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).playbackRate = 0.5; }} />
                      ) : (
                        <video
                          ref={videoRef}
                          playsInline preload="metadata"
                          muted={videoMuted}
                          poster="/images/santarcangelo.webp"
                          src="/videos/santarcangelo.mp4"
                          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                          onClick={handlePlay}
                          onEnded={() => setVideoPlaying(false)} />
                      )}

                      {/* Gradient overlay bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                      {/* Play/Pause button */}
                      <button
                        onClick={handlePlay}
                        className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-200 ${videoPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
                      >
                        {videoPlaying
                          ? <Pause size={40} className="text-white drop-shadow-lg" fill="white" />
                          : <Play size={40} className="text-white drop-shadow-lg ml-1" fill="white" />
                        }
                      </button>
                      {/* Volume button — solo Santarcangelo */}
                      {!isRimini && (
                        <button
                          onClick={() => setVideoMuted(m => !m)}
                          className="absolute bottom-10 right-3 z-30 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                          {videoMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                        </button>
                      )}

                      {/* Top bar */}
                      <div className="absolute top-0 left-0 right-0 flex items-center justify-center px-3 pt-4 pb-2 z-10">
                        <span className="text-white font-bold text-[11px] tracking-wider">Per te</span>
                      </div>

                      {/* Right side actions */}
                      <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4 z-30">
                        {/* Avatar */}
                        <div className="relative mb-1">
                          <div className="w-9 h-9 rounded-full bg-black border-2 border-white overflow-hidden flex items-center justify-center">
                            <img src="/images/logo-transparent.webp" alt="Officina del Panino" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#fe2c55] rounded-full flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold">+</span>
                          </div>
                        </div>
                        {/* Heart */}
                        <button onClick={handleLike} className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform">
                          <div className="w-8 h-8 flex items-center justify-center">
                            <svg
                              viewBox="0 0 24 24"
                              className="w-7 h-7 transition-all duration-200"
                              style={{
                                fill: liked ? "#fe2c55" : "white",
                                transform: likeAnim ? "scale(1.4)" : "scale(1)",
                                filter: liked ? "drop-shadow(0 0 6px #fe2c55)" : "none",
                              }}
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          </div>
                          <span className="text-white text-[10px] font-semibold">
                            {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount}
                          </span>
                        </button>
                        {/* Comment */}
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-8 h-8 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          </div>
                          <span className="text-white text-[10px] font-semibold">{isRimini ? "847" : "1.3K"}</span>
                        </div>
                        {/* Share */}
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-8 h-8 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 0 0 18 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81A3 3 0 0 0 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3a3 3 0 0 0 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
                          </div>
                          <span className="text-white text-[10px] font-semibold">Condividi</span>
                        </div>
                        {/* Music disc */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-white/30 flex items-center justify-center animate-spin" style={{ animationDuration: "4s" }}>
                          <div className="w-2.5 h-2.5 rounded-full bg-black" />
                        </div>
                      </div>

                      {/* Bottom info */}
                      <div className="absolute bottom-6 left-3 right-14 z-10">
                        <p className="text-white font-bold text-[11px] mb-1">@officinadelpanino</p>
                        <p className="text-white/80 text-[10px] leading-tight mb-2">
                          {isRimini ? "🍔 Rimini — Panini fino alle 5:00 🌙" : "🍔 Santarcangelo — La felicità ad ogni morso ✨"}
                        </p>
                        <div className="flex items-center gap-1">
                          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white shrink-0"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
                          <p className="text-white/70 text-[9px] truncate">Musica originale — Officina del Panino</p>
                        </div>
                      </div>


                      {/* Home bar */}
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/40 rounded-full z-10" />
                    </div>
                  </div>
              </div>
            </div>
          </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Social & Order Online */}
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 pt-16 border-t border-border"
        >
        </motion.div>

      </div>
    </div>
  );
}
