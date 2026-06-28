import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Send, Check } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

type FormState = "idle" | "sending" | "sent" | "error";

function GearSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M57,4 L43,4 L40,14 C37,15 34,16 31,18 L22,14 L13,23 L17,32 C15,35 14,38 13,41 L3,44 L3,56 L13,59 C14,62 15,65 17,68 L13,77 L22,86 L31,82 C34,84 37,85 40,86 L43,96 L57,96 L60,86 C63,85 66,84 69,82 L78,86 L87,77 L83,68 C85,65 86,62 87,59 L97,56 L97,44 L87,41 C86,38 85,35 83,32 L87,23 L78,14 L69,18 C66,16 63,15 60,14 Z M65,50 A15,15 0 0,1 35,50 A15,15 0 0,1 65,50 Z"
      />
    </svg>
  );
}

export default function Contatti() {
  const { lang } = useLang();
  const [form, setForm] = useState({ nome: "", cognome: "", indirizzo: "", messaggio: "" });
  const [status, setStatus] = useState<FormState>("idle");

  const t = {
    title:       { it: "CONTATTI",       en: "CONTACTS" },
    phones:      { it: "TELEFONO",       en: "PHONE" },
    writeUs:     { it: "SCRIVICI",       en: "WRITE TO US" },
    nome:        { it: "Nome",           en: "First Name" },
    cognome:     { it: "Cognome",        en: "Last Name" },
    indirizzo:   { it: "Indirizzo email",en: "Email Address" },
    messaggio:   { it: "Messaggio",      en: "Message" },
    send:        { it: "Invia",          en: "Send" },
    sending:     { it: "Invio...",       en: "Sending..." },
    sent:        { it: "Messaggio inviato! Ti risponderemo presto.", en: "Message sent! We'll get back to you soon." },
    error:       { it: "Errore nell'invio. Riprova.", en: "Error sending. Please try again." },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("https://formsubmit.co/ajax/officinadelpanino1@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          Nome: form.nome,
          Cognome: form.cognome,
          Email: form.indirizzo,
          Messaggio: form.messaggio,
          _subject: `Nuovo messaggio da ${form.nome} ${form.cognome}`,
        }),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ nome: "", cognome: "", indirizzo: "", messaggio: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full bg-card border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors text-sm";

  return (
    <div className="w-full pt-32 pb-24 min-h-screen relative overflow-hidden">
      <GearSVG className="absolute -top-16 -right-16 w-80 h-80 text-white opacity-[0.05] gear-cw pointer-events-none select-none" aria-hidden="true" />
      <GearSVG className="absolute -bottom-12 -left-12 w-60 h-60 text-white opacity-[0.04] gear-ccw pointer-events-none select-none" aria-hidden="true" />
      <GearSVG className="absolute top-1/2 right-1/4 -translate-y-1/2 w-28 h-28 text-white opacity-[0.03] gear-cw-fast pointer-events-none select-none" aria-hidden="true" />
      <div className="max-w-2xl mx-auto px-6 relative z-10">

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

          {/* Contact form */}
          <div>
            <h3 className="font-display text-xs tracking-widest uppercase text-muted-foreground mb-4">
              {t.writeUs[lang]}
            </h3>

            {status === "sent" ? (
              <div className="flex items-center gap-3 border border-green-500/40 bg-green-500/10 text-green-400 px-5 py-4">
                <Check size={18} className="shrink-0" />
                <p className="text-sm">{t.sent[lang]}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={t.nome[lang]}
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    required
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder={t.cognome[lang]}
                    value={form.cognome}
                    onChange={(e) => setForm({ ...form, cognome: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
                <input
                  type="email"
                  placeholder={t.indirizzo[lang]}
                  value={form.indirizzo}
                  onChange={(e) => setForm({ ...form, indirizzo: e.target.value })}
                  required
                  className={inputClass}
                />
                <textarea
                  placeholder={t.messaggio[lang]}
                  value={form.messaggio}
                  onChange={(e) => setForm({ ...form, messaggio: e.target.value })}
                  required
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
                {status === "error" && (
                  <p className="text-red-400 text-xs">{t.error[lang]}</p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-display uppercase tracking-widest text-sm px-6 py-3.5 hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  <Send size={15} />
                  {status === "sending" ? t.sending[lang] : t.send[lang]}
                </button>
              </form>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

