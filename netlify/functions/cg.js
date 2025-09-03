// CoinGecko proxy – stabiele Netlify Function (CommonJS, Node 18+)
// Nu met alias-ondersteuning voor endpoints met underscores (bv. coins_markets, search_trending).

const DEFAULT_VS = "eur";
const TIMEOUT_MS = 8000;
const RETRIES = 2;

const ALLOW = Object.freeze({
  "coins/markets": true,
  "search/trending": true,
  "coins/%ID%": true,
  "coins/%ID%/ohlc": true,
});

// Bases (env kan overriden)
const BASE = process.env.CG_BASE || "https://api.coingecko.com/api/v3";
const PRO_BASE = process.env.CG_PRO_BASE || "https://pro-api.coingecko.com/api/v3";
const API_KEY = process.env.CG_API_KEY || "";

function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    ...extra,
  };
}
function toNumber(v, fb) { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : fb; }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function jitter(base){ const d=base*0.2; return base + (Math.random()*2-1)*d; }

async function fetchWithRetry(url, options={}, { timeoutMs=TIMEOUT_MS, retries=RETRIES }={}){
  let attempt=0, lastErr;
  const baseDelay=500;
  while (attempt<=retries){
    const ctrl=new AbortController();
    const t=setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const res = await fetch(url, { ...options, signal: ctrl.signal });
      clearTimeout(t);
      if (res.status>=200 && res.status<300) return res;
      if (res.status===429 || (res.status>=500 && res.status<=599)) {
        lastErr = new Error(`HTTP ${res.status}`);
      } else {
        return res; // overige 4xx niet retryen
      }
    } catch(err){
      clearTimeout(t);
      lastErr = err;
    }
    if (attempt===retries) break;
    await sleep(jitter(baseDelay*Math.pow(2, attempt)));
    attempt++;
  }
  return new Response(JSON.stringify({ error: String(lastErr || "Upstream error") }), {
    status: 502,
    headers: { "Content-Type": "application/json" },
  });
}

// --- Nieuw: normaliseer endpoint aliases (underscores -> slashes) ---
function normalizeEndpoint(raw){
  const s = String(raw || "").trim();
  if (!s) return "";
  // Accepteer underscores en converteer naar slashes
  const normalized = s.replace(/_/g, "/");
  // Ook een aantal veelvoorkomende aliasen expliciet mappen (defensief)
  const map = {
    "coins_markets": "coins/markets",
    "search_trending": "search/trending",
    "coins_%ID%": "coins/%ID%",
    "coins_%ID%_ohlc": "coins/%ID%/ohlc",
  };
  return map[s] || normalized;
}

function buildUrl(params){
  const rawEndpoint = params.endpoint;
  const endpoint = normalizeEndpoint(rawEndpoint);
  const id = (params.id || "").toString().trim();
  const vs = (params.vs_currency || DEFAULT_VS).toString().trim().toLowerCase();
  const days = toNumber(params.days, 1);
  const per_page = toNumber(params.per_page, 50);
  const page = toNumber(params.page, 1);
  const usePro = API_KEY && (params.pro === "1" || params.pro === "true");
  const apiBase = usePro ? PRO_BASE : BASE;

  switch (endpoint) {
    case "coins/markets":
      if (!ALLOW["coins/markets"]) break;
      // 'order' wordt door frontend meegegeven; CoinGecko accepteert het.
      const order = (params.order || "market_cap_desc").toString();
      return `${apiBase}/coins/markets?vs_currency=${encodeURIComponent(vs)}&order=${encodeURIComponent(order)}&per_page=${per_page}&page=${page}&sparkline=false&price_change_percentage=24h`;

    case "search/trending":
      if (!ALLOW["search/trending"]) break;
      return `${apiBase}/search/trending`;

    case "coins/%ID%":
      if (!ALLOW["coins/%ID%"]) break;
      if (!id) return { error: "Missing id", status: 400 };
      return `${apiBase}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&community_data=false&developer_data=false`;

    case "coins/%ID%/ohlc":
      if (!ALLOW["coins/%ID%/ohlc"]) break;
      if (!id) return { error: "Missing id", status: 400 };
      return `${apiBase}/coins/${encodeURIComponent(id)}/ohlc?vs_currency=${encodeURIComponent(vs)}&days=${days}`;

    default:
      return { error: "Unsupported endpoint", status: 400 };
  }
}

function upstreamHeaders(usePro){
  const h = {};
  if (API_KEY) {
    if (usePro) h["x-cg-pro-api-key"] = API_KEY;
    else h["x-cg-demo-api-key"] = API_KEY;
  }
  return h;
}

exports.handler = async function(event,_context){
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: corsHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ error:"Method not allowed" }) };
  }

  const params = event.queryStringParameters || {};
  const built = buildUrl(params);
  if (typeof built === "object" && built?.error) {
    return { statusCode: built.status || 400, headers: corsHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ error: built.error }) };
  }

  const usePro = API_KEY && (params.pro === "1" || params.pro === "true");
  const hdrs = upstreamHeaders(usePro);
  const resp = await fetchWithRetry(built, { headers: hdrs });

  if (resp instanceof Response && resp.body) {
    const text = await resp.text();
    return { statusCode: resp.status || 502, headers: corsHeaders({ "Content-Type": "application/json" }), body: text };
  }

  try {
    const text = await resp.text();
    return { statusCode: resp.status || 200, headers: corsHeaders({ "Content-Type": "application/json" }), body: text };
  } catch (err) {
    return { statusCode: 502, headers: corsHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ error: String(err || "Upstream error") }) };
  }
};
