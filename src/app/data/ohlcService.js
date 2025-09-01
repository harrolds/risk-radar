import { COINGECKO } from "../config.js";

function baseUrl() {
  return COINGECKO.MODE === "pro" ? COINGECKO.PRO_BASE_URL : COINGECKO.BASE_URL;
}
function authHeaders() {
  const headers = { Accept: "application/json" };
  if (COINGECKO.MODE === "demo" && COINGECKO.API_KEY) {
    headers["x-cg-demo-api-key"] = COINGECKO.API_KEY;
  }
  if (COINGECKO.MODE === "pro" && COINGECKO.API_KEY) {
    headers["x-cg-pro-api-key"] = COINGECKO.API_KEY;
  }
  return headers;
}

/** Fetch OHLC candles for a coin. Returns array [{time, open, high, low, close}] with UNIX seconds. */
export async function fetchOHLC({ coinId, vsCurrency='eur', days=90, signal } = {}) {
  const endpoint = `${baseUrl()}/coins/${encodeURIComponent(coinId)}/ohlc?vs_currency=${encodeURIComponent(vsCurrency)}&days=${encodeURIComponent(days)}`;
  const res = await fetch(endpoint, { headers: authHeaders(), signal });
  if (!res.ok) {
    const txt = await res.text().catch(()=>'');
    throw new Error(`HTTP ${res.status} @ /coins/:id/ohlc :: ${txt.slice(0,180)}`);
  }
  const data = await res.json();
  // Data: [[timestamp, open, high, low, close], ...] (timestamp in ms)
  const out = data.map(row => ({
    time: Math.floor(Number(row[0]) / 1000),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
  })).filter(x => Number.isFinite(x.time) && Number.isFinite(x.close));
  return out;
}

/** Downsample candles to target max points for perf */
export function downsampleCandles(candles, maxPoints=500) {
  if (!Array.isArray(candles) || candles.length <= maxPoints) return candles;
  const bucket = Math.ceil(candles.length / maxPoints);
  const out = [];
  for (let i=0; i<candles.length; i += bucket) {
    const slice = candles.slice(i, i+bucket);
    const first = slice[0];
    const last = slice[slice.length - 1];
    if (!first || !last) continue;
    const high = Math.max(...slice.map(s => s.high));
    const low = Math.min(...slice.map(s => s.low));
    out.push({ time: first.time, open: first.open, high, low, close: last.close });
  }
  return out;
}
