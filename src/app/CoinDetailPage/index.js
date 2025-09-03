// /src/app/CoinDetailPage/index.js
(function warnOnce() {
  try {
    const k = '__RR_DEPREC_COINDETAIL__';
    if (!window[k]) {
      window[k] = true;
      console.warn('[DEPRECATED] Gebruik /src/app/pages/CoinDetail i.p.v. /src/app/CoinDetailPage');
    }
  } catch {}
})();

export * from '../pages/CoinDetail/index.js';
export { default } from '../pages/CoinDetail/index.js';
