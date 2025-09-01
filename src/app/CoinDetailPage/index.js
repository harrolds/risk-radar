import { isInWatchlist, toggleWatchlist } from '../data/watchlist.js';
export function renderCoinDetailPage({ id }) {
  const el = document.createElement('div');
  el.className = 'rr-page';
  const coin = id || 'onbekend';
  el.innerHTML = `
    <h1 class="rr-title">Coin detail – ${coin} <button id="rr-detail-star" class="rr-star" style="margin-left:8px; background:transparent; border:1px solid rgba(255,255,255,.15); border-radius:8px; padding:2px 8px; cursor:pointer; font-size:14px;">☆ Watch</button></h1>
    <p class="rr-subtle">Placeholder in Fase 1. In Fase 2 tonen we grafieken, RSI/MA/Bollinger en risicoscore.</p>
    <p><a href="javascript:void(0)" id="rr-back-link">← Terug naar Coins</a></p>
  `;
    const backEl = el.querySelector('#rr-back-link');
  if (backEl) {
    backEl.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.history.length > 1) { window.history.back(); }
      else { location.hash = '#/coins'; }
    });
  }
  
  // Wire up detail star if element exists
  const starBtn = el.querySelector('#rr-detail-star');
  if (starBtn) {
    const idMatch = (location.hash || '').match(/^#\/coin\/([^/?#]+)/);
    const id = idMatch ? idMatch[1] : null;
    if (id) {
      const sync = () => {
        const inList = isInWatchlist(id);
        starBtn.textContent = inList ? '★ In watchlist' : '☆ Watch';
        starBtn.setAttribute('aria-pressed', String(inList));
        starBtn.title = inList ? 'Verwijder uit watchlist' : 'Voeg toe aan watchlist';
      };
      sync();
      starBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleWatchlist(id);
        sync();
      });
    } else {
      starBtn.style.display = 'none';
    }
  }
  return el;
}


