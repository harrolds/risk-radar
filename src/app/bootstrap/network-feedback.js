// src/app/bootstrap/network-feedback.js
// Luistert naar rr:api:retry / rr:api:error en spreekt duidelijke meldingen uit.

(function () {
  let lastAt = 0;
  const throttle = 1200; // ms – niet te praatgraag

  function say(msg) {
    const now = Date.now();
    if (now - lastAt < throttle) return;
    lastAt = now;
    try { window.RR_A11Y?.announceError?.(msg); } catch {}
  }

  window.addEventListener('rr:api:retry', (e) => {
    const { code, status, attempt, max, retryInMs } = e.detail || {};
    if (code === 'HTTP_429') {
      say(`Server is druk (429). Nieuwe poging in ${Math.ceil((retryInMs || 0) / 1000)} seconden (poging ${attempt + 2}/${max + 1}).`);
    } else if (code === 'TIMEOUT' || code === 'NETWORK') {
      say(`Verbinding traag. Nieuwe poging in ${Math.ceil((retryInMs || 0) / 1000)} seconden.`);
    }
  });

  window.addEventListener('rr:api:error', (e) => {
    const { code, status } = e.detail || {};
    if (code === 'HTTP_429') {
      say('Server is tijdelijk overbelast. Probeer het zo weer.');
    } else if (code === 'TIMEOUT') {
      say('De aanvraag duurde te lang (time-out).');
    } else if (code === 'NETWORK') {
      say('Netwerkfout. Controleer je verbinding.');
    }
  });
})();
