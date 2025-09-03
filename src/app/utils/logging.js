// /src/app/utils/logging.js
// Simpele client-side telemetrie voor RiskRadar
// Verzamelt: pageviews, custom events, JS errors, unhandled rejections
// Verstuurt via navigator.sendBeacon of fetch POST naar Netlify Function

const TELEMETRY_ENDPOINT = '/.netlify/functions/telemetry';

// ——— Hulpfuncties ———
function uuid() {
  // Heel kleine, snelle UUID (niet cryptografisch)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function nowIso() {
  return new Date().toISOString();
}

function getSessionId() {
  try {
    const KEY = 'rr_sess_id';
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'nosession';
  }
}

function getClient() {
  return {
    ua: navigator.userAgent || '',
    lang: navigator.language || '',
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    dpr: window.devicePixelRatio || 1,
  };
}

function beaconOrFetch(url, payload) {
  try {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon?.(url, blob)) return Promise.resolve();
  } catch { /* fall through */ }

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-RR-Client': 'riskradar-web' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).then(() => {}).catch(() => {});
}

// ——— Public API ———
let _app = { name: 'RiskRadar', version: '0.0.0', env: 'prod' };
let _session = getSessionId();

export function initTelemetry({ appName = 'RiskRadar', appVersion = '0.0.0', env = 'prod' } = {}) {
  _app = { name: appName, version: appVersion, env };
  _session = getSessionId();

  // Automatische error-listeners (idempotent)
  if (!window.__rrTelemetryBound) {
    window.addEventListener('error', (ev) => {
      const err = ev?.error;
      const payload = {
        type: 'js_error',
        t: nowIso(),
        app: _app,
        session: _session,
        msg: String(err?.message || ev?.message || 'UnknownError'),
        stack: String(err?.stack || ''),
        source: String(ev?.filename || ''),
        line: Number(ev?.lineno || 0),
        col: Number(ev?.colno || 0),
        client: getClient(),
        path: location.pathname + location.search + location.hash,
      };
      beaconOrFetch(TELEMETRY_ENDPOINT, payload);
    });

    window.addEventListener('unhandledrejection', (ev) => {
      const reason = ev?.reason;
      const payload = {
        type: 'unhandled_rejection',
        t: nowIso(),
        app: _app,
        session: _session,
        msg: String(reason?.message || reason || 'UnhandledRejection'),
        stack: String(reason?.stack || ''),
        client: getClient(),
        path: location.pathname + location.search + location.hash,
      };
      beaconOrFetch(TELEMETRY_ENDPOINT, payload);
    });

    window.__rrTelemetryBound = true;
  }
}

export function logPageView(path = location.pathname + location.search + location.hash) {
  const payload = {
    type: 'page_view',
    t: nowIso(),
    app: _app,
    session: _session,
    path,
    client: getClient(),
    ref: document.referrer || '',
  };
  return beaconOrFetch(TELEMETRY_ENDPOINT, payload);
}

export function logEvent(name, data = {}) {
  const payload = {
    type: 'event',
    name,
    t: nowIso(),
    app: _app,
    session: _session,
    data,
    client: getClient(),
    path: location.pathname + location.search + location.hash,
  };
  return beaconOrFetch(TELEMETRY_ENDPOINT, payload);
}

export function logApiError(resource, status, message = '') {
  const payload = {
    type: 'api_error',
    t: nowIso(),
    app: _app,
    session: _session,
    resource,
    status: Number(status || 0),
    message: String(message || ''),
    client: getClient(),
    path: location.pathname + location.search + location.hash,
  };
  return beaconOrFetch(TELEMETRY_ENDPOINT, payload);
}
