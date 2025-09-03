// /netlify/functions/telemetry.js
// CommonJS Netlify Function: slaat events op als NDJSON in Netlify Blobs
// - Ondersteunt base64 bodies (bv. via sendBeacon met Blob)
// - Faalt niet op niet-JSON; slaat dan raw op

const { getStore } = require('@netlify/blobs');

function decodeBody(event) {
  try {
    let raw = event.body || '';
    if (event.isBase64Encoded) {
      raw = Buffer.from(raw, 'base64').toString('utf8');
    }
    // Probeer JSON, zo niet: return { __raw: string }
    try {
      return { parsed: JSON.parse(raw), raw: raw };
    } catch {
      return { parsed: null, raw: raw };
    }
  } catch (e) {
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

  try {
    const { parsed, raw } = decodeBody(event);
    const store = getStore('telemetry');

    // Server-side enrichment
    const baseEvent = parsed || { __raw: raw || null };
    const enriched = {
      ...baseEvent,
      srv: {
        t: new Date().toISOString(),
        ip: (event.headers['x-forwarded-for'] || '').split(',')[0]?.trim() || '',
        ua: event.headers['user-agent'] || '',
        ct: event.headers['content-type'] || '',
        b64: Boolean(event.isBase64Encoded),
      },
    };

    await store.append('events.ndjson', JSON.stringify(enriched) + '\n');

    return {
      statusCode: 204,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: '',
    };
  } catch (e) {
    console.error('telemetry error:', e);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'telemetry_failed' }),
    };
  }
};
