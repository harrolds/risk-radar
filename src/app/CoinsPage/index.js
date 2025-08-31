export function renderCoinsPage() {
  const el = document.createElement('div');
  el.className = 'rr-page';
  el.innerHTML = `<h1 class="rr-title">Coins</h1>`;

  const pills = document.createElement('div');
  pills.className = 'rr-pills';
  pills.innerHTML = `
    <a href="#/coins?tab=all" class="rr-pill active" data-tab="all">Alle coins</a>
    <a href="#/coins?tab=gainers" class="rr-pill" data-tab="gainers">Stijgers</a>
    <a href="#/coins?tab=losers" class="rr-pill" data-tab="losers">Dalers</a>
  `;
  el.appendChild(pills);

  const listWrap = document.createElement('div');
  listWrap.innerHTML = `
    <ul class="rr-list" id="rr-coins-list"></ul>
    <p class="rr-subtle">Dummy lijsten in Fase 1. Live data & zoekfunctie volgen in Fase 2.</p>
  `;
  el.appendChild(listWrap);

  const coinsList = listWrap.querySelector('#rr-coins-list');

  function renderTab(tab='all') {
    coinsList.innerHTML = '';
    const data = {
      all: [
        ['BTC • Bitcoin', '+2.1%','pos','bitcoin'],
        ['ETH • Ethereum', '-0.4%','neg','ethereum'],
        ['SOL • Solana', '+1.2%','pos','solana'],
        ['BNB • BNB', '+0.6%','pos','binancecoin']
      ],
      gainers: [
        ['PEPE • Pepe', '+12.3%','pos','pepe'],
        ['SOL • Solana', '+1.2%','pos','solana'],
        ['INJ • Injective','+0.9%','pos','injective-protocol']
      ],
      losers: [
        ['ARB • Arbitrum', '-1.9%','neg','arbitrum'],
        ['ETH • Ethereum', '-0.4%','neg','ethereum']
      ]
    }[tab] || [];

    data.forEach(([name, pct, cls, slug]) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${name}</span> <span class="rr-badge ${cls}">${pct}</span>`;
      li.addEventListener('click', () => { window.location.hash = `#/coin/${slug}`; });
      coinsList.appendChild(li);
    });
  }

  function setActive(tab) {
    el.querySelectorAll('.rr-pill').forEach(a => a.classList.toggle('active', a.dataset.tab === tab));
  }

  const current = new URLSearchParams((location.hash.split('?')[1]||'')).get('tab') || 'all';
  setActive(current);
  renderTab(current);

  el.querySelectorAll('.rr-pill').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = a.dataset.tab;
      setActive(tab);
      renderTab(tab);
      history.replaceState(null,'', `#/coins?tab=${tab}`);
    });
  });

  return el;
}
