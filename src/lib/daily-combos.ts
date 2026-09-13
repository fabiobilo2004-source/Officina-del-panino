export interface ComboItem {
  type: "sandwich" | "drink" | "side";
  name: string;
  nameEn?: string;
  price: number;
}

export interface DailyCombo {
  items: ComboItem[];
}

export const dailyCombos: DailyCombo[] = [
  // Combo 1: 1 panino + 1 bevanda + 1 contorno
  {
    items: [
      { type: "sandwich", name: "Chiave", price: 10 },
      { type: "drink", name: "Coca Cola in vetro", nameEn: "Coca Cola (glass)", price: 3 },
      { type: "side", name: "Patatine fritte", nameEn: "French fries", price: 5 },
    ],
  },
  // Combo 2: 2 panini + 2 bibite (senza contorno)
  {
    items: [
      { type: "sandwich", name: "Trapano", price: 11 },
      { type: "sandwich", name: "Bullone", price: 10 },
      { type: "drink", name: "Coca Cola Zero in lattina", nameEn: "Coca Cola Zero (can)", price: 2.5 },
      { type: "drink", name: "Sprite in lattina", nameEn: "Sprite (can)", price: 2.5 },
    ],
  },
  // Combo 3: 1 panino + 1 bibita (senza contorno)
  {
    items: [
      { type: "sandwich", name: "Biella", price: 11 },
      { type: "drink", name: "Fanta in lattina", nameEn: "Fanta (can)", price: 2.5 },
    ],
  },
  // Combo 4: 1 panino + 2 bibite + 1 contorno
  {
    items: [
      { type: "sandwich", name: "Carrucola 2.0", price: 12 },
      { type: "drink", name: "Moretti 33 CL", nameEn: "Moretti (33CL)", price: 3 },
      { type: "drink", name: "Acqua Naturale 0.5L", nameEn: "Still Water 0.5L", price: 1.2 },
      { type: "side", name: "Alette di pollo", nameEn: "Chicken wings", price: 5 },
    ],
  },
  // Combo 5: 2 panini + 1 bibita + 1 contorno
  {
    items: [
      { type: "sandwich", name: "Martello", price: 11 },
      { type: "sandwich", name: "Pistone", price: 10 },
      { type: "drink", name: "Heineken 33 CL", nameEn: "Heineken (33CL)", price: 3 },
      { type: "side", name: "Straccetti di pollo", nameEn: "Chicken strips", price: 6 },
    ],
  },
  // Combo 6: 1 panino + 1 bibita + 2 contorni
  {
    items: [
      { type: "sandwich", name: "Trivella 2.0", price: 11 },
      { type: "drink", name: "Fuze Tea in lattina", nameEn: "Fuze Tea (can)", price: 2.5 },
      { type: "side", name: "Patatine fritte", nameEn: "French fries", price: 5 },
      { type: "side", name: "Onion rings", nameEn: "Onion rings", price: 5 },
    ],
  },
  // Combo 7: 3 panini + 1 bibita
  {
    items: [
      { type: "sandwich", name: "Incudine", price: 10 },
      { type: "sandwich", name: "Chiodo", price: 10 },
      { type: "sandwich", name: "Pinza 2.0", price: 12 },
      { type: "drink", name: "Coca Cola in vetro", nameEn: "Coca Cola (glass)", price: 3 },
    ],
  },
  // Combo 8: 1 panino + 1 bibita + 1 contorno
  {
    items: [
      { type: "sandwich", name: "Cacciavite", price: 11 },
      { type: "drink", name: "Sprite in lattina", nameEn: "Sprite (can)", price: 2.5 },
      { type: "side", name: "Patate al forno", nameEn: "Baked potatoes", price: 6 },
    ],
  },
  // Combo 9: 2 panini + 2 contorni (senza bibita)
  {
    items: [
      { type: "sandwich", name: "Candela", price: 9 },
      { type: "sandwich", name: "Perno", price: 8 },
      { type: "side", name: "Patatine fritte", nameEn: "French fries", price: 5 },
      { type: "side", name: "Alette di pollo", nameEn: "Chicken wings", price: 5 },
    ],
  },
  // Combo 10: 1 panino + 3 bibite
  {
    items: [
      { type: "sandwich", name: "Chiave", price: 10 },
      { type: "drink", name: "Coca Cola in vetro", nameEn: "Coca Cola (glass)", price: 3 },
      { type: "drink", name: "Sprite in lattina", nameEn: "Sprite (can)", price: 2.5 },
      { type: "drink", name: "Fanta in lattina", nameEn: "Fanta (can)", price: 2.5 },
    ],
  },
];

export function getTodaysCombo(): DailyCombo {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return dailyCombos[dayOfYear % dailyCombos.length];
}
