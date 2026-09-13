import { getTodaysCombo } from "@/lib/daily-combos";
import { useLang } from "@/context/LanguageContext";

export function DailyMenuCombo() {
  const { lang } = useLang();
  const combo = getTodaysCombo();

  const total = combo.sandwich.price + combo.drink.price + combo.side.price;

  return (
    <div className="py-12 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-2 md:gap-8 overflow-x-auto">
          {/* Sandwich */}
          <div className="flex flex-col items-center">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2 font-semibold">
              {lang === "it" ? "Panino" : "Sandwich"}
            </p>
            <p className="text-lg md:text-xl font-display font-bold text-foreground">{combo.sandwich.name}</p>
            <p className="text-muted-foreground text-sm mt-1">{combo.sandwich.price}€</p>
          </div>

          {/* Plus Sign */}
          <div className="text-xl md:text-2xl font-light text-primary/50">+</div>

          {/* Drink */}
          <div className="flex flex-col items-center">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2 font-semibold">
              {lang === "it" ? "Bevanda" : "Drink"}
            </p>
            <p className="text-lg md:text-xl font-display font-bold text-foreground">
              {lang === "it" ? combo.drink.name : combo.drink.nameEn}
            </p>
            <p className="text-muted-foreground text-sm mt-1">{combo.drink.price}€</p>
          </div>

          {/* Plus Sign */}
          <div className="text-xl md:text-2xl font-light text-primary/50">+</div>

          {/* Side */}
          <div className="flex flex-col items-center">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2 font-semibold">
              {lang === "it" ? "Contorno" : "Side"}
            </p>
            <p className="text-lg md:text-xl font-display font-bold text-foreground">
              {lang === "it" ? combo.side.name : combo.side.nameEn}
            </p>
            <p className="text-muted-foreground text-sm mt-1">{combo.side.price}€</p>
          </div>

          {/* Equals Sign */}
          <div className="text-xl md:text-2xl font-light text-primary/50">=</div>

          {/* Total Price */}
          <div className="flex flex-col items-center border-l border-primary/30 pl-8 md:pl-8">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2 font-semibold">
              {lang === "it" ? "Prezzo" : "Price"}
            </p>
            <p className="text-3xl md:text-4xl font-display font-bold text-primary">
              {total.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
