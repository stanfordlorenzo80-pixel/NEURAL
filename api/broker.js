const ALPACA_BASE = process.env.ALPACA_PAPER === 'true'
  ? 'https://paper-api.alpaca.markets' : 'https://api.alpaca.markets';

const headers = () => ({
  'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
  'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY || '',
  'Content-Type': 'application/json',
});

const ready = () => !!(process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query; // /api/broker?action=status|account|positions|order

  if (!action || action === 'status') {
    return res.json({ connected: ready(), paper: process.env.ALPACA_PAPER === 'true' });
  }

  if (!ready()) return res.json({ connected: false, error: 'No API keys' });

  try {
    if (action === 'account') {
      const r = await fetch(`${ALPACA_BASE}/v2/account`, { headers: headers() });
      if (!r.ok) throw new Error(`Alpaca: ${r.status}`);
      return res.json({ connected: true, ...(await r.json()) });
    }

    if (action === 'positions') {
      const r = await fetch(`${ALPACA_BASE}/v2/positions`, { headers: headers() });
      return res.json(await r.json());
    }

    if (action === 'order' && req.method === 'POST') {
      const { symbol, qty, side, type = 'market', time_in_force = 'day' } = req.body;
      const r = await fetch(`${ALPACA_BASE}/v2/orders`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ symbol, qty: String(qty), side, type, time_in_force }),
      });
      if (!r.ok) { const err = await r.json(); throw new Error(err.message || `${r.status}`); }
      return res.json(await r.json());
    }

    if (action === 'orders') {
      const r = await fetch(`${ALPACA_BASE}/v2/orders?status=all&limit=50`, { headers: headers() });
      return res.json(await r.json());
    }

    res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
