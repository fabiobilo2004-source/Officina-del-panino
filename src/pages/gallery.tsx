import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const photos = [
  { src: "/images/gallery-paninivicini.jpg",  alt: "Cinque panini vicini con ripieni diversi",             titleKey: "vicini" },
  { src: "/images/gallery-panino-castle.png", alt: "Panino davanti al Castel Sismondo di Rimini",          titleKey: "castle" },
  { src: "/images/storefront.jpg",            alt: "Officina del Panino Storefront",                       titleKey: "workshop" },
  { src: "/images/panini-trio.jpg",           alt: "Tre panini misti con lattuga e cheesesteak",           titleKey: "trio" },
  { src: "/images/panini-wings.jpg",          alt: "Panini con onion rings e chicken wings",               titleKey: "wings" },
  { src: "/images/sandwich1.jpg",             alt: "Loaded Sandwich with Rucola and Meatballs",            titleKey: "masterpiece" },
  { src: "/images/panino-patate.jpg",         alt: "Panino con patate e scamorza filante",                 titleKey: "patate" },
  { src: "/images/sala.jpg",                  alt: "Sala interna con pareti industrial e piante",          titleKey: "sala" },
  { src: "/images/interno.jpg",               alt: "Interno del locale con lampadine Edison",              titleKey: "interno" },
  { src: "/images/sandwiches-bag.jpg",        alt: "Sandwiches with Coca-Cola and Birra Moretti",          titleKey: "latenight" },
  { src: "/images/panino-pollo.webp",         alt: "Panino con pollo croccante, lattuga e patate",         titleKey: "pollo" },
  { src: "/images/panino-rucola.webp",        alt: "Panino con rucola, parmigiano e pomodorini",           titleKey: "rucola" },
  { src: "/images/panino-verdure.webp",       alt: "Panino con verdure e patate al forno",                 titleKey: "verdure" },
  { src: "/images/panino-melanzane.webp",     alt: "Panino con melanzane grigliate",                       titleKey: "melanzane" },
  { src: "/images/panino-heinz.jpg",          alt: "Panino con Heinz Classic Burger Sauce",                 titleKey: "heinz" },
  { src: "/images/wings-cheesefries.jpg",     alt: "Chicken wings e cheesefries",                           titleKey: "wingsfries" },
];

export default function Gallery() {
  const { lang } = useLang();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const t = {
    title: { it: "GALLERIA", en: "GALLERY" },
    sub: { it: "Uno sguardo all'interno dell'officina.", en: "A look inside the workshop." },
    titles: {
      vicini:      { it: "Tutti i Sapori",       en: "All the Flavours" },
      castle:      { it: "Panino al Castello",   en: "Sandwich at the Castle" },
      workshop:    { it: "L'Officina",           en: "The Workshop" },
      trio:        { it: "Il Trio",             en: "The Trio" },
      masterpiece: { it: "Il Capolavoro",       en: "The Masterpiece" },
      patate:      { it: "Patate & Scamorza",   en: "Potatoes & Scamorza" },
      wings:       { it: "Wings & Onion Rings",  en: "Wings & Onion Rings" },
      sala:        { it: "La Sala",            en: "The Dining Room" },
      interno:     { it: "L'Interno",          en: "Inside" },
      latenight:   { it: "Combo Notturno",      en: "Late-Night Combo" },
      board:       { it: "Il Nostro Menu",      en: "Our Menu Board" },
      pollo:       { it: "Pollo Croccante",     en: "Crispy Chicken" },
      rucola:      { it: "Rucola & Parmigiano", en: "Rocket & Parmesan" },
      verdure:     { it: "Verdure & Patate",    en: "Roasted Veg & Potatoes" },
      melanzane:   { it: "Melanzane Grigliate", en: "Grilled Aubergine" },
      heinz:       { it: "Heinz Burger Sauce",  en: "Heinz Burger Sauce" },
      wingsfries:  { it: "Wings & Cheesefries", en: "Wings & Cheesefries" },
    } as Record<string, { it: string, en: string }>
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === null ? null : (prev === 0 ? photos.length - 1 : prev - 1)));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === null ? null : (prev === photos.length - 1 ? 0 : prev + 1)));
  };

  return (
    <div className="w-full pt-32 pb-24 min-h-screen relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-display text-primary mb-4">{t.title[lang]}</h1>
          <p className="text-xl text-muted-foreground">{t.sub[lang]}</p>
        </motion.div>

        {/* Vertical grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2">
          {photos.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="group relative overflow-hidden bg-card cursor-pointer"
              style={{ aspectRatio: "1/1" }}
              onClick={() => setSelectedIndex(i)}
              data-testid={`gallery-img-${i}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              className="absolute top-6 right-6 text-white hover:text-primary transition-colors p-2 z-10"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
            >
              <X size={36} />
            </button>

            <button
              className="absolute left-4 md:left-12 text-white/50 hover:text-white transition-colors p-4 z-10"
              onClick={handlePrev}
            >
              <ChevronLeft size={48} />
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-5xl max-h-[80vh] w-full px-12 md:px-24 flex items-center justify-center flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[selectedIndex].src}
                alt={photos[selectedIndex].alt}
                className="max-h-[70vh] object-contain shadow-2xl border border-border/20"
              />
            </motion.div>

            <button
              className="absolute right-4 md:right-12 text-white/50 hover:text-white transition-colors p-4 z-10"
              onClick={handleNext}
            >
              <ChevronRight size={48} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
