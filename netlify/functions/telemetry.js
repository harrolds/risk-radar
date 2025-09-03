// /netlify/functions/telemetry.js
// CommonJS Netlify Function: saves events as NDJSON in Netlify Blobs
// Robust: supports base64 (sendBeacon), tolerates non-JSON, and NEVER throws 500.
// If Blobs fail, it logs to console and returns 202 so the UI never breaks.

let getStore;
try {
  // Lazy require so bundling always succeeds
  ({ getStore } = require('@netlify/blobs'));
} catch (_) {
  // Leave undefined -> handled below
}

function decodeBody(event) {
  try {
    let raw = event.body || '';
    if (event.isBase64Encoded) raw = Buffer.from(raw, 'base64').toString('utf8');
    try {
      return { parsed: JSON.parse(raw), raw };
    } catch {
      return { parsed: null, raw };
    }
  } catch {
    return { parsed: null, raw: '' };
  }
}

exports.handler = async function (event) {
  // CORS & preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-RR-Client',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Allow': 'POST, OPTIONS', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const { parsed, raw } = decodeBody(event);

  const baseEvent = parsed || { __raw: raw || null };
  const enriched = {
    ...baseEvent,
    srv: {
      t: new Date().toISOString(),
      ip: (event.headers['x-forwarded-for'] || '').split(',')[0]?.trim() || '',
      ua: event.headers['user-agent'] || '',
      ct: event.headers['content-type'] || '',
      b64: Boolean(event.isBase64Encoded),
      path: event.path || '',
    },
  };

  // Try to persist to Netlify Blobs; on any error, fall back to console only.
  try {
    if (!getStore) throw new Error('blobs_module_unavailable');
    const store = getStore('telemetry');
    await store.append('events.ndjson', JSON.stringify(enriched) + '\n');

    // Success
    return {
      statusCode: 204,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: '',
    };
  } catch (e) {
    // Soft-fail: log and accept so client never sees a 500
    console.warn('[telemetry] fallback log-only:', e?.message || e);
    console.log('[telemetry] event:', JSON.stringify(enriched));

    return {
      statusCode: 202, // accepted but not persisted
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: '',
    };
  }
};
