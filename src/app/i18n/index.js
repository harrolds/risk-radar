// src/app/i18n/index.js
// Simple i18n module for RiskRadar (Fase 2.6) + JSDoc + compat events

/**
 * @typedef {Record<string, string>} LocaleTable
 * @typedef {Record<string, LocaleTable>} Dictionaries
 */

/** @type {Dictionaries} */
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
    "coins.tabs.losers": "Dalers",
    "home.intro": "Zoek direct naar een coin. Klik op een resultaat voor details.",
    "home.search.placeholder.long": "Zoek op naam of symbool (bijv. BTC, ETH, DOGE)...",
    "home.search.type": "Typ om te zoeken",
    "watchlist.empty": "Nog geen coins in je watchlist",
    "home.tip": "Tip: je kunt zoeken op naam (“bitcoin”) of symbool (“BTC”). Klik op een resultaat voor details.",
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
    "router.portfolio.title": "Portfolio",
    "router.portfolio.body": "Portfolio wordt later toegevoegd.",
    "router.pro.title": "RiskRadar Pro",
    "router.pro.body": "Upgrade-flow komt in Fase 7 (Predict Pro).",
    "footer.copy": "© {year} RiskRadar",
    "footer.phase": "UI-baseline + thema",
    "coins.title": "Coins",
    "search.placeholder.long": "Zoek op naam of symbool (bijv. BTC, ETH, DOGE)...",
    "pred.tab.24h": "24u",
    "pred.tab.7d": "7d",
    "pred.tab.30d": "30d",
    "pred.result": "Verwachte prijs (+-) voor {period}"
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
    "coins.tabs.losers": "Verlierer",
    "home.intro": "Suche direkt nach einer Coin. Klicke für Details auf ein Ergebnis.",
    "home.search.placeholder.long": "Nach Name oder Symbol suchen (z. B. BTC, ETH, DOGE)…",
    "home.search.type": "Zum Suchen tippen",
    "watchlist.empty": "Noch keine Coins in deiner Watchlist",
    "home.tip": "Tipp: Du kannst nach Namen („bitcoin“) oder Symbol („BTC“) suchen. Klicke auf ein Ergebnis für Details.",
    "trend.up": "Steigend",
    "trend.down": "Fallend",
    "trend.flat": "Seitwärts",
    "trend.insufficient": "Unzureichende Daten",
    "pred.title": "Erwarteter Preis ({range}) für {hours} Std.:",
    "pred.obs": "Beobachteter Trend",
    "pred.lastpoints": "Letzte 30 Datenpunkte",
    "pred.loadfail": "Vorhersage konnte nicht geladen werden",
    "router.compare.title": "Vergleichen",
    "router.compare.body": "Die Vergleichsfunktion wird in einer späteren Phase aktiviert.",
    "router.portfolio.title": "Portfolio",
    "router.portfolio.body": "Portfolio wird später hinzugefügt.",
    "router.pro.title": "RiskRadar Pro",
    "router.pro.body": "Der Upgrade-Flow kommt in Phase 7 (Predict Pro).",
    "footer.copy": "© {year} RiskRadar",
    "footer.phase": "UI-Baseline + Thema",
    "coins.title": "Coins",
    "search.placeholder.long": "Nach Name oder Symbol suchen (z. B. BTC, ETH, DOGE)…",
    "pred.tab.24h": "24h",
    "pred.tab.7d": "7T",
    "pred.tab.30d": "30T",
    "pred.result": "Erwarteter Preis (+-) für {period}"
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
    "coins.tabs.losers": "Losers",
    "home.intro": "Search directly for a coin. Click a result for details.",
    "home.search.placeholder.long": "Search by name or symbol (e.g. BTC, ETH, DOGE)...",
    "home.search.type": "Type to search",
    "watchlist.empty": "No coins in your watchlist yet",
    "home.tip": "Tip: you can search by name (“bitcoin”) or symbol (“BTC”). Click a result for details.",
    "trend.up": "Rising",
    "trend.down": "Falling",
    "trend.flat": "Sideways",
    "trend.insufficient": "Insufficient data",
    "pred.title": "Expected price ({range}) for {hours} hours:",
    "pred.obs": "Observed trend",
    "pred.lastpoints": "Last 30 datapoints",
    "pred.loadfail": "Could not load prediction",
    "router.compare.title": "Compare",
    "router.compare.body": "Compare will be enabled in a later phase.",
    "router.portfolio.title": "Portfolio",
    "router.portfolio.body": "Portfolio will be added later.",
    "router.pro.title": "RiskRadar Pro",
    "router.pro.body": "Upgrade flow arrives in Phase 7 (Predict Pro).",
    "footer.copy": "© {year} RiskRadar",
    "footer.phase": "UI baseline + theme",
    "coins.title": "Coins",
    "search.placeholder.long": "Search by name or symbol (e.g. BTC, ETH, DOGE)...",
    "pred.tab.24h": "24h",
    "pred.tab.7d": "7d",
    "pred.tab.30d": "30d",
    "pred.result": "Expected price (+-) for {period}"
  }
};

// Resolve start-locale
let _locale = (function () {
  try {
    const stored = localStorage.getItem('rr_locale');
    if (stored && DICTS[stored]) return stored;
  } catch (_) {}
  return 'nl';
})();

// Apply <html lang="...">
document.documentElement.setAttribute('lang', _locale);

// Persist best effort
try {
  localStorage.setItem('rr_locale', _locale);
} catch (_) {}

/** Internal subscription set for programmatic listeners. */
const listeners = new Set();

/**
 * Get the current active locale (e.g. "nl", "de", "en").
 * @returns {string}
 */
export function getLocale() {
  return _locale;
}

/**
 * Translate a key for the current locale.
 * Supports simple variable interpolation with `{var}` placeholders.
 *
 * @param {string} key - The translation key, e.g. "home.intro".
 * @param {Record<string, string|number>=} vars - Optional variables to inject: { name: "Harrold" }.
 * @returns {string} Localized string (or the key itself if not found).
 */
export function t(key, vars = {}) {
  /** @type {LocaleTable} */
  const dict = DICTS[_locale] || DICTS['nl'];
  const template = dict[key] ?? key;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    template
  );
}

/**
 * Set a new active locale.
 * - Persists to localStorage (best effort)
 * - Updates <html lang="...">
 * - Notifies both programmatic subscribers and window listeners
 *   via "rr:locale" (compat) and "localechange" (standardized name).
 *
 * @param {string} next - Locale code ("nl" | "de" | "en").
 * @returns {void}
 */
export function setLocale(next) {
  const v = (next || '').toLowerCase();
  if (!DICTS[v] || v === _locale) return;

  _locale = v;

  try {
    localStorage.setItem('rr_locale', _locale);
  } catch (_) {}

  document.documentElement.setAttribute('lang', _locale);

  // Programmatic subscribers
  listeners.forEach((fn) => {
    try {
      fn(_locale);
    } catch (e) {
      // avoid breaking others
      console.warn('[i18n] onLocaleChange subscriber threw:', e);
    }
  });

  // Events (compat + standardized)
  try {
    window.dispatchEvent(new CustomEvent('rr:locale', { detail: { locale: _locale } }));
    window.dispatchEvent(new CustomEvent('localechange', { detail: { locale: _locale } }));
  } catch (_) {}
}

/**
 * Subscribe to locale changes (programmatic).
 * Returns an unsubscribe function.
 *
 * @param {(locale: string) => void} fn - Callback invoked with the new locale.
 * @returns {() => void} Unsubscribe function.
 */
export function onLocaleChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Named export for dictionaries if debugging is ever needed (not public API).
// export { DICTS };
