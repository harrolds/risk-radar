// src/app/router.js
// SPA router met nette cleanup + robuuste mount naar #rr-app

import { renderHome } from './pages/Home/index.js';
import { renderCoins } from './pages/Coins/index.js';
import { renderSettings } from './pages/Settings/index.js';

/**
 * @typedef {Object} RouteContext
 * @property {AbortController} abortController
 * @property {Set<() => void>} cleanups
 */
function createRouteContext() {
  return { abortController: new AbortController(), cleanups: new Set() };
}

/** @type {RouteContext} */
let ctx = createRouteContext();

/** Registreer cleanup-callbacks (wordt bij navigatie uitgevoerd) */
export function onCleanup(fn) {
  ctx.cleanups.add(fn);
}

/** AbortSignal voor abortable fetches binnen de huidige route */
export function getAbortSignal() {
  return ctx.abortController.signal;
}

/** Unmount huidige route: abort pending requests + run cleanups */
function unmountCurrent() {
  try { ctx.abortController.abort(); } catch (_) {}
  for (const fn of ctx.cleanups) {
    try { fn(); } catch (e) { console.warn('[router] cleanup error', e); }
  }
  ctx.cleanups.clear();
}

/** Render de gegeven route in #rr-app */
function mount(route) {
  const outlet = document.getElementById('rr-app');
  if (!outlet) {
    console.warn('[router] #rr-app niet gevonden');
    return;
  }

  // Nieuwe context voor de frisse route
  ctx = createRouteContext();

  // Leeg de outlet vooraf (voorkomt “rommel”)
  outlet.innerHTML = '';

  // Opties ALTIJD doorgeven (geen arity-check)
  const opts = { onCleanup, getAbortSignal };

  switch (route) {
    case 'home':
    case '':
      renderHome(opts);
      break;
    case 'coins':
      renderCoins(opts);
      break;
    case 'settings':
      renderSettings(opts);
      break;

    // Placeholder routes (optioneel)
    case 'compare':
      outlet.innerHTML = `<div class="rr-container"><section class="page"><h1>Vergelijk</h1><p>Deze pagina komt later beschikbaar.</p></section></div>`;
      break;
    case 'portfolio':
      outlet.innerHTML = `<div class="rr-container"><section class="page"><h1>Portfolio</h1><p>Deze pagina komt later beschikbaar.</p></section></div>`;
      break;
    case 'pro':
      outlet.innerHTML = `<div class="rr-container"><section class="page"><h1>RiskRadar Pro</h1><p>Upgrade-flow volgt in Fase 7.</p></section></div>`;
      break;

    default:
      renderHome(opts);
      break;
  }
}

/** Hash-router handler */
function handleRouteChange() {
  unmountCurrent();
  // '#/' => hash = '#/', slice(1) => '/', replace(/^\//,'') => '' => 'home'
  const hash = (location.hash || '#/').slice(1);
  const path = hash.replace(/^\//, '');
  mount(path || 'home');
}

/** Init router (call once) */
export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  onCleanup(() => window.removeEventListener('hashchange', handleRouteChange));

  // Re-render bij taalwissel (houdt pages simpel)
  const onLocale = () => handleRouteChange();
  window.addEventListener('localechange', onLocale);
  onCleanup(() => window.removeEventListener('localechange', onLocale));

  // Eerste render
  handleRouteChange();
}
