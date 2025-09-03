// CoinGecko proxy – stabiele Netlify Function (CommonJS, Node 18+)
// - Whitelist van endpoints (least-privilege)
// - Optionele PRO-key support via env
// - Timeout + retries (exponential backoff + jitter)
// - Heldere 4xx/5xx foutcodes
// - CORS + preflight

// ---------- Config ----------
const DEFAULT_VS = "eur";
const TIMEOUT_MS = 8000;           // per request attempt
const RETRIES = 2;                  // totaal 1 (init) + 2 retries = 3 pogingen

// Whitelisted patterns
const ALLOW = Object.freeze({
  "coins/markets": true,
  "search/trending": true,
  "coins/%ID%": true,
  "coins/%ID%/ohlc": true,
});

// Bases (env kan overriden)
const BASE = process.env.CG_BASE || "https://api.coingecko.com/api/v3";
const PRO_BASE = process.env.CG_PRO_BASE || "https://pro-api.coingecko.com/api/v3";
const API_KEY = process.env.CG_API_KEY || ""; // Optioneel

// ---------- Utils ----------
function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    ...extra,
  };
}

function toNumber(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(base) {
  // ±20% jitter
  const delta = base * 0.2;
  return base + (Math.random() * 2 - 1) * delta;
}

/**
 * Fetch met timeout en retries.
 * Retry bij: netwerkfout, 5xx, 429. Geen retry bij overige 4xx.
 */
async function fetchWithRetry(url, options = {}, { timeoutMs = TIMEOUT_MS, retries = RETRIES } = {}) {
  let attempt = 0;
  // Kleine backoff basis (500ms) met exponentiële groei
  const baseDelay = 500;
  let lastErr;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);

      // Retry-policy
      if (res.status >= 200 && res.status < 300) {
        return res;
      }
      if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
        // retry
      } else {
        // 4xx (behalve 429): niet retryen
        return res;
      }
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      // netwerk/abort -> retry mogelijk
    }

    if (attempt === retries) break;
    const delay = jitter(baseDelay * Math.pow(2, attempt)); // 500, 1000, 2000 (±20%)
    await sleep(delay);
    attempt++;
  }

  // Laatste fout als 502
  return new Response(JSON.stringify({ error: String(lastErr || "Upstream error") }), {
    status: 502,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Bouwt een veilige, whitelisted URL naar CoinGecko.
 */
function buildUrl(params) {
  const endpoint = String(params.endpoint || "").trim();
  const id = (params.id || "").toString().trim();
  const vs = (params.vs_currency || DEFAULT_VS).toString().trim().toLowerCase();
  const days = toNumber(params.days, 1);
  const per_page = toNumber(params.per_page, 50);
  const page = toNumber(params.page, 1);
  const usePro = API_KEY && (params.pro === "1" || params.pro === "true");
  const apiBase = usePro ? PRO_BASE : BASE;

  // Map alleen whitelisted endpoints
  switch (endpoint) {
    case "coins/markets":
      if (!ALLOW["coins/markets"]) break;
      return `${apiBase}/coins/markets?vs_currency=${encodeURIComponent(vs)}&order=market_cap_desc&per_page=${per_page}&page=${page}&sparkline=false&price_change_percentage=24h`;

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

/**
 * Header set voor CoinGecko: voeg API key toe als PRO gebruikt wordt.
 */
function upstreamHeaders(usePro) {
  const h = {};
  if (API_KEY) {
    if (usePro) h["x-cg-pro-api-key"] = API_KEY;
    else h["x-cg-demo-api-key"] = API_KEY; // sommige setups loggen demo-key
  }
  return h;
}

// ---------- Netlify handler ----------
exports.handler = async function (event, _context) {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: corsHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const params = event.queryStringParameters || {};
  const built = buildUrl(params);
  if (typeof built === "object" && built?.error) {
    return {
      statusCode: built.status || 400,
      headers: corsHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ error: built.error }),
    };
  }

  const usePro = API_KEY && (params.pro === "1" || params.pro === "true");
  const hdrs = upstreamHeaders(usePro);

  const resp = await fetchWithRetry(built, { headers: hdrs });

  // Als fetchWithRetry al een Response met 502 maakte, forward die
  if (resp instanceof Response && resp.body) {
    const text = await resp.text();
    const status = resp.status || 502;
    return {
      statusCode: status,
      headers: corsHeaders({ "Content-Type": "application/json" }),
      body: text,
    };
  }

  // Normale Node Response (Netlify runtime)
  try {
    const status = resp.status || 200;
    const text = await resp.text();
    return {
      statusCode: status,
      headers: corsHeaders({ "Content-Type": "application/json" }),
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: corsHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ error: String(err || "Upstream error") }),
    };
  }
};
