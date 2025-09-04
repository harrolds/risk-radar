// src/app/main.js
// RiskRadar entrypoint — shell (Header/Footer/BottomNav) + router bootstrap into #rr-app

import { initRouter } from './router.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { BottomNav } from './components/BottomNav.js';
import { getLocale } from './i18n/index.js';

/**
 * Mount a component into a target (supports function or {render|mount} objects).
 * @param {any} component
 * @param {HTMLElement} target
 * @param {string} name
 */
function mountComponent(component, target, name) {
  try {
    if (!component || !target) return;
    if (typeof component === 'function') {
      const out = component();
      if (out instanceof HTMLElement) {
        target.replaceChildren(out);
      } else if (out != null) {
        target.innerHTML = String(out);
      }
      return;
    }
    if (typeof component.render === 'function') {
      component.render(target);
      return;
    }
    if (typeof component.mount === 'function') {
      component.mount(target);
      return;
    }
    target.innerHTML = '';
  } catch (e) {
    console.warn(`[main] mount ${name} failed:`, e);
  }
}

/** Ensure base containers exist; prefer existing DOM from index.html. */
function ensureShell() {
  // Main host
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

  // Header / Footer / Bottom nav
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
    // place before footer content
    footerEl.prepend(bottomNavEl);
  }

  return { headerEl, bottomNavEl, footerEl, appHost };
}

/** Set a safe default route if none present. */
function ensureDefaultRoute() {
  if (!location.hash || location.hash === '#') {
    location.replace('#/home');
  }
}

/** One-time bootstrap with guard. */
function bootstrap() {
  if (window.__RR_BOOTSTRAPPED__) return;
  window.__RR_BOOTSTRAPPED__ = true;

  try {
    document.documentElement.setAttribute('lang', getLocale());
  } catch (_) {}

  const { headerEl, bottomNavEl, footerEl } = ensureShell();

  // Mount chrome
  mountComponent(Header, headerEl, 'Header');
  mountComponent(BottomNav, bottomNavEl, 'BottomNav');
  mountComponent(Footer, footerEl, 'Footer');

  ensureDefaultRoute();
  try {
    initRouter();
  } catch (e) {
    console.error('[RiskRadar] initRouter failed:', e);
  }
}

// Init on DOM ready (fallback on load)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
window.addEventListener('load', bootstrap, { once: true });
