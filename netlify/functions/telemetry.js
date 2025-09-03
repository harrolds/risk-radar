// /netlify/functions/telemetry.js
// Slaat events op in Netlify Blobs als NDJSON (events.ndjson)

import { getStore } from '@netlify/blobs';

export default async (req, res) => {
  // CORS & preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-RR-Client');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const store = getStore('telemetry'); // bucket naam = "telemetry"

    // Enrichment (server-side)
    const event = {
      ...body,
      srv: {
        t: new Date().toISOString(),
        ip: (req.headers['x-forwarded-for'] || '').split(',')[0]?.trim() || '',
        ua: req.headers['user-agent'] || '',
      },
    };

    // Append als NDJSON
    await store.append('events.ndjson', JSON.stringify(event) + '\n');

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(204).end(); // geen inhoud terug
  } catch (e) {
    console.error('telemetry error:', e);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: 'telemetry_failed' });
  }
};
