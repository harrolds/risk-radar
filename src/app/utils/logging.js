// Lightweight client telemetry
export function initClientLogging() {
  function send(payload) {
    try {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/.netlify/functions/log', blob);
      } else {
        fetch('/.netlify/functions/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
    } catch {}
  }
  window.addEventListener('error', (e) => {
    send({ type: 'error', msg: e?.message, src: e?.filename, line: e?.lineno, col: e?.colno, ts: Date.now(), ua: navigator.userAgent });
  });
  window.addEventListener('unhandledrejection', (e) => {
    send({ type: 'unhandledrejection', msg: String(e?.reason), ts: Date.now(), ua: navigator.userAgent });
  });
}
