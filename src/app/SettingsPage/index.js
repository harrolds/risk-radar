// /src/app/SettingsPage/index.js
(function warnOnce() {
  try {
    const k = '__RR_DEPREC_SETTINGS__';
    if (!window[k]) {
      window[k] = true;
      console.warn('[DEPRECATED] Gebruik /src/app/pages/Settings i.p.v. /src/app/SettingsPage');
    }
  } catch {}
})();

export * from '../pages/Settings/index.js';
export { default } from '../pages/Settings/index.js';
