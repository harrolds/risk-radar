export function renderCoinDetailPage({ id }) {
  const el = document.createElement('div');
  el.className = 'rr-page';
  const coin = id || 'onbekend';
  el.innerHTML = `
    <h1 class="rr-title">Coin detail – ${coin}</h1>
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
  return el;
}

