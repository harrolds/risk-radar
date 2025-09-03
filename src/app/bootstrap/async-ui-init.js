// src/app/bootstrap/async-ui-init.js
// Async UI bootstrap die zonder pagina-wijzigingen werkt.
// - Patcht window.fetch voor jouw data-endpoints (CG functions)
// - Gebruikt de bestaande live-regio via RR_A11Y (uit a11y-init.js)
// - Biedt optionele helper-API: window.RR_AUI.{loading, empty, error, done}

(function () {
  // Welke requests willen we aankondigen?
  const INCLUDE_PATTERNS = ['/.netlify/functions/cg/']; // CoinGecko proxy
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

  const nativeFetch = window.fetch.bind(window);

  // Patch fetch
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const monitored = isMonitored(url);

    if (monitored && window.RR_A11Y?.announceLoading) {
      window.RR_A11Y.announceLoading('Gegevens laden…');
    }

    try {
      const res = await nativeFetch(input, init);

      if (monitored && window.RR_A11Y) {
        if (!res.ok) {
          window.RR_A11Y.announceError(`Laden mislukt (${res.status})`);
        } else {
          window.RR_A11Y.announce('Gegevens geladen');
        }
      }
      return res;
    } catch (err) {
      if (monitored && window.RR_A11Y?.announceError) {
        window.RR_A11Y.announceError('Netwerkfout bij laden');
      }
      throw err;
    }
  };

  // Optionele handmatige helpers (je hoeft ze niet te gebruiken)
  window.RR_AUI = {
    loading: (msg = 'Laden…') => window.RR_A11Y?.announceLoading?.(msg),
    empty:   (msg = 'Geen resultaten') => window.RR_A11Y?.announceEmpty?.(msg),
    error:   (msg = 'Er is een fout opgetreden') => window.RR_A11Y?.announceError?.(msg),
    done:    (msg = 'Klaar') => window.RR_A11Y?.announce?.(msg),
  };
})();
