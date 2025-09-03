// Simple i18n system with in-memory dictionaries and event dispatch
const STORAGE_KEY = 'rr.lang';

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
    "search.placeholder": "Zoek op naam of symbool…",
    "search.placeholder.long": "Zoek op naam of symbool (bijv. BTC, ETH, DOGE)…",
    "search.clear": "Wis",
    "home.title": "Welkom",
    "home.intro": "Zoek direct naar een coin. Klik op een resultaat voor details.",
    "home.search.type": "Typ om te zoeken",
    "watchlist.empty": "Nog geen coins in je watchlist",
    "coins.tabs.all": "Alle coins",
    "coins.tabs.gainers": "Stijgers",
    "coins.tabs.losers": "Dalers",
    "trend.up": "Stijgend",
    "trend.down": "Dalend",
    "trend.flat": "Zijwaarts",
    "trend.insufficient": "Onvoldoende data",
    "pred.title": "Verwachte prijs ({range}) voor {hours} uur:",
    "pred.obs": "Geobserveerde trend",
    "pred.lastpoints": "Laatste 30 datapoints",
    "pred.loadfail": "Kon voorspelling niet laden",
    "router.compare.title": "Vergelijk",
    "router.compare.body": "Vergelijk-functionaliteit wordt in een latere fase geactiveerd.",
    "router.portfolio.title": "Portefeuille",
    "router.portfolio.body": "Portefeuille-functionaliteit wordt in een latere fase geactiveerd.",
    "router.pro.title": "Pro",
    "router.pro.body": "Pro-functies worden in een latere fase geactiveerd."
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
    "search.placeholder": "Suche nach Name oder Symbol…",
    "search.placeholder.long": "Suche nach Name oder Symbol (z. B. BTC, ETH, DOGE)…",
    "search.clear": "Löschen",
    "home.title": "Willkommen",
    "home.intro": "Suche direkt nach einem Coin. Klicke auf ein Ergebnis für Details.",
    "home.search.type": "Zum Suchen tippen",
    "watchlist.empty": "Noch keine Coins in deiner Watchlist",
    "coins.tabs.all": "Alle Coins",
    "coins.tabs.gainers": "Steiger",
    "coins.tabs.losers": "Verlierer",
    "trend.up": "Steigend",
    "trend.down": "Fallend",
    "trend.flat": "Seitwärts",
    "trend.insufficient": "Unzureichende Daten",
    "pred.title": "Erwarteter Preis ({range}) für {hours} Stunden:",
    "pred.obs": "Beobachteter Trend",
    "pred.lastpoints": "Letzte 30 Datenpunkte",
    "pred.loadfail": "Vorhersage konnte nicht geladen werden",
    "router.compare.title": "Vergleichen",
    "router.compare.body": "Vergleich wird in einer späteren Phase aktiviert.",
    "router.portfolio.title": "Portfolio",
    "router.portfolio.body": "Portfolio wird in einer späteren Phase aktiviert.",
    "router.pro.title": "Pro",
    "router.pro.body": "Pro-Funktionen werden in einer späteren Phase aktiviert."
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
    "search.placeholder": "Search by name or symbol…",
    "search.placeholder.long": "Search by name or symbol (e.g., BTC, ETH, DOGE)…",
    "search.clear": "Clear",
    "home.title": "Welcome",
    "home.intro": "Search a coin directly. Click a result for details.",
    "home.search.type": "Type to search",
    "watchlist.empty": "No coins in your watchlist yet",
    "coins.tabs.all": "All coins",
    "coins.tabs.gainers": "Gainers",
    "coins.tabs.losers": "Losers",
    "trend.up": "Uptrend",
    "trend.down": "Downtrend",
    "trend.flat": "Sideways",
    "trend.insufficient": "Insufficient data",
    "pred.title": "Expected price ({range}) for {hours} hours:",
    "pred.obs": "Observed trend",
    "pred.lastpoints": "Last 30 datapoints",
    "pred.loadfail": "Could not load prediction",
    "router.compare.title": "Compare",
    "router.compare.body": "Compare will be enabled in a later phase.",
    "router.portfolio.title": "Portfolio",
    "router.portfolio.body": "Portfolio will be enabled in a later phase.",
    "router.pro.title": "Pro",
    "router.pro.body": "Pro features will be enabled in a later phase."
  }
};

let current = getLanguage();

export function getLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'nl';
  } catch {
    return 'nl';
  }
}

export function setLanguage(lang) {
  current = DICTS[lang] ? lang : 'nl';
  try { localStorage.setItem(STORAGE_KEY, current); } catch {}
  try { window.dispatchEvent(new CustomEvent('rr:lang-changed', { detail: { lang: current } })); } catch {}
}

export function t(key, params = {}) {
  const dict = DICTS[current] || DICTS['nl'];
  let out = dict[key] || key;
  for (const [k, v] of Object.entries(params)) {
    out = out.replace(new RegExp(`{${k}}`, 'g'), String(v));
  }
  return out;
}

export function getDict() {
  return DICTS[current] || DICTS['nl'];
}
