// /src/app/router.js
import { t } from './i18n/index.js';
import {
  renderHomePage,
  renderCoinsPage,
  renderSettingsPage,
  renderCoinDetailPage
} from './pages/index.js';

export function initRouter({ mount }) {
  function parse(hash) {
    const coinMatch = hash.match(/^#\/coin\/([^/]+)$/);
    if (coinMatch) return { route: 'coinDetail', params: { id: decodeURIComponent(coinMatch[1]) } };

    if (hash === '' || hash === '#' || hash === '#/') return { route: 'home', params: {} };
    if (hash.startsWith('#/coins'))     return { route: 'coins',     params: {} };
    if (hash.startsWith('#/settings'))  return { route: 'settings',  params: {} };
    if (hash.startsWith('#/compare'))   return { route: 'compare',   params: {} };
    if (hash.startsWith('#/portfolio')) return { route: 'portfolio', params: {} };
    if (hash.startsWith('#/pro'))       return { route: 'pro',       params: {} };
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

  // Titels voor document.title (gebruikt door a11y-init voor aankondigingen)
  function titleFor(route) {
    switch (route) {
      case 'home':      return t?.('router.home.title')       || 'Home';
      case 'coins':     return t?.('router.coins.title')      || 'Munten';
      case 'coinDetail':return t?.('router.coinDetail.title') || 'Munt';
      case 'settings':  return t?.('router.settings.title')   || 'Instellingen';
      case 'compare':   return t?.('router.compare.title')    || 'Vergelijken';
      case 'portfolio': return t?.('router.portfolio.title')  || 'Portfolio';
      case 'pro':       return t?.('router.pro.title')        || 'Pro';
      default:          return 'Niet gevonden';
    }
  }

  async function render() {
    const { route, params } = parse(window.location.hash);
    mount.innerHTML = '';

    // Update document title (helpt a11y-init met nette “Navigatie: …”)
    document.title = `RiskRadar — ${titleFor(route)}`;

    let view;
    switch (route) {
      case 'home':       view = renderHomePage(); break;
      case 'coins':      view = renderCoinsPage(); break;
      case 'coinDetail': view = renderCoinDetailPage(params); break;
      case 'settings':   view = renderSettingsPage(); break;
      case 'compare':    view = simplePage(t('router.compare.title'),   `<p class="rr-subtle">${t('router.compare.body')}</p>`); break;
      case 'portfolio':  view = simplePage(t('router.portfolio.title'), `<p class="rr-subtle">${t('router.portfolio.body')}</p>`); break;
      case 'pro':        view = simplePage(t('router.pro.title'),       `<p class="rr-subtle">${t('router.pro.body')}</p>`); break;
      default:           view = notFound();
    }

    mount.appendChild(view);
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('load', render);
  render();
}
