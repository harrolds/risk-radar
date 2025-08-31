function section(title, body) {
  const wrap = document.createElement('section');
  wrap.style.marginTop = '16px';
  wrap.innerHTML = `<h2 style="margin:0 0 8px 0;">${title}</h2>${body}`;
  return wrap;
}

export function renderHomePage() {
  const el = document.createElement('div');
  el.className = 'rr-page';
  el.innerHTML = `<h1 class="rr-title">RiskRadar – Home</h1>`;

  // Search
  const search = document.createElement('div');
  search.className = 'rr-search';
  search.innerHTML = `
    <input id="rr-search-input" placeholder="Zoek coin (bv. bitcoin, eth, sol)..." />
    <button id="rr-search-btn">Zoek</button>
  `;
  el.appendChild(section('Zoeken', search.outerHTML));

  // Watchlist (dummy)
  const watchlist = `
    <ul class="rr-list" id="rr-watchlist">
      <li><span>BTC • Bitcoin</span> <span class="rr-badge pos">+2.1%</span></li>
      <li><span>ETH • Ethereum</span> <span class="rr-badge neg">-1.3%</span></li>
      <li><span>SOL • Solana</span> <span class="rr-badge pos">+0.7%</span></li>
    </ul>
    <p class="rr-subtle">Dit is dummy data in Fase 1.</p>
  `;
  el.appendChild(section('Watchlist', watchlist));

  // Trending (dummy)
  const trending = `
    <ul class="rr-list" id="rr-trending">
      <li><span>PEPE • Meme</span> <span class="rr-badge pos">+12.3%</span></li>
      <li><span>INJ • Injective</span> <span class="rr-badge pos">+5.4%</span></li>
      <li><span>ARB • Arbitrum</span> <span class="rr-badge neg">-0.9%</span></li>
    </ul>
    <p class="rr-subtle">Dummy trending lijst – echte logica volgt in Fase 2.</p>
  `;
  el.appendChild(section('Trending risk scores', trending));

  return el;
}
