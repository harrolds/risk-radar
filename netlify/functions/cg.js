// Netlify Function: CoinGecko proxy with CORS
// Usage: /.netlify/functions/cg?endpoint=ohlc&id=bitcoin&vs_currency=eur&days=90
//     or /.netlify/functions/cg?endpoint=simple_price&ids=bitcoin&vs_currencies=eur
export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-cg-demo-api-key, x-cg-pro-api-key',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  try {
    const params = event.queryStringParameters || {};
    const endpoint = params.endpoint;
    const base = process.env.CG_BASE || 'https://api.coingecko.com/api/v3';
    let url = null;
    if (endpoint === 'ohlc') {
      const id = params.id;
      const vs = params.vs_currency || 'eur';
      const days = params.days || '90';
      url = `${base}/coins/${encodeURIComponent(id)}/ohlc?vs_currency=${encodeURIComponent(vs)}&days=${encodeURIComponent(days)}`;
    } else if (endpoint === 'simple_price') {
      const ids = params.ids;
      const vs = params.vs_currencies || 'eur';
      url = `${base}/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(vs)}`;
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown endpoint' }) };
    }
    const extraHeaders = {};
    if (process.env.CG_API_KEY) {
      // Prefer demo key unless explicitly PRO; both allowed by CoinGecko headers
      extraHeaders['x-cg-demo-api-key'] = process.env.CG_API_KEY;
    }
    const resp = await fetch(url, { headers: extraHeaders });
    const text = await resp.text();
    return { statusCode: resp.status, headers: { ...headers, 'Content-Type': 'application/json' }, body: text };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: String(err) }) };
  }
}
