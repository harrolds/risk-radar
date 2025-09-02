import { t } from '../../i18n/index.js';
import { formatPriceEUR, formatPct2 } from '../../utils/format.js';
import { fetchCoinsMarkets, fetchMarketsByIds } from '../../data/coingecko.js';
import { isInWatchlist, toggleWatchlist } from '../../data/watchlist.js';


export function renderCoinsPage() {
  const el = document.createElement('div');
  el.className = 'rr-page';
  el.innerHTML = `<h1 class="rr-title">Coins</h1>`;

  // Pills (tabs) — behoud originele DOM-structuur en classes
  const pills = document.createElement('div');
  pills.className = 'rr-pills';
  pills.innerHTML = `
    <a href="#/coins?tab=all" class="rr-pill active" data-tab="all">${t('coins.tabs.all')}</a>
    <a href="#/coins?tab=gainers" class="rr-pill" data-tab="gainers">${t('coins.tabs.gainers')}</a>
    <a href="#/coins?tab=losers" class="rr-pill" data-tab="losers">${t('coins.tabs.losers')}</a>
  `;
  el.appendChild(pills);

  // Search bar — gebruikt bestaande .rr-search styles
  const search = document.createElement('div');
  search.className = 'rr-search';
  search.innerHTML = `
    <input id="rr-coins-q" type="text" placeholder="${t('search.placeholder')}" aria-label="${t('search.placeholder')}" />
    <button id="rr-coins-clear" type="button">${t('search.clear')}</button>
  `;
  el.appendChild(search);

  // List container — behoud .rr-list classes
  const listWrap = document.createElement('div');
  listWrap.innerHTML = `<ul class="rr-list" id="rr-coins-list"></ul>`;
  el.appendChild(listWrap);

  // Status element
  const status = document.createElement('div');
  status.id = 'rr-coins-status';
  status.style.marginTop = '8px';
  el.appendChild(status);

  const qInput = search.querySelector('#rr-coins-q');
  const qClear = search.querySelector('#rr-coins-clear');
  const listEl = listWrap.querySelector('#rr-coins-list');

  // Delegated click: handle ☆/★ without navigating to detail
  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button.rr-star');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.getAttribute('data-id');
    toggleWatchlist(id);
    const inList = isInWatchlist(id);
    btn.setAttribute('aria-pressed', String(inList));
    btn.textContent = inList ? '★' : '☆';
    btn.title = inList ? 'Verwijder uit watchlist' : 'Voeg toe aan watchlist';
    // Notify Home watchlist to refresh
    try { window.dispatchEvent(new CustomEvent('rr:watchlist-changed')); } catch {}
  });


  // Helpers
  const setActive = (tab) => {
    el.querySelectorAll('.rr-pill').forEach(a => {
      a.classList.toggle('active', a.dataset.tab === tab);
    });
  };

  const renderRows = (rows) => {
    listEl.innerHTML = rows.map(c => {
      const pct = c.price_change_percentage_24h ?? 0;
      const cls = pct >= 0 ? 'rr-badge pos' : 'rr-badge neg';
      const price = formatPriceEUR(c.current_price);
    const pctTxt = formatPct2(pct);
    return `<li>
  <a href="#/coin/${c.id}" style="display:flex; justify-content:space-between; align-items:center; text-decoration:none; color:inherit;">
    <span style="display:flex; align-items:center; gap:8px;">
          <button class="rr-star" style="background:transparent; border:none; cursor:pointer; font-size:16px; line-height:1; padding:0; position:relative; z-index:1;" data-id="${c.id}" aria-pressed="${isInWatchlist(c.id)}" title="${isInWatchlist(c.id) ? 'Verwijder uit watchlist' : 'Voeg toe aan watchlist'}" style="background:transparent; border:none; cursor:pointer; font-size:16px; line-height:1; padding:0;">${isInWatchlist(c.id) ? '★' : '☆'}</button>
          <img src="${c.image}" alt="" width="20" height="20" style="vertical-align:middle;" />
          <span>${c.symbol} • ${c.name}</span>
        </span>
    <span><span style="opacity:.8; margin-right:10px;"><span class="rr-price" data-id="${c.id}" data-field="price">${price}</span></span><span class="${cls}"><span class="rr-pct" data-id="${c.id}" data-field="pct24h">${pctTxt}</span></span></span>
  </a>
</li>`;
    }).join('');
  };

  // State
  let all = [];
  let filtered = [];
  let currentTab = 'all';

  const applyFilters = () => {
    const q = (qInput.value || '').trim().toLowerCase();
    let view = all;

    if (currentTab === 'gainers') view = view.filter(c => (c.price_change_percentage_24h ?? 0) > 0);
    if (currentTab === 'losers')  view = view.filter(c => (c.price_change_percentage_24h ?? 0) < 0);

    if (q) {
      view = view.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    filtered = view;
    renderRows(filtered);
  };

  // Load
  (async () => {
    status.textContent = 'Laden…';
    try {
      all = await fetchCoinsMarkets({ page: 1, perPage: 250 });
      status.textContent = '';
      applyFilters();
    } catch (err) {
      console.error(err);
      status.innerHTML = `<div class="rr-subtle">Kon coins niet laden. <button id="rr-retry" type="button">Opnieuw proberen</button></div>`;
      status.querySelector('#rr-retry')?.addEventListener('click', () => {
        status.textContent = '';
        all = [];
        applyFilters();
        // retry
        (async () => {
          status.textContent = 'Laden…';
          try {
            all = await fetchCoinsMarkets({ page: 1, perPage: 250 });
            status.textContent = '';
            applyFilters();
          } catch (e) {
            status.textContent = 'Fout: laden mislukt.';
          }
        })();
      });
    }
  })();

  // Events
  el.querySelectorAll('.rr-pill').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = a.dataset.tab;
      currentTab = tab;
      setActive(tab);
      // update hash zonder volledige reroute
      history.replaceState(null,'', `#/coins?tab=${tab}`);
      applyFilters();
    });
  });

  let t;
  qInput.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(applyFilters, 200);
  });
  qClear.addEventListener('click', () => {
    qInput.value = '';
    applyFilters();
  });

  // Initial tab from URL (preserve original behavior)
  const m = (location.hash || '').match(/tab=(all|gainers|losers)/);
  if (m) {
    currentTab = m[1];
    setActive(currentTab);
  }

  
  // Auto-refresh hook: reapply filters (and refetch if code supports it)
  try {
    const onRRRefresh = () => {
      try { applyFilters && applyFilters(); } catch(_e) {}
      // Fallback: simulate clicking active tab to trigger reload if implemented that way
      try {
        const active = pills.querySelector('.rr-pill.active');
        if (active) active.click();
      } catch(_e) {}
    };
    window.addEventListener('rr:refresh', onRRRefresh);
    el.addEventListener('rr:teardown', () => window.removeEventListener('rr:refresh', onRRRefresh));
  } catch(_e) {}

  
  async function updateVisiblePricesCoins(){
    try{
      const spans = Array.from(el.querySelectorAll('[data-field="price"],[data-field="pct24h"]'));
      const ids = Array.from(new Set(spans.map(s => s.getAttribute('data-id')).filter(Boolean)));
      if(ids.length===0) return;
      const fresh = await fetchMarketsByIds(ids);
      const map = new Map(fresh.map(x => [x.id, x]));
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
      el.querySelectorAll('[data-field="pct24h"]').forEach(sp => {
        const id = sp.getAttribute('data-id'); const d = map.get(id); if(!d) return;
        sp.textContent = formatPct2(d.price_change_percentage_24h);
      });
    }catch(e){ console.warn('updateVisiblePricesCoins', e); }
  }
  const onRRRefreshCoins = () => { const d=Math.floor(Math.random()*300); setTimeout(updateVisiblePricesCoins, d); };
  window.addEventListener('rr:refresh', onRRRefreshCoins);
  el.addEventListener('rr:teardown', () => window.removeEventListener('rr:refresh', onRRRefreshCoins));

  return el;

}