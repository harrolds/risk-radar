// src/app/bootstrap/async-ui-init.js
(function () {
  const INCLUDE_PATTERNS = ['/.netlify/functions/cg'];
  const EXCLUDE_PATTERNS = ['/.netlify/functions/telemetry','/.netlify/functions/log'];

  function isMonitored(url) {
    if (!url) return false;
    const inc = INCLUDE_PATTERNS.some(p => url.includes(p));
    const exc = EXCLUDE_PATTERNS.some(p => url.includes(p));
    return inc && !exc;
  }
  function announceLoading(msg){ try { window.RR_A11Y?.announceLoading?.(msg); } catch {} }
  function announceError(msg){ try { window.RR_A11Y?.announceError?.(msg); } catch {} }
  function announceDone(msg){ try { window.RR_A11Y?.announce?.(msg); } catch {} }

  const nativeFetch = window.fetch.bind(window);
  let active = 0, loadingTimer = null;
  const LOADING_DELAY_MS = 150;

  function parseCgInfo(url) {
    try {
      const u = new URL(url, location.origin);
      const endpoint = u.searchParams.get('endpoint') || '';
      const ids = u.searchParams.get('ids') || '';
      return { url: u.href, endpoint, ids, isWatchlist: Boolean(ids) };
    } catch { return { url, endpoint: '', ids: '', isWatchlist: false }; }
  }

  function onRequestStart(info) {
    active += 1;
    // Event voor skeletons-init
    try { window.dispatchEvent(new CustomEvent('rr:cg:start', { detail: info })); } catch {}
    if (active === 1 && loadingTimer == null) {
      loadingTimer = setTimeout(() => { announceLoading('Gegevens laden…'); loadingTimer = null; }, LOADING_DELAY_MS);
    }
  }
  function onRequestEnd(ok, info) {
    active = Math.max(0, active - 1);
    // Event voor skeletons-init
    try { window.dispatchEvent(new CustomEvent('rr:cg:end', { detail: { ...info, ok } })); } catch {}
    if (active === 0) {
      if (loadingTimer) { clearTimeout(loadingTimer); loadingTimer = null; }
      if (ok) announceDone('Gegevens geladen');
    }
  }

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const monitored = isMonitored(url);
    const info = monitored ? parseCgInfo(url) : null;

    if (monitored) onRequestStart(info);

    try {
      const res = await nativeFetch(input, init);
      if (monitored) {
        if (!res.ok) announceError(`Laden mislukt (${res.status})`);
        onRequestEnd(res.ok, info);
      }
      return res;
    } catch (err) {
      if (monitored) { announceError('Netwerkfout bij laden'); onRequestEnd(false, info); }
      throw err;
    }
  };

  // Optioneel laten staan:
  window.RR_AUI = {
    loading: (msg = 'Gegevens laden…') => announceLoading(msg),
    empty:   (msg = 'Geen resultaten')  => { try { window.RR_A11Y?.announceEmpty?.(msg); } catch {} },
    error:   (msg = 'Er is een fout opgetreden') => announceError(msg),
    done:    (msg = 'Gegevens geladen') => announceDone(msg),
  };
})();
