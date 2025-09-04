// src/app/pages/Coins/index.js
import { t } from '../../i18n/index.js';

/**
 * @typedef {{ onCleanup?: (fn: () => void) => void, getAbortSignal?: () => AbortSignal }} PageOpts
 */
export function renderCoins(opts = {}) {
  const { onCleanup = () => {}, getAbortSignal = () => new AbortController().signal } = opts;
  const outlet = document.getElementById('rr-app');
  if (!outlet) return;

  outlet.innerHTML = /* html */ `
    <div class="rr-container">
      <section id="coins" class="page page-coins">
        <header class="page-header">
          <h1>${t('coins.title')}</h1>
          <nav class="tabs">
            <button data-tab="all" class="tab is-active">${t('coins.tabs.all')}</button>
            <button data-tab="gainers" class="tab">${t('coins.tabs.gainers')}</button>
            <button data-tab="losers" class="tab">${t('coins.tabs.losers')}</button>
          </nav>
        </header>
        <ul id="coins-list" class="coins-list"></ul>
        <p id="coins-msg" class="coins-msg" style="margin-top:8px;opacity:.8;"></p>
      </section>
    </div>
  `;

  const listEl = outlet.querySelector('#coins-list');
  const msgEl = outlet.querySelector('#coins-msg');

  const tabs = outlet.querySelectorAll('.tabs .tab');
  const onTabClick = (e) => {
    tabs.forEach((b) => b.classList.remove('is-active'));
    e.currentTarget.classList.add('is-active');
    // TODO: filterrendering hier
  };
  tabs.forEach((b) => b.addEventListener('click', onTabClick));
  onCleanup(() => tabs.forEach((b) => b.removeEventListener('click', onTabClick)));

  // Hardened fetch (geen crashes bij HTML/404)
  fetch('/.netlify/functions/markets', { signal: getAbortSignal() })
    .then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await r.text();
        throw new Error(`Non-JSON response: ${text.slice(0, 80)}`);
      }
      return r.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error('Unexpected data shape');
      if (!data.length) {
        msgEl.textContent = t('pred.loadfail') || 'Geen marktdata beschikbaar.';
      }
      listEl.innerHTML = data.slice(0, 20).map(
        (c) => `<li class="coin"><span class="name">${c.name}</span> <span class="sym">${(c.symbol?.toUpperCase?.() || '')}</span></li>`
      ).join('');
    })
    .catch((err) => {
      msgEl.textContent = 'Kon marktdata niet laden.';
      listEl.innerHTML = '';
      console.warn('[Coins] fetch warn:', err?.message || err);
    });

  // Locale live update (header/tabs labels)
  const onLocale = () => {
    const h1 = outlet.querySelector('h1');
    if (h1) h1.textContent = t('coins.title');
    outlet.querySelector('[data-tab="all"]').textContent = t('coins.tabs.all');
    outlet.querySelector('[data-tab="gainers"]').textContent = t('coins.tabs.gainers');
    outlet.querySelector('[data-tab="losers"]').textContent = t('coins.tabs.losers');
  };
  window.addEventListener('localechange', onLocale);
  onCleanup(() => window.removeEventListener('localechange', onLocale));
}
