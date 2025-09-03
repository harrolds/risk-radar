// /src/app/HomePage/index.js
(function warnOnce() {
  try {
    const k = '__RR_DEPREC_HOME__';
    if (!window[k]) {
      window[k] = true;
      console.warn('[DEPRECATED] Gebruik /src/app/pages/Home i.p.v. /src/app/HomePage');
    }
  } catch {}
})();

export * from '../pages/Home/index.js';
export { default } from '../pages/Home/index.js';
