// Netlify Function: minimal telemetry sink (CommonJS)
exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const body = event.body || '{}';
    return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' }, body };
  } catch (err) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: String(err) }) };
  }
};
