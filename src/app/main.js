// src/app/main.js
// RiskRadar entrypoint (actief via index.html <script type="module" src="/src/app/main.js">)

import { initRouter } from './router.js';
import { getLocale } from './i18n/index.js';

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

  // Zorg voor een default route
  ensureDefaultRoute();

  // i18n is al lazy-init via module side effects; getLocale() houdt html[lang] synchroon
  try {
    document.documentElement.setAttribute('lang', getLocale());
  } catch (e) {
    /* ignore */
  }

  // Router starten
  try {
    initRouter();
  } catch (e) {
    console.error('[RiskRadar] initRouter failed:', e);
  }
}

// Init zodra DOM klaar is (en ook fallback op window load)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
window.addEventListener('load', bootstrap, { once: true });
