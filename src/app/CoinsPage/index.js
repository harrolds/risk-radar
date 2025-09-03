// /src/app/CoinsPage/index.js
(function warnOnce() {
  try {
    const k = '__RR_DEPREC_COINS__';
    if (!window[k]) {
      window[k] = true;
      console.warn('[DEPRECATED] Gebruik /src/app/pages/Coins i.p.v. /src/app/CoinsPage');
    }
  } catch {}
})();

export * from '../pages/Coins/index.js';
export { default } from '../pages/Coins/index.js';
