export function renderCoinsPage() {
  const el = document.createElement('div');
  el.className = 'rr-page';
  el.innerHTML = `
    <h1 class="rr-title">Coins</h1>
    <p class="rr-subtle">Fase 1: placeholder lijst. Zoek, tabs en live data volgen in Fase 2.</p>
    <ul>
      <li><a href="#/coin/bitcoin">Bitcoin</a></li>
      <li><a href="#/coin/ethereum">Ethereum</a></li>
      <li><a href="#/coin/solana">Solana</a></li>
    </ul>
  `;
  return el;
}
