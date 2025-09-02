import { renderHomePage } from './HomePage/index.js';
import { renderCoinsPage } from './CoinsPage/index.js';
import { renderSettingsPage } from './SettingsPage/index.js';
import { renderCoinDetailPage } from './CoinDetailPage/index.js';

export function initRouter({ mount }) {
  function parse(hash) {
    const coinMatch = hash.match(/^#\/coin\/([^/]+)$/);
    if (coinMatch) return { route: 'coinDetail', params: { id: decodeURIComponent(coinMatch[1]) } };

    if (hash === '' || hash === '#' || hash === '#/') return { route: 'home', params: {} };
    if (hash.startsWith('#/coins')) return { route: 'coins', params: {} };
    if (hash.startsWith('#/settings')) return { route: 'settings', params: {} };
    if (hash.startsWith('#/compare')) return { route: 'compare', params: {} };
    if (hash.startsWith('#/portfolio')) return { route: 'portfolio', params: {} };
    if (hash.startsWith('#/pro')) return { route: 'pro', params: {} };
    return { route: 'notfound', params: {} };
  }

  function simplePage(title, body='') {
    const el = document.createElement('div');
    el.className = 'rr-page';
    el.innerHTML = `<h1 class="rr-title">${title}</h1>${body || '<p class="rr-subtle">Placeholder – inhoud volgt in volgende fase.</p>'}`;
    return el;
  }

  function notFound() {
    return simplePage('Pagina niet gevonden', '<p>Ga terug naar <a href="#/">Home</a>.</p>');
  }

  async function render() {
    const { route, params } = parse(window.location.hash);
    mount.innerHTML = '';
    let view;
    switch(route) {
      case 'home': view = renderHomePage(); break;
      case 'coins': view = renderCoinsPage(); break;
      case 'coinDetail': view = renderCoinDetailPage(params); break;
      case 'settings': view = renderSettingsPage(); break;
      case 'compare': view = simplePage('Vergelijk', '<p class="rr-subtle">Vergelijk-functionaliteit wordt in Fase 4 geactiveerd.</p>'); break;
      case 'portfolio': view = simplePage('Portfolio', '<p class="rr-subtle">Portfolio wordt later toegevoegd.</p>'); break;
      case 'pro': view = simplePage('RiskRadar Pro', '<p class="rr-subtle">Upgrade-flow komt in Fase 7 (Predict Pro).</p>'); break;
      default: view = notFound();
    }
    mount.appendChild(view);
    window.scrollTo(0,0);
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('load', render);
  
  render();
}
