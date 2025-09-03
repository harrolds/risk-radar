// src/app/bootstrap/seo-init.js
// Dynamische SEO: titel, description, Open Graph, canonical, robots, twitter.

import { t } from '../i18n/index.js';

(function () {
  const SITE_NAME = 'RiskRadar';
  const BASE_URL = location.origin;

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

    document.title = `RiskRadar — ${title}`;

    ensureMetaByName('description').setAttribute('content', desc);

    ensureMetaByProp('og:site_name').setAttribute('content', SITE_NAME);
    ensureMetaByProp('og:type').setAttribute('content', route === 'home' ? 'website' : 'article');
    ensureMetaByProp('og:title').setAttribute('content', `${title} | ${SITE_NAME}`);
    ensureMetaByProp('og:description').setAttribute('content', desc);
    ensureMetaByProp('og:url').setAttribute('content', url);
    ensureMetaByProp('og:locale').setAttribute('content', 'nl_NL');

    ensureMetaByName('twitter:card').setAttribute('content', 'summary');
    ensureMetaByName('twitter:title').setAttribute('content', `${title} | ${SITE_NAME}`);
    ensureMetaByName('twitter:description').setAttribute('content', desc);

    ensureLinkCanonical().setAttribute('href', url);
    ensureMetaByName('robots').setAttribute('content', 'index,follow');
  }

  // Hooks
  window.addEventListener('hashchange', updateSEO);
  window.addEventListener('popstate', updateSEO);

  const _push = history.pushState;
  const _replace = history.replaceState;
  history.pushState = function (s, t, u) { const r = _push.apply(this, arguments); setTimeout(updateSEO, 0); return r; };
  history.replaceState = function (s, t, u) { const r = _replace.apply(this, arguments); setTimeout(updateSEO, 0); return r; };

  // Init – werkt óók als DOM al geladen is
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateSEO, { once: true });
  } else {
    updateSEO();
  }

  // Debug API in console
  window.RR_SEO = { update: updateSEO };
})();
