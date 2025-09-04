// src/app/router.js
import { renderHome } from './pages/Home/index.js';
import { renderCoins } from './pages/Coins/index.js';
import { renderSettings } from './pages/Settings/index.js';

/** @typedef {{ abortController: AbortController, cleanups: Set<() => void> }} RouteContext */
function createRouteContext() { return { abortController: new AbortController(), cleanups: new Set() }; }
/** @type {RouteContext} */ let ctx = createRouteContext();

export function onCleanup(fn) { ctx.cleanups.add(fn); }
export function getAbortSignal() { return ctx.abortController.signal; }

function unmountCurrent() {
  try { ctx.abortController.abort(); } catch (_) {}
  for (const fn of ctx.cleanups) { try { fn(); } catch (e) { console.warn('[router] cleanup error', e); } }
  ctx.cleanups.clear();
}

function outletEl() {
  return document.getElementById('rr-app');
}

function doMount(route) {
  const outlet = outletEl();
  if (!outlet) { console.warn('[router] #rr-app niet gevonden'); return; }

  ctx = createRouteContext();
  outlet.innerHTML = '';
  const opts = { onCleanup, getAbortSignal };

  switch (route) {
    case 'home':
    case '':
      renderHome(opts); break;
    case 'coins':
      renderCoins(opts); break;
    case 'settings':
      renderSettings(opts); break;
    case 'compare':
      outlet.innerHTML = `<div class="rr-container"><section class="page"><h1>Vergelijk</h1><p>Deze pagina komt later beschikbaar.</p></section></div>`; break;
    case 'portfolio':
      outlet.innerHTML = `<div class="rr-container"><section class="page"><h1>Portfolio</h1><p>Deze pagina komt later beschikbaar.</p></section></div>`; break;
    case 'pro':
      outlet.innerHTML = `<div class="rr-container"><section class="page"><h1>RiskRadar Pro</h1><p>Upgrade-flow volgt in Fase 7.</p></section></div>`; break;
    default:
      renderHome(opts);
  }
}

function normalizeRoute() {
  const hash = (location.hash || '#/').slice(1); // "..." minus leading '#'
  const path = hash.replace(/^\//, '');          // drop leading '/'
  return path.split('?')[0];                     // no query
}

function handleRouteChange() {
  unmountCurrent();
  const route = normalizeRoute() || 'home';
  doMount(route);

  // Guard: als er (asynchroon) iets DOM leegtrekt, forceer één remount in microtask
  queueMicrotask(() => {
    const o = outletEl();
    if (o && o.children.length === 0 && o.innerHTML.trim() === '') {
      // één her-mount poging
      doMount(route);
    }
  });
}

export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  onCleanup(() => window.removeEventListener('hashchange', handleRouteChange));
  const onLocale = () => handleRouteChange();
  window.addEventListener('localechange', onLocale);
  onCleanup(() => window.removeEventListener('localechange', onLocale));
  handleRouteChange();
}
