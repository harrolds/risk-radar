import { COINGECKO } from "../config.js";

const _cache = new Map(); // key -> { t, data, promise }
const TTL_MS = 3 * 60 * 1000;

function cacheKey({coinId, vsCurrency, days}) { return `${coinId}|${vsCurrency}|${days}`; }

async function _request(url) {
  // Simple fetch wrapper with 429 retry
  let attempt = 0;
  while (true) {
    const res = await fetch(url, { method: 'GET' });
    if (res.status === 429 && attempt < 2) {
      await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
      attempt++; continue;
    }
    if (!res.ok) {
      const txt = await res.text().catch(()=>'');
      throw new Error(`HTTP ${res.status}: ${txt.slice(0,120)}`);
    }
    return res.json();
  }
}

/** Fetch OHLC via Netlify proxy, cached */
export async function fetchOHLC({ coinId, vsCurrency='eur', days=90 } = {}) {
  const key = cacheKey({ coinId, vsCurrency, days });
  const now = Date.now();
  const entry = _cache.get(key);
  if (entry && entry.data && (now - entry.t) < TTL_MS) return entry.data;
  if (entry && entry.promise) return entry.promise;

  const url = `${COINGECKO.CG_PROXY}?endpoint=ohlc&id=${encodeURIComponent(coinId)}&vs_currency=${encodeURIComponent(vsCurrency)}&days=${encodeURIComponent(days)}`;
  const p = _request(url).then(rows => rows.map(r => ({ time: Math.floor(r[0]/1000), open:r[1], high:r[2], low:r[3], close:r[4] })))
    .then(data => { _cache.set(key, { t: Date.now(), data }); return data; })
    .finally(() => { const e = _cache.get(key); if (e && e.promise) delete e.promise; });

  _cache.set(key, { promise: p, t: now, data: null });
  return p;
}
