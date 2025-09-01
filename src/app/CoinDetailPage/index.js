import { isInWatchlist, toggleWatchlist } from '../data/watchlist.js';
import { CoinCharts } from '../components/CoinChart.js';

export function renderCoinDetailPage({ id }) {
  const el = document.createElement('div');
  el.className = 'rr-page';
  const coin = id || 'onbekend';
  el.innerHTML = `
    <h1 class="rr-title">
      Coin detail – ${coin}
      <button id="rr-detail-star" class="rr-pill" style="margin-left:8px; padding:2px 8px; cursor:pointer; font-size:14px;">☆ Watch</button>
    </h1>
    <div class="rr-subtle">Candlestick + SMA(6/9) + Bollinger(20,±2) en RSI(14). Kies bereik boven de grafiek.</div>
    <div id="rr-chart-root" class="rr-chart-root"></div>
    <p style="margin-top:12px;"><a href="javascript:void(0)" id="rr-back-link">← Terug</a></p>
  `;

  // Back
  const backEl = el.querySelector('#rr-back-link');
  if (backEl) {
    backEl.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.history.length > 1) { window.history.back(); }
      else { location.hash = '#/coins'; }
    });
  }

  // Watchlist toggle
  const starBtn = el.querySelector('#rr-detail-star');
  if (starBtn) {
    function sync() {
      const active = isInWatchlist(id);
      starBtn.textContent = active ? '★ In watchlist' : '☆ Watch';
      starBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
      starBtn.classList.toggle('active', active);
    }
    sync();
    starBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleWatchlist(id);
      sync();
    });
  }

  // Charts
  const root = el.querySelector('#rr-chart-root');
  if (root) {
    CoinCharts(root, { coinId: id, vsCurrency: 'eur' });
  }

  return el;
}
