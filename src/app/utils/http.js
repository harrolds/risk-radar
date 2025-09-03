// src/app/utils/http.js
// Netwerkrobuuste fetch util: timeout, retries (exponential backoff + jitter), 429 support, telemetrie.
// Gebruik fetchJSON(url, { timeoutMs, retries, retryOnMethods, ... })

import { logApiError } from './logging.js';

// ——— Config ———
const DEFAULTS = {
  timeoutMs: 8000,           // 8s per poging
  retries: 3,                // extra pogingen naast de eerste
  backoffBaseMs: 500,        // 0.5s, groeit met factor^attempt
  backoffFactor: 2,          // 0.5s → 1s → 2s → 4s …
  jitterRatio: 0.2,          // ±20% jitter
  retryOnMethods: ['GET'],   // alleen idempotente calls retried
  retryOnStatuses: new Set([408, 425, 429, 500, 502, 503, 504]),
};

export class NetError extends Error {
  constructor(code, message, extra = {}) {
    super(message);
    this.name = 'NetError';
    this.code = code;           // 'TIMEOUT' | 'NETWORK' | 'HTTP_429' | 'HTTP_xxx'
    this.status = extra.status || 0;
    this.url = extra.url || '';
    this.attempt = extra.attempt ?? 0;
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function withJitter(ms, ratio = DEFAULTS.jitterRatio) {
  const delta = ms * ratio; return Math.max(0, ms - delta + Math.random() * 2 * delta);
}
function parseRetryAfterMs(res) {
  const ra = res.headers?.get?.('retry-after');
  if (!ra) return 0;
  // seconds or HTTP-date
  const sec = Number(ra);
  if (!Number.isNaN(sec)) return Math.max(0, sec * 1000);
  const ts = Date.parse(ra);
  if (!Number.isNaN(ts)) return Math.max(0, ts - Date.now());
  return 0;
}

// UI events voor optionele feedback bootstrap
function emit(type, detail) {
  try { window.dispatchEvent(new CustomEvent(type, { detail })); } catch {}
}

export async function fetchJSON(input, opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };
  const method = (opts.method || 'GET').toUpperCase();
  const url = typeof input === 'string' ? input : (input && input.url) || '';

  const canRetryMethod = cfg.retryOnMethods.includes(method);

  for (let attempt = 0; attempt <= cfg.retries; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), cfg.timeoutMs);

    try {
      const res = await fetch(input, { ...opts, signal: controller.signal });
      clearTimeout(t);

      if (!res.ok) {
        const retryable = cfg.retryOnStatuses.has(res.status) && canRetryMethod;
        if (retryable && attempt < cfg.retries) {
          // backoff delay (respecteer Retry-After bij 429/503)
          const backoff = cfg.backoffBaseMs * Math.pow(cfg.backoffFactor, attempt);
          const ra = (res.status === 429 || res.status === 503) ? parseRetryAfterMs(res) : 0;
          const delay = withJitter(Math.max(backoff, ra));
          emit('rr:api:retry', { url, status: res.status, code: res.status === 429 ? 'HTTP_429' : `HTTP_${res.status}`, attempt, max: cfg.retries, retryInMs: delay });
          await sleep(delay);
          continue;
        }

        // Niet-retryable of laatste poging → error gooien
        const msg = `HTTP ${res.status} ${res.statusText || ''}`.trim();
        logApiError(url, res.status, msg);
        const code = res.status === 429 ? 'HTTP_429' : `HTTP_${res.status}`;
        emit('rr:api:error', { url, status: res.status, code, attempt });
        throw new NetError(code, msg, { status: res.status, url, attempt });
      }

      // OK → parse als JSON indien mogelijk
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) return await res.json();
      // fallback op text
      const text = await res.text();
      try { return JSON.parse(text); } catch { return text; }
    } catch (err) {
      clearTimeout(t);
      // timeout?
      if (err?.name === 'AbortError') {
        if (canRetryMethod && attempt < cfg.retries) {
          const backoff = cfg.backoffBaseMs * Math.pow(cfg.backoffFactor, attempt);
          const delay = withJitter(backoff);
          emit('rr:api:retry', { url, status: 0, code: 'TIMEOUT', attempt, max: cfg.retries, retryInMs: delay });
          await sleep(delay);
          continue;
        }
        logApiError(url, 0, `timeout_after_${cfg.timeoutMs}ms`);
        emit('rr:api:error', { url, status: 0, code: 'TIMEOUT', attempt });
        throw new NetError('TIMEOUT', `Time-out na ${cfg.timeoutMs}ms`, { url, attempt });
      }

      // netwerkfout (TypeError) of iets anders
      const isNetwork = err instanceof TypeError || err?.message === 'Failed to fetch';
      if (isNetwork && canRetryMethod && attempt < cfg.retries) {
        const backoff = cfg.backoffBaseMs * Math.pow(cfg.backoffFactor, attempt);
        const delay = withJitter(backoff);
        emit('rr:api:retry', { url, status: 0, code: 'NETWORK', attempt, max: cfg.retries, retryInMs: delay });
        await sleep(delay);
        continue;
      }
      const code = isNetwork ? 'NETWORK' : (err?.code || 'UNKNOWN');
      logApiError(url, 0, code);
      emit('rr:api:error', { url, status: 0, code, attempt });
      throw err;
    }
  }
  // theoretisch onbereikbaar
  throw new NetError('UNKNOWN', 'Onbekende fout', { url });
}
