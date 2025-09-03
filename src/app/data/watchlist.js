/**
 * RiskRadar – Watchlist storage (stable)
 * Persistente watchlist met events voor UI-updates.
 * - LocalStorage met defensieve try/catch
 * - Geen duplicates
 * - Event: 'rr:watchlist-changed'
 */

/** @type {string} */
const STORAGE_KEY = 'rr.watchlist';
/** @type {string} */
export const WATCHLIST_EVENT = 'rr:watchlist-changed';

/** Normaliseer een coin-id voor consistente opslag. */
function normalizeId(id) {
  return String(id || '').trim().toLowerCase();
}

/** Lees array uit localStorage. */
function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(normalizeId) : [];
  } catch {
    // In incognito of bij blokkering kan dit falen
    return [];
  }
}

/** Schrijf array naar localStorage + dispatch event. */
function writeStore(list) {
  const clean = Array.from(new Set((list || []).map(normalizeId))).filter(Boolean);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // Swallow: opslag kan falen, maar UI moet niet crashen
  }
  // Laat de rest van de app weten dat de watchlist is veranderd
  try {
    window.dispatchEvent(new CustomEvent(WATCHLIST_EVENT, { detail: clean }));
  } catch {
    // Geen hard fail als CustomEvent niet beschikbaar is (oude browsers)
  }
}

/** Haal de volledige watchlist op. */
export function getWatchlist() {
  return readStore();
}

/** Sla een volledige watchlist op (vervangend). */
export function setWatchlist(list) {
  writeStore(Array.isArray(list) ? list : []);
}

/** Check of een id aanwezig is. */
export function isInWatchlist(id) {
  const nid = normalizeId(id);
  if (!nid) return false;
  const set = new Set(readStore());
  return set.has(nid);
}

/** Voeg een id toe (geen duplicates). Retourneert nieuwe lijst. */
export function addToWatchlist(id) {
  const nid = normalizeId(id);
  if (!nid) return getWatchlist();
  const set = new Set(readStore());
  set.add(nid);
  const out = [...set];
  writeStore(out);
  return out;
}

/** Verwijder een id. Retourneert nieuwe lijst. */
export function removeFromWatchlist(id) {
  const nid = normalizeId(id);
  if (!nid) return getWatchlist();
  const set = new Set(readStore());
  set.delete(nid);
  const out = [...set];
  writeStore(out);
  return out;
}

/** Toggle een id. Retourneert nieuwe lijst. */
export function toggleWatchlist(id) {
  return isInWatchlist(id) ? removeFromWatchlist(id) : addToWatchlist(id);
}

/** Leeg de watchlist. Retourneert lege lijst. */
export function clearWatchlist() {
  writeStore([]);
  return [];
}

/**
 * Subscribe helper (optioneel): luister naar wijzigingen.
 * @param {(list:string[]) => void} handler
 * @returns {() => void} unsubscribe
 */
export function onWatchlistChange(handler) {
  const fn = (e) => {
    try { handler(Array.isArray(e?.detail) ? e.detail : readStore()); }
    catch { /* noop */ }
  };
  window.addEventListener(WATCHLIST_EVENT, fn);
  // Initial push zodat UI direct synchroon is
  try { handler(readStore()); } catch {}
  return () => window.removeEventListener(WATCHLIST_EVENT, fn);
}
// Backwards-compat alias zodat bestaande imports blijven werken:
export { getWatchlist as getWatchlistIds };

// Alleen voor debug/test in console:
if (typeof window !== 'undefined') {
  window.getWatchlist = getWatchlist;
  window.addToWatchlist = addToWatchlist;
  window.removeFromWatchlist = removeFromWatchlist;
  window.toggleWatchlist = toggleWatchlist;
  window.clearWatchlist = clearWatchlist;
  window.isInWatchlist = isInWatchlist;
}

