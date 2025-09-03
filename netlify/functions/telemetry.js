// /netlify/functions/telemetry.js
// CommonJS Netlify Function: slaat events op als NDJSON in Netlify Blobs

const { getStore } = require('@netlify/blobs');

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
    const body = event.body ? JSON.parse(event.body) : {};
    const store = getStore('telemetry');

    const enriched = {
      ...body,
      srv: {
        t: new Date().toISOString(),
        ip: (event.headers['x-forwarded-for'] || '').split(',')[0]?.trim() || '',
        ua: event.headers['user-agent'] || '',
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
