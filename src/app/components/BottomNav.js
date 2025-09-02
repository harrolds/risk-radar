import { t, onLocaleChange } from '../i18n/index.js';
function icon(name, size=20) {
  const icons = {
    home: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>`,
    coins: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3c5 0 9 1.3 9 3s-4 3-9 3-9-1.3-9-3 4-3 9-3z"/><path d="M21 12c0 1.7-4 3-9 3s-9-1.3-9-3"/><path d="M21 17c0 1.7-4 3-9 3s-9-1.3-9-3V5"/><path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/></svg>`,
    compare: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 3H6v18h4V3zM18 9h-4v12h4V9z"/></svg>`,
    portfolio: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7h18v10H3z"/><path d="M8 7V5h8v2"/></svg>`,
    pro: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7 7 .5-5.5 4.5 1.8 7L12 17l-6.3 4 1.8-7L2 9.5 9 9l3-7z"/></svg>`
  };
  return icons[name] || '';
}

export function BottomNav() {
  const el = document.createElement('nav');
  el.className = 'rr-bottomnav';
  const render = () => {
    
  el.innerHTML = `
    <a href="#/" data-route="home">${icon('home')}<span>${t('nav.home')}</span></a>
    <a href="#/coins" data-route="coins">${icon('coins')}<span>${t('nav.coins')}</span></a>
    <a href="#/compare" data-route="compare">${icon('compare')}<span>${t('router.compare.title')}</span></a>
    <a href="#/portfolio" data-route="portfolio">${icon('portfolio')}<span>${t('router.portfolio.title')}</span></a>
    <a href="#/pro" data-route="pro">${icon('pro')}<span>Pro</span></a>
  `;

    activate();
  };
  function activate() {
    const hash = window.location.hash || '#/';
    el.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      const active = hash === href || hash.startsWith(href + '/') || (href === '#/' && (hash === '#/' || hash === '#'));
      a.classList.toggle('active', active);
    });
  }
  window.addEventListener('hashchange', activate);
  window.addEventListener('load', activate);
  const off = onLocaleChange(render);
  el.addEventListener('rr:teardown', off);
  render();
  return el;
}


  // Rebuild labels on locale change
  window.addEventListener('rr:locale', () => {
    el.innerHTML = `
      <a href="#/" data-route="home">${icon('home')}<span>${t('nav.home')}</span></a>
      <a href="#/coins" data-route="coins">${icon('coins')}<span>${t('nav.coins')}</span></a>
      <a href="#/compare" data-route="compare">${icon('compare')}<span>${t('router.compare.title')}</span></a>
      <a href="#/portfolio" data-route="portfolio">${icon('portfolio')}<span>${t('router.portfolio.title')}</span></a>
      <a href="#/pro" data-route="pro">${icon('pro')}<span>Pro</span></a>
    `;
  });
