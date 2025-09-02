
// Netlify Function: CoinGecko proxy (CommonJS)
exports.handler = async function(event, context) {
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

    if (endpoint === 'simple_price') {
      const ids = encodeURIComponent(params.ids || '');
      const vs = encodeURIComponent(params.vs_currencies || 'eur');
      url = `${base}/simple/price?ids=${ids}&vs_currencies=${vs}`;
    }
    else if (endpoint === 'coins_markets') {
      const u = new URL(`${base}/coins/markets`);
      if (params.vs_currency) u.searchParams.set('vs_currency', params.vs_currency);
      if (params.order) u.searchParams.set('order', params.order);
      if (params.per_page) u.searchParams.set('per_page', params.per_page);
      if (params.page) u.searchParams.set('page', params.page);
      if (params.ids) u.searchParams.set('ids', params.ids);
      if (params.price_change_percentage) u.searchParams.set('price_change_percentage', params.price_change_percentage);
      url = u.toString();
    }
    else if (endpoint === 'search_trending') {
      url = `${base}/search/trending`;
    }
    else if (endpoint === 'ohlc') {
      // id=<coinId>&vs_currency=eur&days=1|7|30
      const id = encodeURIComponent(params.id || '');
      const vs = encodeURIComponent(params.vs_currency || 'eur');
      const days = encodeURIComponent(params.days || '1');
      url = `${base}/coins/${id}/ohlc?vs_currency=${vs}&days=${days}`;
    }
    else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown endpoint' }) };
    }

    const extraHeaders = {};
    if (process.env.CG_API_KEY) {
      // Use demo key header by default; adjust if using PRO endpoint
      extraHeaders['x-cg-demo-api-key'] = process.env.CG_API_KEY;
    }

    const resp = await fetch(url, { headers: extraHeaders });
    const text = await resp.text();
    return { statusCode: resp.status, headers: { ...headers, 'Content-Type': 'application/json' }, body: text };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: String(err) }) };
  }
};
