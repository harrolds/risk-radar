// src/app/pages/Home/index.js
// Home page met lifecycle hooks (onCleanup/getAbortSignal).
// Zet jouw bestaande DOM-render code binnen de aangegeven zone.

import { t } from '../../i18n/index.js';

/**
 * @typedef {{ onCleanup?: (fn: () => void) => void, getAbortSignal?: () => AbortSignal }} PageOpts
 */

/**
 * Render Home page.
 * @param {PageOpts=} opts
 */
export function renderHome(opts = {}) {
  const { onCleanup = () => {}, getAbortSignal = () => new AbortController().signal } = opts;

  const outlet = document.getElementById('app');
  if (!outlet) return;

  // === JOUW BESTAANDE UI-STRUCTUUR HIERONDER (vrij aanpassen/inplakken) ===
  outlet.innerHTML = /* html */ `
    <section id="home" class="page page-home">
      <header class="page-header">
        <h1>${t('app.title')}</h1>
        <p class="sub">${t('home.intro')}</p>
      </header>
      <div id="home-content">
        <!-- TODO: plaats hier je bestaande search/tiles/trending markup -->
      </div>
    </section>
  `;
  // === EINDE UI ZONE ===

  // Locale live update (voorbeeld)
  const onLocale = () => {
    const h1 = outlet.querySelector('h1');
    const sub = outlet.querySelector('.sub');
    if (h1) h1.textContent = t('app.title');
    if (sub) sub.textContent = t('home.intro');
  };
  window.addEventListener('localechange', onLocale);
  onCleanup(() => window.removeEventListener('localechange', onLocale));

  // Voorbeeld van abortable fetch (vervang door jouw echte endpoint)
  fetch('/.netlify/functions/ping', { signal: getAbortSignal() })
    .then((r) => (r.ok ? r.text() : 'ok'))
    .then(() => {
      // no-op; rooktest
    })
    .catch((err) => {
      if (err?.name !== 'AbortError') console.warn('[Home] fetch error', err);
    });
}
