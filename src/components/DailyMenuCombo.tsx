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
  const total = combo.items.reduce((sum, item) => sum + item.price, 0);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "sandwich":
        return lang === "it" ? "Panino" : "Sandwich";
      case "drink":
        return lang === "it" ? "Bevanda" : "Drink";
      case "side":
        return lang === "it" ? "Contorno" : "Side";
      default:
        return "";
    }
  };

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
              <div className="flex items-center justify-center gap-1 md:gap-8 flex-wrap">
                {combo.items.map((item, idx) => (
                  <div key={idx}>
                    {idx > 0 && <div className="text-lg md:text-2xl font-light text-primary/50 mb-6">+</div>}
                    <div className="flex flex-col items-center">
                      <p className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground mb-1 font-semibold">
                        {getTypeLabel(item.type)}
                      </p>
                      <p className="text-sm md:text-lg font-display font-bold text-foreground">{item.name}</p>
                      <p className="text-muted-foreground text-xs md:text-sm mt-0.5">{item.price}€</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Second row: total price */}
              <div className="flex items-center justify-center gap-2 md:gap-4">
                <div className="flex flex-col items-center">
                  <p className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground mb-1 font-semibold">
                    =
                  </p>
                  <p className="text-xl md:text-4xl font-display font-bold text-foreground">
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
