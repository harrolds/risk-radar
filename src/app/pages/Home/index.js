// src/app/pages/Home/index.js
import { t } from '../../i18n/index.js';

/**
 * @typedef {{ onCleanup?: (fn: () => void) => void, getAbortSignal?: () => AbortSignal }} PageOpts
 */
export function renderHome(opts = {}) {
  const { onCleanup = () => {}, getAbortSignal = () => new AbortController().signal } = opts;
  const outlet = document.getElementById('rr-app');
  if (!outlet) return;

  outlet.innerHTML = /* html */ `
    <div class="rr-container">
      <section id="home" class="page page-home">
        <header class="page-header">
          <h1>${t('app.title')}</h1>
          <p class="sub">${t('home.intro')}</p>
        </header>
        <div id="home-content">
          <!-- TODO: plaats hier je bestaande search/tiles/trending markup -->
        </div>
      </section>
    </div>
  `;

  const onLocale = () => {
    const h1 = outlet.querySelector('h1');
    const sub = outlet.querySelector('.sub');
    if (h1) h1.textContent = t('app.title');
    if (sub) sub.textContent = t('home.intro');
  };
  window.addEventListener('localechange', onLocale);
  onCleanup(() => window.removeEventListener('localechange', onLocale));

  fetch('/.netlify/functions/ping', { signal: getAbortSignal() })
    .then((r) => (r.ok ? r.text() : 'ok'))
    .catch((err) => { if (err?.name !== 'AbortError') console.warn('[Home] fetch warn', err); });
}
