// src/app/main.js
// RiskRadar entrypoint — met UI chrome (Header/Footer/BottomNav) + router bootstrap

import { initRouter } from './router.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { BottomNav } from './components/BottomNav.js';
import { getLocale } from './i18n/index.js';

/**
 * Zorg dat er een container bestaat met gegeven id.
 * Als deze niet bestaat, wordt hij aangemaakt en op de juiste plek geplaatst.
 * @param {string} id
 * @param {'header'|'main'|'footer'} region
 * @returns {HTMLElement}
 */
function ensureContainer(id, region) {
  let el = document.getElementById(id);
  if (el) return el;

  el = document.createElement(region === 'main' ? 'main' : region);
  el.id = id;

  // Plaats in logische volgorde: header → main → footer.
  // Als body leeg is, bouwen we een basisstructuur op.
  const body = document.body;

  const header = document.getElementById('rr-header');
  const app = document.getElementById('app');
  const footer = document.getElementById('rr-footer');

  if (!header && region === 'header') {
    body.prepend(el);
  } else if (!app && region === 'main') {
    if (header) {
      header.insertAdjacentElement('afterend', el);
    } else {
      body.prepend(el);
    }
  } else if (!footer && region === 'footer') {
    body.appendChild(el);
  } else {
    // fallback: gewoon achteraan
    body.appendChild(el);
  }

  return el;
}

/**
 * Probeert een component te mounten. We ondersteunen zowel:
 * - functionele componenten: () => string | HTMLElement
 * - object met .render(targetEl) of .mount(targetEl)
 * @param {any} component
 * @param {HTMLElement} target
 * @param {string} name
 */
function mountComponent(component, target, name) {
  try {
    if (!component) return;

    // function component → string/HTMLElement
    if (typeof component === 'function') {
      const out = component();
      if (out instanceof HTMLElement) {
        target.replaceChildren(out);
      } else if (out != null) {
        target.innerHTML = String(out);
      }
      return;
    }

    // object met render/mount
    if (typeof component.render === 'function') {
      component.render(target);
      return;
    }
    if (typeof component.mount === 'function') {
      component.mount(target);
      return;
    }

    // laatste redmiddel
    target.innerHTML = '';
  } catch (e) {
    console.warn(`[main] Fout bij mounten van ${name}:`, e);
  }
}

/**
 * Zet een veilige default route als er nog geen hash is.
 */
function ensureDefaultRoute() {
  if (!location.hash || location.hash === '#') {
    location.replace('#/home');
  }
}

/**
 * Bouw de basis UI (header, main #app, bottomnav, footer).
 */
function buildShell() {
  const headerEl = ensureContainer('rr-header', 'header');
  const appEl = ensureContainer('app', 'main');
  const bottomNavMount = ensureContainer('rr-bottomnav', 'footer'); // onderaan vóór footer-content
  const footerEl = ensureContainer('rr-footer', 'footer');

  // Mount components (defensief)
  mountComponent(Header, headerEl, 'Header');
  mountComponent(BottomNav, bottomNavMount, 'BottomNav');
  mountComponent(Footer, footerEl, 'Footer');

  // Zorg dat main altijd een rol heeft
  appEl.setAttribute('role', 'main');
}

/**
 * Eenmalige bootstrap met guard tegen dubbele init.
 */
function bootstrap() {
  if (window.__RR_BOOTSTRAPPED__) return;
  window.__RR_BOOTSTRAPPED__ = true;

  // Locale → html[lang]
  try {
    document.documentElement.setAttribute('lang', getLocale());
  } catch (_) {}

  // Basis UI neerzetten (containers + header/footer/bottomnav)
  buildShell();

  // Default route en router init
  ensureDefaultRoute();
  initRouter();
}

// Init bij DOM ready (fallback op window load)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
window.addEventListener('load', bootstrap, { once: true });
