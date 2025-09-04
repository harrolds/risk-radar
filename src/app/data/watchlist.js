// src/app/data/watchlist.js
/**
 * RiskRadar – Watchlist storage (stable)
 * Persistente watchlist met events voor UI-updates.
 * - LocalStorage met defensieve try/catch
 * - Geen duplicates
 * - Event: 'rr:watchlist-changed'
 *
 * Publieke API:
 *  - getWatchlist(): string[]
 *  - isInWatchlist(id: string): boolean
 *  - addToWatchlist(id: string): string[]
 *  - removeFromWatchlist(id: string): string[]
 *  - toggleWatchlist(id: string): string[]
 *  - clearWatchlist(): void
 *  - WATCHLIST_EVENT: 'rr:watchlist-changed'
 */

const STORAGE_KEY = 'rr.watchlist';
export const WATCHLIST_EVENT = 'rr:watchlist-changed';

/**
 * Normaliseer een coin-id voor consistente opslag.
 * @param {string} id
 * @returns {string} lowercased, trimmed id
 */
function normalizeId(id) {
  return String(id || '').trim().toLowerCase();
}

/**
 * Safely parse JSON, fallback op defaultValue bij error.
 * @template T
 * @param {string|null} raw
 * @param {T} defaultValue
 * @returns {T}
 */
function safeParse(raw, defaultValue) {
  if (!raw) return defaultValue;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Lees de watchlist uit localStorage.
 * @returns {string[]} Lijst met coin-id’s (lowercased).
 */
export function getWatchlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = safeParse(raw, []);
    if (!Array.isArray(arr)) return [];
    return arr.map(normalizeId).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Sla de watchlist op naar localStorage.
 * Dispatcht WATCHLIST_EVENT met de nieuwe lijst.
 * @param {string[]} list - lijst met coin-id’s.
 * @returns {void}
 */
function saveWatchlist(list) {
  const unique = Array.from(new Set(list.map(normalizeId))).filter(Boolean);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  } catch {
    // ignore quota/security errors
  }
  try {
    window.dispatchEvent(new CustomEvent(WATCHLIST_EVENT, { detail: { list: unique } }));
  } catch {
    // ignore
  }
}

/**
 * Controleren of een coin-id in de watchlist staat.
 * @param {string} id
 * @returns {boolean}
 */
export function isInWatchlist(id) {
  const nid = normalizeId(id);
  if (!nid) return false;
  return getWatchlist().includes(nid);
}

/**
 * Voeg een coin-id toe aan de watchlist (geen duplicates).
 * @param {string} id
 * @returns {string[]} De geüpdatete watchlist.
 */
export function addToWatchlist(id) {
  const nid = normalizeId(id);
  if (!nid) return getWatchlist();
  const list = getWatchlist();
  if (!list.includes(nid)) {
    list.push(nid);
    saveWatchlist(list);
  }
  return getWatchlist();
}

/**
 * Verwijder een coin-id uit de watchlist.
 * @param {string} id
 * @returns {string[]} De geüpdatete watchlist.
 */
export function removeFromWatchlist(id) {
  const nid = normalizeId(id);
  if (!nid) return getWatchlist();
  const list = getWatchlist().filter((x) => x !== nid);
  saveWatchlist(list);
  return list;
}

/**
 * Toggle presence van coin-id in de watchlist.
 * @param {string} id
 * @returns {string[]} De geüpdatete watchlist.
 */
export function toggleWatchlist(id) {
  return isInWatchlist(id) ? removeFromWatchlist(id) : addToWatchlist(id);
}

/**
 * Maak de watchlist leeg.
 * @returns {void}
 */
export function clearWatchlist() {
  saveWatchlist([]);
}

// Backwards-compat alias zodat bestaande imports blijven werken (indien gebruikt):
export { getWatchlist as getWatchlistIds };

// Belangrijk: GEEN debug-exports naar window.* meer (Taak 10 opgelost).
