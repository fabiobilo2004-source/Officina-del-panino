// Sezioni del menu modificabili dal pannello admin. I dati stanno in src/content/site-edits.json → "menu".
import { useSyncExternalStore } from "react";
import { getEdits, subscribe, type MenuItem } from "@/lib/site-edits";

export type MenuField = "name" | "desc" | "price" | "qty" | "isNew" | "badge";

/** Per ogni sezione: nome mostrato nel pannello e campi che si compilano aggiungendo una voce */
export const MENU_SECTIONS: Record<string, { label: string; fields: MenuField[] }> = {
  proposte: { label: "Le nostre proposte", fields: ["name", "desc", "isNew"] },
  veg: { label: "Vegetariani e vegani (9€)", fields: ["name", "desc", "badge", "isNew"] },
  build_carni: { label: "Componi il tuo panino · Carni", fields: ["name"] },
  build_formaggi: { label: "Componi il tuo panino · Formaggi", fields: ["name"] },
  build_contorni: { label: "Componi il tuo panino · Contorni", fields: ["name"] },
  build_salse: { label: "Componi il tuo panino · Salse", fields: ["name"] },
  sfizi: { label: "I nostri sfizi", fields: ["name", "qty", "price"] },
  patatine_base: { label: "Patatine · Patate", fields: ["name", "price"] },
  patatine_formaggi: { label: "Patatine · Formaggio", fields: ["name", "price"] },
  patatine_carni: { label: "Patatine · Carne", fields: ["name", "price"] },
  insalate: { label: "Le nostre insalate", fields: ["name", "desc"] },
  birre: { label: "Birre", fields: ["name", "price"] },
  vini: { label: "Vini", fields: ["name", "price"] },
  bevande: { label: "Bevande / bibite", fields: ["name", "price"] },
};

export type MenuSection = keyof typeof MENU_SECTIONS;

/** Le voci di una sezione, aggiornate quando l'admin le modifica */
export function useMenuSection(section: MenuSection): MenuItem[] {
  return useSyncExternalStore(subscribe, () => getEdits().menu?.[section]) ?? EMPTY;
}

const EMPTY: MenuItem[] = [];

export function itemName(item: MenuItem, lang: "it" | "en") {
  return lang === "en" && item.nameEn ? item.nameEn : item.name;
}

export function itemDesc(item: MenuItem, lang: "it" | "en") {
  return lang === "en" && item.descEn ? item.descEn : item.desc ?? "";
}
