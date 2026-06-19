import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { SiInstagram } from "react-icons/si";
import { useLang } from "@/context/LanguageContext";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const posts = [
  "https://www.instagram.com/p/DY6wH0HIzyS/",
  "https://www.instagram.com/p/DQ1nBVECIkz/",
  "https://www.instagram.com/p/DILpNf4Ibzn/",
  "https://www.instagram.com/p/CodK6hQoB3r/",
  "https://www.instagram.com/p/CNVQprXlNwL/",
  "https://www.instagram.com/p/CBVLVVaIAek/",
];

function InstagramPost({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, []);

  return (
    <div ref={ref} className="w-full flex justify-center">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          background: "#FFF",
          border: 0,
          borderRadius: "3px",
          boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
          margin: "1px",
          maxWidth: "540px",
          minWidth: "326px",
          padding: 0,
          width: "100%",
        }}
      />
    </div>
  );
}

export default function Social() {
  const { lang } = useLang();

  useEffect(() => {
    const existing = document.getElementById("instagram-embed-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "instagram-embed-script";
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, []);

  const t = {
    title:   { it: "I NOSTRI POST",    en: "OUR POSTS" },
    sub:     { it: "Seguici su Instagram per restare aggiornato.", en: "Follow us on Instagram to stay updated." },
    follow:  { it: "SEGUICI SU INSTAGRAM", en: "FOLLOW US ON INSTAGRAM" },
    empty:   { it: "Nessun post ancora. Torna presto!", en: "No posts yet. Check back soon!" },
  };

  return (
    <div className="w-full pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <SiInstagram size={28} className="text-primary" />
            <h1 className="font-display text-4xl md:text-5xl text-foreground uppercase tracking-widest">
              {t.title[lang]}
            </h1>
          </div>
          <div className="w-12 h-px bg-primary mx-auto mb-6" />
          <p className="text-muted-foreground text-sm tracking-wide">{t.sub[lang]}</p>
          <a
            href="https://www.instagram.com/officinadelpanino.rimini/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 border border-primary text-primary font-display uppercase tracking-widest text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <SiInstagram size={16} />
            {t.follow[lang]}
          </a>
        </motion.div>

        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground">{t.empty[lang]}</p>
        ) : (
          <div className="flex flex-col items-center gap-8">
            {posts.map((url, i) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="w-full max-w-[540px]"
              >
                <InstagramPost url={url} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
