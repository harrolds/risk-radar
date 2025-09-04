// src/app/router.js
// Minimal SPA router with lifecycle cleanup (backwards compatible).

import { renderHome } from './pages/HomePage/index.js';
import { renderCoins } from './pages/CoinsPage/index.js';
import { renderSettings } from './pages/SettingsPage/index.js';

/**
 * @typedef {Object} RouteContext
 * @property {AbortController} abortController
 * @property {Set<() => void>} cleanups
 */

/**
 * Create a fresh context with cleanup registry and abort controller.
 * @returns {RouteContext}
 */
function createRouteContext() {
  return {
    abortController: new AbortController(),
    cleanups: new Set(),
  };
}

/** @type {RouteContext} */
let ctx = createRouteContext();

/**
 * Register a cleanup callback that runs on unmount.
 * @param {() => void} fn
 */
export function onCleanup(fn) {
  ctx.cleanups.add(fn);
}

/**
 * Get an AbortSignal bound to the current route context.
 * Use in fetch: fetch(url, { signal: getAbortSignal() })
 * @returns {AbortSignal}
 */
export function getAbortSignal() {
  return ctx.abortController.signal;
}

/**
 * Unmount current route: abort pending requests and run cleanups.
 */
function unmountCurrent() {
  try {
    ctx.abortController.abort();
  } catch (_) {}

  for (const fn of ctx.cleanups) {
    try {
      fn();
    } catch (e) {
      console.warn('[router] cleanup error', e);
    }
  }
  ctx.cleanups.clear();
}

/**
 * Mount a route by name.
 * Passes lifecycle helpers if the render function expects an options object.
 * (Backwards compatible: renderX can ignore the argument.)
 * @param {string} route
 */
function mount(route) {
  const outlet = document.getElementById('app');
  if (!outlet) return;

  // Fresh context for the new route
  ctx = createRouteContext();

  const opts = { onCleanup, getAbortSignal };

  switch (route) {
    case 'home':
      renderHome?.length ? renderHome(opts) : renderHome();
      break;
    case 'coins':
      renderCoins?.length ? renderCoins(opts) : renderCoins();
      break;
    case 'settings':
      renderSettings?.length ? renderSettings(opts) : renderSettings();
      break;
    default:
      renderHome?.length ? renderHome(opts) : renderHome();
      break;
  }
}

/**
 * Simple hash-based router.
 */
function handleRouteChange() {
  unmountCurrent();
  const hash = (location.hash || '#/').slice(1);
  const path = hash.replace(/^\//, '');
  mount(path || 'home');
}

/**
 * Initialize router (call once).
 */
export function initRouter() {
  // Listen to hash changes
  window.addEventListener('hashchange', handleRouteChange);
  onCleanup(() => window.removeEventListener('hashchange', handleRouteChange));

  // Re-render current route on locale change (keeps pages simple)
  const onLocale = () => handleRouteChange();
  window.addEventListener('localechange', onLocale);
  onCleanup(() => window.removeEventListener('localechange', onLocale));

  // Initial route
  handleRouteChange();
}
