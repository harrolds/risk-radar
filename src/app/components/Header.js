export function Header() {
  const el = document.createElement('header');
  el.className = 'rr-header';
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;">
      <a href="#/" style="font-weight:700;letter-spacing:0.3px;">RiskRadar</a>
      <nav style="display:flex;gap:12px;">
        <a href="#/coins" aria-label="Coins">Coins</a>
        <a href="#/settings" aria-label="Instellingen">Instellingen</a>
      </nav>
    </div>
  `;
  return el;
}
