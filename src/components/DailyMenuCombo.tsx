import { getTodaysCombo } from "@/lib/daily-combos";
import { useLang } from "@/context/LanguageContext";

export function DailyMenuCombo() {
  const { lang } = useLang();
  const combo = getTodaysCombo();

  const total = combo.sandwich.price + combo.drink.price + combo.side.price;

  return (
    <div className="py-8 px-4 md:py-12 md:px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-4 md:gap-6">
          {/* First row: items */}
          <div className="flex items-center justify-center gap-1 md:gap-8">
            {/* Sandwich */}
            <div className="flex flex-col items-center">
              <p className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground mb-1 font-semibold">
                {lang === "it" ? "Panino" : "Sandwich"}
              </p>
              <p className="text-sm md:text-lg font-display font-bold text-foreground">{combo.sandwich.name}</p>
              <p className="text-muted-foreground text-xs md:text-sm mt-0.5">{combo.sandwich.price}€</p>
            </div>

            {/* Plus Sign */}
            <div className="text-lg md:text-2xl font-light text-primary/50">+</div>

            {/* Drink */}
            <div className="flex flex-col items-center">
              <p className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground mb-1 font-semibold">
                {lang === "it" ? "Bevanda" : "Drink"}
              </p>
              <p className="text-sm md:text-lg font-display font-bold text-foreground">
                {lang === "it" ? combo.drink.name : combo.drink.nameEn}
              </p>
              <p className="text-muted-foreground text-xs md:text-sm mt-0.5">{combo.drink.price}€</p>
            </div>

            {/* Plus Sign */}
            <div className="text-lg md:text-2xl font-light text-primary/50">+</div>

            {/* Side */}
            <div className="flex flex-col items-center">
              <p className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground mb-1 font-semibold">
                {lang === "it" ? "Contorno" : "Side"}
              </p>
              <p className="text-sm md:text-lg font-display font-bold text-foreground">
                {lang === "it" ? combo.side.name : combo.side.nameEn}
              </p>
              <p className="text-muted-foreground text-xs md:text-sm mt-0.5">{combo.side.price}€</p>
            </div>
          </div>

          {/* Second row: total price */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {/* Total Price */}
            <div className="flex flex-col items-center">
              <p className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground mb-1 font-semibold">
                =
              </p>
              <p className="text-xl md:text-4xl font-display font-bold text-primary">
                {total.toFixed(2)}€
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
