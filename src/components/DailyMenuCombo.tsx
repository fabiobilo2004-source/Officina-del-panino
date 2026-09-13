import { useState } from "react";
import { dailyCombos } from "@/lib/daily-combos";
import { useLang } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DailyMenuCombo() {
  const { lang } = useLang();
  const [currentIdx, setCurrentIdx] = useState(0);
  const combosToShow = dailyCombos.slice(0, 10);

  const navigate = (direction: "left" | "right") => {
    if (direction === "left") {
      setCurrentIdx((prev) => (prev === 0 ? combosToShow.length - 1 : prev - 1));
    } else {
      setCurrentIdx((prev) => (prev === combosToShow.length - 1 ? 0 : prev + 1));
    }
  };

  const combo = combosToShow[currentIdx];
  const total = combo.sandwich.price + combo.drink.price + combo.side.price;

  return (
    <div className="py-8 px-4 md:py-12 md:px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Left Arrow */}
          <button
            onClick={() => navigate("left")}
            className="flex-shrink-0 p-2 hover:bg-primary/10 rounded transition-colors"
            aria-label="Previous combo"
          >
            <ChevronLeft size={20} className="text-primary" />
          </button>

          {/* Combo Display */}
          <div className="flex-1">
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

          {/* Right Arrow */}
          <button
            onClick={() => navigate("right")}
            className="flex-shrink-0 p-2 hover:bg-primary/10 rounded transition-colors"
            aria-label="Next combo"
          >
            <ChevronRight size={20} className="text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
