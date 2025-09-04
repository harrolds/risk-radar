// src/app/pages/Settings/index.js
// Settings page met lifecycle hooks (onCleanup/getAbortSignal).

import { t, setLocale, getLocale } from '../../i18n/index.js';

/**
 * @typedef {{ onCleanup?: (fn: () => void) => void, getAbortSignal?: () => AbortSignal }} PageOpts
 */

/**
 * Render Settings page.
 * @param {PageOpts=} opts
 */
export function renderSettings(opts = {}) {
  const { onCleanup = () => {}, getAbortSignal = () => new AbortController().signal } = opts;

  const outlet = document.getElementById('app');
  if (!outlet) return;

  outlet.innerHTML = /* html */ `
    <section id="settings" class="page page-settings">
      <header class="page-header"><h1>${t('settings.title')}</h1></header>

      <div class="setting">
        <label for="lang-select">${t('settings.language')}</label>
        <select id="lang-select">
          <option value="nl">${t('lang.nl')}</option>
          <option value="de">${t('lang.de')}</option>
          <option value="en">${t('lang.en')}</option>
        </select>
      </div>

      <p class="note">${t('settings.note')}</p>
    </section>
  `;

  const select = outlet.querySelector('#lang-select');
  if (select) {
    select.value = getLocale();
    const onChange = (e) => setLocale(e.target.value);
    select.addEventListener('change', onChange);
    onCleanup(() => select.removeEventListener('change', onChange));
  }

  // Locale live update van labels
  const onLocale = () => {
    outlet.querySelector('h1').textContent = t('settings.title');
    outlet.querySelector('label[for="lang-select"]').textContent = t('settings.language');
    outlet.querySelector('option[value="nl"]').textContent = t('lang.nl');
    outlet.querySelector('option[value="de"]').textContent = t('lang.de');
    outlet.querySelector('option[value="en"]').textContent = t('lang.en');
    outlet.querySelector('.note').textContent = t('settings.note');
  };
  window.addEventListener('localechange', onLocale);
  onCleanup(() => window.removeEventListener('localechange', onLocale));

  // rooktest
  fetch('/.netlify/functions/ping', { signal: getAbortSignal() }).catch((err) => {
    if (err?.name !== 'AbortError') console.warn('[Settings] fetch error', err);
  });
}
