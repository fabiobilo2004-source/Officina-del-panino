import { useState, useEffect } from "react";
import { SiInstagram, SiFacebook, SiTiktok, SiJusteat } from "react-icons/si";
import { useLang } from "@/context/LanguageContext";
import { isAnyLocationOpen } from "@/lib/live-status";

export function Footer() {
  const { lang } = useLang();
  const [anyOpen, setAnyOpen] = useState(() => isAnyLocationOpen(new Date()));

  useEffect(() => {
    const id = setInterval(() => setAnyOpen(isAnyLocationOpen(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  const t = {
    tagline: {
      it: "Paninoteca take-away specializzata in panini alla brace. La vera Cheesesteak americana arriva a Rimini.",
      en: "Take-away sandwich shop specialising in grilled sandwiches. The real American Cheesesteak comes to Rimini.",
    },
    locations: { it: "SEDI", en: "LOCATIONS" },
    hours:     { it: "ORARI",    en: "HOURS" },
    contact:   { it: "CONTATTI", en: "CONTACT" },
    rights:    { it: "Tutti i diritti riservati.", en: "All rights reserved." },
    rimini_hours: {
      it: "Lun: 18:00 – 05:00\nMar: 18:00 – 05:00\nMer: 18:00 – 05:00\nGio: 18:00 – 05:00\nVen: 18:00 – 05:00\nSab: 18:00 – 05:00\nDom: 18:00 – 05:00",
      en: "Mon: 6 pm – 5 am\nTue: 6 pm – 5 am\nWed: 6 pm – 5 am\nThu: 6 pm – 5 am\nFri: 6 pm – 5 am\nSat: 6 pm – 5 am\nSun: 6 pm – 5 am",
    },
    santa_hours: {
      it: "Lun: 18:00 – 23:30\nMar: Chiuso\nMer: 18:00 – 23:30\nGio: 18:00 – 23:30\nVen: 18:00 – 02:30\nSab: 18:00 – 02:30\nDom: 18:00 – 23:30",
      en: "Mon: 6–11:30 pm\nTue: Closed\nWed: 6–11:30 pm\nThu: 6–11:30 pm\nFri: 6 pm – 2:30 am\nSat: 6 pm – 2:30 am\nSun: 6–11:30 pm",
    },
  };

  return (
    <footer className="bg-card border-t border-border/60 py-16 mt-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="navbar-wood inline-flex items-center justify-center p-2 rounded-sm cursor-pointer">
            <img
              src="/images/logo-transparent.webp"
              alt="Officina del Panino"
              className="w-52 h-auto"
              style={{ filter: anyOpen ? "drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 4px #fff5cc) drop-shadow(0 0 6px #ffd060) drop-shadow(0 0 8px #ffaa20)" : "none", transition: "filter 0.4s ease" }}
            />
          </a>
          <p className="text-primary font-display text-sm tracking-widest mt-3 mb-2 uppercase">Dal 2019</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{t.tagline[lang]}</p>
        </div>

        {/* Rimini */}
        <div>
          <h4 className="font-display text-base mb-4 uppercase tracking-wider text-primary">Rimini</h4>
          <address className="not-italic text-muted-foreground space-y-1 text-sm">
            <a href="https://www.google.com/maps/place/Officina+Del+Panino+-+Rimini/@44.0592474,12.5601417,17z/data=!3m1!4b1!4m6!3m5!1s0x132cc3400c5cc94b:0xc915d079235ec43e!8m2!3d44.0592474!4d12.5627166!16s%2Fg%2F11h_wy233j" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline underline-offset-2">Via Circonvallazione Occ. 70</a>
            <p className="pt-1">Tel: 0541 141 9757</p>
          </address>
          <div className="mt-4 text-sm text-muted-foreground space-y-1">
            {t.rimini_hours[lang].split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        {/* Santarcangelo */}
        <div>
          <h4 className="font-display text-base mb-4 uppercase tracking-wider text-primary">Santarcangelo</h4>
          <address className="not-italic text-muted-foreground space-y-1 text-sm">
            <a href="https://www.google.com/maps/place/Officina+Del+Panino+-+Santarcangelo/@44.0623582,12.4425889,17z/data=!3m1!4b1!4m6!3m5!1s0x132cc10031ca2e5b:0x6025f48f4bc5a6ea!8m2!3d44.0623582!4d12.4451638!16s%2Fg%2F11yp4jgy2k" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline underline-offset-2">P.za G. Marconi, 10<br/>47822 Santarcangelo di Romagna</a>
            <p className="pt-1">Tel: 0541 184 0930</p>
          </address>
          <div className="mt-4 text-sm text-muted-foreground space-y-1">
            {t.santa_hours[lang].split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-display text-base mb-4 uppercase tracking-wider">{lang === "it" ? "SEGUICI" : "FOLLOW US"}</h4>
          <div className="flex gap-4 mb-6">
            <a
              href="https://www.instagram.com/officinadelpanino.rimini/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              data-testid="social-instagram"
              className="w-10 h-10 bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <SiInstagram size={18} />
            </a>
            <a
              href="https://www.facebook.com/officinadelpaninorimini/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              data-testid="social-facebook"
              className="w-10 h-10 bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <SiFacebook size={18} />
            </a>
            <a
              href="https://www.tiktok.com/@officinadelpanino"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              data-testid="social-tiktok"
              className="w-10 h-10 bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <SiTiktok size={18} />
            </a>
          </div>

          {/* Ordina Ora */}
          <h4 className="font-display text-base mb-4 uppercase tracking-wider">{lang === "it" ? "ORDINA ORA" : "ORDER NOW"}</h4>
          <div className="flex gap-3">
            <a
              href="https://www.justeat.it/restaurants-officina-del-panino-rimini-47923/menu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Just Eat"
              className="w-14 h-14 border border-border bg-card hover:border-primary transition-colors flex items-center justify-center"
            >
              <SiJusteat size={28} className="text-orange-500" />
            </a>
            <a
              href="tel:+390541419757"
              aria-label="Chiama Rimini"
              className="w-14 h-14 border border-border bg-card hover:border-primary transition-colors flex items-center justify-center overflow-hidden"
            >
              <img
                src="/images/logo-transparent.webp"
                alt="Rimini"
                className="w-24 h-24 object-contain scale-150"
              />
            </a>
            <a
              href="tel:+390541840930"
              aria-label="Chiama Santarcangelo"
              className="w-14 h-14 border border-border bg-card hover:border-primary transition-colors flex items-center justify-center p-1"
            >
              <img
                src="/images/logo-santarcangelo.png"
                alt="Santarcangelo"
                className="w-full h-full object-contain"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} Officina del Panino. {t.rights[lang]}</p>
        <a
          href="https://www.instagram.com/fabioshkurta7/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 text-muted-foreground/60 hover:text-primary transition-colors duration-300"
        >
          <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
          <span className="font-display text-[10px] tracking-[0.25em] uppercase">Powered by Fabio Shkurta</span>
          <span className="w-4 h-px bg-current transition-all duration-300 group-hover:w-6" />
        </a>
      </div>
    </footer>
  );
}
