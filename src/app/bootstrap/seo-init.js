// src/app/bootstrap/seo-init.js
// Dynamische SEO voor SPA: titel, description, Open Graph, canonical, robots, twitter.
// Werkt met hash-routes (#/...), patcht pushState/replaceState en luistert op hashchange/popstate.

import { t } from '../i18n/index.js';

(function () {
  const SITE_NAME = 'RiskRadar';
  const BASE_URL = location.origin; // absolute canonical base

  // --- Helpers --------------------------------------------------------------
  function ensureMetaByName(name) {
    let el = document.head.querySelector(`meta[name="${name}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
    return el;
  }
  function ensureMetaByProp(prop) {
    let el = document.head.querySelector(`meta[property="${prop}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
    return el;
  }
  function ensureLinkCanonical() {
    let el = document.head.querySelector('link[rel="canonical"]');
    if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el); }
    return el;
  }

  // Route parsing (matcht jouw router)
  function parseRoute() {
    const hash = window.location.hash || '';
    const m = hash.match(/^#\/coin\/([^/]+)$/);
    if (m) return { route: 'coinDetail', params: { id: decodeURIComponent(m[1]) } };
    if (hash === '' || hash === '#' || hash === '#/') return { route: 'home', params: {} };
    if (hash.startsWith('#/coins'))     return { route: 'coins',     params: {} };
    if (hash.startsWith('#/settings'))  return { route: 'settings',  params: {} };
    if (hash.startsWith('#/compare'))   return { route: 'compare',   params: {} };
    if (hash.startsWith('#/portfolio')) return { route: 'portfolio', params: {} };
    if (hash.startsWith('#/pro'))       return { route: 'pro',       params: {} };
    return { route: 'notfound', params: {} };
  }

  // Titles / descriptions
  const i18n = (k, fb) => { try { return t?.(k) || fb; } catch { return fb; } };

  function titleFor(route, params) {
    switch (route) {
      case 'home':       return i18n('seo.home.title', 'Home');
      case 'coins':      return i18n('seo.coins.title', 'Munten');
      case 'coinDetail': return (i18n('seo.coin.title', 'Munt')) + (params?.id ? ` – ${params.id}` : '');
      case 'settings':   return i18n('seo.settings.title', 'Instellingen');
      case 'compare':    return i18n('seo.compare.title', 'Vergelijken');
      case 'portfolio':  return i18n('seo.portfolio.title', 'Portfolio');
      case 'pro':        return i18n('seo.pro.title', 'Pro');
      default:           return i18n('seo.notfound.title', 'Niet gevonden');
    }
  }

  function descFor(route, params) {
    switch (route) {
      case 'home':
        return i18n('seo.home.desc', 'Volg crypto-markttrends, watchlist en prijzen in EUR.');
      case 'coins':
        return i18n('seo.coins.desc', 'Overzicht van munten met prijs, 24h verandering en ranking.');
      case 'coinDetail':
        return i18n('seo.coin.desc', 'Details, prijs en verandering voor deze munt.');
      case 'settings':
        return i18n('seo.settings.desc', 'Instellingen en voorkeuren van RiskRadar.');
      default:
        return i18n('seo.generic.desc', 'RiskRadar – marktinzichten, trending en watchlist.');
    }
  }

  // Canonical path zonder hash (SPA-compat; Netlify serveert overal index.html)
  function pathFor(route, params) {
    switch (route) {
      case 'home':       return '/';
      case 'coins':      return '/coins';
      case 'settings':   return '/settings';
      case 'coinDetail': return params?.id ? `/coin/${encodeURIComponent(params.id)}` : '/coin';
      case 'compare':    return '/compare';
      case 'portfolio':  return '/portfolio';
      case 'pro':        return '/pro';
      default:           return '/404';
    }
  }

  function updateSEO() {
    const { route, params } = parseRoute();

    const title = titleFor(route, params);
    const desc  = descFor(route, params);
    const path  = pathFor(route, params);
    const url   = BASE_URL + path;

    // Document title (houdt lijn met router; zelfde string voorkomt flikkeren)
    document.title = `RiskRadar — ${title}`;

    // Meta description
    ensureMetaByName('description').setAttribute('content', desc);

    // Open Graph
    ensureMetaByProp('og:site_name').setAttribute('content', SITE_NAME);
    ensureMetaByProp('og:type').setAttribute('content', route === 'home' ? 'website' : 'article');
    ensureMetaByProp('og:title').setAttribute('content', `${title} | ${SITE_NAME}`);
    ensureMetaByProp('og:description').setAttribute('content', desc);
    ensureMetaByProp('og:url').setAttribute('content', url);
    ensureMetaByProp('og:locale').setAttribute('content', 'nl_NL');

    // Twitter (basic)
    ensureMetaByName('twitter:card').setAttribute('content', 'summary');
    ensureMetaByName('twitter:title').setAttribute('content', `${title} | ${SITE_NAME}`);
    ensureMetaByName('twitter:description').setAttribute('content', desc);

    // Canonical
    ensureLinkCanonical().setAttribute('href', url);

    // Robots (zorg dat-ie bestaat en staat op index,follow)
    ensureMetaByName('robots').setAttribute('content', 'index,follow');
  }

  // Hooks op navigatie: initial + hash/popstate + push/replace
  document.addEventListener('DOMContentLoaded', updateSEO);
  window.addEventListener('hashchange', updateSEO);
  window.addEventListener('popstate', updateSEO);

  const _push = history.pushState;
  const _replace = history.replaceState;
  history.pushState = function (s, t, u) { const r = _push.apply(this, arguments); setTimeout(updateSEO, 0); return r; };
  history.replaceState = function (s, t, u) { const r = _replace.apply(this, arguments); setTimeout(updateSEO, 0); return r; };
})();
