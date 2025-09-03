// netlify/functions/log.js
// Eenvoudige echo-logger: accepteert JSON, logt het in Netlify logs en geeft 200 terug.

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
      headers: {
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const json = event.body ? JSON.parse(event.body) : {};
    console.log('[LOG_FN] received:', JSON.stringify(json));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ok: true, received: json }),
    };
  } catch (e) {
    console.error('[LOG_FN] parse error:', e);
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ok: false, error: 'invalid_json' }),
    };
  }
};
