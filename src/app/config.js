// Config voor CoinGecko API-key gebruik in frontend.
// MODE: "demo" | "demo" | "pro"
export const COINGECKO = {
  CG_PROXY: '/.netlify/functions/cg',
  MODE: "demo",                  // "pro" voor Pro, "none" zonder key
  API_KEY: "CG-qkcUsGMYirruAsAN2HM4wmCk", // <-- jouw key hier
  BASE_URL: "https://api.coingecko.com/api/v3",
  PRO_BASE_URL: "https://pro-api.coingecko.com/api/v3",
  VS_CURRENCY: "eur",
  CACHE_TTL_MS: 60 * 1000,   // 5 minuten caching
};
