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
    return { route: 'notfound', params: {} };
  }

  function notFound() {
    const el = document.createElement('div');
    el.className = 'rr-page';
    el.innerHTML = '<h1>Pagina niet gevonden</h1><p>Ga terug naar <a href="#/">Home</a>.</p>';
    return el;
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
      default: view = notFound();
    }
    mount.appendChild(view);
    window.scrollTo(0,0);
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('load', render);
  render();
}
