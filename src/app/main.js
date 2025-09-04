// src/app/main.js
import { initRouter } from './router.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { BottomNav } from './components/BottomNav.js';
import { getLocale } from './i18n/index.js';
import { initTheme } from './utils/theme.js';

function mountComponent(component, target, name) {
  try {
    if (!component || !target) return;
    if (typeof component === 'function') {
      const out = component();
      if (out instanceof HTMLElement) target.replaceChildren(out);
      else if (out != null) target.innerHTML = String(out);
      return;
    }
    if (typeof component.render === 'function') { component.render(target); return; }
    if (typeof component.mount === 'function') { component.mount(target); return; }
    target.innerHTML = '';
  } catch (e) { console.warn(`[main] mount ${name} failed:`, e); }
}

function ensureShell() {
  let rrMain = document.getElementById('rr-main');
  if (!rrMain) {
    rrMain = document.createElement('main');
    rrMain.id = 'rr-main';
    rrMain.setAttribute('role', 'main');
    rrMain.setAttribute('tabindex', '-1');
    document.body.appendChild(rrMain);
  }
  let appHost = document.getElementById('rr-app');
  if (!appHost) { appHost = document.createElement('div'); appHost.id = 'rr-app'; rrMain.appendChild(appHost); }
  let headerEl = document.getElementById('rr-header');
  if (!headerEl) { headerEl = document.createElement('div'); headerEl.id = 'rr-header'; headerEl.setAttribute('role', 'banner'); document.body.prepend(headerEl); }
  let footerEl = document.getElementById('rr-footer');
  if (!footerEl) { footerEl = document.createElement('div'); footerEl.id = 'rr-footer'; footerEl.setAttribute('role', 'contentinfo'); document.body.appendChild(footerEl); }
  let bottomNavEl = document.getElementById('rr-bottomnav');
  if (!bottomNavEl) { bottomNavEl = document.createElement('nav'); bottomNavEl.id = 'rr-bottomnav'; bottomNavEl.setAttribute('aria-label', 'Onderste navigatie'); footerEl.prepend(bottomNavEl); }
  return { headerEl, bottomNavEl, footerEl, appHost };
}

function ensureLayoutStyles() {
  if (document.getElementById('rr-layout-styles')) return;
  const style = document.createElement('style');
  style.id = 'rr-layout-styles';
  style.textContent = `
    .rr-container { max-width: 960px; margin: 0 auto; padding: 0 16px; }
    .page-header { margin: 16px 0 12px; }
    .coins-list { list-style: none; padding: 0; margin: 0; }
    .coins-list .coin { display: flex; gap: 8px; padding: 6px 0; border-bottom: 1px solid rgba(0,0,0,.06); }
  `;
  document.head.appendChild(style);
}

function ensureDefaultRoute() {
  if (!location.hash || location.hash === '#') {
    location.replace('#/');
  }
}

// Forceer hash routing op anchor-clicks
function enableAnchorRouting() {
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#/') || href.startsWith('/#/')) {
      e.preventDefault();
      const nextHash = href.startsWith('/#/') ? href.slice(1) : href;
      if (location.hash !== nextHash) {
        location.hash = nextHash;
      }
      // Forceer altijd update
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  }, true);
}

function bootstrap() {
  if (window.__RR_BOOTSTRAPPED__) return;
  window.__RR_BOOTSTRAPPED__ = true;

  try { document.documentElement.setAttribute('lang', getLocale()); } catch (_) {}

  initTheme();
  const { headerEl, bottomNavEl, footerEl } = ensureShell();
  ensureLayoutStyles();
  enableAnchorRouting();

  mountComponent(Header, headerEl, 'Header');
  mountComponent(BottomNav, bottomNavEl, 'BottomNav');
  mountComponent(Footer, footerEl, 'Footer');

  ensureDefaultRoute();
  try { initRouter(); } catch (e) { console.error('[RiskRadar] initRouter failed:', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else { bootstrap(); }
window.addEventListener('load', bootstrap, { once: true });
