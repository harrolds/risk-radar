// src/app/bootstrap/async-ui-init.js
// Verbeterde Async UI bootstrap:
// - Patcht window.fetch VROEG
// - Matcht zowel "/.netlify/functions/cg" als "/.netlify/functions/cg/..."
// - Anti-flicker: korte delay voor 'Gegevens laden…' zodat screenreaders het horen

(function () {
  // Endpoints die we willen aankondigen (CoinGecko proxy)
  const INCLUDE_PATTERNS = ['/.netlify/functions/cg']; // zonder / aan eind -> vangt beide varianten
  const EXCLUDE_PATTERNS = [
    '/.netlify/functions/telemetry',
    '/.netlify/functions/log'
  ];

  function isMonitored(url) {
    if (!url) return false;
    const inc = INCLUDE_PATTERNS.some(p => url.includes(p));
    const exc = EXCLUDE_PATTERNS.some(p => url.includes(p));
    return inc && !exc;
  }

  // Safety: no-ops wanneer RR_A11Y nog niet bestaat
  function announceLoading(msg){ try { window.RR_A11Y?.announceLoading?.(msg); } catch {} }
  function announceError(msg){ try { window.RR_A11Y?.announceError?.(msg); } catch {} }
  function announceDone(msg){ try { window.RR_A11Y?.announce?.(msg); } catch {} }

  const nativeFetch = window.fetch.bind(window);

  // Anti-flicker: start 'laden' pas na een korte delay
  let active = 0;
  let loadingTimer = null;
  const LOADING_DELAY_MS = 150; // voldoende om 'Gegevens laden…' hoorbaar te maken

  function onRequestStart() {
    active += 1;
    if (active === 1 && loadingTimer == null) {
      loadingTimer = setTimeout(() => {
        announceLoading('Gegevens laden…');
        loadingTimer = null;
      }, LOADING_DELAY_MS);
    }
  }

  function onRequestEnd(ok, status) {
    active = Math.max(0, active - 1);
    if (active === 0) {
      // Geen lopende requests meer: clear pending timer en kondig resultaat aan (indien niet fout)
      if (loadingTimer) { clearTimeout(loadingTimer); loadingTimer = null; }
      if (ok) announceDone('Gegevens geladen');
      // Bij fout kondigen we al direct aan in de catch/!ok-tak hieronder.
    }
  }

  // Patch window.fetch
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const monitored = isMonitored(url);

    if (monitored) onRequestStart();

    try {
      const res = await nativeFetch(input, init);

      if (monitored) {
        if (!res.ok) {
          // Foutstatus meteen melden (assertiever)
          announceError(`Laden mislukt (${res.status})`);
          onRequestEnd(false, res.status);
        } else {
          onRequestEnd(true, res.status);
        }
      }
      return res;
    } catch (err) {
      if (monitored) {
        announceError('Netwerkfout bij laden');
        onRequestEnd(false, 0);
      }
      throw err;
    }
  };

  // Optionele handmatige helpers (netjes laten staan)
  window.RR_AUI = {
    loading: (msg = 'Gegevens laden…') => announceLoading(msg),
    empty:   (msg = 'Geen resultaten') => { try { window.RR_A11Y?.announceEmpty?.(msg); } catch {} },
    error:   (msg = 'Er is een fout opgetreden') => announceError(msg),
    done:    (msg = 'Gegevens geladen') => announceDone(msg),
  };
})();
