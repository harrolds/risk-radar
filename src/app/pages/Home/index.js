// src/app/pages/Home/index.js
import { t } from '../../i18n/index.js';
import { getWatchlist } from '../../data/watchlist.js';

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

        <section id="trending" style="margin-top:16px;">
          <h2>Trending</h2>
          <ul id="trending-list" class="coins-list"></ul>
          <p id="trending-msg" style="opacity:.8;"></p>
        </section>

        <section id="watchlist" style="margin-top:16px;">
          <h2>Watchlist</h2>
          <ul id="watchlist-list" class="coins-list"></ul>
          <p id="watchlist-msg" style="opacity:.8;"></p>
        </section>
      </section>
    </div>
  `;

  const trendList = outlet.querySelector('#trending-list');
  const trendMsg = outlet.querySelector('#trending-msg');
  const wlList = outlet.querySelector('#watchlist-list');
  const wlMsg = outlet.querySelector('#watchlist-msg');

  async function loadTrending() {
    trendMsg.textContent = 'Laden…';
    trendList.innerHTML = '';
    try {
      const r = await fetch('/.netlify/functions/cg?endpoint=search_trending', { signal: getAbortSignal() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error('Non-JSON trending');
      const data = await r.json();
      const items = data?.coins || [];
      if (!Array.isArray(items) || items.length === 0) {
        trendMsg.textContent = t('trend.insufficient') || 'Geen trending data.';
        return;
      }
      trendList.innerHTML = items.slice(0, 10).map(({ item }) =>
        `<li class="coin"><span class="name">${item?.name || '-'}</span> <span class="sym">${(item?.symbol || '').toUpperCase()}</span></li>`
      ).join('');
      trendMsg.textContent = '';
    } catch (e) {
      trendMsg.textContent = 'Kon trending niet laden.';
      console.warn('[Home] trending warn:', e?.message || e);
    }
  }

  async function loadWatchlist() {
    wlMsg.textContent = 'Laden…';
    wlList.innerHTML = '';
    const ids = getWatchlist();
    if (!ids.length) {
      wlMsg.textContent = t('watchlist.empty') || 'Nog geen items in je watchlist.';
      return;
    }
    const url = `/.netlify/functions/cg?endpoint=coins_markets&vs_currency=eur&per_page=50&ids=${encodeURIComponent(ids.join(','))}`;
    try {
      const r = await fetch(url, { signal: getAbortSignal() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error('Non-JSON watchlist');
      const data = await r.json();
      if (!Array.isArray(data) || data.length === 0) {
        wlMsg.textContent = t('watchlist.empty') || 'Nog geen items in je watchlist.';
        return;
      }
      wlList.innerHTML = data.map(
        (c) => `<li class="coin"><span class="name">${c.name}</span> <span class="sym">${(c.symbol?.toUpperCase?.() || '')}</span></li>`
      ).join('');
      wlMsg.textContent = '';
    } catch (e) {
      wlMsg.textContent = 'Kon watchlist niet laden.';
      console.warn('[Home] watchlist warn:', e?.message || e);
    }
  }

  // Locale live update
  const onLocale = () => {
    const h1 = outlet.querySelector('h1');
    const sub = outlet.querySelector('.sub');
    if (h1) h1.textContent = t('app.title');
    if (sub) sub.textContent = t('home.intro');
  };
  window.addEventListener('localechange', onLocale);
  onCleanup(() => window.removeEventListener('localechange', onLocale));

  loadTrending();
  loadWatchlist();
}
