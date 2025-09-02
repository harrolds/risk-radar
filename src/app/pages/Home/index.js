import { t } from '../../i18n/index.js';
import { formatPriceEUR, formatPct2 } from '../../utils/format.js';
import { fetchCoinsMarkets, fetchTrending, fetchMarketsByIds } from '../../data/coingecko.js';
import { getWatchlistIds, isInWatchlist, toggleWatchlist } from '../../data/watchlist.js';

export function renderHomePage() {
  const el = document.createElement('div');
  el.className = 'rr-page';

  // Title
  const title = document.createElement('h1');
  title.className = 'rr-title';
  title.textContent = t('app.title');
  el.appendChild(title);

  // Intro card (keeps existing friendly intro)
  const intro = document.createElement('div');
  intro.className = 'rr-card';
  intro.innerHTML = `<p>${t('home.intro')}</p>`;
  el.appendChild(intro);

  // Search area
  const search = document.createElement('div');
  search.className = 'rr-search';
  search.innerHTML = `
    <input id="rr-home-q" type="text" placeholder="Zoek op naam of symbool (bijv. BTC, ETH, DOGE)…" aria-label="Zoek coin" />
    <button id="rr-home-clear" type="button" title="Wis zoekopdracht">Wis</button>
  `;
  el.appendChild(search);

  // Status + results
  const status = document.createElement('div');
  status.id = 'rr-home-status';
  status.className = 'rr-subtle';
  status.style.margin = '8px 0';
  status.textContent = 'Typ om te zoeken…';
  el.appendChild(status);

  const resultsWrap = document.createElement('div');
  resultsWrap.innerHTML = `<ul class="rr-list" id="rr-home-results"></ul>`;
  el.appendChild(resultsWrap);

  const qInput = search.querySelector('#rr-home-q');
  const qClear = search.querySelector('#rr-home-clear');
  const resultsEl = resultsWrap.querySelector('#rr-home-results');

  // Persisted query key
  const QKEY = 'rr.home.q';

  // State
  let all = null;     // full market list (cached by fetchCoinsMarkets)
  let timer = null;

  // Helpers
  const renderRows = (rows) => {
    resultsEl.innerHTML = rows.map(c => {
      const pct = c.price_change_percentage_24h ?? 0;
      const cls = pct >= 0 ? 'rr-badge pos' : 'rr-badge neg';
      const price = formatPriceEUR(c.current_price);
    const pctTxt = formatPct2(pct);
    return `<li>
        <a href="#/coin/${c.id}" style="display:flex; justify-content:space-between; align-items:center; text-decoration:none; color:inherit;">
          <span><img src="${c.image}" alt="" width="20" height="20" style="vertical-align:middle; margin-right:8px;" />${c.symbol} • ${c.name}</span>
          <span><span style="opacity:.8; margin-right:10px;"><span class="rr-price" data-id="${c.id}" data-field="price">${price}</span></span><span class="${cls}"><span class="rr-pct" data-id="${c.id}" data-field="pct24h">${pctTxt}</span></span></span>
        </a>
      </li>`;
    }).join('');
  };

  const doFilter = () => {
    const q = (qInput.value || '').trim().toLowerCase();
    if (!q) {
      resultsEl.innerHTML = '';
      status.textContent = 'Typ om te zoeken…';
      return;
    }
    const filtered = (all || []).filter(c => {
      return c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
    }).slice(0, 50); // cap to 50 results for readability
    if (filtered.length === 0) {
      resultsEl.innerHTML = '';
      status.textContent = `Geen resultaten voor “${q}”.`;
      return;
    }
    status.textContent = `${filtered.length} resultaat/resulaten`;
    renderRows(filtered);
  };

  // Load markets lazily on first input focus (less work on idle home)
  const saveQuery = () => { try { sessionStorage.setItem(QKEY, (qInput.value || '').trim()); } catch {} };
  const restoreQuery = () => { try { return sessionStorage.getItem(QKEY) || ''; } catch { return ''; } };

  const ensureData = async () => {
    if (all) return;
    status.textContent = 'Laden…';
    try {
      all = await fetchCoinsMarkets({ page: 1, perPage: 250 });
      if (!qInput.value.trim()) {
        status.textContent = 'Typ om te zoeken…';
      } else {
        doFilter();
      }
    } catch (err) {
      console.error(err);
      status.textContent = 'Kon lijst niet laden. Controleer je verbinding.';
    }
  };

  // Events
  qInput.addEventListener('focus', ensureData);
  qInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!all) {
        ensureData().then(() => doFilter());
      } else {
        doFilter();
      }
    }, 200);
    saveQuery();
  });
  qClear.addEventListener('click', () => {
    qInput.value = '';
    try { sessionStorage.removeItem(QKEY); } catch {}
    doFilter();
    qInput.focus();
  });

  // Restore previous query if present
  (async () => {
    const q0 = restoreQuery();
    if (q0) {
      qInput.value = q0;
      await ensureData();
      doFilter();
    }
  })();

  // Accessibility tip (Content Manager: tooltip/uitleg)
  const tip = document.createElement('p');
  tip.className = 'rr-subtle';
  tip.style.marginTop = '8px';
  tip.textContent = '${t('home.tip')}';
  
  // Watchlist section
  const wlCard = document.createElement('div');
  wlCard.className = 'rr-card';
  wlCard.innerHTML = `<h2 class="rr-title" style="font-size:18px;margin:0 0 8px 0;">Watchlist</h2><ul class="rr-list" id="rr-watchlist"></ul><p id="rr-watchlist-empty" class="rr-subtle">${t('watchlist.empty')}.</p>`;
  el.appendChild(wlCard);

  const wlList = wlCard.querySelector('#rr-watchlist');
  const wlEmpty = wlCard.querySelector('#rr-watchlist-empty');

  const renderRowsWL = (coins) => coins.map(c => {
    const pct = c.price_change_percentage_24h ?? 0;
    const cls = pct >= 0 ? 'rr-badge pos' : 'rr-badge neg';
    const price = formatPriceEUR(c.current_price);
    const pctTxt = formatPct2(pct);
    return `<li>
      <a href="#/coin/${c.id}" style="display:flex; justify-content:space-between; align-items:center; text-decoration:none; color:inherit;">
        <span>
          <button class="rr-star" data-id="${c.id}" aria-pressed="${isInWatchlist(c.id)}" title="${isInWatchlist(c.id) ? 'Verwijder uit watchlist' : 'Voeg toe aan watchlist'}" style="margin-right:8px; background:transparent; border:none; cursor:pointer; font-size:16px; line-height:1;">${isInWatchlist(c.id) ? '★' : '☆'}</button>
          ${c.symbol} • ${c.name}
        </span>
        <span><span style="opacity:.8; margin-right:10px;"><span class="rr-price" data-id="${c.id}" data-field="price">${price}</span></span><span class="${cls}"><span class="rr-pct" data-id="${c.id}" data-field="pct24h">${pctTxt}</span></span></span>
      </a>
    </li>`;
  }).join('');

  const refreshWatchlist = async () => {
    const ids = getWatchlistIds();
    if (!ids.length) {
      wlList.innerHTML = '';
      wlEmpty.style.display = '';
      return;
    }
    wlEmpty.style.display = 'none';
    try {
      // Use cached markets data if already loaded
      const all = await fetchCoinsMarkets({ page: 1, perPage: 250 });
      const subset = all.filter(c => ids.includes(c.id));
      wlList.innerHTML = renderRowsWL(subset);
    } catch (e) {
      console.error(e);
      /* keep old list on error */
    }
  };

  wlList.addEventListener('click', (e) => {
    const btn = e.target.closest('button.rr-star');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.getAttribute('data-id');
    toggleWatchlist(id);
    refreshWatchlist();
  });

  window.addEventListener('rr:watchlist-changed', refreshWatchlist);
  refreshWatchlist();

  // Trending section
  const trCard = document.createElement('div');
  trCard.className = 'rr-card';
  trCard.style.marginTop = '12px';
  trCard.innerHTML = `<h2 class="rr-title" style="font-size:18px;margin:0 0 8px 0;">Trending</h2><ul class="rr-list" id="rr-trending"></ul><p id="rr-trending-empty" class="rr-subtle">Laden…</p>`;
  el.appendChild(trCard);

  const trList = trCard.querySelector('#rr-trending');
  const trEmpty = trCard.querySelector('#rr-trending-empty');

  const refreshTrending = async () => {
    trEmpty.textContent = 'Laden…';
    try {
      const [all, ids] = await Promise.all([fetchCoinsMarkets({ page:1, perPage:250 }), fetchTrending().catch(() => [])]);
      let items = [];
      if (ids && ids.length) {
        // Enrich trending ids with market data
        items = all.filter(c => ids.includes(c.id));
      }
      if (!items.length) {
        // Fallback: top 7 gainers by 24h %
        items = all.slice().sort((a,b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)).slice(0,7);
      }
      items = items.slice().sort((a,b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));
      trList.innerHTML = renderRowsWL(items);
      trEmpty.textContent = items.length ? '' : 'Geen trending items gevonden.';
    } catch (e) {
      console.error(e);
      trEmpty.textContent = 'Kon trending niet laden.';
    }
  };
  trList.addEventListener('click', (e) => {
    const btn = e.target.closest('button.rr-star');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.getAttribute('data-id');
    toggleWatchlist(id);
    refreshWatchlist();
    refreshTrending();
  });
  refreshTrending();
el.appendChild(tip);

  
  // Auto-refresh hook: update watchlist & trending on global refresh
  try {
    const onRRRefresh = () => { const d = Math.floor(Math.random()*300); setTimeout(()=>{ try { refreshWatchlist && refreshWatchlist(); } catch(e){} try { refreshTrending && refreshTrending(); } catch(e){} }, d); };
    window.addEventListener('rr:refresh', onRRRefresh);
    el.addEventListener('rr:teardown', () => window.removeEventListener('rr:refresh', onRRRefresh));
  } catch(e) {}
  
  // Incremental price/pct updater for Home widgets
  async function updateVisiblePricesHome(){
    try{
      const spans = Array.from(el.querySelectorAll('[data-field="price"],[data-field="pct24h"]'));
      const ids = Array.from(new Set(spans.map(s => s.getAttribute('data-id')).filter(Boolean)));
      if(ids.length===0) return;
      const fresh = await fetchMarketsByIds(ids);
      const map = new Map(fresh.map(x => [x.id, x]));
      // prices
      el.querySelectorAll('[data-field="price"]').forEach(sp => {
        const id = sp.getAttribute('data-id'); const d = map.get(id); if(!d) return;
        const newTxt = formatPriceEUR(d.current_price);
        if(sp.textContent !== newTxt){
          const up = (d.price_change_percentage_24h ?? 0) >= 0;
          sp.textContent = newTxt;
          sp.classList.remove('rr-tick-up','rr-tick-down');
          sp.classList.add(up ? 'rr-tick-up' : 'rr-tick-down');
        }
      });
      // pct
      el.querySelectorAll('[data-field="pct24h"]').forEach(sp => {
        const id = sp.getAttribute('data-id'); const d = map.get(id); if(!d) return;
        sp.textContent = formatPct2(d.price_change_percentage_24h);
      });
    }catch(e){ console.warn('updateVisiblePricesHome', e); }
  }
  const onRRRefreshHome = () => updateVisiblePricesHome();
  window.addEventListener('rr:refresh', onRRRefreshHome);
  el.addEventListener('rr:teardown', () => window.removeEventListener('rr:refresh', onRRRefreshHome));

  return el;

}