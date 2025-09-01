import { COINGECKO } from "../config.js";
import { fetchOHLC } from "./ohlcService.js";

const _priceCache = new Map();
const TTL_MS = 2 * 60 * 1000;

async function _request(url) {
  let attempt = 0;
  while (true) {
    const res = await fetch(url);
    if (res.status === 429 && attempt < 2) {
      await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt))); attempt++; continue;
    }
    if (!res.ok) throw new Error('HTTP '+res.status);
    return res.json();
  }
}

export async function fetchPriceOrFallback({ coinId, vsCurrency='eur' }) {
  const key = `${coinId}|${vsCurrency}`;
  const e = _priceCache.get(key);
  const now = Date.now();
  if (e && (now - e.t) < TTL_MS) return e.v;
  try {
    const url = `${COINGECKO.CG_PROXY}?endpoint=simple_price&ids=${encodeURIComponent(coinId)}&vs_currencies=${encodeURIComponent(vsCurrency)}`;
    const j = await _request(url);
    const v = j?.[coinId]?.[vsCurrency] ?? null;
    if (v != null) { _priceCache.set(key, { t: now, v }); return v; }
    throw new Error('no price');
  } catch {
    // fallback last close from 1d OHLC
    try {
      const candles = await fetchOHLC({ coinId, vsCurrency, days: 1 });
      const last = candles[candles.length-1]?.close ?? null;
      if (last != null) { _priceCache.set(key, { t: now, v: last }); return last; }
    } catch {}
    return null;
  }
}
