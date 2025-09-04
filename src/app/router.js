// src/app/router.js
// Minimal SPA router with lifecycle cleanup (backwards compatible).
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
export function onCleanup(fn) { ctx.cleanups.add(fn); }
export function getAbortSignal() { return ctx.abortController.signal; }
function unmountCurrent() {
  try { ctx.abortController.abort(); } catch (_) {}
  for (const fn of ctx.cleanups) { try { fn(); } catch (e) { console.warn('[router] cleanup error', e);} }
  ctx.cleanups.clear();
}
function mount(route) {
  const outlet = document.getElementById('rr-app'); // <-- render into #rr-app
  if (!outlet) return;
  ctx = createRouteContext();
  const opts = { onCleanup, getAbortSignal };
  switch (route) {
    case 'home': renderHome?.length ? renderHome(opts) : renderHome(); break;
    case 'coins': renderCoins?.length ? renderCoins(opts) : renderCoins(); break;
    case 'settings': renderSettings?.length ? renderSettings(opts) : renderSettings(); break;
    default: renderHome?.length ? renderHome(opts) : renderHome(); break;
  }
}
function handleRouteChange() {
  unmountCurrent();
  const hash = (location.hash || '#/').slice(1);
  const path = hash.replace(/^\//, '');
  mount(path || 'home');
}
export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  onCleanup(() => window.removeEventListener('hashchange', handleRouteChange));
  const onLocale = () => handleRouteChange();
  window.addEventListener('localechange', onLocale);
  onCleanup(() => window.removeEventListener('localechange', onLocale));
  handleRouteChange();
}
