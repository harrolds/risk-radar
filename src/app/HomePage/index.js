import { fetchCoinsMarkets } from '../data/coingecko.js';

export function renderHomePage() {
  const el = document.createElement('div');
  el.className = 'rr-page';

  // Title
  const title = document.createElement('h1');
  title.className = 'rr-title';
  title.textContent = 'RiskRadar';
  el.appendChild(title);

  // Intro card (keeps existing friendly intro)
  const intro = document.createElement('div');
  intro.className = 'rr-card';
  intro.innerHTML = `<p>Zoek direct naar een coin. Klik op een resultaat voor details.</p>`;
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

  // State
  let all = null;     // full market list (cached by fetchCoinsMarkets)
  let timer = null;

  // Helpers
  const renderRows = (rows) => {
    resultsEl.innerHTML = rows.map(c => {
      const pct = c.price_change_percentage_24h ?? 0;
      const cls = pct >= 0 ? 'rr-badge pos' : 'rr-badge neg';
      const price = (c.current_price ?? 0).toLocaleString('nl-NL', { style:'currency', currency:'EUR', maximumFractionDigits: 8 });
      const pctTxt = `${pct.toFixed(2)}%`;
      return `<li>
        <a href="#/coin/${c.id}" style="display:flex; justify-content:space-between; align-items:center; text-decoration:none; color:inherit;">
          <span><img src="${c.image}" alt="" width="20" height="20" style="vertical-align:middle; margin-right:8px;" />${c.symbol} • ${c.name}</span>
          <span><span style="opacity:.8; margin-right:10px;">${price}</span><span class="${cls}">${pctTxt}</span></span>
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
  });
  qClear.addEventListener('click', () => {
    qInput.value = '';
    doFilter();
    qInput.focus();
  });

  // Accessibility tip (Content Manager: tooltip/uitleg)
  const tip = document.createElement('p');
  tip.className = 'rr-subtle';
  tip.style.marginTop = '8px';
  tip.textContent = 'Tip: je kunt zoeken op naam (“bitcoin”) of symbool (“BTC”). Klik op een resultaat voor details.';
  el.appendChild(tip);

  return el;
}
