// Watchlist storage using localStorage + dispatch events
const KEY = 'rr.watchlist';

function readStore() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeStore(arr) {
  try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch {}
}

export function getWatchlist() {
  return readStore();
}

export function isInWatchlist(id) {
  const set = new Set(readStore());
  return set.has(id);
}

export function addToWatchlist(id) {
  const set = new Set(readStore());
  set.add(id);
  writeStore([...set]);
  try { window.dispatchEvent(new CustomEvent('rr:watchlist-changed')); } catch {}
}

export function removeFromWatchlist(id) {
  const set = new Set(readStore());
  set.delete(id);
  writeStore([...set]);
  try { window.dispatchEvent(new CustomEvent('rr:watchlist-changed')); } catch {}
}

export function toggleWatchlist(id) {
  if (isInWatchlist(id)) removeFromWatchlist(id);
  else addToWatchlist(id);
}
