import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Check } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function Contatti() {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText("officinadelpanino1@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const t = {
    title:  { it: "CONTATTI",  en: "CONTACTS" },
    sub:    { it: "Per qualche domanda o dubbio potete scriverci.", en: "For any question or doubt, feel free to write to us." },
    phones: { it: "TELEFONO",    en: "PHONE" },
    email:  { it: "EMAIL",       en: "EMAIL" },
  };

  return (
    <div className="w-full pt-32 pb-24 min-h-screen">
      <div className="max-w-2xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-5xl md:text-7xl font-display text-primary mb-4">{t.title[lang]}</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-10"
        >
          {/* Email */}
          <div>
            <h3 className="font-display text-xs tracking-widest uppercase text-muted-foreground mb-4">
              {t.email[lang]}
            </h3>
            <button
              onClick={copyEmail}
              className="w-full flex items-center gap-4 border border-border bg-card px-5 py-4 hover:border-primary transition-colors group cursor-pointer"
            >
              {copied ? <Check size={18} className="text-primary shrink-0" /> : <Mail size={18} className="text-primary shrink-0" />}
              <p className="font-mono text-base text-foreground group-hover:text-primary transition-colors">
                {copied ? (lang === "it" ? "Copiato!" : "Copied!") : "officinadelpanino1@gmail.com"}
              </p>
            </button>
          </div>

          {/* Phones */}
          <div>
            <h3 className="font-display text-xs tracking-widest uppercase text-muted-foreground mb-4">
              {t.phones[lang]}
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:+390541419757"
                className="flex-1 flex items-center gap-4 border border-border bg-card px-5 py-4 hover:border-primary hover:text-primary text-muted-foreground transition-colors group"
              >
                <Phone size={18} className="text-primary shrink-0" />
                <div>
                  <p className="font-display text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">Rimini</p>
                  <p className="font-mono text-base text-foreground group-hover:text-primary transition-colors">0541 141 9757</p>
                </div>
              </a>
              <a
                href="tel:+3905411840930"
                className="flex-1 flex items-center gap-4 border border-border bg-card px-5 py-4 hover:border-primary hover:text-primary text-muted-foreground transition-colors group"
              >
                <Phone size={18} className="text-primary shrink-0" />
                <div>
                  <p className="font-display text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5">Santarcangelo</p>
                  <p className="font-mono text-base text-foreground group-hover:text-primary transition-colors">0541 184 0930</p>
                </div>
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
