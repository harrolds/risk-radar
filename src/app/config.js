// Config voor CoinGecko API-key gebruik in frontend.
// MODE: "none" | "demo" | "pro"
export const COINGECKO = {
  MODE: "demo",                  // "pro" voor Pro, "none" zonder key
  API_KEY: "VUL_HIER_JE_KEY_IN", // <-- jouw key hier
  BASE_URL: "https://api.coingecko.com/api/v3",
  PRO_BASE_URL: "https://pro-api.coingecko.com/api/v3",
  VS_CURRENCY: "eur",
  CACHE_TTL_MS: 5 * 60 * 1000,   // 5 minuten caching
};
