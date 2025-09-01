function icon(name, size=18) {
  const icons = {
    home: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>`,
    cog: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 11 3.09V3a2 2 0 0 1 4 0v.09c0 .65.38 1.24.97 1.51h0c.6.27 1.3.16 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.49.52-.6 1.22-.33 1.82h0c.27.59.86.97 1.51.97H21a2 2 0 0 1 0 4h-.09c-.65 0-1.24.38-1.51.97Z"/></svg>`,
    coins: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/></svg>`
  };
  return icons[name] || '';
}

export function Header() {
  const el = document.createElement('header');
  el.className = 'rr-header';
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;">
      <a href="#/" style="font-weight:700;letter-spacing:0.3px;display:flex;align-items:center;gap:8px;">
        ${icon('home',20)} <span>RiskRadar</span>
      </a>
      <nav class="rr-headnav" style="display:flex;gap:12px;">
        <a href="#/coins" aria-label="Coins">${icon('coins')} <span>Coins</span></a>
        <a href="#/settings" aria-label="Instellingen">${icon('cog')} <span>Instellingen</span></a>
      </nav>
    </div>
  `;
  return el;
}
