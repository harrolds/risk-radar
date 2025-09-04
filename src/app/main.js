// src/app/main.js
// RiskRadar entrypoint – bouwt DOM-frame (Header/Footer/BottomNav + #app) en start router.

import { initRouter } from './router.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { BottomNav } from './components/BottomNav.js';
import { getLocale } from './i18n/index.js';

/**
 * Helper: render component output (string of Node) in target element.
 * @param {Element} target
 * @param {any} componentOutput - string | Node | { toString(): string }
 */
function renderInto(target, componentOutput) {
  if (!target) return;
  if (componentOutput instanceof Node) {
    target.replaceChildren(componentOutput);
    return;
  }
  // fallback: behandel als HTML string
  target.innerHTML = String(componentOutput ?? '');
}

/**
 * Zorg dat de basisstructuur bestaat:
 * <header id="rr-header"></header>
 * <main id="app"></main>
 * <footer id="rr-footer"></footer>
 * <nav id="rr-bottomnav"></nav>
 */
function ensureShell() {
  const body = document.body;

  let headerEl = document.getElementById('rr-header');
  if (!headerEl) {
    headerEl = document.createElement('header');
    headerEl.id = 'rr-header';
    body.prepend(headerEl);
  }

  let appEl = document.getElementById('app');
  if (!appEl) {
    appEl = document.createElement('main');
    appEl.id = 'app';
    // plaats #app onder header en boven bottomnav/footer
    const afterHeader = headerEl.nextSibling;
    body.insertBefore(appEl, afterHeader || null);
  }

  let footerEl = document.getElementById('rr-footer');
  if (!footerEl) {
    footerEl = document.createElement('footer');
    footerEl.id = 'rr-footer';
    body.appendChild(footerEl);
  }

  let navEl = document.getElementById('rr-bottomnav');
  if (!navEl) {
    navEl = document.createElement('nav');
    navEl.id = 'rr-bottomnav';
    // BottomNav vóór footer
    body.insertBefore(navEl, footerEl);
  }

  return { headerEl, appEl, footerEl, navEl };
}

/**
 * Zet een veilige default hash als er (nog) geen route staat.
 */
function ensureDefaultRoute() {
  if (!location.hash || location.hash === '#') {
    location.replace('#/home');
  }
}

/**
 * Eenmalige bootstrap met guard tegen dubbele initialisatie.
 */
function bootstrap() {
  if (window.__RR_BOOTSTRAPPED__) return;
  window.__RR_BOOTSTRAPPED__ = true;

  // Locale → <html lang>
  try {
    document.documentElement.setAttribute('lang', getLocale());
  } catch (_) {}

  // Bouw shell + render vaste componenten
  const { headerEl, footerEl, navEl } = ensureShell();

  try {
    renderInto(headerEl, Header());
  } catch (e) {
    console.warn('[RiskRadar] Header render failed:', e);
  }

  try {
    renderInto(navEl, BottomNav());
  } catch (e) {
    console.warn('[RiskRadar] BottomNav render failed:', e);
  }

  try {
    renderInto(footerEl, Footer());
  } catch (e) {
    console.warn('[RiskRadar] Footer render failed:', e);
  }

  // Default route en router starten
  ensureDefaultRoute();
  try {
    initRouter();
  } catch (e) {
    console.error('[RiskRadar] initRouter failed:', e);
  }
}

// Init zodra DOM klaar is (en extra guard op window load)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
window.addEventListener('load', bootstrap, { once: true });
