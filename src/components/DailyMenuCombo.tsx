import { useRef } from "react";
import { dailyCombos } from "@/lib/daily-combos";
import { useLang } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DailyMenuCombo() {
  const { lang } = useLang();
  const scrollRef = useRef<HTMLDivElement>(null);
  const combosToShow = dailyCombos.slice(0, 10);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="py-8 px-4 md:py-12 md:px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="flex-shrink-0 p-2 hover:bg-primary/10 rounded transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="text-primary" />
          </button>

          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-4 md:gap-6 pb-2"
            style={{ scrollBehavior: "smooth" }}
          >
            {combosToShow.map((combo, idx) => {
              const total = combo.sandwich.price + combo.drink.price + combo.side.price;
              return (
                <div
                  key={idx}
                  className="flex-shrink-0 w-80 md:w-96 snap-center p-4 md:p-6 rounded border border-border/30 bg-card"
                >
                  <div className="flex flex-col gap-4">
                    {/* First row: items */}
                    <div className="flex items-center justify-center gap-1 md:gap-4">
                      {/* Sandwich */}
                      <div className="flex flex-col items-center flex-1">
                        <p className="text-[9px] md:text-xs tracking-widest uppercase text-muted-foreground mb-1 font-semibold">
                          {lang === "it" ? "Panino" : "Sandwich"}
                        </p>
                        <p className="text-xs md:text-sm font-display font-bold text-foreground text-center">{combo.sandwich.name}</p>
                        <p className="text-muted-foreground text-[10px] md:text-xs mt-0.5">{combo.sandwich.price}€</p>
                      </div>

                      {/* Plus Sign */}
                      <div className="text-base md:text-lg font-light text-primary/50">+</div>

                      {/* Drink */}
                      <div className="flex flex-col items-center flex-1">
                        <p className="text-[9px] md:text-xs tracking-widest uppercase text-muted-foreground mb-1 font-semibold">
                          {lang === "it" ? "Bevanda" : "Drink"}
                        </p>
                        <p className="text-xs md:text-sm font-display font-bold text-foreground text-center">
                          {lang === "it" ? combo.drink.name : combo.drink.nameEn}
                        </p>
                        <p className="text-muted-foreground text-[10px] md:text-xs mt-0.5">{combo.drink.price}€</p>
                      </div>

                      {/* Plus Sign */}
                      <div className="text-base md:text-lg font-light text-primary/50">+</div>

                      {/* Side */}
                      <div className="flex flex-col items-center flex-1">
                        <p className="text-[9px] md:text-xs tracking-widest uppercase text-muted-foreground mb-1 font-semibold">
                          {lang === "it" ? "Contorno" : "Side"}
                        </p>
                        <p className="text-xs md:text-sm font-display font-bold text-foreground text-center">
                          {lang === "it" ? combo.side.name : combo.side.nameEn}
                        </p>
                        <p className="text-muted-foreground text-[10px] md:text-xs mt-0.5">{combo.side.price}€</p>
                      </div>
                    </div>

                    {/* Second row: total price */}
                    <div className="flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <p className="text-[9px] md:text-xs tracking-widest uppercase text-muted-foreground mb-1 font-semibold">
                          =
                        </p>
                        <p className="text-lg md:text-2xl font-display font-bold text-primary">
                          {total.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="flex-shrink-0 p-2 hover:bg-primary/10 rounded transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
