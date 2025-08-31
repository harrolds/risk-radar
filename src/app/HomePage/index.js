export function renderHomePage() {
  const el = document.createElement('div');
  el.className = 'rr-page';
  el.innerHTML = `
    <h1 class="rr-title">RiskRadar – Home</h1>
    <p class="rr-subtle">Fundament staat. Navigatie werkt. Coin detail is als placeholder aanwezig.</p>

    <div style="margin-top:12px;">
      <h2 style="margin:0 0 8px 0;">Voorbeeld secties</h2>
      <ul>
        <li><a href="#/coins">Naar Coins-overzicht</a></li>
        <li><a href="#/coin/bitcoin">Voorbeeld CoinDetail: Bitcoin</a></li>
        <li><a href="#/settings">Naar Instellingen</a></li>
      </ul>
    </div>
  `;
  return el;
}
