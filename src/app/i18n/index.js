// Simple i18n module for RiskRadar (Fase 2.6)
const DICTS = {
  nl: {
    "app.title": "RiskRadar",
    "nav.home": "Home",
    "nav.coins": "Coins",
    "nav.settings": "Instellingen",
    "nav.language": "Taal",
    "lang.nl": "Nederlands",
    "lang.de": "Duits",
    "lang.en": "Engels",
    "settings.title": "Instellingen",
    "settings.theme": "Thema",
    "settings.language": "Taal",
    "theme.dark": "Donker",
    "theme.light": "Licht",
    "settings.note": "(Thema en taal worden opgeslagen.)",
    "search.placeholder": "Zoek op naam of symbool…",
    "search.clear": "Wis",
    "coins.tabs.all": "Alle coins",
    "coins.tabs.gainers": "Stijgers",
    "coins.tabs.losers": "Dalers"
    ,"home.intro": "Zoek direct naar een coin. Klik op een resultaat voor details."
    ,"home.search.placeholder.long": "Zoek op naam of symbool (bijv. BTC, ETH, DOGE)..."
    ,"home.search.type": "Typ om te zoeken"
    ,"watchlist.empty": "Nog geen coins in je watchlist"
    ,"home.tip": "Tip: je kunt zoeken op naam (“bitcoin”) of symbool (“BTC”). Klik op een resultaat voor details."
    ,"trend.up": "Stijgend"
    ,"trend.down": "Dalend"
    ,"trend.flat": "Zijwaarts"
    ,"trend.insufficient": "Onvoldoende data"
    ,"pred.title": "Verwachte prijs ({range}) voor {hours} uur:"
    ,"pred.obs": "Geobserveerde trend"
    ,"pred.lastpoints": "Laatste 30 datapoints"
    ,"pred.loadfail": "Kon voorspelling niet laden"
  },
  de: {
    "app.title": "RiskRadar",
    "nav.home": "Start",
    "nav.coins": "Coins",
    "nav.settings": "Einstellungen",
    "nav.language": "Sprache",
    "lang.nl": "Niederländisch",
    "lang.de": "Deutsch",
    "lang.en": "Englisch",
    "settings.title": "Einstellungen",
    "settings.theme": "Thema",
    "settings.language": "Sprache",
    "theme.dark": "Dunkel",
    "theme.light": "Hell",
    "settings.note": "(Thema und Sprache werden gespeichert.)",
    "search.placeholder": "Suche nach Name oder Symbol…",
    "search.clear": "Löschen",
    "coins.tabs.all": "Alle Coins",
    "coins.tabs.gainers": "Gewinner",
    "coins.tabs.losers": "Verlierer"
    ,"home.intro": "Suche direkt nach einer Coin. Klicke für Details auf ein Ergebnis."
    ,"home.search.placeholder.long": "Nach Name oder Symbol suchen (z. B. BTC, ETH, DOGE)…"
    ,"home.search.type": "Zum Suchen tippen"
    ,"watchlist.empty": "Noch keine Coins in deiner Watchlist"
    ,"home.tip": "Tipp: Du kannst nach Namen („bitcoin“) oder Symbol („BTC“) suchen. Klicke auf ein Ergebnis für Details."
    ,"trend.up": "Steigend"
    ,"trend.down": "Fallend"
    ,"trend.flat": "Seitwärts"
    ,"trend.insufficient": "Unzureichende Daten"
    ,"pred.title": "Erwarteter Preis ({range}) für {hours} Std.:"
    ,"pred.obs": "Beobachteter Trend"
    ,"pred.lastpoints": "Letzte 30 Datenpunkte"
    ,"pred.loadfail": "Vorhersage konnte nicht geladen werden"
  },
  en: {
    "app.title": "RiskRadar",
    "nav.home": "Home",
    "nav.coins": "Coins",
    "nav.settings": "Settings",
    "nav.language": "Language",
    "lang.nl": "Dutch",
    "lang.de": "German",
    "lang.en": "English",
    "settings.title": "Settings",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "theme.dark": "Dark",
    "theme.light": "Light",
    "settings.note": "(Theme and language are saved.)",
    "search.placeholder": "Search by name or symbol…",
    "search.clear": "Clear",
    "coins.tabs.all": "All coins",
    "coins.tabs.gainers": "Gainers",
    "coins.tabs.losers": "Losers"
    ,"home.intro": "Search directly for a coin. Click a result for details."
    ,"home.search.placeholder.long": "Search by name or symbol (e.g. BTC, ETH, DOGE)..."
    ,"home.search.type": "Type to search"
    ,"watchlist.empty": "No coins in your watchlist yet"
    ,"home.tip": "Tip: you can search by name (“bitcoin”) or symbol (“BTC”). Click a result for details."
    ,"trend.up": "Rising"
    ,"trend.down": "Falling"
    ,"trend.flat": "Sideways"
    ,"trend.insufficient": "Insufficient data"
    ,"pred.title": "Expected price ({range}) for {hours} hours:"
    ,"pred.obs": "Observed trend"
    ,"pred.lastpoints": "Last 30 datapoints"
    ,"pred.loadfail": "Could not load prediction"
  }
};

let _locale = localStorage.getItem('rr_locale') || 'nl';
if (!DICTS[_locale]) _locale = 'nl';
document.documentElement.setAttribute('lang', _locale);
localStorage.setItem('rr_locale', _locale);

const listeners = new Set();

export function getLocale(){ return _locale; }
export function t(key){
  const dict = DICTS[_locale] || DICTS['nl'];
  return dict[key] || key;
}
export function setLocale(next){
  const v = (next || '').toLowerCase();
  if (!DICTS[v]) return;
  if (v === _locale) return;
  _locale = v;
  localStorage.setItem('rr_locale', _locale);
  document.documentElement.setAttribute('lang', _locale);
  // notify
  listeners.forEach(fn => { try { fn(_locale); } catch(e){} });
  window.dispatchEvent(new CustomEvent('rr:locale', { detail: { locale: _locale }}));
}
export function onLocaleChange(fn){
  listeners.add(fn);
  return () => listeners.delete(fn);
}
