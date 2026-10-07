export const APP_STORE_URL = "https://apps.apple.com/it/app/officina-del-panino-rimini/id6746928336";
export const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=it.officinadelpaninorimini.pienissimo&pli=1";

export function getSmartAppLink(): string {
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return GOOGLE_PLAY_URL;
  if (/iphone|ipad|ipod/i.test(ua)) return APP_STORE_URL;
  return APP_STORE_URL;
}
