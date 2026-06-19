import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "it" | "en";
type LanguageContextType = { lang: Lang; setLang: (l: Lang) => void };
const LanguageContext = createContext<LanguageContextType>({ lang: "it", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("it");
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}
