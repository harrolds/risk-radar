// src/app/main.js
// Entry — gebruikt de bestaande shell (#rr-header, #rr-main > #rr-app, #rr-bottomnav, #rr-footer)

import { initRouter } from './router.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { BottomNav } from './components/BottomNav.js';
import { getLocale } from './i18n/index.js';

/** Mount helper (function or {render|mount} object) */
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
  } catch (e) {
    console.warn(`[main] mount ${name} failed:`, e);
  }
}

/** Gebruik DOM uit index.html; maak aan als iets ontbreekt */
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
  if (!appHost) {
    appHost = document.createElement('div');
    appHost.id = 'rr-app';
    rrMain.appendChild(appHost);
  }
  let headerEl = document.getElementById('rr-header');
  if (!headerEl) {
    headerEl = document.createElement('div');
    headerEl.id = 'rr-header';
    headerEl.setAttribute('role', 'banner');
    document.body.prepend(headerEl);
  }
  let footerEl = document.getElementById('rr-footer');
  if (!footerEl) {
    footerEl = document.createElement('div');
    footerEl.id = 'rr-footer';
    footerEl.setAttribute('role', 'contentinfo');
    document.body.appendChild(footerEl);
  }
  let bottomNavEl = document.getElementById('rr-bottomnav');
  if (!bottomNavEl) {
    bottomNavEl = document.createElement('nav');
    bottomNavEl.id = 'rr-bottomnav';
    bottomNavEl.setAttribute('aria-label', 'Onderste navigatie');
    footerEl.prepend(bottomNavEl);
  }
  return { headerEl, bottomNavEl, footerEl, appHost };
}

/** Houd default in lijn met je UI: '#/' == Home */
function ensureDefaultRoute() {
  if (!location.hash || location.hash === '#') {
    location.replace('#/');
  }
}

/** Bootstrap met guard */
function bootstrap() {
  if (window.__RR_BOOTSTRAPPED__) return;
  window.__RR_BOOTSTRAPPED__ = true;

  try { document.documentElement.setAttribute('lang', getLocale()); } catch (_) {}

  const { headerEl, bottomNavEl, footerEl } = ensureShell();
  mountComponent(Header, headerEl, 'Header');
  mountComponent(BottomNav, bottomNavEl, 'BottomNav');
  mountComponent(Footer, footerEl, 'Footer');

  ensureDefaultRoute();

  try { initRouter(); }
  catch (e) { console.error('[RiskRadar] initRouter failed:', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
window.addEventListener('load', bootstrap, { once: true });
