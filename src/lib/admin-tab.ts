// Il pannello admin compare solo nella scheda in cui si è entrati da /admin:
// chi apre il sito normalmente lo vede senza pannello, anche se ha un login ancora valido.
const KEY = "admin-tab";

export function isAdminTab() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setAdminTab(on: boolean) {
  try {
    if (on) sessionStorage.setItem(KEY, "1");
    else sessionStorage.removeItem(KEY);
  } catch {
    // senza sessionStorage il pannello resta chiuso: si rientra da /admin
  }
}
