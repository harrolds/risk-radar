// Netlify Function: CoinGecko proxy (CommonJS)
const ALLOWED = new Set([
  'coins/markets',
  'search/trending',
  'coins/%ID%',
  'coins/%ID%/ohlc'
]);

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
    const endpoint = params.endpoint || '';
    const vs = params.vs_currency || 'eur';
    const id = params.id || '';

    const base = process.env.CG_BASE || 'https://api.coingecko.com/api/v3';
    const proBase = process.env.CG_PRO_BASE || 'https://pro-api.coingecko.com/api/v3';
    const usePro = !!process.env.CG_API_KEY && (params.pro === '1' || params.pro === 'true');
    const apiBase = usePro ? proBase : base;

    let url;
    if (endpoint === 'coins/markets') {
      const per_page = Number(params.per_page || 50);
      const page = Number(params.page || 1);
      url = `${apiBase}/coins/markets?vs_currency=${encodeURIComponent(vs)}&order=market_cap_desc&per_page=${per_page}&page=${page}&sparkline=false&price_change_percentage=24h`;
    } else if (endpoint === 'search/trending') {
      url = `${apiBase}/search/trending`;
    } else if (endpoint === 'coins/%ID%') {
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing id' }) };
      url = `${apiBase}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&community_data=false&developer_data=false`;
    } else if (endpoint === 'coins/%ID%/ohlc') {
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing id' }) };
      const days = Number(params.days || 1);
      url = `${apiBase}/coins/${encodeURIComponent(id)}/ohlc?vs_currency=${encodeURIComponent(vs)}&days=${days}`;
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unsupported endpoint' }) };
    }

    const extraHeaders = {};
    if (process.env.CG_API_KEY) {
      if (usePro) extraHeaders['x-cg-pro-api-key'] = process.env.CG_API_KEY;
      else extraHeaders['x-cg-demo-api-key'] = process.env.CG_API_KEY;
    }

    const resp = await fetch(url, { headers: extraHeaders });
    const text = await resp.text();
    return { statusCode: resp.status, headers: { ...headers, 'Content-Type': 'application/json' }, body: text };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: String(err) }) };
  }
};
