import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu as MenuIcon, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const { lang, setLang } = useLang();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = {
    it: [
      { href: "/", label: "Home", testId: "home" },
      { href: "/menu", label: "Menu", testId: "menu" },
      { href: "/gallery", label: "Galleria", testId: "gallery" },
      { href: "/contact", label: "Dove siamo", testId: "contact" },
      { href: "/contatti", label: "Contatti", testId: "contatti" },
    ],
    en: [
      { href: "/", label: "Home", testId: "home" },
      { href: "/menu", label: "Menu", testId: "menu" },
      { href: "/gallery", label: "Gallery", testId: "gallery" },
      { href: "/contact", label: "Find Us", testId: "contact" },
      { href: "/contatti", label: "Contact", testId: "contatti" },
    ]
  };

  const currentLinks = links[lang];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 navbar-wood border-b border-[#3a1a08] transition-shadow duration-300 ${scrolled ? "shadow-[0_4px_30px_rgba(0,0,0,0.75)]" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 h-[68px] md:h-20 flex items-center justify-between">
        <Link href="/" className="hover:opacity-90 transition-opacity block" style={{ overflow: "visible" }} data-testid="nav-logo">
          <img
            src="/images/logo-transparent.png"
            alt="Officina del Panino"
            className="h-[68px] md:h-20 w-auto"
            onLoad={() => setLogoLoaded(true)}
            style={{
              filter: logoLoaded ? "drop-shadow(0 0 5px #ffffff) drop-shadow(0 0 12px #fff5cc) drop-shadow(0 0 24px #ffd060) drop-shadow(0 0 40px #ffaa20)" : "none",
              overflow: "visible",
              transition: "filter 0.4s ease",
            }}
          />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {currentLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-display tracking-widest uppercase text-sm transition-colors hover:text-white ${
                location === link.href ? "text-white font-bold" : "text-[#f5e6d8]"
              }`}
              data-testid={`nav-link-${link.testId}`}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={() => setLang(lang === "it" ? "en" : "it")}
            data-testid="lang-toggle"
            className="font-display text-sm border border-[#f5e6d8]/40 text-[#f5e6d8] px-3 py-1 hover:border-white hover:text-white transition-colors tracking-widest"
          >
            {lang === "it" ? "EN" : "IT"}
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={() => setLang(lang === "it" ? "en" : "it")}
            data-testid="lang-toggle"
            className="font-display text-sm border border-[#f5e6d8]/40 text-[#f5e6d8] px-3 py-1 hover:border-white hover:text-white transition-colors tracking-widest"
          >
            {lang === "it" ? "EN" : "IT"}
          </button>
          <button
            className="text-[#f5e6d8] hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="nav-mobile-toggle"
          >
            {isOpen ? <X size={28} /> : <MenuIcon size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-[68px] md:top-20 left-0 w-full navbar-wood border-b border-[#3a1a08] py-4 px-6 flex flex-col gap-4 shadow-lg">
          {currentLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`font-display tracking-widest uppercase text-xl py-2 transition-colors ${
                location === link.href ? "text-white font-bold" : "text-[#f5e6d8]"
              }`}
              data-testid={`nav-mobile-link-${link.testId}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
