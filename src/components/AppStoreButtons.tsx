import { SiApple } from "react-icons/si";
import { PiAndroidLogoFill } from "react-icons/pi";
import { useLang } from "@/context/LanguageContext";

const APP_STORE_URL = "https://apps.apple.com/it/app/officina-del-panino-rimini/id6746928336";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=it.officinadelpaninorimini.pienissimo&pli=1";

function AppStoreIcon({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/images/app-store-icon.jpg"
      alt="App Store"
      width={size}
      height={size}
      className="rounded-[22%] object-cover"
      style={{ width: size, height: size }}
    />
  );
}

function GooglePlayIcon({ size = 24 }: { size?: number }) {
  return (
    <img
      src="/images/google-play-icon.jpg"
      alt="Google Play"
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
    />
  );
}

export function AppStoreButtons({ className = "", variant = "badge", layout = "responsive" }: { className?: string; variant?: "badge" | "outline"; layout?: "responsive" | "col" | "row" }) {
  const { lang } = useLang();
  const direction = layout === "col" ? "flex-col" : layout === "row" ? "flex-row" : "flex-col sm:flex-row";
  const btnWidth = layout === "col" ? "w-full" : layout === "row" ? "w-auto" : "w-full sm:w-auto";

  if (variant === "outline") {
    return (
      <div className={`flex ${direction} items-center gap-3 ${className}`}>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="app-store-link"
          className="flex items-center gap-3 bg-background border border-border hover:border-foreground/40 rounded-lg px-5 py-2.5 transition-colors duration-200 w-full sm:w-auto justify-center"
        >
          <AppStoreIcon size={28} />
          <div className="flex flex-col items-start leading-none">
            <span className="text-muted-foreground text-[10px] tracking-wide">
              {lang === "it" ? "Scarica su" : "Download on the"}
            </span>
            <span className="text-foreground font-display text-lg leading-tight tracking-wide">App Store</span>
          </div>
        </a>

        <a
          href={GOOGLE_PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="google-play-link"
          className="flex items-center gap-3 bg-background border border-border hover:border-foreground/40 rounded-lg px-5 py-2.5 transition-colors duration-200 w-full sm:w-auto justify-center"
        >
          <GooglePlayIcon size={24} />
          <div className="flex flex-col items-start leading-none">
            <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
              {lang === "it" ? "Disponibile su" : "Get it on"}
            </span>
            <span className="text-foreground font-display text-lg leading-tight tracking-wide">Google Play</span>
          </div>
        </a>
      </div>
    );
  }

  return (
    <div className={`flex ${direction} items-center gap-2 md:gap-3 ${className}`}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="app-store-link"
        className={`group flex items-center gap-2 md:gap-3 bg-black hover:bg-black/80 border border-white/25 hover:border-primary rounded-lg px-3.5 md:px-5 py-1.5 md:py-2.5 transition-all duration-200 ${btnWidth} justify-center`}
      >
        <SiApple size={18} className="text-white md:w-6 md:h-6" />
        <div className="flex flex-col items-start leading-none">
          <span className="text-white/70 text-[8px] md:text-[10px] tracking-wide">
            {lang === "it" ? "Scarica su" : "Download on the"}
          </span>
          <span className="text-white font-display text-sm md:text-lg leading-tight tracking-wide">App Store</span>
        </div>
      </a>

      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="google-play-link"
        className={`group flex items-center gap-2 md:gap-3 bg-black hover:bg-black/80 border border-white/25 hover:border-primary rounded-lg px-3.5 md:px-5 py-1.5 md:py-2.5 transition-all duration-200 ${btnWidth} justify-center`}
      >
        <PiAndroidLogoFill size={18} className="text-white md:w-6 md:h-6" />
        <div className="flex flex-col items-start leading-none">
          <span className="text-white/70 text-[8px] md:text-[10px] tracking-wide uppercase">
            {lang === "it" ? "Disponibile su" : "Get it on"}
          </span>
          <span className="text-white font-display text-sm md:text-lg leading-tight tracking-wide">Google Play</span>
        </div>
      </a>
    </div>
  );
}
