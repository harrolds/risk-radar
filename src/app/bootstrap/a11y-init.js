// src/app/bootstrap/a11y-init.js
// A11y bootstrap: skip-link, focus na routewissel, live announces, icon-labels.

(function () {
  const MAIN_ID = 'rr-main';
  const LIVE_ID = 'rr-live';

  function $(sel) { return document.querySelector(sel); }
  function byId(id) { return document.getElementById(id); }

  function focusMain() {
    const el = byId(MAIN_ID);
    if (!el) return;
    // maak focusbaar en focus
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: false });
  }

  function announce(msg) {
    const live = byId(LIVE_ID);
    if (!live) return;
    // aria-live polite leest updates voor; atomic houdt het kort
    live.textContent = msg || '';
  }

  // Kleine mapping voor je bekende icon-only knoppen (pas id’s aan indien nodig)
  const ICON_LABELS = {
    '#nav-home': 'Home',
    '#nav-coins': 'Munten',
    '#nav-settings': 'Instellingen',
    '#nav-search': 'Zoeken'
  };

  function ensureIconLabels() {
    Object.entries(ICON_LABELS).forEach(([sel, label]) => {
      const el = $(sel);
      if (!el) return;
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', label);
      // Decoratieve SVG’s verbergen
      const svg = el.querySelector('svg');
      if (svg) { svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); }
    });
  }

  // aria-current="page" toepassen in navigatie (match op pathname/hash)
  function updateAriaCurrent() {
    const links = document.querySelectorAll('a[href]');
    const here = location.hash || location.pathname;
    links.forEach(a => {
      try {
        const href = a.getAttribute('href') || '';
        if (!href) return a.removeAttribute('aria-current');
        // simpele match voor SPA-hash of pad
        if (href === here || (href.startsWith('#') && href === location.hash)) {
          a.setAttribute('aria-current', 'page');
        } else {
          a.removeAttribute('aria-current');
        }
      } catch {}
    });
  }

  // Skip-link werkt naar #rr-main
  function bindSkipLink() {
    const skip = document.querySelector('a.skip-link[href="#' + MAIN_ID + '"]');
    if (!skip) return;
    skip.addEventListener('click', (e) => {
      // default anchor jump is ok; we forceren focus ook expliciet:
      setTimeout(focusMain, 0);
    });
  }

  // Hook voor SPA navigatie: patch pushState/replaceState + luister op popstate/hashchange
  function patchHistoryForA11y() {
    const _push = history.pushState;
    const _replace = history.replaceState;

    history.pushState = function (state, title, url) {
      const ret = _push.apply(this, arguments);
      dispatchNavigate(url);
      return ret;
    };
    history.replaceState = function (state, title, url) {
      const ret = _replace.apply(this, arguments);
      dispatchNavigate(url);
      return ret;
    };

    window.addEventListener('popstate', () => dispatchNavigate());
    window.addEventListener('hashchange', () => dispatchNavigate());
  }

  function labelFromLocation() {
    // Probeer document.title; val terug op path/hash
    if (document.title) return 'Navigatie: ' + document.title;
    const h = location.hash || '/';
    return 'Navigatie: ' + h.replace(/^#/, '') || 'Navigatie';
  }

  function dispatchNavigate(optionalURL) {
    // focus en announce
    focusMain();
    announce(labelFromLocation());
    updateAriaCurrent();
  }

  // Publieke helpers voor async UI
  window.RR_A11Y = {
    announce,
    announceLoading: (txt = 'Laden…') => announce(txt),
    announceEmpty: (txt = 'Geen items gevonden') => announce(txt),
    announceError: (txt = 'Er is een fout opgetreden') => announce(txt),
    focusMain
  };

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    bindSkipLink();
    ensureIconLabels();
    updateAriaCurrent();
    patchHistoryForA11y();
    // Initial announce/focus alleen als we via skip komen niet verplicht;
    // maar we kunnen bij load alvast de aria-current zetten.
  });

})();
